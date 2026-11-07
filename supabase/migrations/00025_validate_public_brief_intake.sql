-- 00025: Validate untrusted, bearer-token brief intake before inserting submissions.
-- Additive migration: do not edit already-applied 00021 or rewrite historical submissions.
CREATE OR REPLACE FUNCTION public.submit_public_brief(
    p_token TEXT,
    p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    link_record RECORD;
    target_brief RECORD;
    answer_key TEXT;
    answer_value JSONB;
    field_record RECORD;
    answer_type TEXT;
    submission_id UUID;
BEGIN
    -- Reject malformed/abusive input before hashing, JSON iteration or database writes.
    IF p_token IS NULL OR length(p_token) = 0 OR length(p_token) > 256
       OR jsonb_typeof(p_answers) IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION 'Invalid brief intake request' USING ERRCODE = '22023';
    END IF;

    IF octet_length(p_answers::TEXT) > 65536
       OR (SELECT count(*) FROM jsonb_object_keys(p_answers)) > 100 THEN
        RAISE EXCEPTION 'Brief intake payload exceeds limits' USING ERRCODE = '22023';
    END IF;

    SELECT id, workspace_id, project_id
      INTO link_record
      FROM public.public_share_links
     WHERE token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
       AND purpose = 'brief_intake'
       AND is_active = TRUE
       AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid, expired, or revoked brief intake link' USING ERRCODE = '22023';
    END IF;

    SELECT id
      INTO target_brief
      FROM public.briefs
     WHERE project_id = link_record.project_id
       AND workspace_id = link_record.workspace_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Brief intake is unavailable' USING ERRCODE = '22023';
    END IF;

    -- Do not allow public clients to name any internal/read-only, foreign or unknown field.
    FOR answer_key, answer_value IN SELECT key, value FROM jsonb_each(p_answers) LOOP
        IF answer_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
           OR octet_length(answer_value::TEXT) > 8192 THEN
            RAISE EXCEPTION 'Invalid brief answer' USING ERRCODE = '22023';
        END IF;

        SELECT f.field_type, f.is_required, f.visibility
          INTO field_record
          FROM public.brief_fields AS f
          JOIN public.brief_sections AS s ON s.id = f.section_id
         WHERE f.id = answer_key::UUID
           AND s.brief_id = target_brief.id
           AND f.visibility IN ('client_can_fill', 'client_must_fill');

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Answer field is not available for this brief' USING ERRCODE = '22023';
        END IF;

        answer_type := jsonb_typeof(answer_value);

        IF field_record.field_type = 'checkbox' THEN
            IF answer_type NOT IN ('boolean', 'null') THEN
                RAISE EXCEPTION 'Invalid checkbox answer' USING ERRCODE = '22023';
            END IF;
        ELSIF field_record.field_type = 'number' THEN
            -- Browser input[type=number] serializes strings; allow numeric JSON as well.
            IF answer_type NOT IN ('string', 'number', 'null')
               OR (answer_type = 'string' AND (answer_value #>> '{}') !~
                   '^[+-]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?$') THEN
                RAISE EXCEPTION 'Invalid numeric answer' USING ERRCODE = '22023';
            END IF;
        ELSIF field_record.field_type IN ('multi_select', 'checklist', 'schedule_timeline') THEN
            -- Existing public form renders these as text; array-valued clients remain supported.
            IF answer_type NOT IN ('string', 'array', 'null') THEN
                RAISE EXCEPTION 'Invalid structured answer' USING ERRCODE = '22023';
            END IF;
            IF answer_type = 'array' AND EXISTS (
                SELECT 1 FROM jsonb_array_elements(answer_value) AS el(value)
                 WHERE jsonb_typeof(el.value) NOT IN ('string', 'number', 'boolean')
            ) THEN
                RAISE EXCEPTION 'Invalid structured answer items' USING ERRCODE = '22023';
            END IF;
        ELSE
            -- Fields in the current renderer are text controls; reject object injection.
            IF answer_type NOT IN ('string', 'null') THEN
                RAISE EXCEPTION 'Invalid text answer' USING ERRCODE = '22023';
            END IF;
        END IF;
    END LOOP;

    -- Validate all visible required fields, not only those supplied by the caller.
    IF EXISTS (
        SELECT 1
          FROM public.brief_fields AS f
          JOIN public.brief_sections AS s ON s.id = f.section_id
         WHERE s.brief_id = target_brief.id
           AND f.visibility IN ('client_can_fill', 'client_must_fill')
           AND (f.is_required OR f.visibility = 'client_must_fill')
           AND (
               NOT (p_answers ? f.id::TEXT)
               OR CASE jsonb_typeof(p_answers -> f.id::TEXT)
                    WHEN 'null' THEN TRUE
                    WHEN 'string' THEN btrim(p_answers ->> f.id::TEXT) = ''
                    WHEN 'array' THEN jsonb_array_length(p_answers -> f.id::TEXT) = 0
                    ELSE FALSE
                  END
           )
    ) THEN
        RAISE EXCEPTION 'Required brief answers are missing' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.brief_submissions (brief_id, submitted_values, review_status)
    VALUES (target_brief.id, p_answers, 'pending')
    RETURNING id INTO submission_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'submission_id', submission_id,
        'submitted_at', NOW()
    );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_public_brief(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_public_brief(TEXT, JSONB) TO anon, authenticated;
