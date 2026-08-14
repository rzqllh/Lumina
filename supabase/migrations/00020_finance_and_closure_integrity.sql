-- Migration 00020: Finance Integrity and Project Closure Lifecycle
-- Enforces cross-workspace validation, operational freeze on expenses/engagements, and atomic closure RPCs

-- 1. Trigger: Ensure payments workspace matches parent project
CREATE OR REPLACE FUNCTION check_payment_workspace_match()
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
        RAISE EXCEPTION 'Cross-parent violation: payment workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_payment_workspace_match ON public.payments;
CREATE TRIGGER trg_check_payment_workspace_match
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION check_payment_workspace_match();

-- 2. Trigger: Ensure expenses workspace matches parent project
CREATE OR REPLACE FUNCTION check_expense_workspace_match()
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
        RAISE EXCEPTION 'Cross-parent violation: expense workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_expense_workspace_match ON public.expenses;
CREATE TRIGGER trg_check_expense_workspace_match
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION check_expense_workspace_match();

-- 3. Trigger: Ensure collaborator engagements workspace matches parent project & collaborator
CREATE OR REPLACE FUNCTION check_collaborator_engagement_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
    collab_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    SELECT workspace_id INTO collab_workspace_id FROM public.collaborators WHERE id = NEW.collaborator_id;

    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF collab_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Collaborator % does not exist', NEW.collaborator_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id OR NEW.workspace_id IS DISTINCT FROM collab_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: engagement workspace does not match project and collaborator';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_collaborator_engagement_workspace_match ON public.collaborator_engagements;
CREATE TRIGGER trg_check_collaborator_engagement_workspace_match
BEFORE INSERT OR UPDATE ON public.collaborator_engagements
FOR EACH ROW EXECUTE FUNCTION check_collaborator_engagement_workspace_match();

-- 4. Operational freeze on force_closed projects
DROP TRIGGER IF EXISTS trg_freeze_expenses_on_force_closed ON public.expenses;
CREATE TRIGGER trg_freeze_expenses_on_force_closed
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

DROP TRIGGER IF EXISTS trg_freeze_collaborator_engagements_on_force_closed ON public.collaborator_engagements;
CREATE TRIGGER trg_freeze_collaborator_engagements_on_force_closed
BEFORE INSERT OR UPDATE ON public.collaborator_engagements
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

-- For payments: block INSERT on force-closed projects, but permit updating existing receivables
CREATE OR REPLACE FUNCTION check_payment_create_operational_freeze()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_status TEXT;
BEGIN
    SELECT status INTO proj_status FROM public.projects WHERE id = NEW.project_id;
    IF proj_status = 'force_closed' THEN
        RAISE EXCEPTION 'Operational freeze violation: Project % is force_closed. Adding new payment schedules is blocked.',
            NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_freeze_payment_insert_on_force_closed ON public.payments;
CREATE TRIGGER trg_freeze_payment_insert_on_force_closed
BEFORE INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION check_payment_create_operational_freeze();

-- 5. RPC: close_project (Normal closure gate)
CREATE OR REPLACE FUNCTION public.close_project(p_project_id UUID)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_project public.projects;
    v_unapproved_deliv_count INTEGER;
    v_contract_total BIGINT;
    v_paid_total BIGINT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
    IF v_project.id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', p_project_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_project.workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: Caller is not a member of this workspace.';
    END IF;

    -- Gate 1: Check all deliverables are approved
    SELECT COUNT(*) INTO v_unapproved_deliv_count
    FROM public.deliverables
    WHERE project_id = p_project_id AND status != 'approved';

    IF v_unapproved_deliv_count > 0 THEN
        RAISE EXCEPTION 'Close gate violation: % deliverables have not reached approved status.', v_unapproved_deliv_count;
    END IF;

    -- Gate 2: Check project is fully paid
    SELECT COALESCE(SUM(unit_price * quantity), 0) INTO v_contract_total
    FROM public.project_services
    WHERE project_id = p_project_id;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid_total
    FROM public.payments
    WHERE project_id = p_project_id AND status = 'paid';

    IF v_paid_total < v_contract_total THEN
        RAISE EXCEPTION 'Close gate violation: Project has outstanding balance. (Paid: %, Contract: %)',
            v_paid_total, v_contract_total;
    END IF;

    UPDATE public.projects
    SET status = 'closed',
        closed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_project_id
    RETURNING * INTO v_project;

    RETURN v_project;
END;
$$;

GRANT EXECUTE ON FUNCTION public.close_project(UUID) TO authenticated;

-- 6. RPC: force_close_project (Owner override with permanent reason)
CREATE OR REPLACE FUNCTION public.force_close_project(
    p_project_id UUID,
    p_reason TEXT
)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_project public.projects;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 5 THEN
        RAISE EXCEPTION 'Validation error: A written reason of at least 5 characters is required to force-close.';
    END IF;

    SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
    IF v_project.id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', p_project_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_project.workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: Caller is not a member of this workspace.';
    END IF;

    UPDATE public.projects
    SET status = 'force_closed',
        force_closed_at = NOW(),
        force_close_reason = TRIM(p_reason),
        updated_at = NOW()
    WHERE id = p_project_id
    RETURNING * INTO v_project;

    RETURN v_project;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_close_project(UUID, TEXT) TO authenticated;

-- 7. RPC: reopen_project
CREATE OR REPLACE FUNCTION public.reopen_project(p_project_id UUID)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_project public.projects;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
    IF v_project.id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', p_project_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_project.workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: Caller is not a member of this workspace.';
    END IF;

    UPDATE public.projects
    SET status = 'active',
        reopened_at = NOW(),
        updated_at = NOW()
    WHERE id = p_project_id
    RETURNING * INTO v_project;

    RETURN v_project;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reopen_project(UUID) TO authenticated;
