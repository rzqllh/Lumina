-- pgTAP Test Suite 10: Financial Tracking, Payments, Expenses & Project Closure
-- Tests: Payments CRUD, Expenses, Collaborators & Engagements, Financial aggregations,
-- Normal closure gate validations, Force-close with reason, Operational freeze, and Reopening.

BEGIN;

SELECT plan(12);

-- ── Fixtures ──────────────────────────────────────────────────────────────────

-- Workspace 1
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'Finance Workspace');

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
    'Finance Client',
    'organization'
);

-- Project 1 (Active)
INSERT INTO public.projects (id, workspace_id, client_id, title, status)
VALUES (
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000010'::UUID,
    'Commercial Production',
    'active'
);

-- Service Item on Project 1: IDR 10,000,000
INSERT INTO public.project_services (
    id, workspace_id, project_id, label, unit_price, quantity
)
VALUES (
    '00000000-0000-0000-0000-000000000030'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    'Video Production Package',
    10000000,
    1
);

-- Workspace 2
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-ffff-000000000002'::UUID, 'Foreign Workspace');

-- Mock authenticated session as Workspace 1 owner
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-ffff-000000000001', true);

-- ── Test 1: Insert Payment Milestone ──────────────────────────────────────────
INSERT INTO public.payments (
    id, workspace_id, project_id, type, label, amount, due_date, status
)
VALUES (
    '00000000-0000-0000-0000-000000000040'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    'dp',
    '50% Initial Booking DP',
    5000000,
    CURRENT_DATE,
    'pending'
);

SELECT ok(
    EXISTS(SELECT 1 FROM public.payments WHERE id = '00000000-0000-0000-0000-000000000040'::UUID),
    'Test 1: Payment milestone inserted successfully'
);

-- ── Test 2: Mark Payment as Paid ──────────────────────────────────────────────
UPDATE public.payments
SET status = 'paid', paid_date = CURRENT_DATE, payment_method = 'Bank Transfer'
WHERE id = '00000000-0000-0000-0000-000000000040'::UUID;

SELECT is(
    (SELECT status FROM public.payments WHERE id = '00000000-0000-0000-0000-000000000040'::UUID),
    'paid',
    'Test 2: Payment status updated to paid'
);

-- ── Test 3: Insert Expense ───────────────────────────────────────────────────
INSERT INTO public.expenses (
    id, workspace_id, project_id, label, amount, date, category
)
VALUES (
    '00000000-0000-0000-0000-000000000050'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    'Lighting Gear Rental',
    1500000,
    CURRENT_DATE,
    'Equipment Rental'
);

SELECT is(
    (SELECT amount FROM public.expenses WHERE id = '00000000-0000-0000-0000-000000000050'::UUID),
    1500000::BIGINT,
    'Test 3: Generic expense recorded with amount 1,500,000'
);

-- ── Test 4: Collaborator Engagement (INV-013) ─────────────────────────────────
INSERT INTO public.collaborators (
    id, workspace_id, name, specialty
)
VALUES (
    '00000000-0000-0000-0000-000000000060'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Alex Second Shooter',
    'Cinematography'
);

INSERT INTO public.collaborator_engagements (
    id, workspace_id, project_id, collaborator_id, role_label, agreed_fee, payment_status, paid_amount
)
VALUES (
    '00000000-0000-0000-0000-000000000070'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000060'::UUID,
    'B-Camera Operator',
    2000000,
    'unpaid',
    0
);

SELECT is(
    (SELECT agreed_fee FROM public.collaborator_engagements WHERE id = '00000000-0000-0000-0000-000000000070'::UUID),
    2000000::BIGINT,
    'Test 4: Collaborator engagement created with agreed fee 2,000,000'
);

-- ── Test 5: Normal close rejected when deliverables not approved ─────────────
INSERT INTO public.deliverables (
    id, workspace_id, project_id, label, status
)
VALUES (
    '00000000-0000-0000-0000-000000000080'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    'Main Video Cut',
    'in_progress'
);

SELECT throws_ok(
    $$ SELECT public.close_project('00000000-0000-0000-0000-000000000020'::UUID) $$,
    'P0001',
    NULL::text,
    'Test 5: close_project rejected when deliverables are not approved'
);

-- ── Test 6: Normal close rejected when project has unpaid balance ────────────
UPDATE public.deliverables
SET status = 'approved'
WHERE id = '00000000-0000-0000-0000-000000000080'::UUID;

SELECT throws_ok(
    $$ SELECT public.close_project('00000000-0000-0000-0000-000000000020'::UUID) $$,
    'P0001',
    NULL::text,
    'Test 6: close_project rejected when project has outstanding balance'
);

-- ── Test 7: Normal close succeeds when fully paid and deliverables approved ───
INSERT INTO public.payments (
    id, workspace_id, project_id, type, label, amount, due_date, status, paid_date
)
VALUES (
    '00000000-0000-0000-0000-000000000041'::UUID,
    '00000000-0000-0000-0000-000000000001'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    'final',
    'Final Balance Payment',
    5000000,
    CURRENT_DATE,
    'paid',
    CURRENT_DATE
);

SELECT is(
    (SELECT (public.close_project('00000000-0000-0000-0000-000000000020'::UUID)).status),
    'closed',
    'Test 7: close_project succeeds when criteria are met'
);

-- ── Test 8: Reopen project back to active ────────────────────────────────────
SELECT is(
    (SELECT (public.reopen_project('00000000-0000-0000-0000-000000000020'::UUID)).status),
    'active',
    'Test 8: reopen_project restores active status'
);

-- ── Test 9: Force close project with recorded reason ──────────────────────────
SELECT is(
    (SELECT (public.force_close_project(
        '00000000-0000-0000-0000-000000000020'::UUID,
        'Client bankruptcy and event cancellation'
    )).status),
    'force_closed',
    'Test 9: force_close_project sets status to force_closed'
);

SELECT is(
    (SELECT force_close_reason FROM public.projects WHERE id = '00000000-0000-0000-0000-000000000020'::UUID),
    'Client bankruptcy and event cancellation',
    'Test 10: force_close_reason is stored permanently'
);

-- ── Test 11: Operational freeze on force_closed project (Expenses) ───────────
SELECT throws_ok(
    $$ INSERT INTO public.expenses (
        workspace_id, project_id, label, amount, date
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000020'::UUID,
        'Late Expense',
        500000,
        CURRENT_DATE
    ) $$,
    'P0001',
    NULL::text,
    'Test 11: Adding expense to force_closed project is blocked'
);

-- ── Test 12: Cross-workspace payment insertion rejected ───────────────────────
SELECT throws_ok(
    $$ INSERT INTO public.payments (
        workspace_id, project_id, amount, due_date
    ) VALUES (
        '00000000-0000-0000-ffff-000000000002'::UUID,
        '00000000-0000-0000-0000-000000000020'::UUID,
        1000000,
        CURRENT_DATE
    ) $$,
    'P0001',
    NULL::text,
    'Test 12: Cross-workspace payment is rejected'
);

SELECT * FROM finish();
ROLLBACK;
