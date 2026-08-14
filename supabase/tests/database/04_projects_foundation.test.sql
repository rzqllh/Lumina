-- Lumina Database Test Suite (pgTAP)
-- Test Suite 04: Project Foundation, Canonical Brief Invariant & Cross-Workspace Integrity

BEGIN;
SELECT plan(6);

-- Test 1: Check required tables exist
SELECT has_table('public', 'projects', 'projects table exists in public schema');
SELECT has_table('public', 'briefs', 'briefs table exists in public schema');

-- Setup test fixtures: 2 workspaces, 1 client in workspace A, 1 client in workspace B
INSERT INTO workspaces (id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Studio Alpha'),
    ('22222222-2222-2222-2222-222222222222', 'Studio Beta');

INSERT INTO clients (id, workspace_id, display_name, client_type) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Alpha Client', 'individual'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Beta Client', 'organization');

-- Test 2: Project creation in Workspace A automatically generates 1:1 canonical Brief
INSERT INTO projects (id, workspace_id, client_id, title, status)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Alpha Campaign Commercial',
    'active'
);

SELECT results_eq(
    'SELECT project_id, title FROM public.briefs WHERE project_id = ''33333333-3333-3333-3333-333333333333''',
    $$ VALUES ('33333333-3333-3333-3333-333333333333'::uuid, 'Alpha Campaign Commercial Brief'::text) $$,
    'PROJ-REQ-003: Inserting project automatically triggers exactly 1:1 canonical Brief creation'
);

-- Test 3: Duplicate Brief insertion for same project is rejected by UNIQUE constraint
SELECT throws_ok(
    'INSERT INTO public.briefs (workspace_id, project_id, title) VALUES (''11111111-1111-1111-1111-111111111111'', ''33333333-3333-3333-3333-333333333333'', ''Duplicate Brief'')',
    '23505',
    NULL,
    'PROJ-REQ-003: Exact 1:1 Brief guarantee enforces no duplicate briefs per project'
);

-- Test 4: Project in Workspace A referencing Client in Workspace B is rejected by cross-parent trigger
SELECT throws_ok(
    'INSERT INTO public.projects (workspace_id, client_id, title) VALUES (''11111111-1111-1111-1111-111111111111'', ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'', ''Cross-Workspace Violation Project'')',
    'P0001',
    NULL,
    'PROJ-REQ-006: Project cannot reference client belonging to different workspace'
);

-- Test 5: Invalid project status is rejected by check constraint
SELECT throws_ok(
    'INSERT INTO public.projects (workspace_id, client_id, title, status) VALUES (''11111111-1111-1111-1111-111111111111'', ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'', ''Bad Status Project'', ''completed'')',
    '23514',
    NULL,
    'PROJ-REQ-001: Invalid status (e.g. completed) rejected by CHECK constraint'
);

SELECT * FROM finish();
ROLLBACK;
