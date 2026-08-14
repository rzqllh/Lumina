-- Migration 00017: Workflow Templates Integrity and Atomic Snapshot RPC
-- Enforces cross-workspace integrity for workflow templates/stages and provides atomic template application

-- 1. Trigger: Ensure project_workflow_stages workspace matches parent project
CREATE OR REPLACE FUNCTION check_project_workflow_stage_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
    tmpl_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: project_workflow_stage workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    -- If source_template_id is provided, verify template belongs to same workspace
    IF NEW.source_template_id IS NOT NULL THEN
        SELECT workspace_id INTO tmpl_workspace_id FROM public.workflow_templates WHERE id = NEW.source_template_id;
        IF tmpl_workspace_id IS NOT NULL AND tmpl_workspace_id IS DISTINCT FROM proj_workspace_id THEN
            RAISE EXCEPTION 'Cross-workspace violation: Source template % workspace % does not match project workspace %',
                NEW.source_template_id, tmpl_workspace_id, proj_workspace_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_project_workflow_stage_workspace_match ON public.project_workflow_stages;
CREATE TRIGGER trg_check_project_workflow_stage_workspace_match
BEFORE INSERT OR UPDATE ON public.project_workflow_stages
FOR EACH ROW EXECUTE FUNCTION check_project_workflow_stage_workspace_match();

-- 2. Trigger: Ensure tasks workspace matches parent project
CREATE OR REPLACE FUNCTION check_task_workspace_match()
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
        RAISE EXCEPTION 'Cross-parent violation: task workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_task_workspace_match ON public.tasks;
CREATE TRIGGER trg_check_task_workspace_match
BEFORE INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION check_task_workspace_match();

-- 3. Atomic RPC: apply_workflow_template_to_project
CREATE OR REPLACE FUNCTION public.apply_workflow_template_to_project(
    p_project_id UUID,
    p_template_id UUID,
    p_mode TEXT DEFAULT 'append' -- 'replace' or 'append'
)
RETURNS SETOF public.project_workflow_stages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_workspace_id UUID;
    v_template_workspace_id UUID;
    v_proj_status TEXT;
    v_max_pos INTEGER := 0;
BEGIN
    -- 1. Authenticate caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    -- 2. Verify project exists and get context
    SELECT workspace_id, status INTO v_workspace_id, v_proj_status
    FROM public.projects
    WHERE id = p_project_id;

    IF v_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', p_project_id;
    END IF;

    -- 3. Verify caller membership in workspace
    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: User % cannot modify project in workspace %', auth.uid(), v_workspace_id;
    END IF;

    -- 4. Check operational freeze
    IF v_proj_status = 'force_closed' THEN
        RAISE EXCEPTION 'Operational freeze violation: Project % is force_closed. Operational mutations are blocked.', p_project_id;
    END IF;

    -- 5. Verify workflow template exists and workspace matches
    SELECT workspace_id INTO v_template_workspace_id
    FROM public.workflow_templates
    WHERE id = p_template_id;

    IF v_template_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Workflow template % not found', p_template_id;
    END IF;

    IF v_template_workspace_id IS DISTINCT FROM v_workspace_id THEN
        RAISE EXCEPTION 'Cross-workspace violation: Template workspace % does not match project workspace %',
            v_template_workspace_id, v_workspace_id;
    END IF;

    -- 6. Execute Replace or Append
    IF p_mode = 'replace' THEN
        -- Unlink tasks from existing stages
        UPDATE public.tasks
        SET stage_id = NULL
        WHERE project_id = p_project_id;

        -- Delete existing project workflow stages
        DELETE FROM public.project_workflow_stages
        WHERE project_id = p_project_id;

        v_max_pos := 0;
    ELSE
        -- Find current maximum position
        SELECT COALESCE(MAX(position), 0) INTO v_max_pos
        FROM public.project_workflow_stages
        WHERE project_id = p_project_id;
    END IF;

    -- 7. Snapshot template stages into project_workflow_stages
    RETURN QUERY
    INSERT INTO public.project_workflow_stages (
        workspace_id,
        project_id,
        label,
        position,
        status,
        source_template_id
    )
    SELECT
        v_workspace_id,
        p_project_id,
        wts.label,
        v_max_pos + ROW_NUMBER() OVER (ORDER BY wts.position ASC),
        'not_started'::TEXT,
        p_template_id
    FROM public.workflow_template_stages wts
    WHERE wts.workflow_template_id = p_template_id
    ORDER BY wts.position ASC
    RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_workflow_template_to_project(UUID, UUID, TEXT) TO authenticated;
