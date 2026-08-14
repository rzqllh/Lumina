-- Migration 00021: Structured Brief Builder, Reusable Templates & Public Intake Engine
-- Implements atomic template cloning, tokenized public intake projection, and owner review/merge procedures

-- 1. Apply Brief Template RPC
CREATE OR REPLACE FUNCTION apply_brief_template(
    p_brief_id UUID,
    p_template_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    target_brief RECORD;
    tmpl RECORD;
    t_sec RECORD;
    t_field RECORD;
    new_sec_id UUID;
    sections_count INT := 0;
    fields_count INT := 0;
BEGIN
    -- 1. Verify target brief
    SELECT * INTO target_brief FROM public.briefs WHERE id = p_brief_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Brief with ID % not found', p_brief_id;
    END IF;

    -- Verify workspace membership
    IF NOT public.is_workspace_member(target_brief.workspace_id) THEN
        RAISE EXCEPTION 'Access denied: caller is not a member of workspace %', target_brief.workspace_id;
    END IF;

    -- 2. Verify source template
    SELECT * INTO tmpl FROM public.brief_templates WHERE id = p_template_id AND workspace_id = target_brief.workspace_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Brief template with ID % not found in workspace %', p_template_id, target_brief.workspace_id;
    END IF;

    -- 3. Update brief source_template_id
    UPDATE public.briefs
    SET source_template_id = p_template_id,
        updated_at = NOW()
    WHERE id = p_brief_id;

    -- 4. Clone template sections and fields
    FOR t_sec IN (
        SELECT * FROM public.brief_template_sections
        WHERE brief_template_id = p_template_id
        ORDER BY position ASC, created_at ASC
    ) LOOP
        INSERT INTO public.brief_sections (
            brief_id,
            label,
            instruction_text,
            position
        ) VALUES (
            p_brief_id,
            t_sec.label,
            t_sec.instruction_text,
            t_sec.position
        ) RETURNING id INTO new_sec_id;

        sections_count := sections_count + 1;

        FOR t_field IN (
            SELECT * FROM public.brief_template_fields
            WHERE section_id = t_sec.id
            ORDER BY position ASC, created_at ASC
        ) LOOP
            INSERT INTO public.brief_fields (
                section_id,
                field_type,
                label,
                helper_text,
                is_required,
                visibility,
                value,
                position
            ) VALUES (
                new_sec_id,
                t_field.field_type,
                t_field.label,
                t_field.helper_text,
                t_field.is_required,
                t_field.visibility,
                t_field.default_value,
                t_field.position
            );

            fields_count := fields_count + 1;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'sections_cloned', sections_count,
        'fields_cloned', fields_count
    );
END;
$$;

-- 2. Generate Brief Share Link RPC
CREATE OR REPLACE FUNCTION generate_brief_share_link(
    p_project_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    target_project RECORD;
    raw_token TEXT;
    computed_hash TEXT;
    link_record RECORD;
BEGIN
    SELECT * INTO target_project FROM public.projects WHERE id = p_project_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Project with ID % not found', p_project_id;
    END IF;

    IF NOT public.is_workspace_member(target_project.workspace_id) THEN
        RAISE EXCEPTION 'Access denied: caller is not a member of workspace %', target_project.workspace_id;
    END IF;

    -- Check if active link already exists
    SELECT * INTO link_record
    FROM public.public_share_links
    WHERE project_id = p_project_id
      AND purpose = 'brief_intake'
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW());

    IF FOUND THEN
        RETURN jsonb_build_object(
            'link_id', link_record.id,
            'is_existing', TRUE,
            'expires_at', link_record.expires_at
        );
    END IF;

    -- Generate a cryptographically secure 32-character hexadecimal token
    raw_token := encode(extensions.gen_random_bytes(16), 'hex');
    computed_hash := encode(extensions.digest(raw_token, 'sha256'), 'hex');

    -- Insert new active share link (expires_at is optional, no fixed 30-day constraint)
    INSERT INTO public.public_share_links (
        workspace_id,
        project_id,
        token_hash,
        purpose,
        is_active,
        expires_at
    ) VALUES (
        target_project.workspace_id,
        p_project_id,
        computed_hash,
        'brief_intake',
        TRUE,
        NULL
    ) RETURNING * INTO link_record;

    RETURN jsonb_build_object(
        'link_id', link_record.id,
        'raw_token', raw_token,
        'is_existing', FALSE,
        'expires_at', link_record.expires_at
    );
END;
$$;

