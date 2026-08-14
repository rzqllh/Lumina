-- Migration 00012: Personal Workspace Bootstrap RPC
-- Creates atomic, idempotent bootstrap function for authenticated owner

CREATE OR REPLACE FUNCTION public.bootstrap_personal_workspace()
RETURNS TABLE (
    workspace_id UUID,
    workspace_name TEXT,
    member_role TEXT,
    is_new BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_uid UUID;
    user_email TEXT;
    raw_meta JSONB;
    display_name TEXT;
    ws_name TEXT;
    existing_ws RECORD;
    new_ws_id UUID;
BEGIN
    current_uid := auth.uid();
    IF current_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required to bootstrap workspace';
    END IF;

    -- 1. Check for existing membership (Idempotent check)
    SELECT wm.workspace_id, w.name, wm.role
    INTO existing_ws
    FROM public.workspace_members wm
    JOIN public.workspaces w ON w.id = wm.workspace_id
    WHERE wm.user_id = current_uid
    ORDER BY wm.created_at ASC
    LIMIT 1;

    IF existing_ws.workspace_id IS NOT NULL THEN
        RETURN QUERY SELECT existing_ws.workspace_id, existing_ws.name, existing_ws.role, FALSE;
        RETURN;
    END IF;

    -- 2. Extract user identity metadata from auth.users
    SELECT email, raw_user_meta_data
    INTO user_email, raw_meta
    FROM auth.users
    WHERE id = current_uid;

    display_name := COALESCE(
        raw_meta->>'full_name',
        raw_meta->>'name',
        raw_meta->>'user_name'
    );

    IF display_name IS NOT NULL AND btrim(display_name) <> '' THEN
        ws_name := btrim(display_name) || '''s Workspace';
    ELSIF user_email IS NOT NULL AND position('@' in user_email) > 1 THEN
        ws_name := split_part(user_email, '@', 1) || '''s Workspace';
    ELSE
        ws_name := 'Lumina Workspace';
    END IF;

    -- 3. Atomically create personal workspace and owner membership
    INSERT INTO public.workspaces (name)
    VALUES (ws_name)
    RETURNING id INTO new_ws_id;

    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new_ws_id, current_uid, 'owner');

    RETURN QUERY SELECT new_ws_id, ws_name, 'owner'::TEXT, TRUE;
END;
$$;

-- Restrict execution permissions: only authenticated users can invoke
REVOKE EXECUTE ON FUNCTION public.bootstrap_personal_workspace() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_personal_workspace() FROM anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_personal_workspace() TO authenticated;
