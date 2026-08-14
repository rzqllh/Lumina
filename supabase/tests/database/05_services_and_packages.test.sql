-- Lumina Database Test Suite (pgTAP)
-- Test Suite 05: Services, Packages, Cross-Workspace Isolation & Duplication RPC

BEGIN;
SELECT plan(6);

-- Test 1: Check required tables exist
SELECT has_table('public', 'services', 'services table exists in public schema');
SELECT has_table('public', 'packages', 'packages table exists in public schema');
SELECT has_table('public', 'package_items', 'package_items table exists in public schema');

-- Setup test fixtures: 2 workspaces, 1 service in WS A, 1 service in WS B
INSERT INTO workspaces (id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Studio Alpha'),
    ('22222222-2222-2222-2222-222222222222', 'Studio Beta');

INSERT INTO services (id, workspace_id, label, default_unit_price) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Alpha Photography', 1500000),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Beta Videography', 2000000);

INSERT INTO packages (id, workspace_id, name, description) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Graduation Basic', 'Essential portrait preset');

INSERT INTO package_items (id, package_id, service_id, label, quantity, unit_price, position) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alpha Photography', 1, 1500000, 0);

-- Test 2: Cross-workspace service reference rejection
SELECT throws_ok(
    'INSERT INTO package_items (package_id, service_id, label, quantity, unit_price) VALUES (''cccccccc-cccc-cccc-cccc-cccccccccccc'', ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'', ''Beta Cross Service'', 1, 2000000)',
    'P0001',
    NULL,
    'CAT-REQ-009: Package item cannot reference service belonging to different workspace'
);

-- Test 3: Package item without service (custom line) succeeds
INSERT INTO package_items (package_id, service_id, label, quantity, unit_price, position) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, 'Custom Photo Album Print', 2, 350000, 1);

SELECT is(
    (SELECT COUNT(*) FROM package_items WHERE package_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    2::bigint,
    'CAT-REQ-006: Custom line items with NULL service_id are cleanly supported'
);

-- Test 4: Package total sum calculation
SELECT is(
    (SELECT SUM(quantity * unit_price) FROM package_items WHERE package_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    2200000::numeric,
    'CAT-REQ-008: Correct minor-unit sum: 1500000 + (2 * 350000) = 2200000'
);

SELECT * FROM finish();
ROLLBACK;
