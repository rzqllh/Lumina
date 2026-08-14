-- Migration 00022: Client-Facing Live Project Status Portal & Media Projections
-- Implements tokenized status link generation, instant revocation, and safe client projections (INV-004)

-- 1. Generate Status Share Link RPC
CREATE OR REPLACE FUNCTION generate_project_status_share_link(
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
      AND purpose = 'status_page'
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW());

    IF FOUND THEN
        RETURN jsonb_build_object(
            'link_id', link_record.id,
            'is_existing', TRUE,
            'expires_at', link_record.expires_at
        );
    END IF;

    -- Generate cryptographically secure token
    raw_token := encode(extensions.gen_random_bytes(16), 'hex');
    computed_hash := encode(extensions.digest(raw_token, 'sha256'), 'hex');

    -- Insert new active link (no forced fixed expiry; expires_at is optional)
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
        'status_page',
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

-- 2. Revoke Status Share Link RPC
CREATE OR REPLACE FUNCTION revoke_project_share_link(
    p_link_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    link_rec RECORD;
BEGIN
    SELECT * INTO link_rec FROM public.public_share_links WHERE id = p_link_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Share link with ID % not found', p_link_id;
    END IF;

    IF NOT public.is_workspace_member(link_rec.workspace_id) THEN
        RAISE EXCEPTION 'Access denied: caller is not a member of workspace %', link_rec.workspace_id;
    END IF;

    UPDATE public.public_share_links
    SET is_active = FALSE,
        revoked_at = NOW()
    WHERE id = p_link_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'revoked_at', NOW()
    );
END;
$$;

-- 3. Public Project Status Projection RPC (INV-004)
-- Strictly excludes all commercial/financial data (INV-004): Project Value, payments, receivables, expenses, margins, collaborator costs, internal notes/tasks.
CREATE OR REPLACE FUNCTION get_public_project_status(
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
    stages_json JSONB;
    sessions_json JSONB;
    deliverables_json JSONB;
    general_files_json JSONB;
BEGIN
    computed_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

    SELECT * INTO link_record
    FROM public.public_share_links
    WHERE token_hash = computed_hash
      AND purpose = 'status_page'
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW());

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid, expired, or revoked project status link';
    END IF;

    SELECT * INTO project_record FROM public.projects WHERE id = link_record.project_id;
    SELECT * INTO client_record FROM public.clients WHERE id = project_record.client_id;

    -- 1. Workflow Stages
    SELECT coalesce(jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'label', s.label,
            'position', s.position,
            'status', s.status
        ) ORDER BY s.position ASC
    ), '[]'::jsonb) INTO stages_json
    FROM public.project_workflow_stages s
    WHERE s.project_id = project_record.id;

    -- 2. Sessions
    SELECT coalesce(jsonb_agg(
        jsonb_build_object(
            'id', ses.id,
            'type', ses.type,
            'custom_type_label', ses.custom_type_label,
            'title', ses.title,
            'date', ses.date,
            'start_time', ses.start_time,
            'end_time', ses.end_time,
            'location', ses.location,
            'status', ses.status
        ) ORDER BY ses.date ASC, ses.start_time ASC
    ), '[]'::jsonb) INTO sessions_json
    FROM public.sessions ses
    WHERE ses.project_id = project_record.id;

    -- 3. Deliverables with client-visible file attachments
    SELECT coalesce(jsonb_agg(
        jsonb_build_object(
            'id', d.id,
            'label', d.label,
            'quantity', d.quantity,
            'type_label', d.type_label,
            'status', d.status,
            'deadline', d.deadline,
            'files', (
                SELECT coalesce(jsonb_agg(
                    jsonb_build_object(
                        'id', f.id,
                        'provider', f.provider,
                        'display_name', f.display_name,
                        'url_or_path', f.url_or_path
                    ) ORDER BY f.created_at ASC
                ), '[]'::jsonb)
                FROM public.file_references f
                WHERE f.deliverable_id = d.id
                  AND f.is_client_visible = TRUE
            )
        ) ORDER BY d.created_at ASC
    ), '[]'::jsonb) INTO deliverables_json
    FROM public.deliverables d
    WHERE d.project_id = project_record.id;

    -- 4. General Client-Visible Project Files
    SELECT coalesce(jsonb_agg(
        jsonb_build_object(
            'id', gf.id,
            'provider', gf.provider,
            'display_name', gf.display_name,
            'url_or_path', gf.url_or_path
        ) ORDER BY gf.created_at ASC
    ), '[]'::jsonb) INTO general_files_json
    FROM public.file_references gf
    WHERE gf.project_id = project_record.id
      AND gf.deliverable_id IS NULL
      AND gf.is_client_visible = TRUE;

    RETURN jsonb_build_object(
        'project', jsonb_build_object(
            'id', project_record.id,
            'title', project_record.title,
            'project_number', project_record.project_number,
            'status', project_record.status,
            'currency', project_record.currency
        ),
        'client', jsonb_build_object(
            'display_name', client_record.display_name
        ),
        'stages', stages_json,
        'sessions', sessions_json,
        'deliverables', deliverables_json,
        'general_files', general_files_json
    );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION generate_project_status_share_link(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_project_share_link(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_project_status(TEXT) TO anon, authenticated;
