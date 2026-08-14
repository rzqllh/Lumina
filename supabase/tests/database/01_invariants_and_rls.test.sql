-- Lumina Database Test Suite (pgTAP)
-- Verifies database invariants, total participation triggers, cross-parent integrity, and RLS

BEGIN;
SELECT plan(15);

-- Test 1: Check required tables exist
SELECT has_table('workspaces', 'workspaces table exists');
SELECT has_table('projects', 'projects table exists');
SELECT has_table('briefs', 'briefs table exists');
SELECT has_table('public_share_links', 'public_share_links table exists');
SELECT has_table('payments', 'payments table exists');

-- Test 2: Invariant INV-011: Exact 1:1 Brief creation on project insert
-- Setup dummy test data
INSERT INTO workspaces (id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'Test Studio');
INSERT INTO clients (id, workspace_id, display_name) VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Test Client');
INSERT INTO projects (id, workspace_id, client_id, title) VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Wedding Project');

SELECT results_eq(
    'SELECT count(*)::integer FROM briefs WHERE project_id = ''33333333-3333-3333-3333-333333333333''',
    ARRAY[1],
    'INV-011: Project automatically has exactly one canonical brief created via trigger'
);

-- Test 3: Invariant INV-001 & INV-015: Snapshot independence
INSERT INTO services (id, workspace_id, label, default_unit_price) VALUES ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Main Photography', 5000000);
INSERT INTO project_services (project_id, workspace_id, label, unit_price, quantity, subtotal, source_service_id)
VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Main Photography', 5000000, 1, 5000000, '44444444-4444-4444-4444-444444444444');

-- Mutate catalog price
UPDATE services SET default_unit_price = 7500000 WHERE id = '44444444-4444-4444-4444-444444444444';

SELECT results_eq(
    'SELECT unit_price FROM project_services WHERE project_id = ''33333333-3333-3333-3333-333333333333''',
    ARRAY[5000000::bigint],
    'INV-001/INV-015: Updating catalog service rate does not mutate historical project service snapshot'
);

-- Test 4: Invariant INV-002: Revision belongs to exactly one deliverable & unique revision_number
INSERT INTO deliverables (id, workspace_id, project_id, label) VALUES ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '50 Edited Photos');
INSERT INTO revisions (workspace_id, deliverable_id, revision_number, requested_date, feedback)
VALUES ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 1, CURRENT_DATE, 'Warm tones please');

SELECT throws_ok(
    'INSERT INTO revisions (workspace_id, deliverable_id, revision_number, requested_date, feedback) VALUES (''11111111-1111-1111-1111-111111111111'', ''55555555-5555-5555-5555-555555555555'', 1, CURRENT_DATE, ''Duplicate revision'')',
    '23505',
    NULL,
    'INV-002: Duplicate revision_number for the same deliverable is rejected by unique constraint'
);

-- Test 5: Public Share Link active token uniqueness per (project, purpose) (OD-004)
INSERT INTO public_share_links (workspace_id, project_id, token_hash, purpose, is_active)
VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'hash_v1_status', 'status_page', TRUE);

SELECT throws_ok(
    'INSERT INTO public_share_links (workspace_id, project_id, token_hash, purpose, is_active) VALUES (''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'', ''hash_v2_status'', ''status_page'', TRUE)',
    '23505',
    NULL,
    'OD-004: Only one active token permitted per (project_id, purpose)'
);

-- Allow new token after revoking old token
UPDATE public_share_links SET is_active = FALSE WHERE token_hash = 'hash_v1_status';

SELECT lives_ok(
    'INSERT INTO public_share_links (workspace_id, project_id, token_hash, purpose, is_active) VALUES (''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'', ''hash_v2_status'', ''status_page'', TRUE)',
    'OD-004: New active token successfully created after revoking previous token'
);

-- Test 6: Cross-parent ProjectContact client consistency
INSERT INTO clients (id, workspace_id, display_name) VALUES ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Other Client');
INSERT INTO client_contacts (id, workspace_id, client_id, name) VALUES ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Other Contact');

SELECT throws_ok(
    'INSERT INTO project_contacts (workspace_id, project_id, client_contact_id) VALUES (''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'', ''77777777-7777-7777-7777-777777777777'')',
    'P0001',
    '%Cross-parent violation%',
    'Cross-parent check: ProjectContact with mismatched client is rejected by trigger'
);

-- Test 7: Force-close operational freeze (OD-001)
UPDATE projects SET status = 'force_closed', force_close_reason = 'Client cancelled project' WHERE id = '33333333-3333-3333-3333-333333333333';

SELECT throws_ok(
    'INSERT INTO tasks (workspace_id, project_id, title) VALUES (''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'', ''New Task'')',
    'P0001',
    '%Operational freeze violation%',
    'OD-001: Operational mutation blocked on force_closed project'
);

-- But late incoming payments are permitted on force_closed project!
SELECT lives_ok(
    'INSERT INTO payments (workspace_id, project_id, amount, due_date, status) VALUES (''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'', 1000000, CURRENT_DATE, ''paid'')',
    'OD-001: Late incoming payments are permitted on force_closed project'
);

-- Test 8: RLS enabled on all tables
SELECT results_eq(
    'SELECT count(*)::integer FROM pg_tables WHERE schemaname = ''public'' AND rowsecurity = true',
    'SELECT count(*)::integer FROM pg_tables WHERE schemaname = ''public''',
    '100% of public business tables have Row Level Security enabled'
);

SELECT * FROM finish();
ROLLBACK;
