BEGIN;
SELECT plan(11);

-- Dedicated fixture identities; no production data is touched.
INSERT INTO auth.users (id, email) VALUES
 ('11111111-aaaa-4aaa-8aaa-111111111111', 'brief_scope_owner@example.test'),
 ('22222222-bbbb-4bbb-8bbb-222222222222', 'brief_scope_other@example.test')
ON CONFLICT (id) DO NOTHING;
SELECT set_config('request.jwt.claim.sub', '11111111-aaaa-4aaa-8aaa-111111111111', true);

INSERT INTO public.workspaces (id, name) VALUES
 ('30000000-0000-4000-8000-000000000001', 'Review Scope A'),
 ('30000000-0000-4000-8000-000000000002', 'Review Scope B');
INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
 ('30000000-0000-4000-8000-000000000001', '11111111-aaaa-4aaa-8aaa-111111111111', 'owner'),
 ('30000000-0000-4000-8000-000000000002', '22222222-bbbb-4bbb-8bbb-222222222222', 'owner');
INSERT INTO public.clients (id, workspace_id, client_type, display_name) VALUES
 ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'individual', 'Client A'),
 ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'individual', 'Client B');
INSERT INTO public.projects (id, workspace_id, client_id, title, status) VALUES
 ('50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Project A1', 'active'),
 ('50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'Project B', 'active'),
 ('50000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'Project A2', 'active');

INSERT INTO public.brief_sections (id, brief_id, label) VALUES
 ('60000000-0000-4000-8000-000000000001', (SELECT id FROM public.briefs WHERE project_id = '50000000-0000-4000-8000-000000000001'), 'Section A1'),
 ('60000000-0000-4000-8000-000000000002', (SELECT id FROM public.briefs WHERE project_id = '50000000-0000-4000-8000-000000000002'), 'Section B'),
 ('60000000-0000-4000-8000-000000000003', (SELECT id FROM public.briefs WHERE project_id = '50000000-0000-4000-8000-000000000003'), 'Section A2');
INSERT INTO public.brief_fields (id, section_id, field_type, label, visibility, value) VALUES
 ('70000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', 'short_text', 'A1', 'client_can_fill', '"before-a1"'),
 ('70000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000002', 'short_text', 'B', 'client_can_fill', '"before-b"'),
 ('70000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000003', 'short_text', 'A2', 'client_can_fill', '"before-a2"');

-- A hostile client can submit foreign field IDs; approval must not honor them.
INSERT INTO public.brief_submissions (id, brief_id, submitted_values) VALUES (
 '80000000-0000-4000-8000-000000000001',
 (SELECT id FROM public.briefs WHERE project_id = '50000000-0000-4000-8000-000000000001'),
 jsonb_build_object(
   '70000000-0000-4000-8000-000000000001', 'accepted-a1',
   '70000000-0000-4000-8000-000000000002', 'attack-b',
   '70000000-0000-4000-8000-000000000003', 'attack-a2'
 )
);
CREATE TEMP TABLE brief_review_probe (case_name TEXT PRIMARY KEY, denied BOOLEAN);

DO $$
BEGIN
  BEGIN
    PERFORM public.apply_brief_submission_review(
      '80000000-0000-4000-8000-000000000001',
      '[{"field_id":"70000000-0000-4000-8000-000000000002","value":"attack-b"}]'::jsonb
    );
    INSERT INTO brief_review_probe VALUES ('cross_workspace', FALSE);
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO brief_review_probe VALUES ('cross_workspace', SQLSTATE = '22023');
  END;
  BEGIN
    PERFORM public.apply_brief_submission_review(
      '80000000-0000-4000-8000-000000000001',
      '[{"field_id":"70000000-0000-4000-8000-000000000003","value":"attack-a2"}]'::jsonb
    );
    INSERT INTO brief_review_probe VALUES ('cross_brief', FALSE);
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO brief_review_probe VALUES ('cross_brief', SQLSTATE = '22023');
  END;
  BEGIN
    PERFORM public.apply_brief_submission_review(
      '80000000-0000-4000-8000-000000000001',
      '[{"field_id":"70000000-0000-4000-8000-000000000001","value":"different-from-client"}]'::jsonb
    );
    INSERT INTO brief_review_probe VALUES ('value_tamper', FALSE);
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO brief_review_probe VALUES ('value_tamper', SQLSTATE = '22023');
  END;
END;
$$;

SELECT ok((SELECT denied FROM brief_review_probe WHERE case_name='cross_workspace'), 'Reject foreign workspace field');
SELECT is((SELECT value #>> '{}' FROM public.brief_fields WHERE id='70000000-0000-4000-8000-000000000002'), 'before-b', 'Foreign workspace value stays unchanged');
SELECT ok((SELECT denied FROM brief_review_probe WHERE case_name='cross_brief'), 'Reject different brief within same workspace');
SELECT is((SELECT value #>> '{}' FROM public.brief_fields WHERE id='70000000-0000-4000-8000-000000000003'), 'before-a2', 'Other brief value stays unchanged');
SELECT ok((SELECT denied FROM brief_review_probe WHERE case_name='value_tamper'), 'Reject value altered from client submission');
SELECT is((SELECT value #>> '{}' FROM public.brief_fields WHERE id='70000000-0000-4000-8000-000000000001'), 'before-a1', 'Rejected values cannot mutate legitimate field');
SELECT is((SELECT review_status FROM public.brief_submissions WHERE id='80000000-0000-4000-8000-000000000001'), 'pending', 'Failed review leaves submission pending');

SELECT is((public.apply_brief_submission_review(
 '80000000-0000-4000-8000-000000000001',
 '[{"field_id":"70000000-0000-4000-8000-000000000001","value":"accepted-a1"}]'::jsonb
)->>'fields_applied')::int, 1, 'Valid submitted field can be accepted');
SELECT is((SELECT value #>> '{}' FROM public.brief_fields WHERE id='70000000-0000-4000-8000-000000000001'), 'accepted-a1', 'Accepted value updates only the canonical field');
SELECT is((SELECT review_status FROM public.brief_submissions WHERE id='80000000-0000-4000-8000-000000000001'), 'reviewed', 'Valid review marks submission reviewed');
-- Completed reviews must be immutable, even when retried with an identical payload.
CREATE TEMP TABLE review_replay_probe (denied BOOLEAN);
DO $replay$
BEGIN
    BEGIN
        PERFORM public.apply_brief_submission_review(
            '80000000-0000-4000-8000-000000000001',
            '[{"field_id":"70000000-0000-4000-8000-000000000001","value":"accepted-a1"}]'::jsonb
        );
        INSERT INTO review_replay_probe VALUES (FALSE);
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO review_replay_probe VALUES (SQLSTATE = '22023');
    END;
END;
$replay$;
SELECT ok((SELECT denied FROM review_replay_probe), 'Completed review cannot be replayed');

SELECT * FROM finish();
ROLLBACK;
