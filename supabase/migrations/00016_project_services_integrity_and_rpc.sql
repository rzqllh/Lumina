-- Migration 00016: Project Services Cross-Workspace Integrity & Atomic Package Snapshot RPC
-- Enforces source_service_id and source_package_id workspace match on project_services
-- Provides atomic apply_package_to_project RPC for all-or-nothing pricing snapshot

-- ─── Cross-Workspace Source Integrity Trigger ────────────────────────────────
-- Validates that source_service_id and source_package_id, when provided,
-- belong to the same Workspace as the Project. Snapshot values are already
-- copied at insert time, so this trigger only guards source audit references.

CREATE OR REPLACE FUNCTION check_project_service_source_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_ws_id  UUID;
    srv_ws_id   UUID;
    pkg_ws_id   UUID;
BEGIN
    -- Fetch the workspace of the owning project
    SELECT workspace_id INTO proj_ws_id
      FROM public.projects
     WHERE id = NEW.project_id;

    -- Validate source_service_id belongs to same workspace
    IF NEW.source_service_id IS NOT NULL THEN
        SELECT workspace_id INTO srv_ws_id
          FROM public.services
         WHERE id = NEW.source_service_id;

        IF srv_ws_id IS DISTINCT FROM proj_ws_id THEN
            RAISE EXCEPTION
                'Cross-workspace violation: Service % (workspace %) does not match Project % (workspace %)',
                NEW.source_service_id, srv_ws_id, NEW.project_id, proj_ws_id;
        END IF;
    END IF;

    -- Validate source_package_id belongs to same workspace
    IF NEW.source_package_id IS NOT NULL THEN
        SELECT workspace_id INTO pkg_ws_id
          FROM public.packages
         WHERE id = NEW.source_package_id;

        IF pkg_ws_id IS DISTINCT FROM proj_ws_id THEN
            RAISE EXCEPTION
                'Cross-workspace violation: Package % (workspace %) does not match Project % (workspace %)',
                NEW.source_package_id, pkg_ws_id, NEW.project_id, proj_ws_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_project_service_source_workspace_match ON public.project_services;
CREATE TRIGGER trg_check_project_service_source_workspace_match
BEFORE INSERT OR UPDATE ON public.project_services
FOR EACH ROW EXECUTE FUNCTION check_project_service_source_workspace_match();


-- ─── Atomic Package → Project Snapshot RPC ────────────────────────────────────
-- Applies all Package Items as independent ProjectService snapshot rows within
-- a single transaction (all-or-nothing). Source references preserved for audit.
-- Does NOT delete or replace existing project_services (APPEND semantics).

CREATE OR REPLACE FUNCTION apply_package_to_project(
    p_workspace_id UUID,
    p_project_id   UUID,
    p_package_id   UUID
)
RETURNS INTEGER   -- count of inserted project_service rows
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    proj_ws_id   UUID;
    pkg_ws_id    UUID;
    next_pos     INTEGER;
    inserted_cnt INTEGER := 0;
    item         RECORD;
BEGIN
    -- Verify caller is a workspace member
    IF NOT public.is_workspace_member(p_workspace_id) THEN
        RAISE EXCEPTION 'Unauthorized: User is not a member of workspace %', p_workspace_id;
    END IF;

    -- Verify project belongs to the workspace
    SELECT workspace_id INTO proj_ws_id
      FROM public.projects
     WHERE id = p_project_id;

    IF proj_ws_id IS DISTINCT FROM p_workspace_id THEN
        RAISE EXCEPTION
            'Cross-workspace violation: Project % does not belong to workspace %',
            p_project_id, p_workspace_id;
    END IF;

    -- Verify package belongs to the same workspace
    SELECT workspace_id INTO pkg_ws_id
      FROM public.packages
     WHERE id = p_package_id;

    IF pkg_ws_id IS DISTINCT FROM p_workspace_id THEN
        RAISE EXCEPTION
            'Cross-workspace violation: Package % does not belong to workspace %',
            p_package_id, p_workspace_id;
    END IF;

    -- Determine next position after current project_services
    SELECT COALESCE(MAX(position) + 1, 0)
      INTO next_pos
      FROM public.project_services
     WHERE project_id = p_project_id;

    -- Insert one project_services row per package_item (APPEND, ordered by position)
    FOR item IN
        SELECT *
          FROM public.package_items
         WHERE package_id = p_package_id
         ORDER BY position ASC, created_at ASC
    LOOP
        INSERT INTO public.project_services (
            workspace_id,
            project_id,
            label,
            description,
            quantity,
            unit_price,
            subtotal,
            adjustment_label,
            adjustment_amount,
            source_package_id,
            source_service_id,
            position
        ) VALUES (
            p_workspace_id,
            p_project_id,
            item.label,
            item.description,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price,   -- snapshot subtotal
            NULL,                               -- no adjustment at apply time
            0,
            p_package_id,
            item.service_id,                   -- audit reference (may be NULL for custom items)
            next_pos + inserted_cnt
        );

        inserted_cnt := inserted_cnt + 1;
    END LOOP;

    RETURN inserted_cnt;
END;
$$;

-- Restrict execute to authenticated users only
REVOKE ALL ON FUNCTION public.apply_package_to_project(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_package_to_project(UUID, UUID, UUID) TO authenticated;

-- Index for Project Value aggregation performance
CREATE INDEX IF NOT EXISTS idx_project_services_project_position
  ON public.project_services(project_id, position);
