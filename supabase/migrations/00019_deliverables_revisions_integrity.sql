-- Migration 00019: Deliverables and Revisions Integrity & Atomic Revision Creation
-- Enforces cross-workspace isolation and atomic revision numbering with deliverable status synchronization

-- 1. Trigger: Ensure deliverables workspace matches parent project
CREATE OR REPLACE FUNCTION check_deliverable_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: deliverable workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_deliverable_workspace_match ON public.deliverables;
CREATE TRIGGER trg_check_deliverable_workspace_match
BEFORE INSERT OR UPDATE ON public.deliverables
FOR EACH ROW EXECUTE FUNCTION check_deliverable_workspace_match();

-- 2. Trigger: Ensure revisions workspace matches parent deliverable
CREATE OR REPLACE FUNCTION check_revision_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    deliv_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO deliv_workspace_id FROM public.deliverables WHERE id = NEW.deliverable_id;
    IF deliv_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Deliverable % does not exist', NEW.deliverable_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM deliv_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: revision workspace % does not match deliverable workspace %',
            NEW.workspace_id, deliv_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_revision_workspace_match ON public.revisions;
CREATE TRIGGER trg_check_revision_workspace_match
BEFORE INSERT OR UPDATE ON public.revisions
FOR EACH ROW EXECUTE FUNCTION check_revision_workspace_match();

-- 3. Atomic RPC: create_deliverable_revision
CREATE OR REPLACE FUNCTION public.create_deliverable_revision(
    p_deliverable_id UUID,
    p_feedback TEXT,
    p_due_date DATE DEFAULT NULL
)
RETURNS public.revisions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_workspace_id UUID;
    v_project_id UUID;
    v_proj_status TEXT;
    v_next_rev_num INTEGER;
    v_new_revision public.revisions;
BEGIN
    -- 1. Authenticate caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    -- 2. Verify deliverable exists and get context
    SELECT d.workspace_id, d.project_id, p.status
    INTO v_workspace_id, v_project_id, v_proj_status
    FROM public.deliverables d
    JOIN public.projects p ON p.id = d.project_id
    WHERE d.id = p_deliverable_id;

    IF v_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Deliverable % not found', p_deliverable_id;
    END IF;

    -- 3. Verify caller membership in workspace
    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: User % cannot modify deliverable in workspace %', auth.uid(), v_workspace_id;
    END IF;

    -- 4. Check operational freeze
    IF v_proj_status = 'force_closed' THEN
        RAISE EXCEPTION 'Operational freeze violation: Project % is force_closed. Operational mutations are blocked.', v_project_id;
    END IF;

    -- 5. Calculate next revision number
    SELECT COALESCE(MAX(revision_number), 0) + 1
    INTO v_next_rev_num
    FROM public.revisions
    WHERE deliverable_id = p_deliverable_id;

    -- 6. Insert new revision
    INSERT INTO public.revisions (
        workspace_id,
        deliverable_id,
        revision_number,
        requested_date,
        due_date,
        feedback,
        status
    )
    VALUES (
        v_workspace_id,
        p_deliverable_id,
        v_next_rev_num,
        CURRENT_DATE,
        p_due_date,
        p_feedback,
        'requested'
    )
    RETURNING * INTO v_new_revision;

    -- 7. Update parent deliverable status to revision_requested
    UPDATE public.deliverables
    SET status = 'revision_requested',
        updated_at = NOW()
    WHERE id = p_deliverable_id;

    RETURN v_new_revision;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_deliverable_revision(UUID, TEXT, DATE) TO authenticated;
