BEGIN;
SELECT plan(19);

-- All fixtures are disposable and rolled back. This is DB function validation,
-- NOT proof of anonymous REST/JWT behavior or production RLS.
INSERT INTO auth.users (id, email)
VALUES ('aa000000-0000-4000-8000-000000000001', 'intake_owner@example.test')
ON CONFLICT (id) DO NOTHING;
SELECT set_config('request.jwt.claim.sub', 'aa000000-0000-4000-8000-000000000001', true);

INSERT INTO public.workspaces (id, name) VALUES
 ('bb000000-0000-4000-8000-000000000001', 'Public Intake Test Workspace');
INSERT INTO public.workspace_members (workspace_id, user_id, role)
VALUES ('bb000000-0000-4000-8000-000000000001', 'aa000000-0000-4000-8000-000000000001', 'owner');
INSERT INTO public.clients (id, workspace_id, client_type, display_name) VALUES
 ('cc000000-0000-4000-8000-000000000001', 'bb000000-0000-4000-8000-000000000001', 'individual', 'Fixture Client');
INSERT INTO public.projects (id, workspace_id, client_id, title, status) VALUES
 ('dd000000-0000-4000-8000-000000000001', 'bb000000-0000-4000-8000-000000000001', 'cc000000-0000-4000-8000-000000000001', 'Intake Project', 'active'),
 ('dd000000-0000-4000-8000-000000000002', 'bb000000-0000-4000-8000-000000000001', 'cc000000-0000-4000-8000-000000000001', 'Unrelated Project', 'active');
INSERT INTO public.brief_sections (id, brief_id, label) VALUES
 ('ee000000-0000-4000-8000-000000000001',
  (SELECT id FROM public.briefs WHERE project_id = 'dd000000-0000-4000-8000-000000000001'), 'Intake Fields'),
 ('ee000000-0000-4000-8000-000000000002',
  (SELECT id FROM public.briefs WHERE project_id = 'dd000000-0000-4000-8000-000000000002'), 'Other Fields');
INSERT INTO public.brief_fields (id, section_id, field_type, label, is_required, visibility, value) VALUES
 ('ff000000-0000-4000-8000-000000000001', 'ee000000-0000-4000-8000-000000000001', 'short_text', 'Required', TRUE, 'client_must_fill', '"canonical"'::jsonb),
 ('ff000000-0000-4000-8000-000000000002', 'ee000000-0000-4000-8000-000000000001', 'checkbox', 'Agree', FALSE, 'client_can_fill', 'false'::jsonb),
 ('ff000000-0000-4000-8000-000000000003', 'ee000000-0000-4000-8000-000000000001', 'short_text', 'Private', FALSE, 'internal_only', NULL),
 ('ff000000-0000-4000-8000-000000000004', 'ee000000-0000-4000-8000-000000000001', 'short_text', 'Read Only', FALSE, 'client_can_view', NULL),
 ('ff000000-0000-4000-8000-000000000005', 'ee000000-0000-4000-8000-000000000002', 'short_text', 'Foreign Project', FALSE, 'client_can_fill', NULL);
INSERT INTO public.public_share_links (workspace_id, project_id, token_hash, purpose, is_active)
VALUES ('bb000000-0000-4000-8000-000000000001',
        'dd000000-0000-4000-8000-000000000001',
        encode(extensions.digest('valid-intake-token', 'sha256'), 'hex'),
        'brief_intake', TRUE);

SELECT is(
 (public.submit_public_brief('valid-intake-token',
    jsonb_build_object('ff000000-0000-4000-8000-000000000001', 'Client response',
                       'ff000000-0000-4000-8000-000000000002', FALSE))->>'success')::boolean,
 TRUE, 'Valid editable submission accepted');
SELECT is((SELECT review_status FROM public.brief_submissions LIMIT 1),
          'pending', 'Submission still awaits human review');
