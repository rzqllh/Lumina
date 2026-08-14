-- pgTAP Test Suite 06: Project Services & Pricing Snapshot
-- Tests: snapshot stability, workspace integrity, package apply, project value sum

BEGIN;

SELECT plan(16);

-- ── Fixtures ──────────────────────────────────────────────────────────────────

-- Workspace
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'Test Workspace');

INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-ffff-000000000001'::UUID, 'owner@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspace_members (workspace_id, user_id, role)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-ffff-000000000001'::UUID,
    'owner'
);

-- Client
INSERT INTO public.clients (id, workspace_id, display_name, client_type)
VALUES (
    '00000000-0000-0000-0000-000000000010'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Wedding Couple A',
    'couple'
);

-- Project
INSERT INTO public.projects (id, workspace_id, client_id, title, status)
VALUES (
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000010'::UUID,
    'Wedding 2026',
    'active'
);

-- Services
INSERT INTO public.services (id, workspace_id, label, default_unit_price, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000030'::UUID, '00000000-0000-0000-0000-000000000001'::UUID, 'Photography', 2500000, TRUE),
    ('00000000-0000-0000-0000-000000000031'::UUID, '00000000-0000-0000-0000-000000000001'::UUID, 'Videography', 3500000, TRUE);

-- Package
INSERT INTO public.packages (id, workspace_id, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000040'::UUID, '00000000-0000-0000-0000-000000000001'::UUID, 'Wedding Gold', TRUE);

INSERT INTO public.package_items (id, package_id, service_id, label, quantity, unit_price, position)
VALUES
    ('00000000-0000-0000-0000-000000000050'::UUID, '00000000-0000-0000-0000-000000000040'::UUID, '00000000-0000-0000-0000-000000000030'::UUID, 'Photography', 1, 2500000, 0),
    ('00000000-0000-0000-0000-000000000051'::UUID, '00000000-0000-0000-0000-000000000040'::UUID, '00000000-0000-0000-0000-000000000031'::UUID, 'Videography', 1, 3500000, 1);

-- Second workspace for cross-workspace rejection tests
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-ffff-000000000002'::UUID, 'Other Workspace');

INSERT INTO public.services (id, workspace_id, label, default_unit_price, is_active)
VALUES ('00000000-0000-0000-ffff-000000000030'::UUID, '00000000-0000-0000-ffff-000000000002'::UUID, 'Other Photography', 1000000, TRUE);

INSERT INTO public.packages (id, workspace_id, name, is_active)
VALUES ('00000000-0000-0000-ffff-000000000040'::UUID, '00000000-0000-0000-ffff-000000000002'::UUID, 'Other Package', TRUE);

-- ── Test 1: Manual project_service insertion succeeds ────────────────────────
SELECT lives_ok(
    $$INSERT INTO public.project_services
        (workspace_id, project_id, label, quantity, unit_price, subtotal, adjustment_amount)
      VALUES
        ('00000000-0000-0000-0000-000000000001'::UUID,
         '00000000-0000-0000-0000-000000000020'::UUID,
         'Custom Drone Coverage', 1, 750000, 750000, 0)$$,
    'T1: Manual project_service insertion succeeds'
);

-- ── Test 2: Subtotal stored correctly ─────────────────────────────────────────
SELECT is(
    (SELECT subtotal FROM public.project_services
      WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID
        AND label = 'Custom Drone Coverage'),
    750000::BIGINT,
    'T2: Subtotal stored correctly'
);

-- ── Test 3: Project Service with valid source_service_id succeeds ─────────────
SELECT lives_ok(
    $$INSERT INTO public.project_services
        (workspace_id, project_id, label, quantity, unit_price, subtotal, adjustment_amount,
         source_service_id)
      VALUES
        ('00000000-0000-0000-0000-000000000001'::UUID,
         '00000000-0000-0000-0000-000000000020'::UUID,
         'Photography', 1, 2500000, 2500000, 0,
         '00000000-0000-0000-0000-000000000030'::UUID)$$,
    'T3: Project Service with same-workspace source_service_id succeeds'
);

-- ── Test 4: Cross-workspace source_service_id rejected ───────────────────────
SELECT throws_ok(
    $$INSERT INTO public.project_services
        (workspace_id, project_id, label, quantity, unit_price, subtotal, adjustment_amount,
         source_service_id)
      VALUES
        ('00000000-0000-0000-0000-000000000001'::UUID,
         '00000000-0000-0000-0000-000000000020'::UUID,
         'Cross Service', 1, 1000000, 1000000, 0,
         '00000000-0000-0000-ffff-000000000030'::UUID)$$,
    'P0001',
    NULL::text,
    'T4: Cross-workspace source_service_id rejected'
);

-- ── Test 5: Cross-workspace source_package_id rejected ────────────────────────
SELECT throws_ok(
    $$INSERT INTO public.project_services
        (workspace_id, project_id, label, quantity, unit_price, subtotal, adjustment_amount,
         source_package_id)
      VALUES
        ('00000000-0000-0000-0000-000000000001'::UUID,
         '00000000-0000-0000-0000-000000000020'::UUID,
         'Cross Package Item', 1, 1000000, 1000000, 0,
         '00000000-0000-0000-ffff-000000000040'::UUID)$$,
    'P0001',
    NULL::text,
    'T5: Cross-workspace source_package_id rejected'
);

-- ── Test 6: Negative adjustment_amount stored correctly ──────────────────────
SELECT lives_ok(
    $$INSERT INTO public.project_services
        (workspace_id, project_id, label, quantity, unit_price, subtotal,
         adjustment_label, adjustment_amount)
      VALUES
        ('00000000-0000-0000-0000-000000000001'::UUID,
         '00000000-0000-0000-0000-000000000020'::UUID,
         'Photography Discounted', 1, 3000000, 3000000, 'Discount', -500000)$$,
    'T6: Negative adjustment_amount stored correctly'
);

-- ── Test 7: Net line total calculation (subtotal + adjustment_amount) ─────────
SELECT is(
    (SELECT subtotal + adjustment_amount AS net_total
       FROM public.project_services
      WHERE label = 'Photography Discounted'
        AND project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    2500000::BIGINT,
    'T7: Net line total = subtotal + adjustment_amount'
);

-- ── Test 8: Project Value sum (SUM of net_line_totals) ───────────────────────
-- At this point: Custom Drone 750000 + Photography 2500000 + Photography Discounted 2500000 = 5750000
SELECT is(
    (SELECT SUM(subtotal + adjustment_amount)::BIGINT
       FROM public.project_services
      WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    5750000::BIGINT,
    'T8: Project Value sums all net line totals'
);

-- ── Test 9: Updating source service price does NOT change project_service ────
UPDATE public.services
   SET default_unit_price = 9999999
 WHERE id = '00000000-0000-0000-0000-000000000030'::UUID;

SELECT is(
    (SELECT unit_price FROM public.project_services
      WHERE source_service_id = '00000000-0000-0000-0000-000000000030'::UUID
        AND project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    2500000::BIGINT,
    'T9: Catalog service price change does not affect existing project_service unit_price'
);

-- ── Test 10: Source deletion sets source_service_id to NULL (ON DELETE SET NULL) ──
DELETE FROM public.services WHERE id = '00000000-0000-0000-0000-000000000030'::UUID;

SELECT is(
    (SELECT COUNT(*) FROM public.project_services
      WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    3::BIGINT,
    'T10: Deleting source service does not delete project_service rows'
);

-- ── Test 11: Snapshot label unchanged after service deletion ─────────────────
SELECT is(
    (SELECT label FROM public.project_services
      WHERE source_service_id IS NULL
        AND label = 'Photography'
        AND project_id = '00000000-0000-0000-0000-000000000020'::UUID
      LIMIT 1),
    'Photography',
    'T11: Snapshot label preserved after source service deletion'
);

-- ── Test 12: apply_package_to_project RPC inserts correct count ───────────────
-- Note: function runs with SECURITY DEFINER; in test context, set local user
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-ffff-000000000001', true);

SELECT is(
    public.apply_package_to_project(
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000020'::UUID,
        '00000000-0000-0000-0000-000000000040'::UUID
    ),
    2,
    'T12: apply_package_to_project returns count of inserted rows'
);

-- ── Test 13: Package items snapshotted as separate project_services ───────────
SELECT is(
    (SELECT COUNT(*) FROM public.project_services
      WHERE source_package_id = '00000000-0000-0000-0000-000000000040'::UUID
        AND project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    2::BIGINT,
    'T13: Package items each become independent project_service rows'
);

-- ── Test 14: Package snapshot subtotal = quantity × unit_price ────────────────
SELECT ok(
    (SELECT BOOL_AND(subtotal = quantity * unit_price)
       FROM public.project_services
      WHERE source_package_id = '00000000-0000-0000-0000-000000000040'::UUID
        AND project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    'T14: Each snapshotted package item has subtotal = quantity * unit_price'
);

-- ── Test 15: Applying package twice appends (no deduplication) ────────────────
SELECT public.apply_package_to_project(
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000040'::UUID
);

SELECT is(
    (SELECT COUNT(*) FROM public.project_services
      WHERE source_package_id = '00000000-0000-0000-0000-000000000040'::UUID
        AND project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    4::BIGINT,
    'T15: Applying same package twice appends rows (no silent deduplication)'
);

-- ── Test 16: Package from other workspace rejected by RPC ─────────────────────
SELECT throws_ok(
    $$SELECT public.apply_package_to_project(
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000020'::UUID,
        '00000000-0000-0000-ffff-000000000040'::UUID
    )$$,
    'P0001',
    NULL::text,
    'T16: apply_package_to_project rejects cross-workspace package'
);

SELECT * FROM finish();
ROLLBACK;
