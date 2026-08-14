-- Lumina Database Test Suite (pgTAP)
-- Test Suite 02: Auth & Personal Workspace Bootstrap Invariants

BEGIN;
SELECT plan(6);

-- Test 1: Check function exists with correct signature
SELECT has_function(
    'public',
    'bootstrap_personal_workspace',
    ARRAY[]::text[],
    'Function bootstrap_personal_workspace() exists in public schema'
);

-- Test 2: Unauthenticated caller is rejected
SELECT throws_ok(
    'SELECT * FROM public.bootstrap_personal_workspace()',
    'P0001',
    '%Authentication required to bootstrap workspace%',
    'AUTH-INV-006: Unauthenticated caller cannot invoke bootstrap RPC'
);

-- Setup test user in auth.users
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
    '88888888-8888-8888-8888-888888888888',
    'alex.creator@example.com',
    '{"full_name": "Alex Studio"}'::jsonb
);

-- Simulate authenticated session for test user
SET LOCAL "request.jwt.claim.sub" = '88888888-8888-8888-8888-888888888888';

-- Test 3: First-time bootstrap creates personal workspace with derived display name
SELECT results_eq(
    'SELECT workspace_name, member_role, is_new FROM public.bootstrap_personal_workspace()',
    $$ VALUES ('Alex Studio''s Workspace'::text, 'owner'::text, true) $$,
    'AUTH-REQ-005 / AUTH-INV-004 / AUTH-INV-005: First-time bootstrap provisions personal workspace with owner role'
);

-- Test 4: Verify workspace and member records exist in tables
SELECT results_eq(
    'SELECT count(*)::integer FROM public.workspaces WHERE name = ''Alex Studio''''s Workspace''',
    ARRAY[1],
    'AUTH-INV-001: Exactly one workspace record was created'
);

SELECT results_eq(
    'SELECT role FROM public.workspace_members WHERE user_id = ''88888888-8888-8888-8888-888888888888''',
    ARRAY['owner'::text],
    'AUTH-INV-005: Workspace member record references authenticated user with owner role'
);

-- Test 5: Second bootstrap call is completely idempotent (returns existing workspace, is_new = false)
SELECT results_eq(
    'SELECT workspace_name, member_role, is_new FROM public.bootstrap_personal_workspace()',
    $$ VALUES ('Alex Studio''s Workspace'::text, 'owner'::text, false) $$,
    'AUTH-REQ-006 / AUTH-INV-002 / AUTH-INV-003: Repeated bootstrap call returns existing workspace with is_new = false'
);

SELECT * FROM finish();
ROLLBACK;