SELECT ok((SELECT submitted_values ? 'ff000000-0000-4000-8000-000000000002'
           FROM public.brief_submissions LIMIT 1),
          'Boolean checkbox answer retained');
SELECT is((SELECT value #>> '{}' FROM public.brief_fields
           WHERE id = 'ff000000-0000-4000-8000-000000000001'),
          'canonical', 'Submission cannot write canonical value without approval');

CREATE TEMP TABLE intake_validation_probes (case_name TEXT PRIMARY KEY, denied BOOLEAN);
DO $test$
DECLARE
    probe RECORD;
    good JSONB := jsonb_build_object('ff000000-0000-4000-8000-000000000001', 'Client response');
BEGIN
    FOR probe IN
        SELECT * FROM (VALUES
          ('bad_shape', 'valid-intake-token', '[]'::jsonb),
          ('null_json', 'valid-intake-token', 'null'::jsonb),
          ('unknown_field', 'valid-intake-token', good || jsonb_build_object('ff000000-0000-4000-8000-000000000099', 'x')),
          ('cross_brief', 'valid-intake-token', good || jsonb_build_object('ff000000-0000-4000-8000-000000000005', 'x')),
          ('internal_only', 'valid-intake-token', good || jsonb_build_object('ff000000-0000-4000-8000-000000000003', 'x')),
          ('read_only', 'valid-intake-token', good || jsonb_build_object('ff000000-0000-4000-8000-000000000004', 'x')),
          ('missing_required', 'valid-intake-token', '{}'::jsonb),
          ('blank_required', 'valid-intake-token', jsonb_build_object('ff000000-0000-4000-8000-000000000001', '  ')),
          ('wrong_checkbox', 'valid-intake-token', good || jsonb_build_object('ff000000-0000-4000-8000-000000000002', 'yes')),
          ('oversized_answer', 'valid-intake-token', jsonb_build_object('ff000000-0000-4000-8000-000000000001', repeat('x', 9000))),
          ('invalid_token', 'not-valid-token', good),
          ('object_injection', 'valid-intake-token', jsonb_build_object('ff000000-0000-4000-8000-000000000001', jsonb_build_object('x', 'y'))),
          ('malformed_key', 'valid-intake-token', good || jsonb_build_object('not-an-id', 'x'))
        ) AS v(case_name, token, answers)
    LOOP
        BEGIN
            PERFORM public.submit_public_brief(probe.token, probe.answers);
            INSERT INTO intake_validation_probes VALUES (probe.case_name, FALSE);
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO intake_validation_probes VALUES (probe.case_name, SQLSTATE = '22023');
        END;
    END LOOP;
END;
$test$;

SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='bad_shape'), 'Reject array instead of object');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='null_json'), 'Reject null payload');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='unknown_field'), 'Reject unknown field');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='cross_brief'), 'Reject unrelated project field');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='internal_only'), 'Reject private field');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='read_only'), 'Reject read-only field');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='missing_required'), 'Require mandatory answer');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='blank_required'), 'Reject whitespace-only mandatory answer');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='wrong_checkbox'), 'Require boolean checkbox');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='oversized_answer'), 'Cap per-answer serialized size');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='invalid_token'), 'Reject invalid public token');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='object_injection'), 'Reject object in scalar answer');
SELECT ok((SELECT denied FROM intake_validation_probes WHERE case_name='malformed_key'), 'Reject non-UUID keys');

SELECT is((SELECT count(*)::integer FROM public.brief_submissions),
          1, 'Failed submissions never insert a row');

UPDATE public.public_share_links SET is_active = FALSE
 WHERE project_id = 'dd000000-0000-4000-8000-000000000001'
   AND purpose = 'brief_intake';
SELECT throws_ok(
 $$SELECT public.submit_public_brief('valid-intake-token',
  '{"ff000000-0000-4000-8000-000000000001":"Client response"}'::jsonb)$$,
 '22023', 'Invalid, expired, or revoked brief intake link',
 'Revoked token is rejected');

SELECT * FROM finish();
ROLLBACK;
