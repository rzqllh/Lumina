-- Migration 00023: Fix apply_brief_submission_review to record decisions in brief_submission_reviews table schema
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

GRANT EXECUTE ON FUNCTION apply_brief_submission_review(UUID, JSONB) TO authenticated;
