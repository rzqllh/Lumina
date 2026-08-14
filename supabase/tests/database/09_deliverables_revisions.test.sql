-- pgTAP Test Suite 09: Deliverables & Revisions
-- Tests: Deliverable CRUD, Status transitions, Atomic RPC revision creation with auto-increment,
-- Deliverable status synchronization, Operational freeze on force_closed projects, Cross-workspace isolation

BEGIN;

SELECT plan(10);

-- ── Fixtures ──────────────────────────────────────────────────────────────────

-- Workspace 1
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'Deliverables Test Workspace');

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
    'Deliverables Client',
    'organization'
);

-- Project 1 (Active)
INSERT INTO public.projects (id, workspace_id, client_id, title, status)
VALUES (
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000010'::UUID,
    'Commercial Video Campaign',
    'active'
);

-- Project 2 (Force Closed)
INSERT INTO public.projects (id, workspace_id, client_id, title, status, force_closed_at, force_close_reason)
VALUES (
    '00000000-0000-0000-0000-000000000021'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000010'::UUID,
    'Frozen Commercial',
    'force_closed',
    NOW(),
    'Client cancelled project'
);

-- Workspace 2 (Cross-workspace isolation fixture)
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-ffff-000000000002'::UUID, 'Foreign Workspace');

-- Mock authenticated session as Workspace 1 owner
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-ffff-000000000001', true);

-- ── Test 1: Insert deliverable ────────────────────────────────────────────────
INSERT INTO public.deliverables (
    id, workspace_id, project_id, label, quantity, type_label, deadline, status, notes
)
VALUES (
    '00000000-0000-0000-0000-000000000080'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    '4K Cinematic Teaser (60s)',
    1,
    'Video',
    '2026-10-01',
    'planned',
    'Color graded in Rec.709 with cinematic aspect ratio'
);

SELECT ok(
    EXISTS(SELECT 1 FROM public.deliverables WHERE id = '00000000-0000-0000-0000-000000000080'::UUID),
    'Test 1: Insert deliverable successfully'
);

-- ── Test 2: Transition deliverable to in_progress and delivered ───────────────
UPDATE public.deliverables
SET status = 'delivered'
WHERE id = '00000000-0000-0000-0000-000000000080'::UUID;

SELECT is(
    (SELECT status FROM public.deliverables WHERE id = '00000000-0000-0000-0000-000000000080'::UUID),
    'delivered',
    'Test 2: Deliverable status updated to delivered'
);

-- ── Test 3: Log Revision 1 via create_deliverable_revision RPC ────────────────
SELECT ok(
    (SELECT (public.create_deliverable_revision(
        '00000000-0000-0000-0000-000000000080'::UUID,
        'Please adjust background music at 0:20 and swap product close-up shot',
        '2026-10-05'::DATE
    )).revision_number = 1),
    'Test 3: create_deliverable_revision creates Revision #1'
);

-- ── Test 4: Parent deliverable status automatically updated to revision_requested
SELECT is(
    (SELECT status FROM public.deliverables WHERE id = '00000000-0000-0000-0000-000000000080'::UUID),
    'revision_requested',
    'Test 4: Deliverable status synchronized to revision_requested'
);

-- ── Test 5: Log Revision 2 via create_deliverable_revision RPC ────────────────
SELECT ok(
    (SELECT (public.create_deliverable_revision(
        '00000000-0000-0000-0000-000000000080'::UUID,
        'Increase ending logo size by 15%',
        '2026-10-08'::DATE
    )).revision_number = 2),
    'Test 5: create_deliverable_revision auto-increments to Revision #2'
);

-- ── Test 6: Verify revisions count for deliverable ────────────────────────────
SELECT is(
    (SELECT count(*)::INTEGER FROM public.revisions WHERE deliverable_id = '00000000-0000-0000-0000-000000000080'::UUID),
    2,
    'Test 6: Two revisions exist for deliverable'
);

-- ── Test 7: Approve Revision #2 and parent deliverable ────────────────────────
UPDATE public.revisions
SET status = 'approved'
WHERE deliverable_id = '00000000-0000-0000-0000-000000000080'::UUID AND revision_number = 2;

UPDATE public.deliverables
SET status = 'approved'
WHERE id = '00000000-0000-0000-0000-000000000080'::UUID;

SELECT is(
    (SELECT status FROM public.deliverables WHERE id = '00000000-0000-0000-0000-000000000080'::UUID),
    'approved',
    'Test 7: Deliverable status set to approved'
);

-- ── Test 8: Cross-workspace deliverable insertion rejected ────────────────────
SELECT throws_ok(
    $$ INSERT INTO public.deliverables (
        workspace_id, project_id, label
    ) VALUES (
        '00000000-0000-0000-ffff-000000000002'::UUID,
        '00000000-0000-0000-0000-000000000020'::UUID,
        'Cross Workspace Deliverable'
    ) $$,
    'P0001',
    NULL::text,
    'Test 8: Cross-workspace deliverable insertion is rejected'
);

-- ── Test 9: Operational freeze on force_closed project (Deliverables) ─────────
SELECT throws_ok(
    $$ INSERT INTO public.deliverables (
        workspace_id, project_id, label
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000021'::UUID,
        'Frozen Deliverable'
    ) $$,
    'P0001',
    NULL::text,
    'Test 9: Adding deliverable to force_closed project is blocked'
);

-- ── Test 10: Cascade deletion of revisions on deliverable deletion ────────────
DELETE FROM public.deliverables WHERE id = '00000000-0000-0000-0000-000000000080'::UUID;

SELECT is(
    (SELECT count(*)::INTEGER FROM public.revisions WHERE deliverable_id = '00000000-0000-0000-0000-000000000080'::UUID),
    0,
    'Test 10: Revisions cascade-deleted when parent deliverable is deleted'
);

SELECT * FROM finish();
ROLLBACK;
