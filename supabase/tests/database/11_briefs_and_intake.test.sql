BEGIN;
SELECT plan(12);

-- 1. Setup test user and workspace
SELECT tests.create_supabase_user('brief_owner@lumina.app');
SELECT tests.authenticate_as('brief_owner@lumina.app');

INSERT INTO public.workspaces (id, name, owner_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'Brief Test Studio', tests.get_supabase_uid('brief_owner@lumina.app'));

INSERT INTO public.workspace_members (workspace_id, user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', tests.get_supabase_uid('brief_owner@lumina.app'), 'owner');

-- 2. Setup Client and Project (triggers canonical brief creation)
INSERT INTO public.clients (id, workspace_id, client_type, display_name)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'individual', 'Emma Watson');

INSERT INTO public.projects (id, workspace_id, client_id, title, status)
VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Editorial Fashion Shoot', 'active');

-- Test 1: Verify 1:1 Canonical Brief auto-created by trigger
SELECT is(
    (SELECT count(*)::int FROM public.briefs WHERE project_id = '33333333-3333-3333-3333-333333333333'),
    1,
    'Canonical 1:1 Brief was automatically created on project insertion'
);

-- Test 2: Create Brief Template with sections and fields
INSERT INTO public.brief_templates (id, workspace_id, name, description)
VALUES ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Fashion Lookbook Template', 'Standard editorial brief');

INSERT INTO public.brief_template_sections (id, brief_template_id, label, instruction_text, position)
VALUES ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Creative Direction', 'Moodboard links and tone', 0);

INSERT INTO public.brief_template_fields (section_id, field_type, label, is_required, visibility, default_value)
VALUES 
('55555555-5555-5555-5555-555555555555', 'short_text', 'Moodboard URL', TRUE, 'client_must_fill', '"https://pinterest.com/moodboard"'::jsonb),
('55555555-5555-5555-5555-555555555555', 'long_text', 'Internal Crew Notes', FALSE, 'internal_only', null);

SELECT is(
    (SELECT count(*)::int FROM public.brief_template_fields WHERE section_id = '55555555-5555-5555-5555-555555555555'),
    2,
    'Brief template sections and fields inserted correctly'
);

-- Test 3: Apply Brief Template RPC
SELECT is(
    (SELECT (apply_brief_template((SELECT id FROM public.briefs WHERE project_id = '33333333-3333-3333-3333-333333333333'), '44444444-4444-4444-4444-444444444444')->>'success')::boolean),
    TRUE,
    'apply_brief_template clones template into project brief'
);

SELECT is(
    (SELECT count(*)::int FROM public.brief_sections WHERE brief_id = (SELECT id FROM public.briefs WHERE project_id = '33333333-3333-3333-3333-333333333333')),
    1,
    'Project brief now has 1 cloned section'
);

SELECT is(
    (SELECT count(*)::int FROM public.brief_fields WHERE section_id IN (SELECT id FROM public.brief_sections WHERE brief_id = (SELECT id FROM public.briefs WHERE project_id = '33333333-3333-3333-3333-333333333333'))),
    2,
    'Project brief now has 2 cloned fields'
);

-- Test 4: Generate Brief Share Link RPC
DO $$
DECLARE
    gen_result JSONB;
    raw_tok TEXT;
    pub_brief JSONB;
    f_id TEXT;
    sub_result JSONB;
    sub_id UUID;
    apply_result JSONB;
BEGIN
    gen_result := generate_brief_share_link('33333333-3333-3333-3333-333333333333');
    raw_tok := gen_result->>'raw_token';

    -- Test 5: Validate public brief projection strips internal_only fields (INV-004)
    pub_brief := get_public_brief_intake(raw_tok);
    
    -- Assert project_title and client_name exist
    PERFORM is(pub_brief->>'project_title', 'Editorial Fashion Shoot', 'Public intake projects correct project title');
    PERFORM is(pub_brief->>'client_name', 'Emma Watson', 'Public intake projects correct client name');
    
    -- Assert only client-visible field is present (1 of 2 fields)
    PERFORM is(
        jsonb_array_length(pub_brief->'sections'->0->'fields'),
        1,
        'Public intake projection strips internal_only fields'
    );

    -- Test 6: Submit public brief answers (INV-003)
    f_id := pub_brief->'sections'->0->'fields'->0->>'id';
    sub_result := submit_public_brief(raw_tok, jsonb_build_object(f_id, 'https://pinterest.com/client-vibe'));
    
    PERFORM is((sub_result->>'success')::boolean, TRUE, 'submit_public_brief returns success');
    sub_id := (sub_result->>'submission_id')::UUID;

    -- Assert submission is pending
    PERFORM is(
        (SELECT review_status FROM public.brief_submissions WHERE id = sub_id),
        'pending',
        'New submission is marked pending review'
    );

    -- Test 7: Owner Review and Apply RPC (INV-003, INV-012)
    apply_result := apply_brief_submission_review(
        sub_id,
        jsonb_build_array(
            jsonb_build_object('field_id', f_id, 'value', '"https://pinterest.com/client-vibe"'::jsonb)
        )
    );

    PERFORM is((apply_result->>'success')::boolean, TRUE, 'apply_brief_submission_review returns success');

    -- Assert canonical brief field updated
    PERFORM is(
        (SELECT value #>> '{}' FROM public.brief_fields WHERE id = f_id::UUID),
        'https://pinterest.com/client-vibe',
        'Canonical brief field value updated after owner acceptance'
    );

    -- Assert submission marked reviewed
    PERFORM is(
        (SELECT review_status FROM public.brief_submissions WHERE id = sub_id),
        'reviewed',
        'Submission record marked reviewed'
    );
END;
$$;

SELECT * FROM finish();
ROLLBACK;
