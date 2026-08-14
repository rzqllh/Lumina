-- pgTAP Test Suite 07: Project Workflow & Tasks
-- Tests: Template CRUD, Stage snapshots, Atomic RPC (replace/append), Stage status transitions,
-- Task scoping, Stage deletion task preservation (ON DELETE SET NULL), Operational freeze, Workspace isolation

BEGIN;

SELECT plan(13);

-- ── Fixtures ──────────────────────────────────────────────────────────────────

-- Workspace 1
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'Workflow Test Workspace');

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
    'Workflow Client',
    'individual'
);

-- Project 1 (Active)
INSERT INTO public.projects (id, workspace_id, client_id, title, status)
VALUES (
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000010'::UUID,
    'Workflow Active Project',
    'active'
);

-- Project 2 (Force Closed)
INSERT INTO public.projects (id, workspace_id, client_id, title, status, force_closed_at, force_close_reason)
VALUES (
    '00000000-0000-0000-0000-000000000021'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000010'::UUID,
    'Workflow Closed Project',
    'force_closed',
    NOW(),
    'Client cancelled project'
);

-- Workflow Template 1
INSERT INTO public.workflow_templates (id, workspace_id, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000030'::UUID, '00000000-0000-0000-0000-000000000001'::UUID, 'Wedding Workflow', TRUE);

INSERT INTO public.workflow_template_stages (id, workflow_template_id, label, position)
VALUES
    ('00000000-0000-0000-0000-000000000040'::UUID, '00000000-0000-0000-0000-000000000030'::UUID, 'Pre-Production', 0),
    ('00000000-0000-0000-0000-000000000041'::UUID, '00000000-0000-0000-0000-000000000030'::UUID, 'Production / Shoot', 1),
    ('00000000-0000-0000-0000-000000000042'::UUID, '00000000-0000-0000-0000-000000000030'::UUID, 'Post-Production', 2);

-- Workspace 2 (Cross-workspace isolation fixture)
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-ffff-000000000002'::UUID, 'Foreign Workspace');

INSERT INTO public.workflow_templates (id, workspace_id, name, is_active)
VALUES ('00000000-0000-0000-ffff-000000000030'::UUID, '00000000-0000-0000-ffff-000000000002'::UUID, 'Foreign Workflow', TRUE);

INSERT INTO public.workflow_template_stages (id, workflow_template_id, label, position)
VALUES ('00000000-0000-0000-ffff-000000000040'::UUID, '00000000-0000-0000-ffff-000000000030'::UUID, 'Foreign Stage', 0);

-- Mock authenticated session as Workspace 1 owner
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-ffff-000000000001', true);

-- ── Test 1: apply_workflow_template_to_project in replace mode copies stages ──
SELECT ok(
    (SELECT count(*) = 3 FROM public.apply_workflow_template_to_project(
        '00000000-0000-0000-0000-000000000020'::UUID,
        '00000000-0000-0000-0000-000000000030'::UUID,
        'replace'
    )),
    'Test 1: apply_workflow_template_to_project inserts all 3 template stages'
);

-- ── Test 2: Project stages store correct initial status and labels ─────────────
SELECT is(
    (SELECT array_agg(label ORDER BY position ASC) FROM public.project_workflow_stages WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    ARRAY['Pre-Production', 'Production / Shoot', 'Post-Production'],
    'Test 2: Project stages match template labels in position order'
);

SELECT ok(
    (SELECT bool_and(status = 'not_started') FROM public.project_workflow_stages WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    'Test 3: Project stages are initialized with status not_started'
);

-- ── Test 4: Stage status transition to active and completed ───────────────────
UPDATE public.project_workflow_stages
SET status = 'active'
WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID AND label = 'Pre-Production';

SELECT is(
    (SELECT status FROM public.project_workflow_stages WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID AND label = 'Pre-Production'),
    'active',
    'Test 4: Stage status transitioned to active'
);

-- ── Test 5: Adding a custom stage without template source ─────────────────────
INSERT INTO public.project_workflow_stages (id, workspace_id, project_id, label, position, status)
VALUES (
    '00000000-0000-0000-0000-000000000050'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    'Client Delivery & Gallery',
    4,
    'not_started'
);

SELECT ok(
    EXISTS(SELECT 1 FROM public.project_workflow_stages WHERE id = '00000000-0000-0000-0000-000000000050'::UUID AND source_template_id IS NULL),
    'Test 5: Custom stage created with source_template_id = NULL'
);

-- ── Test 6: Creating a task linked to a stage ─────────────────────────────────
INSERT INTO public.tasks (id, workspace_id, project_id, stage_id, title, status)
VALUES (
    '00000000-0000-0000-0000-000000000060'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000050'::UUID,
    'Upload final gallery',
    'open'
);

SELECT ok(
    EXISTS(SELECT 1 FROM public.tasks WHERE id = '00000000-0000-0000-0000-000000000060'::UUID AND stage_id = '00000000-0000-0000-0000-000000000050'::UUID),
    'Test 6: Task linked to custom stage successfully'
);

-- ── Test 7: Deleting a stage unlinks tasks (stage_id = NULL, INV-014) ──────────
DELETE FROM public.project_workflow_stages WHERE id = '00000000-0000-0000-0000-000000000050'::UUID;

SELECT is(
    (SELECT stage_id FROM public.tasks WHERE id = '00000000-0000-0000-0000-000000000060'::UUID),
    NULL,
    'Test 7: Task stage_id set to NULL upon stage deletion without deleting task'
);

-- ── Test 8: Historical Snapshot Stability (INV-008) ───────────────────────────
UPDATE public.workflow_templates SET name = 'Renamed Workflow' WHERE id = '00000000-0000-0000-0000-000000000030'::UUID;
UPDATE public.workflow_template_stages SET label = 'Modified Pre-Prod' WHERE workflow_template_id = '00000000-0000-0000-0000-000000000030'::UUID AND label = 'Pre-Production';

SELECT is(
    (SELECT label FROM public.project_workflow_stages WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID AND position = 1),
    'Pre-Production',
    'Test 8: Editing catalog template stage does not mutate historical project workflow stage'
);

-- ── Test 9: Apply template in append mode ─────────────────────────────────────
SELECT ok(
    (SELECT count(*) = 3 FROM public.apply_workflow_template_to_project(
        '00000000-0000-0000-0000-000000000020'::UUID,
        '00000000-0000-0000-0000-000000000030'::UUID,
        'append'
    )),
    'Test 9: Append mode adds 3 more stages'
);

SELECT is(
    (SELECT count(*)::INTEGER FROM public.project_workflow_stages WHERE project_id = '00000000-0000-0000-0000-000000000020'::UUID),
    6,
    'Test 10: Total project stages is now 6 (3 existing + 3 appended)'
);

-- ── Test 11: Cross-workspace template apply rejected ──────────────────────────
SELECT throws_ok(
    $$ SELECT public.apply_workflow_template_to_project(
        '00000000-0000-0000-0000-000000000020'::UUID,
        '00000000-0000-0000-ffff-000000000030'::UUID,
        'replace'
    ) $$,
    'P0001',
    NULL::text,
    'Test 11: Cross-workspace workflow template apply is rejected'
);

-- ── Test 12: Operational freeze on force-closed project ───────────────────────
SELECT throws_ok(
    $$ INSERT INTO public.project_workflow_stages (workspace_id, project_id, label, position)
       VALUES ('00000000-0000-0000-0000-000000000001'::UUID, '00000000-0000-0000-0000-000000000021'::UUID, 'Frozen Stage', 1) $$,
    'P0001',
    NULL::text,
    'Test 12: Adding stage to force_closed project is blocked'
);

SELECT throws_ok(
    $$ INSERT INTO public.tasks (workspace_id, project_id, title)
       VALUES ('00000000-0000-0000-0000-000000000001'::UUID, '00000000-0000-0000-0000-000000000021'::UUID, 'Frozen Task') $$,
    'P0001',
    NULL::text,
    'Test 13: Adding task to force_closed project is blocked'
);

SELECT * FROM finish();
ROLLBACK;
