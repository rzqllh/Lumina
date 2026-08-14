-- Lumina Database Test Suite (pgTAP)
-- Test Suite 03: Clients & Contacts Integrity and Invariants

BEGIN;
SELECT plan(6);

-- Test 1: Check required tables exist
SELECT has_table('public', 'clients', 'clients table exists in public schema');
SELECT has_table('public', 'client_contacts', 'client_contacts table exists in public schema');

-- Setup workspace test fixture
INSERT INTO workspaces (id, name) VALUES ('99999999-9999-9999-9999-999999999999', 'Studio Nine');

-- Test 2: Insert client with canonical types
INSERT INTO clients (id, workspace_id, display_name, client_type, email, phone)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '99999999-9999-9999-9999-999999999999',
    'Sarah & Dave Wedding',
    'couple',
    'sarah.dave@example.com',
    '+628123456789'
);

SELECT results_eq(
    'SELECT display_name, client_type FROM public.clients WHERE id = ''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa''',
    $$ VALUES ('Sarah & Dave Wedding'::text, 'couple'::text) $$,
    'CLIENT-REQ-002: Client successfully created with couple type'
);

-- Test 3: Insert associated client contact
INSERT INTO client_contacts (id, workspace_id, client_id, name, role_label, is_primary)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Sarah Jenkins',
    'Bride',
    true
);

SELECT results_eq(
    'SELECT name, role_label, is_primary FROM public.client_contacts WHERE id = ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb''',
    $$ VALUES ('Sarah Jenkins'::text, 'Bride'::text, true) $$,
    'CLIENT-REQ-005: Client contact successfully created and linked to parent client'
);

-- Test 4: Orphan contact with non-existent client is rejected by foreign key
SELECT throws_ok(
    'INSERT INTO public.client_contacts (workspace_id, client_id, name) VALUES (''99999999-9999-9999-9999-999999999999'', ''00000000-0000-0000-0000-000000000000'', ''Orphan Person'')',
    '23503',
    NULL,
    'CLIENT-REQ-006: Client contact cannot be created without a valid parent client'
);

-- Test 5: Invalid client_type is rejected by check constraint
SELECT throws_ok(
    'INSERT INTO public.clients (workspace_id, display_name, client_type) VALUES (''99999999-9999-9999-9999-999999999999'', ''Invalid Client'', ''unsupported_type'')',
    '23514',
    NULL,
    'CLIENT-REQ-002: Invalid client_type is rejected by check constraint'
);

SELECT * FROM finish();
ROLLBACK;
