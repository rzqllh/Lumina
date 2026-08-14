-- Migration 00009: Files and Public Share Links
-- File metadata (INV-009) and tokenized polymorphic public links (INV-004, OD-004)

CREATE TABLE file_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    deliverable_id UUID REFERENCES deliverables(id) ON DELETE SET NULL,
    revision_id UUID REFERENCES revisions(id) ON DELETE SET NULL,
    provider TEXT NOT NULL CHECK (provider IN ('app_storage', 'google_drive', 'external_url')),
    display_name TEXT NOT NULL,
    url_or_path TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    is_client_visible BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: Check file reference project scope
CREATE OR REPLACE FUNCTION check_file_ref_project_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    deliv_proj_id UUID;
BEGIN
    IF NEW.deliverable_id IS NOT NULL THEN
        SELECT project_id INTO deliv_proj_id FROM public.deliverables WHERE id = NEW.deliverable_id;
        IF deliv_proj_id IS DISTINCT FROM NEW.project_id THEN
            RAISE EXCEPTION 'Cross-parent violation: Deliverable % does not belong to Project %',
                NEW.deliverable_id, NEW.project_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_file_ref_project_scope
BEFORE INSERT OR UPDATE ON file_references
FOR EACH ROW EXECUTE FUNCTION check_file_ref_project_scope();

-- Link receipt_file_id FK on expenses
ALTER TABLE expenses
ADD CONSTRAINT fk_expenses_receipt_file
FOREIGN KEY (receipt_file_id) REFERENCES file_references(id) ON DELETE SET NULL;

-- Polymorphic Public Share Links (OD-004, INV-004)
CREATE TABLE public_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of URL token
    purpose TEXT NOT NULL DEFAULT 'status_page' CHECK (purpose IN ('status_page', 'brief_intake')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    visible_sections JSONB, -- Purpose-specific allow-list configuration
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exactly one active token per (project_id, purpose)
CREATE UNIQUE INDEX idx_public_share_links_active_purpose
ON public_share_links (project_id, purpose)
WHERE is_active = TRUE;

CREATE INDEX idx_file_references_project ON file_references(project_id);
CREATE INDEX idx_public_share_links_token_hash ON public_share_links(token_hash) WHERE is_active = TRUE;
