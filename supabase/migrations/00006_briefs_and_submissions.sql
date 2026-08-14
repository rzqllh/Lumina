-- Migration 00006: Briefs and Submissions
-- 1:1 Brief guarantee, sections, fields, immutable submissions, and review queue

CREATE TABLE brief_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brief_template_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_template_id UUID NOT NULL REFERENCES brief_templates(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    instruction_text TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brief_template_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES brief_template_sections(id) ON DELETE CASCADE,
    field_type TEXT NOT NULL,
    label TEXT NOT NULL,
    helper_text TEXT,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    visibility TEXT NOT NULL DEFAULT 'client_can_fill' CHECK (visibility IN ('internal_only', 'client_can_view', 'client_can_fill', 'client_must_fill')),
    default_value JSONB,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Briefs (Exact 1:1 Project constraint, INV-011)
CREATE TABLE briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    source_template_id UUID REFERENCES brief_templates(id) ON DELETE SET NULL,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger ensuring every newly created Project automatically receives its canonical 1:1 Brief (Total Participation)
CREATE OR REPLACE FUNCTION create_project_canonical_brief()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO briefs (workspace_id, project_id, title)
    VALUES (NEW.workspace_id, NEW.id, NEW.title || ' Brief')
    ON CONFLICT (project_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_project_canonical_brief
AFTER INSERT ON projects
FOR EACH ROW EXECUTE FUNCTION create_project_canonical_brief();

CREATE TABLE brief_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    instruction_text TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brief_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES brief_sections(id) ON DELETE CASCADE,
    field_type TEXT NOT NULL,
    label TEXT NOT NULL,
    helper_text TEXT,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    visibility TEXT NOT NULL DEFAULT 'client_can_fill' CHECK (visibility IN ('internal_only', 'client_can_view', 'client_can_fill', 'client_must_fill')),
    value JSONB,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutable Client Submissions (INV-003, INV-012)
CREATE TABLE brief_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
    submitted_values JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed')),
    reviewed_at TIMESTAMPTZ
);

-- Owner Review Decisions (Separated from immutable submission)
CREATE TABLE brief_submission_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES brief_submissions(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES brief_fields(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (submission_id, field_id)
);

CREATE INDEX idx_briefs_project ON briefs(project_id);
CREATE INDEX idx_brief_sections_brief ON brief_sections(brief_id);
CREATE INDEX idx_brief_fields_section ON brief_fields(section_id);
CREATE INDEX idx_brief_submissions_brief ON brief_submissions(brief_id);
CREATE INDEX idx_brief_submission_reviews_submission ON brief_submission_reviews(submission_id);
