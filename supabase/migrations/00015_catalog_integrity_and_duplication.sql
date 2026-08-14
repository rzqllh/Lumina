-- Migration 00015: Catalog Integrity & Package Duplication RPC
-- Ensures PackageItem service references match Package workspace_id and provides atomic package cloning

CREATE OR REPLACE FUNCTION check_package_item_service_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    pkg_ws_id UUID;
    srv_ws_id UUID;
BEGIN
    IF NEW.service_id IS NOT NULL THEN
        SELECT workspace_id INTO pkg_ws_id FROM public.packages WHERE id = NEW.package_id;
        SELECT workspace_id INTO srv_ws_id FROM public.services WHERE id = NEW.service_id;

        IF srv_ws_id IS DISTINCT FROM pkg_ws_id THEN
            RAISE EXCEPTION 'Cross-parent violation: Service workspace % does not match Package workspace %',
                srv_ws_id, pkg_ws_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_package_item_service_workspace_match ON public.package_items;
CREATE TRIGGER trg_check_package_item_service_workspace_match
BEFORE INSERT OR UPDATE ON public.package_items
FOR EACH ROW EXECUTE FUNCTION check_package_item_service_workspace_match();

-- Atomic Package Duplication RPC
CREATE OR REPLACE FUNCTION duplicate_package(
    p_workspace_id UUID,
    p_package_id UUID,
    p_new_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    src_pkg RECORD;
    new_pkg_id UUID;
BEGIN
    -- Verify workspace membership
    IF NOT public.is_workspace_member(p_workspace_id) THEN
        RAISE EXCEPTION 'Unauthorized: User is not a member of workspace %', p_workspace_id;
    END IF;

    -- Fetch source package
    SELECT * INTO src_pkg FROM public.packages WHERE id = p_package_id AND workspace_id = p_workspace_id;
    IF src_pkg.id IS NULL THEN
        RAISE EXCEPTION 'Source package % not found in workspace %', p_package_id, p_workspace_id;
    END IF;

    -- Insert cloned package
    INSERT INTO public.packages (workspace_id, name, description, is_active)
    VALUES (
        p_workspace_id,
        COALESCE(p_new_name, src_pkg.name || ' (Copy)'),
        src_pkg.description,
        TRUE
    )
    RETURNING id INTO new_pkg_id;

    -- Clone package items
    INSERT INTO public.package_items (package_id, service_id, label, quantity, unit_price, description, position)
    SELECT new_pkg_id, service_id, label, quantity, unit_price, description, position
    FROM public.package_items
    WHERE package_id = p_package_id
    ORDER BY position ASC, created_at ASC;

    RETURN new_pkg_id;
END;
$$;
