BEGIN;
SELECT plan(7);

-- 1. Setup test user and workspace
INSERT INTO auth.users (id, email)
VALUES ('99999999-9999-9999-9999-999999999999'::UUID, 'portal_owner@lumina.app')
ON CONFLICT (id) DO NOTHING;

SELECT set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);

INSERT INTO public.workspaces (id, name)
VALUES ('11111111-1111-1111-1111-111111111111', 'Portal Test Studio');

INSERT INTO public.workspace_members (workspace_id, user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999'::UUID, 'owner');

-- 2. Setup Client and Project
INSERT INTO public.clients (id, workspace_id, client_type, display_name)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'individual', 'Marcus Aurelius');

INSERT INTO public.projects (id, workspace_id, client_id, title, status)
VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Commercial Architecture Shoot', 'active');

-- Add Deliverable and File Reference
INSERT INTO public.deliverables (id, workspace_id, project_id, label, status)
VALUES ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '30 Retouched Architecture Stills', 'approved');

INSERT INTO public.file_references (workspace_id, project_id, deliverable_id, provider, display_name, url_or_path, is_client_visible)
VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'google_drive', 'High-Res Stills (Google Drive)', 'https://drive.google.com/drive/folders/123xyz', TRUE);

-- Add internal expense (MUST NOT be exposed to client, INV-004)
INSERT INTO public.expenses (workspace_id, project_id, category, amount, label, date)
VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Equipment Rental', 2500000, 'Tilt-shift lens rental', CURRENT_DATE);

-- Test 1: Generate Status Share Link
DO $$
DECLARE
    gen_result JSONB;
    raw_tok TEXT;
    link_id UUID;
    status_proj JSONB;
    revoke_res JSONB;
BEGIN
    gen_result := generate_project_status_share_link('33333333-3333-3333-3333-333333333333');
    raw_tok := gen_result->>'raw_token';
    link_id := (gen_result->>'link_id')::UUID;

    -- Test 2: Project status returns correct client title and client name
    status_proj := get_public_project_status(raw_tok);
    
    PERFORM is(status_proj->'project'->>'title', 'Commercial Architecture Shoot', 'Public portal projects correct project title');
    PERFORM is(status_proj->'client'->>'display_name', 'Marcus Aurelius', 'Public portal projects correct client display name');
    
    -- Test 3: Approved deliverable includes client-visible Google Drive link
    PERFORM is(
        status_proj->'deliverables'->0->'files'->0->>'display_name',
        'High-Res Stills (Google Drive)',
        'Client-visible Google Drive gallery file attached to deliverable'
    );

    -- Test 4: Verify internal expense, payments, and financial details are NOT in projection (INV-004)
    PERFORM is(
        status_proj ? 'expenses',
        FALSE,
        'Internal studio expenses are completely omitted from public projection (INV-004)'
    );
    PERFORM is(
        status_proj ? 'payments',
        FALSE,
        'Payment schedules are completely omitted from public projection (INV-004)'
    );

    -- Test 5: Revoke Link RPC (INV-010)
    revoke_res := revoke_project_share_link(link_id);
    PERFORM is((revoke_res->>'success')::boolean, TRUE, 'revoke_project_share_link succeeded');
    
    -- Test 6: Querying with revoked token raises error
    BEGIN
        PERFORM get_public_project_status(raw_tok);
        PERFORM ok(FALSE, 'Should have failed on revoked token');
    EXCEPTION WHEN OTHERS THEN
        PERFORM ok(TRUE, 'Calling get_public_project_status with revoked token fails gracefully');
    END;
END;
$$;

SELECT * FROM finish();
ROLLBACK;
