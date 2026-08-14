-- Migration 00014: Project Client Workspace Match Trigger
-- Ensures Project.workspace_id matches Client.workspace_id upon INSERT or UPDATE

CREATE OR REPLACE FUNCTION check_project_client_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    client_ws_id UUID;
BEGIN
    SELECT workspace_id INTO client_ws_id FROM public.clients WHERE id = NEW.client_id;
    IF client_ws_id IS NULL THEN
        RAISE EXCEPTION 'Referenced client % does not exist', NEW.client_id;
    END IF;
    IF client_ws_id IS DISTINCT FROM NEW.workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: Project workspace % does not match Client % workspace %',
            NEW.workspace_id, NEW.client_id, client_ws_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_project_client_workspace_match ON public.projects;
CREATE TRIGGER trg_check_project_client_workspace_match
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION check_project_client_workspace_match();