-- 3. Public Brief Intake Projection RPC (INV-004)
CREATE OR REPLACE FUNCTION get_public_brief_intake(
    p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    computed_hash TEXT;
    link_record RECORD;
    project_record RECORD;
    client_record RECORD;
    brief_record RECORD;
    sections_json JSONB;
BEGIN
    computed_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

    SELECT * INTO link_record
    FROM public.public_share_links
    WHERE token_hash = computed_hash
      AND purpose = 'brief_intake'
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid, expired, or revoked brief intake link';
    END IF;

    SELECT * INTO project_record FROM public.projects WHERE id = link_record.project_id;
    SELECT * INTO client_record FROM public.clients WHERE id = project_record.client_id;
    SELECT * INTO brief_record FROM public.briefs WHERE project_id = project_record.id;

    -- Aggregate non-internal sections and fields
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'label', s.label,
            'instruction_text', s.instruction_text,
            'position', s.position,
            'fields', (
                SELECT coalesce(jsonb_agg(
                    jsonb_build_object(
                        'id', f.id,
                        'field_type', f.field_type,
                        'label', f.label,
                        'helper_text', f.helper_text,
                        'is_required', f.is_required,
                        'visibility', f.visibility,
                        'value', f.value,
                        'position', f.position
                    ) ORDER BY f.position ASC, f.created_at ASC
                ), '[]'::jsonb)
                FROM public.brief_fields f
                WHERE f.section_id = s.id
                  AND f.visibility IN ('client_can_view', 'client_can_fill', 'client_must_fill')
            )
        ) ORDER BY s.position ASC, s.created_at ASC
    ) INTO sections_json
    FROM public.brief_sections s
    WHERE s.brief_id = brief_record.id;

    RETURN jsonb_build_object(
        'project_title', project_record.title,
        'client_name', client_record.display_name,
        'brief_title', brief_record.title,
        'sections', coalesce(sections_json, '[]'::jsonb)
    );
END;
$$;

-- 4. Public Brief Submission RPC (INV-003, INV-012)
CREATE OR REPLACE FUNCTION submit_public_brief(
    p_token TEXT,
    p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    computed_hash TEXT;
    link_record RECORD;
    brief_record RECORD;
    submission_id UUID;
BEGIN
    computed_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

    SELECT * INTO link_record
    FROM public.public_share_links
    WHERE token_hash = computed_hash
      AND purpose = 'brief_intake'
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid, expired, or revoked brief intake link';
    END IF;

    SELECT * INTO brief_record FROM public.briefs WHERE project_id = link_record.project_id;

    -- Insert immutable submission record
    INSERT INTO public.brief_submissions (
        brief_id,
        submitted_values,
        review_status
    ) VALUES (
        brief_record.id,
        p_answers,
        'pending'
    ) RETURNING id INTO submission_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'submission_id', submission_id,
        'submitted_at', NOW()
    );
END;
$$;

-- 5. Apply Brief Submission Review RPC (INV-003, INV-012)
CREATE OR REPLACE FUNCTION apply_brief_submission_review(
    p_submission_id UUID,
    p_accepted_fields JSONB -- Array of { "field_id": "uuid", "value": ... }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    sub RECORD;
    target_brief RECORD;
    elem JSONB;
    f_id UUID;
    f_val JSONB;
    applied_count INT := 0;
BEGIN
    SELECT * INTO sub FROM public.brief_submissions WHERE id = p_submission_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission with ID % not found', p_submission_id;
    END IF;

    SELECT * INTO target_brief FROM public.briefs WHERE id = sub.brief_id;

    IF NOT public.is_workspace_member(target_brief.workspace_id) THEN
        RAISE EXCEPTION 'Access denied: caller is not a member of workspace %', target_brief.workspace_id;
    END IF;

    -- Apply each accepted field value to canonical brief_fields and record decision
    FOR elem IN SELECT * FROM jsonb_array_elements(p_accepted_fields) LOOP
        f_id := (elem->>'field_id')::UUID;
        f_val := elem->'value';

        UPDATE public.brief_fields
        SET value = f_val,
            updated_at = NOW()
        WHERE id = f_id;

        INSERT INTO public.brief_submission_reviews (
            submission_id,
            field_id,
            decision,
            decided_at
        ) VALUES (
            p_submission_id,
            f_id,
            'accepted',
            NOW()
        )
        ON CONFLICT (submission_id, field_id) DO UPDATE
        SET decision = 'accepted',
            decided_at = NOW();

        applied_count := applied_count + 1;
    END LOOP;

    -- Mark submission as reviewed
    UPDATE public.brief_submissions
    SET review_status = 'reviewed',
        reviewed_at = NOW()
    WHERE id = p_submission_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'fields_applied', applied_count
    );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION apply_brief_template(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_brief_share_link(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_brief_intake(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_public_brief(TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION apply_brief_submission_review(UUID, JSONB) TO authenticated;
