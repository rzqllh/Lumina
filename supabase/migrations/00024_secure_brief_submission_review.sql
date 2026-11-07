-- Security follow-up to 00023. Do not edit an already-applied migration.
-- Scope accepted fields to the submission's canonical brief, and to values
-- actually submitted by the client. All changes remain atomic.
CREATE OR REPLACE FUNCTION public.apply_brief_submission_review(
    p_submission_id UUID,
    p_accepted_fields JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    submission_row RECORD;
    owning_brief RECORD;
    accepted JSONB;
    accepted_id UUID;
    accepted_key TEXT;
    applied_count INTEGER := 0;
BEGIN
    SELECT id, brief_id, submitted_values
      INTO submission_row
      FROM public.brief_submissions
     WHERE id = p_submission_id
     FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Brief submission not found' USING ERRCODE = '22023';
    END IF;

    SELECT id, workspace_id
      INTO owning_brief
      FROM public.briefs
     WHERE id = submission_row.brief_id;
    IF NOT FOUND OR NOT public.is_workspace_member(owning_brief.workspace_id) THEN
        RAISE EXCEPTION 'Brief review not permitted' USING ERRCODE = '42501';
    END IF;

    IF jsonb_typeof(p_accepted_fields) IS DISTINCT FROM 'array'
       OR jsonb_typeof(submission_row.submitted_values) IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION 'Invalid brief review payload' USING ERRCODE = '22023';
    END IF;

    FOR accepted IN SELECT value FROM jsonb_array_elements(p_accepted_fields) LOOP
        IF jsonb_typeof(accepted) IS DISTINCT FROM 'object'
           OR NOT (accepted ? 'field_id')
           OR NOT (accepted ? 'value') THEN
            RAISE EXCEPTION 'Invalid accepted field' USING ERRCODE = '22023';
        END IF;

        accepted_key := accepted->>'field_id';
        accepted_id := accepted_key::UUID;

        IF NOT (submission_row.submitted_values ? accepted_key)
           OR (accepted->'value') IS DISTINCT FROM (submission_row.submitted_values->accepted_key) THEN
            RAISE EXCEPTION 'Accepted field does not match the original submission'
                USING ERRCODE = '22023';
        END IF;

        UPDATE public.brief_fields AS field
           SET value = accepted->'value',
               updated_at = NOW()
          FROM public.brief_sections AS section
         WHERE field.id = accepted_id
           AND section.id = field.section_id
           AND section.brief_id = owning_brief.id
           AND field.visibility IN ('client_can_fill', 'client_must_fill');
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Accepted field is outside this submission brief'
                USING ERRCODE = '22023';
        END IF;

        INSERT INTO public.brief_submission_reviews (
            submission_id, field_id, decision, decided_at
        ) VALUES (
            p_submission_id, accepted_id, 'accepted', NOW()
        )
        ON CONFLICT (submission_id, field_id)
        DO UPDATE SET decision = 'accepted', decided_at = NOW();

        applied_count := applied_count + 1;
    END LOOP;

    UPDATE public.brief_submissions
       SET review_status = 'reviewed',
           reviewed_at = NOW()
     WHERE id = p_submission_id;

    RETURN jsonb_build_object('success', TRUE, 'fields_applied', applied_count);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_brief_submission_review(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_brief_submission_review(UUID, JSONB) TO authenticated;
