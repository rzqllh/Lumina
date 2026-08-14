-- Migration 00018: Sessions Integrity and Operational Freeze Triggers
-- Enforces cross-workspace integrity for project sessions and operational freeze on force_closed projects

-- 1. Trigger: Ensure sessions workspace matches parent project
CREATE OR REPLACE FUNCTION check_session_workspace_match()
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
        RAISE EXCEPTION 'Cross-parent violation: session workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_session_workspace_match ON public.sessions;
CREATE TRIGGER trg_check_session_workspace_match
BEFORE INSERT OR UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION check_session_workspace_match();

-- 2. Trigger: Force-Close Operational Freeze on Sessions (OD-001)
DROP TRIGGER IF EXISTS trg_freeze_sessions_on_force_closed ON public.sessions;
CREATE TRIGGER trg_freeze_sessions_on_force_closed
BEFORE INSERT OR UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

-- 3. Composite Index for Chronological Querying
CREATE INDEX IF NOT EXISTS idx_sessions_project_date_time ON public.sessions(project_id, date ASC, start_time ASC);
