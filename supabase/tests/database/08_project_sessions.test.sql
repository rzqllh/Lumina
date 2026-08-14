-- pgTAP Test Suite 08: Project Sessions
-- Tests: Session CRUD, Session types, Status transitions (scheduled, completed, cancelled),
-- Operational freeze on force_closed projects, Cross-workspace isolation

BEGIN;

SELECT plan(9);

-- ── Fixtures ──────────────────────────────────────────────────────────────────

-- Workspace 1
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'Sessions Test Workspace');

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
    'Sessions Client',
    'couple'
);

-- Project 1 (Active)
INSERT INTO public.projects (id, workspace_id, client_id, title, status)
VALUES (
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000010'::UUID,
    'Sessions Active Project',
    'active'
);

-- Project 2 (Force Closed)
INSERT INTO public.projects (id, workspace_id, client_id, title, status, force_closed_at, force_close_reason)
VALUES (
    '00000000-0000-0000-0000-000000000021'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000010'::UUID,
    'Sessions Closed Project',
    'force_closed',
    NOW(),
    'Client cancelled project'
);

-- Workspace 2 (Cross-workspace isolation fixture)
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-ffff-000000000002'::UUID, 'Foreign Workspace');

-- ── Test 1: Insert standard shoot session ────────────────────────────────────
INSERT INTO public.sessions (
    id, workspace_id, project_id, type, title, date, start_time, end_time, location, notes, status
)
VALUES (
    '00000000-0000-0000-0000-000000000070'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    'shoot',
    'Pre-wedding Outdoor Shoot',
    '2026-09-15',
    '06:00',
    '12:00',
    'Pine Forest Lembang',
    'Bring natural light reflectors and wide angle lens',
    'scheduled'
);

SELECT ok(
    EXISTS(SELECT 1 FROM public.sessions WHERE id = '00000000-0000-0000-0000-000000000070'::UUID),
    'Test 1: Insert shoot session successfully'
);

-- ── Test 2: Insert custom session with custom_type_label ──────────────────────
INSERT INTO public.sessions (
    id, workspace_id, project_id, type, custom_type_label, title, date, start_time, end_time, location, status
)
VALUES (
    '00000000-0000-0000-0000-000000000071'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    'custom',
    'Wardrobe Fitting',
    'Gown & Suit Tryout',
    '2026-09-10',
    '14:00',
    '16:00',
    'Studio Vendor Bandung',
    'scheduled'
);

SELECT ok(
    EXISTS(SELECT 1 FROM public.sessions WHERE id = '00000000-0000-0000-0000-000000000071'::UUID AND custom_type_label = 'Wardrobe Fitting'),
    'Test 2: Insert custom session with custom_type_label successfully'
);

-- ── Test 3: Transition session status to completed ────────────────────────────
UPDATE public.sessions
SET status = 'completed'
WHERE id = '00000000-0000-0000-0000-000000000071'::UUID;

SELECT is(
    (SELECT status FROM public.sessions WHERE id = '00000000-0000-0000-0000-000000000071'::UUID),
    'completed',
    'Test 3: Transition session status to completed'
);

-- ── Test 4: Transition session status to cancelled ────────────────────────────
UPDATE public.sessions
SET status = 'cancelled'
WHERE id = '00000000-0000-0000-0000-000000000070'::UUID;

SELECT is(
    (SELECT status FROM public.sessions WHERE id = '00000000-0000-0000-0000-000000000070'::UUID),
    'cancelled',
    'Test 4: Transition session status to cancelled'
);

-- ── Test 5: Reopen session to scheduled ───────────────────────────────────────
UPDATE public.sessions
SET status = 'scheduled'
WHERE id = '00000000-0000-0000-0000-000000000070'::UUID;

SELECT is(
    (SELECT status FROM public.sessions WHERE id = '00000000-0000-0000-0000-000000000070'::UUID),
    'scheduled',
    'Test 5: Reopen session to scheduled'
);

-- ── Test 6: Delete a session ──────────────────────────────────────────────────
DELETE FROM public.sessions WHERE id = '00000000-0000-0000-0000-000000000071'::UUID;

SELECT ok(
    NOT EXISTS(SELECT 1 FROM public.sessions WHERE id = '00000000-0000-0000-0000-000000000071'::UUID),
    'Test 6: Delete session successfully'
);

-- ── Test 7: Cross-workspace session rejection ─────────────────────────────────
SELECT throws_ok(
    $$ INSERT INTO public.sessions (
        workspace_id, project_id, type, title, date
    ) VALUES (
        '00000000-0000-0000-ffff-000000000002'::UUID,
        '00000000-0000-0000-0000-000000000020'::UUID,
        'shoot',
        'Cross Workspace Shoot',
        '2026-09-20'
    ) $$,
    'Cross-parent violation%',
    'Test 7: Cross-workspace session insertion is rejected'
);

-- ── Test 8: Operational freeze on force_closed project (Insert) ───────────────
SELECT throws_ok(
    $$ INSERT INTO public.sessions (
        workspace_id, project_id, type, title, date
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000021'::UUID,
        'meeting',
        'Frozen Meeting',
        '2026-09-22'
    ) $$,
    'Operational freeze violation%',
    'Test 8: Adding session to force_closed project is blocked'
);

-- ── Test 9: Cascade deletion on project deletion ──────────────────────────────
DELETE FROM public.projects WHERE id = '00000000-0000-0000-0000-000000000020'::UUID;

SELECT is(
    (SELECT count(*)::INTEGER FROM public.sessions WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    0,
    'Test 9: Sessions are cascade-deleted with parent project'
);

SELECT * FROM finish();
ROLLBACK;
