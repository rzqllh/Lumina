-- Migration 00001: Extensions and Security Definer Helpers
-- Lumina Database Schema Baseline

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to verify workspace membership for authenticated users
-- Hardened with explicit empty search_path and fully-qualified schema names
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id
          AND user_id = (SELECT auth.uid())
    );
END;
$$;

-- Restrict execution: only authenticated users can invoke membership helper
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID) TO authenticated;
-- Migration 00002: Workspaces and Members
-- Logical tenant boundary and user mapping

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
-- Migration 00003: Clients and Contacts
-- Customer identity, person contacts, and project-specific contact assignments

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    client_type TEXT NOT NULL DEFAULT 'individual' CHECK (client_type IN ('individual', 'couple', 'organization', 'custom')),
    custom_type_label TEXT,
    email TEXT,
    phone TEXT,
    notes TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role_label TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_workspace ON clients(workspace_id);
CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);
-- Migration 00004: Services and Packages
-- Workspace catalog definitions

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    default_unit_price BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    label TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_workspace ON services(workspace_id);
CREATE INDEX idx_packages_workspace ON packages(workspace_id);
CREATE INDEX idx_package_items_package ON package_items(package_id);
-- Migration 00005: Projects, Sessions, Workflows and Tasks
-- Central project aggregates, pricing snapshots, workflow stages, and integrity triggers

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    project_number TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'force_closed', 'archived')),
    currency TEXT NOT NULL DEFAULT 'IDR',
    client_approved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    force_closed_at TIMESTAMPTZ,
    force_close_reason TEXT,
    reopened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Contacts Junction
CREATE TABLE project_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_contact_id UUID NOT NULL REFERENCES client_contacts(id) ON DELETE CASCADE,
    role_label TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, client_contact_id)
);

-- Cross-parent trigger: project_contacts must belong to same client as project
CREATE OR REPLACE FUNCTION check_project_contact_client_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_client_id UUID;
    cont_client_id UUID;
BEGIN
    SELECT client_id INTO proj_client_id FROM public.projects WHERE id = NEW.project_id;
    SELECT client_id INTO cont_client_id FROM public.client_contacts WHERE id = NEW.client_contact_id;
    IF proj_client_id IS DISTINCT FROM cont_client_id THEN
        RAISE EXCEPTION 'Cross-parent violation: ClientContact % does not belong to Project % client %',
            NEW.client_contact_id, NEW.project_id, proj_client_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_project_contact_client_match
BEFORE INSERT OR UPDATE ON project_contacts
FOR EACH ROW EXECUTE FUNCTION check_project_contact_client_match();

-- Project Services Snapshot (INV-001, INV-015)
CREATE TABLE project_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price BIGINT NOT NULL DEFAULT 0,
    subtotal BIGINT NOT NULL DEFAULT 0,
    adjustment_label TEXT,
    adjustment_amount BIGINT NOT NULL DEFAULT 0,
    source_package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    source_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'shoot' CHECK (type IN ('shoot', 'meeting', 'pre_production', 'event_day', 'custom')),
    custom_type_label TEXT,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    google_calendar_event_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow Templates & Stages
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workflow_template_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Workflow Stages Snapshot (INV-008)
CREATE TABLE project_workflow_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'active', 'completed', 'skipped')),
    source_template_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks (INV-014)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES project_workflow_stages(id) ON DELETE SET NULL,
    deliverable_id UUID, -- FK will be added after deliverables table is created
    title TEXT NOT NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: Task stage scope match
CREATE OR REPLACE FUNCTION check_task_project_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    stage_proj_id UUID;
BEGIN
    IF NEW.stage_id IS NOT NULL THEN
        SELECT project_id INTO stage_proj_id FROM public.project_workflow_stages WHERE id = NEW.stage_id;
        IF stage_proj_id IS DISTINCT FROM NEW.project_id THEN
            RAISE EXCEPTION 'Cross-parent violation: Stage % does not belong to Project %',
                NEW.stage_id, NEW.project_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_task_project_scope
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION check_task_project_scope();

-- Trigger: Force-Close Operational Freeze (OD-001)
CREATE OR REPLACE FUNCTION check_project_operational_freeze()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_status TEXT;
BEGIN
    SELECT status INTO proj_status FROM public.projects WHERE id = NEW.project_id;
    IF proj_status = 'force_closed' THEN
        RAISE EXCEPTION 'Operational freeze violation: Project % is force_closed. Operational mutations are blocked.',
            NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_freeze_tasks_on_force_closed
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

CREATE TRIGGER trg_freeze_stages_on_force_closed
BEFORE INSERT OR UPDATE ON project_workflow_stages
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

CREATE INDEX idx_projects_workspace_status ON projects(workspace_id, status);
CREATE INDEX idx_project_services_project ON project_services(project_id);
CREATE INDEX idx_sessions_workspace_date ON sessions(workspace_id, date);
CREATE INDEX idx_project_workflow_stages_project ON project_workflow_stages(project_id);
CREATE INDEX idx_tasks_workspace_status_due ON tasks(workspace_id, status, due_date);
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
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.briefs (workspace_id, project_id, title)
    VALUES (NEW.workspace_id, NEW.id, NEW.title || ' Brief')
    ON CONFLICT (project_id) DO NOTHING;
    RETURN NEW;
END;
$$;

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
-- Migration 00007: Deliverables and Revisions
-- Promised outputs, revision cycles, and task linkage

CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    quantity INTEGER,
    type_label TEXT,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'delivered', 'awaiting_review', 'approved', 'revision_requested')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Revisions (INV-002)
CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL CHECK (revision_number > 0),
    requested_date DATE NOT NULL,
    due_date DATE,
    feedback TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'in_progress', 'delivered', 'awaiting_review', 'approved', 'changes_requested')),
    delivered_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (deliverable_id, revision_number)
);

-- Link deliverable FK on tasks
ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_deliverable
FOREIGN KEY (deliverable_id) REFERENCES deliverables(id) ON DELETE SET NULL;

-- Trigger: Check task deliverable scope
CREATE OR REPLACE FUNCTION check_task_deliverable_scope()
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

CREATE TRIGGER trg_check_task_deliverable_scope
BEFORE INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION check_task_deliverable_scope();

-- Trigger: Freeze deliverables and revisions when project is force_closed
CREATE TRIGGER trg_freeze_deliverables_on_force_closed
BEFORE INSERT OR UPDATE ON deliverables
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

CREATE OR REPLACE FUNCTION check_revision_operational_freeze()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    deliv_proj_id UUID;
    proj_status TEXT;
BEGIN
    SELECT project_id INTO deliv_proj_id FROM public.deliverables WHERE id = NEW.deliverable_id;
    SELECT status INTO proj_status FROM public.projects WHERE id = deliv_proj_id;
    IF proj_status = 'force_closed' THEN
        RAISE EXCEPTION 'Operational freeze violation: Parent project of Deliverable % is force_closed.',
            NEW.deliverable_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_freeze_revisions_on_force_closed
BEFORE INSERT OR UPDATE ON revisions
FOR EACH ROW EXECUTE FUNCTION check_revision_operational_freeze();

CREATE INDEX idx_deliverables_project ON deliverables(project_id);
CREATE INDEX idx_deliverables_workspace_status ON deliverables(workspace_id, status, deadline);
CREATE INDEX idx_revisions_deliverable ON revisions(deliverable_id);
-- Migration 00008: Finance and Collaborators
-- Payments (pending/paid), generic expenses, and external collaborator engagements (INV-013)

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'installment' CHECK (type IN ('dp', 'installment', 'final', 'other')),
    label TEXT,
    amount BIGINT NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paid_date DATE,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses (generic project costs, transport, rentals; excludes collaborator fees, INV-013)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    category TEXT,
    receipt_file_id UUID, -- Optional reference to file_references
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collaborator Catalog
CREATE TABLE collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    specialty TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collaborator Engagements (Project-specific agreed fee tracking, INV-013)
CREATE TABLE collaborator_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    collaborator_id UUID NOT NULL REFERENCES collaborators(id) ON DELETE RESTRICT,
    role_label TEXT NOT NULL,
    agreed_fee BIGINT NOT NULL DEFAULT 0 CHECK (agreed_fee >= 0),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    paid_amount BIGINT NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_payments_workspace_status_due ON payments(workspace_id, status, due_date);
CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_collaborators_workspace ON collaborators(workspace_id);
CREATE INDEX idx_collaborator_engagements_project ON collaborator_engagements(project_id);
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
-- Migration 00010: Security and Row Level Security (RLS)
-- Enforces workspace isolation and denies anonymous direct table access

-- Enable RLS across all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_template_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_submission_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_share_links ENABLE ROW LEVEL SECURITY;

-- 1. workspaces & workspace_members policies
CREATE POLICY "Users can view workspaces they belong to"
ON workspaces FOR SELECT TO authenticated
USING (public.is_workspace_member(id));

CREATE POLICY "Users can update workspaces they own"
ON workspaces FOR UPDATE TO authenticated
USING (public.is_workspace_member(id))
WITH CHECK (public.is_workspace_member(id));

CREATE POLICY "Users can view members in their workspace"
ON workspace_members FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

-- 2. Direct workspace_id scoped tables
CREATE POLICY "Workspace members full access to clients"
ON clients FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to client_contacts"
ON client_contacts FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to project_contacts"
ON project_contacts FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to services"
ON services FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to packages"
ON packages FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to package_items"
ON package_items FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM packages p
    WHERE p.id = package_items.package_id
      AND public.is_workspace_member(p.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM packages p
    WHERE p.id = package_items.package_id
      AND public.is_workspace_member(p.workspace_id)
));

CREATE POLICY "Workspace members full access to project_services"
ON project_services FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to projects"
ON projects FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to sessions"
ON sessions FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to workflow_templates"
ON workflow_templates FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to workflow_template_stages"
ON workflow_template_stages FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM workflow_templates wt
    WHERE wt.id = workflow_template_stages.workflow_template_id
      AND public.is_workspace_member(wt.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM workflow_templates wt
    WHERE wt.id = workflow_template_stages.workflow_template_id
      AND public.is_workspace_member(wt.workspace_id)
));

CREATE POLICY "Workspace members full access to project_workflow_stages"
ON project_workflow_stages FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to tasks"
ON tasks FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to brief_templates"
ON brief_templates FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to brief_template_sections"
ON brief_template_sections FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM brief_templates bt
    WHERE bt.id = brief_template_sections.brief_template_id
      AND public.is_workspace_member(bt.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM brief_templates bt
    WHERE bt.id = brief_template_sections.brief_template_id
      AND public.is_workspace_member(bt.workspace_id)
));

CREATE POLICY "Workspace members full access to brief_template_fields"
ON brief_template_fields FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM brief_template_sections bts
    JOIN brief_templates bt ON bt.id = bts.brief_template_id
    WHERE bts.id = brief_template_fields.section_id
      AND public.is_workspace_member(bt.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM brief_template_sections bts
    JOIN brief_templates bt ON bt.id = bts.brief_template_id
    WHERE bts.id = brief_template_fields.section_id
      AND public.is_workspace_member(bt.workspace_id)
));

CREATE POLICY "Workspace members full access to briefs"
ON briefs FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to brief_sections"
ON brief_sections FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM briefs b
    WHERE b.id = brief_sections.brief_id
      AND public.is_workspace_member(b.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM briefs b
    WHERE b.id = brief_sections.brief_id
      AND public.is_workspace_member(b.workspace_id)
));

CREATE POLICY "Workspace members full access to brief_fields"
ON brief_fields FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM brief_sections bs
    JOIN briefs b ON b.id = bs.brief_id
    WHERE bs.id = brief_fields.section_id
      AND public.is_workspace_member(b.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM brief_sections bs
    JOIN briefs b ON b.id = bs.brief_id
    WHERE bs.id = brief_fields.section_id
      AND public.is_workspace_member(b.workspace_id)
));

CREATE POLICY "Workspace members can view and update submissions"
ON brief_submissions FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM briefs b
    WHERE b.id = brief_submissions.brief_id
      AND public.is_workspace_member(b.workspace_id)
));

CREATE POLICY "Workspace members full access to brief_submission_reviews"
ON brief_submission_reviews FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM brief_submissions bs
    JOIN briefs b ON b.id = bs.brief_id
    WHERE bs.id = brief_submission_reviews.submission_id
      AND public.is_workspace_member(b.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM brief_submissions bs
    JOIN briefs b ON b.id = bs.brief_id
    WHERE bs.id = brief_submission_reviews.submission_id
      AND public.is_workspace_member(b.workspace_id)
));

CREATE POLICY "Workspace members full access to deliverables"
ON deliverables FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to revisions"
ON revisions FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to payments"
ON payments FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to expenses"
ON expenses FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to collaborators"
ON collaborators FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to collaborator_engagements"
ON collaborator_engagements FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to file_references"
ON file_references FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to public_share_links"
ON public_share_links FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id))
WITH CHECK (public.is_workspace_member(workspace_id));
-- Migration 00011: Audit Logs and OAuth Credentials
-- High-consequence audit logging and encrypted OAuth storage

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE oauth_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'google' CHECK (provider = 'google'),
    encrypted_refresh_token TEXT NOT NULL,
    access_token TEXT,
    access_token_expires_at TIMESTAMPTZ,
    google_calendar_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view audit logs"
ON audit_logs FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

-- OAuth credentials accessible only via Service Role (Edge functions)
CREATE INDEX idx_audit_logs_workspace_event ON audit_logs(workspace_id, event_type);
-- Migration 00012: Personal Workspace Bootstrap RPC
-- Creates atomic, idempotent bootstrap function for authenticated owner

CREATE OR REPLACE FUNCTION public.bootstrap_personal_workspace()
RETURNS TABLE (
    workspace_id UUID,
    workspace_name TEXT,
    member_role TEXT,
    is_new BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_uid UUID;
    user_email TEXT;
    raw_meta JSONB;
    display_name TEXT;
    ws_name TEXT;
    existing_ws RECORD;
    new_ws_id UUID;
BEGIN
    current_uid := auth.uid();
    IF current_uid IS NULL THEN
        RAISE EXCEPTION 'Authentication required to bootstrap workspace';
    END IF;

    -- 1. Check for existing membership (Idempotent check)
    SELECT wm.workspace_id, w.name, wm.role
    INTO existing_ws
    FROM public.workspace_members wm
    JOIN public.workspaces w ON w.id = wm.workspace_id
    WHERE wm.user_id = current_uid
    ORDER BY wm.created_at ASC
    LIMIT 1;

    IF existing_ws.workspace_id IS NOT NULL THEN
        RETURN QUERY SELECT existing_ws.workspace_id, existing_ws.name, existing_ws.role, FALSE;
        RETURN;
    END IF;

    -- 2. Extract user identity metadata from auth.users
    SELECT email, raw_user_meta_data
    INTO user_email, raw_meta
    FROM auth.users
    WHERE id = current_uid;

    display_name := COALESCE(
        raw_meta->>'full_name',
        raw_meta->>'name',
        raw_meta->>'user_name'
    );

    IF display_name IS NOT NULL AND btrim(display_name) <> '' THEN
        ws_name := btrim(display_name) || '''s Workspace';
    ELSIF user_email IS NOT NULL AND position('@' in user_email) > 1 THEN
        ws_name := split_part(user_email, '@', 1) || '''s Workspace';
    ELSE
        ws_name := 'Lumina Workspace';
    END IF;

    -- 3. Atomically create personal workspace and owner membership
    INSERT INTO public.workspaces (name)
    VALUES (ws_name)
    RETURNING id INTO new_ws_id;

    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (new_ws_id, current_uid, 'owner');

    RETURN QUERY SELECT new_ws_id, ws_name, 'owner'::TEXT, TRUE;
END;
$$;

-- Restrict execution permissions: only authenticated users can invoke
REVOKE EXECUTE ON FUNCTION public.bootstrap_personal_workspace() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_personal_workspace() FROM anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_personal_workspace() TO authenticated;
-- Migration 00013: Client Contacts Workspace Index
-- Optimizes workspace client contact queries and joined lookups

CREATE INDEX IF NOT EXISTS idx_client_contacts_workspace_client
ON public.client_contacts(workspace_id, client_id);
-- Migration 00014: Project Client Workspace Match Trigger
-- Ensures Project.workspace_id matches Client.workspace_id upon INSERT or UPDATE

CREATE OR REPLACE FUNCTION check_project_client_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    client_ws_id UUID;
BEGIN
    SELECT workspace_id INTO client_ws_id FROM public.clients WHERE id = NEW.client_id;
    IF client_ws_id IS NULL THEN
        RAISE EXCEPTION 'Referenced client % does not exist', NEW.client_id;
    END IF;
    IF client_ws_id IS DISTINCT FROM NEW.workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: Project workspace % does not match Client % workspace %',
            NEW.workspace_id, NEW.client_id, client_ws_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_project_client_workspace_match ON public.projects;
CREATE TRIGGER trg_check_project_client_workspace_match
BEFORE INSERT OR UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION check_project_client_workspace_match();
-- Migration 00015: Catalog Integrity & Package Duplication RPC
-- Ensures PackageItem service references match Package workspace_id and provides atomic package cloning

CREATE OR REPLACE FUNCTION check_package_item_service_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    pkg_ws_id UUID;
    srv_ws_id UUID;
BEGIN
    IF NEW.service_id IS NOT NULL THEN
        SELECT workspace_id INTO pkg_ws_id FROM public.packages WHERE id = NEW.package_id;
        SELECT workspace_id INTO srv_ws_id FROM public.services WHERE id = NEW.service_id;

        IF srv_ws_id IS DISTINCT FROM pkg_ws_id THEN
            RAISE EXCEPTION 'Cross-parent violation: Service workspace % does not match Package workspace %',
                srv_ws_id, pkg_ws_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_package_item_service_workspace_match ON public.package_items;
CREATE TRIGGER trg_check_package_item_service_workspace_match
BEFORE INSERT OR UPDATE ON public.package_items
FOR EACH ROW EXECUTE FUNCTION check_package_item_service_workspace_match();

-- Atomic Package Duplication RPC
CREATE OR REPLACE FUNCTION duplicate_package(
    p_workspace_id UUID,
    p_package_id UUID,
    p_new_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    src_pkg RECORD;
    new_pkg_id UUID;
BEGIN
    -- Verify workspace membership
    IF NOT public.is_workspace_member(p_workspace_id) THEN
        RAISE EXCEPTION 'Unauthorized: User is not a member of workspace %', p_workspace_id;
    END IF;

    -- Fetch source package
    SELECT * INTO src_pkg FROM public.packages WHERE id = p_package_id AND workspace_id = p_workspace_id;
    IF src_pkg.id IS NULL THEN
        RAISE EXCEPTION 'Source package % not found in workspace %', p_package_id, p_workspace_id;
    END IF;

    -- Insert cloned package
    INSERT INTO public.packages (workspace_id, name, description, is_active)
    VALUES (
        p_workspace_id,
        COALESCE(p_new_name, src_pkg.name || ' (Copy)'),
        src_pkg.description,
        TRUE
    )
    RETURNING id INTO new_pkg_id;

    -- Clone package items
    INSERT INTO public.package_items (package_id, service_id, label, quantity, unit_price, description, position)
    SELECT new_pkg_id, service_id, label, quantity, unit_price, description, position
    FROM public.package_items
    WHERE package_id = p_package_id
    ORDER BY position ASC, created_at ASC;

    RETURN new_pkg_id;
END;
$$;
-- Migration 00016: Project Services Cross-Workspace Integrity & Atomic Package Snapshot RPC
-- Enforces source_service_id and source_package_id workspace match on project_services
-- Provides atomic apply_package_to_project RPC for all-or-nothing pricing snapshot

-- ─── Cross-Workspace Source Integrity Trigger ────────────────────────────────
-- Validates that source_service_id and source_package_id, when provided,
-- belong to the same Workspace as the Project. Snapshot values are already
-- copied at insert time, so this trigger only guards source audit references.

CREATE OR REPLACE FUNCTION check_project_service_source_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_ws_id  UUID;
    srv_ws_id   UUID;
    pkg_ws_id   UUID;
BEGIN
    -- Fetch the workspace of the owning project
    SELECT workspace_id INTO proj_ws_id
      FROM public.projects
     WHERE id = NEW.project_id;

    -- Validate source_service_id belongs to same workspace
    IF NEW.source_service_id IS NOT NULL THEN
        SELECT workspace_id INTO srv_ws_id
          FROM public.services
         WHERE id = NEW.source_service_id;

        IF srv_ws_id IS DISTINCT FROM proj_ws_id THEN
            RAISE EXCEPTION
                'Cross-workspace violation: Service % (workspace %) does not match Project % (workspace %)',
                NEW.source_service_id, srv_ws_id, NEW.project_id, proj_ws_id;
        END IF;
    END IF;

    -- Validate source_package_id belongs to same workspace
    IF NEW.source_package_id IS NOT NULL THEN
        SELECT workspace_id INTO pkg_ws_id
          FROM public.packages
         WHERE id = NEW.source_package_id;

        IF pkg_ws_id IS DISTINCT FROM proj_ws_id THEN
            RAISE EXCEPTION
                'Cross-workspace violation: Package % (workspace %) does not match Project % (workspace %)',
                NEW.source_package_id, pkg_ws_id, NEW.project_id, proj_ws_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_project_service_source_workspace_match ON public.project_services;
CREATE TRIGGER trg_check_project_service_source_workspace_match
BEFORE INSERT OR UPDATE ON public.project_services
FOR EACH ROW EXECUTE FUNCTION check_project_service_source_workspace_match();


-- ─── Atomic Package → Project Snapshot RPC ────────────────────────────────────
-- Applies all Package Items as independent ProjectService snapshot rows within
-- a single transaction (all-or-nothing). Source references preserved for audit.
-- Does NOT delete or replace existing project_services (APPEND semantics).

CREATE OR REPLACE FUNCTION apply_package_to_project(
    p_workspace_id UUID,
    p_project_id   UUID,
    p_package_id   UUID
)
RETURNS INTEGER   -- count of inserted project_service rows
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    proj_ws_id   UUID;
    pkg_ws_id    UUID;
    next_pos     INTEGER;
    inserted_cnt INTEGER := 0;
    item         RECORD;
BEGIN
    -- Verify caller is a workspace member
    IF NOT public.is_workspace_member(p_workspace_id) THEN
        RAISE EXCEPTION 'Unauthorized: User is not a member of workspace %', p_workspace_id;
    END IF;

    -- Verify project belongs to the workspace
    SELECT workspace_id INTO proj_ws_id
      FROM public.projects
     WHERE id = p_project_id;

    IF proj_ws_id IS DISTINCT FROM p_workspace_id THEN
        RAISE EXCEPTION
            'Cross-workspace violation: Project % does not belong to workspace %',
            p_project_id, p_workspace_id;
    END IF;

    -- Verify package belongs to the same workspace
    SELECT workspace_id INTO pkg_ws_id
      FROM public.packages
     WHERE id = p_package_id;

    IF pkg_ws_id IS DISTINCT FROM p_workspace_id THEN
        RAISE EXCEPTION
            'Cross-workspace violation: Package % does not belong to workspace %',
            p_package_id, p_workspace_id;
    END IF;

    -- Determine next position after current project_services
    SELECT COALESCE(MAX(position) + 1, 0)
      INTO next_pos
      FROM public.project_services
     WHERE project_id = p_project_id;

    -- Insert one project_services row per package_item (APPEND, ordered by position)
    FOR item IN
        SELECT *
          FROM public.package_items
         WHERE package_id = p_package_id
         ORDER BY position ASC, created_at ASC
    LOOP
        INSERT INTO public.project_services (
            workspace_id,
            project_id,
            label,
            description,
            quantity,
            unit_price,
            subtotal,
            adjustment_label,
            adjustment_amount,
            source_package_id,
            source_service_id,
            position
        ) VALUES (
            p_workspace_id,
            p_project_id,
            item.label,
            item.description,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price,   -- snapshot subtotal
            NULL,                               -- no adjustment at apply time
            0,
            p_package_id,
            item.service_id,                   -- audit reference (may be NULL for custom items)
            next_pos + inserted_cnt
        );

        inserted_cnt := inserted_cnt + 1;
    END LOOP;

    RETURN inserted_cnt;
END;
$$;

-- Restrict execute to authenticated users only
REVOKE ALL ON FUNCTION public.apply_package_to_project(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_package_to_project(UUID, UUID, UUID) TO authenticated;

-- Index for Project Value aggregation performance
CREATE INDEX IF NOT EXISTS idx_project_services_project_position
  ON public.project_services(project_id, position);
-- Migration 00017: Workflow Templates Integrity and Atomic Snapshot RPC
-- Enforces cross-workspace integrity for workflow templates/stages and provides atomic template application

-- 1. Trigger: Ensure project_workflow_stages workspace matches parent project
CREATE OR REPLACE FUNCTION check_project_workflow_stage_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
    tmpl_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: project_workflow_stage workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    -- If source_template_id is provided, verify template belongs to same workspace
    IF NEW.source_template_id IS NOT NULL THEN
        SELECT workspace_id INTO tmpl_workspace_id FROM public.workflow_templates WHERE id = NEW.source_template_id;
        IF tmpl_workspace_id IS NOT NULL AND tmpl_workspace_id IS DISTINCT FROM proj_workspace_id THEN
            RAISE EXCEPTION 'Cross-workspace violation: Source template % workspace % does not match project workspace %',
                NEW.source_template_id, tmpl_workspace_id, proj_workspace_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_project_workflow_stage_workspace_match ON public.project_workflow_stages;
CREATE TRIGGER trg_check_project_workflow_stage_workspace_match
BEFORE INSERT OR UPDATE ON public.project_workflow_stages
FOR EACH ROW EXECUTE FUNCTION check_project_workflow_stage_workspace_match();

-- 2. Trigger: Ensure tasks workspace matches parent project
CREATE OR REPLACE FUNCTION check_task_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: task workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_task_workspace_match ON public.tasks;
CREATE TRIGGER trg_check_task_workspace_match
BEFORE INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION check_task_workspace_match();

-- 3. Atomic RPC: apply_workflow_template_to_project
CREATE OR REPLACE FUNCTION public.apply_workflow_template_to_project(
    p_project_id UUID,
    p_template_id UUID,
    p_mode TEXT DEFAULT 'append' -- 'replace' or 'append'
)
RETURNS SETOF public.project_workflow_stages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_workspace_id UUID;
    v_template_workspace_id UUID;
    v_proj_status TEXT;
    v_max_pos INTEGER := 0;
BEGIN
    -- 1. Authenticate caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    -- 2. Verify project exists and get context
    SELECT workspace_id, status INTO v_workspace_id, v_proj_status
    FROM public.projects
    WHERE id = p_project_id;

    IF v_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', p_project_id;
    END IF;

    -- 3. Verify caller membership in workspace
    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: User % cannot modify project in workspace %', auth.uid(), v_workspace_id;
    END IF;

    -- 4. Check operational freeze
    IF v_proj_status = 'force_closed' THEN
        RAISE EXCEPTION 'Operational freeze violation: Project % is force_closed. Operational mutations are blocked.', p_project_id;
    END IF;

    -- 5. Verify workflow template exists and workspace matches
    SELECT workspace_id INTO v_template_workspace_id
    FROM public.workflow_templates
    WHERE id = p_template_id;

    IF v_template_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Workflow template % not found', p_template_id;
    END IF;

    IF v_template_workspace_id IS DISTINCT FROM v_workspace_id THEN
        RAISE EXCEPTION 'Cross-workspace violation: Template workspace % does not match project workspace %',
            v_template_workspace_id, v_workspace_id;
    END IF;

    -- 6. Execute Replace or Append
    IF p_mode = 'replace' THEN
        -- Unlink tasks from existing stages
        UPDATE public.tasks
        SET stage_id = NULL
        WHERE project_id = p_project_id;

        -- Delete existing project workflow stages
        DELETE FROM public.project_workflow_stages
        WHERE project_id = p_project_id;

        v_max_pos := 0;
    ELSE
        -- Find current maximum position
        SELECT COALESCE(MAX(position), 0) INTO v_max_pos
        FROM public.project_workflow_stages
        WHERE project_id = p_project_id;
    END IF;

    -- 7. Snapshot template stages into project_workflow_stages
    RETURN QUERY
    INSERT INTO public.project_workflow_stages (
        workspace_id,
        project_id,
        label,
        position,
        status,
        source_template_id
    )
    SELECT
        v_workspace_id,
        p_project_id,
        wts.label,
        v_max_pos + ROW_NUMBER() OVER (ORDER BY wts.position ASC),
        'not_started'::TEXT,
        p_template_id
    FROM public.workflow_template_stages wts
    WHERE wts.workflow_template_id = p_template_id
    ORDER BY wts.position ASC
    RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_workflow_template_to_project(UUID, UUID, TEXT) TO authenticated;
-- Migration 00018: Sessions Integrity and Operational Freeze Triggers
-- Enforces cross-workspace integrity for project sessions and operational freeze on force_closed projects

-- 1. Trigger: Ensure sessions workspace matches parent project
CREATE OR REPLACE FUNCTION check_session_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: session workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_session_workspace_match ON public.sessions;
CREATE TRIGGER trg_check_session_workspace_match
BEFORE INSERT OR UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION check_session_workspace_match();

-- 2. Trigger: Force-Close Operational Freeze on Sessions (OD-001)
DROP TRIGGER IF EXISTS trg_freeze_sessions_on_force_closed ON public.sessions;
CREATE TRIGGER trg_freeze_sessions_on_force_closed
BEFORE INSERT OR UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

-- 3. Composite Index for Chronological Querying
CREATE INDEX IF NOT EXISTS idx_sessions_project_date_time ON public.sessions(project_id, date ASC, start_time ASC);
-- Migration 00019: Deliverables and Revisions Integrity & Atomic Revision Creation
-- Enforces cross-workspace isolation and atomic revision numbering with deliverable status synchronization

-- 1. Trigger: Ensure deliverables workspace matches parent project
CREATE OR REPLACE FUNCTION check_deliverable_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: deliverable workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_deliverable_workspace_match ON public.deliverables;
CREATE TRIGGER trg_check_deliverable_workspace_match
BEFORE INSERT OR UPDATE ON public.deliverables
FOR EACH ROW EXECUTE FUNCTION check_deliverable_workspace_match();

-- 2. Trigger: Ensure revisions workspace matches parent deliverable
CREATE OR REPLACE FUNCTION check_revision_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    deliv_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO deliv_workspace_id FROM public.deliverables WHERE id = NEW.deliverable_id;
    IF deliv_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Deliverable % does not exist', NEW.deliverable_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM deliv_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: revision workspace % does not match deliverable workspace %',
            NEW.workspace_id, deliv_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_revision_workspace_match ON public.revisions;
CREATE TRIGGER trg_check_revision_workspace_match
BEFORE INSERT OR UPDATE ON public.revisions
FOR EACH ROW EXECUTE FUNCTION check_revision_workspace_match();

-- 3. Atomic RPC: create_deliverable_revision
CREATE OR REPLACE FUNCTION public.create_deliverable_revision(
    p_deliverable_id UUID,
    p_feedback TEXT,
    p_due_date DATE DEFAULT NULL
)
RETURNS public.revisions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_workspace_id UUID;
    v_project_id UUID;
    v_proj_status TEXT;
    v_next_rev_num INTEGER;
    v_new_revision public.revisions;
BEGIN
    -- 1. Authenticate caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    -- 2. Verify deliverable exists and get context
    SELECT d.workspace_id, d.project_id, p.status
    INTO v_workspace_id, v_project_id, v_proj_status
    FROM public.deliverables d
    JOIN public.projects p ON p.id = d.project_id
    WHERE d.id = p_deliverable_id;

    IF v_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Deliverable % not found', p_deliverable_id;
    END IF;

    -- 3. Verify caller membership in workspace
    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: User % cannot modify deliverable in workspace %', auth.uid(), v_workspace_id;
    END IF;

    -- 4. Check operational freeze
    IF v_proj_status = 'force_closed' THEN
        RAISE EXCEPTION 'Operational freeze violation: Project % is force_closed. Operational mutations are blocked.', v_project_id;
    END IF;

    -- 5. Calculate next revision number
    SELECT COALESCE(MAX(revision_number), 0) + 1
    INTO v_next_rev_num
    FROM public.revisions
    WHERE deliverable_id = p_deliverable_id;

    -- 6. Insert new revision
    INSERT INTO public.revisions (
        workspace_id,
        deliverable_id,
        revision_number,
        requested_date,
        due_date,
        feedback,
        status
    )
    VALUES (
        v_workspace_id,
        p_deliverable_id,
        v_next_rev_num,
        CURRENT_DATE,
        p_due_date,
        p_feedback,
        'requested'
    )
    RETURNING * INTO v_new_revision;

    -- 7. Update parent deliverable status to revision_requested
    UPDATE public.deliverables
    SET status = 'revision_requested',
        updated_at = NOW()
    WHERE id = p_deliverable_id;

    RETURN v_new_revision;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_deliverable_revision(UUID, TEXT, DATE) TO authenticated;
-- Migration 00020: Finance Integrity and Project Closure Lifecycle
-- Enforces cross-workspace validation, operational freeze on expenses/engagements, and atomic closure RPCs

-- 1. Trigger: Ensure payments workspace matches parent project
CREATE OR REPLACE FUNCTION check_payment_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: payment workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_payment_workspace_match ON public.payments;
CREATE TRIGGER trg_check_payment_workspace_match
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION check_payment_workspace_match();

-- 2. Trigger: Ensure expenses workspace matches parent project
CREATE OR REPLACE FUNCTION check_expense_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: expense workspace % does not match project workspace %',
            NEW.workspace_id, proj_workspace_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_expense_workspace_match ON public.expenses;
CREATE TRIGGER trg_check_expense_workspace_match
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION check_expense_workspace_match();

-- 3. Trigger: Ensure collaborator engagements workspace matches parent project & collaborator
CREATE OR REPLACE FUNCTION check_collaborator_engagement_workspace_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_workspace_id UUID;
    collab_workspace_id UUID;
BEGIN
    SELECT workspace_id INTO proj_workspace_id FROM public.projects WHERE id = NEW.project_id;
    SELECT workspace_id INTO collab_workspace_id FROM public.collaborators WHERE id = NEW.collaborator_id;

    IF proj_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Project % does not exist', NEW.project_id;
    END IF;

    IF collab_workspace_id IS NULL THEN
        RAISE EXCEPTION 'Foreign key violation: Collaborator % does not exist', NEW.collaborator_id;
    END IF;

    IF NEW.workspace_id IS DISTINCT FROM proj_workspace_id OR NEW.workspace_id IS DISTINCT FROM collab_workspace_id THEN
        RAISE EXCEPTION 'Cross-parent violation: engagement workspace does not match project and collaborator';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_collaborator_engagement_workspace_match ON public.collaborator_engagements;
CREATE TRIGGER trg_check_collaborator_engagement_workspace_match
BEFORE INSERT OR UPDATE ON public.collaborator_engagements
FOR EACH ROW EXECUTE FUNCTION check_collaborator_engagement_workspace_match();

-- 4. Operational freeze on force_closed projects
DROP TRIGGER IF EXISTS trg_freeze_expenses_on_force_closed ON public.expenses;
CREATE TRIGGER trg_freeze_expenses_on_force_closed
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

DROP TRIGGER IF EXISTS trg_freeze_collaborator_engagements_on_force_closed ON public.collaborator_engagements;
CREATE TRIGGER trg_freeze_collaborator_engagements_on_force_closed
BEFORE INSERT OR UPDATE ON public.collaborator_engagements
FOR EACH ROW EXECUTE FUNCTION check_project_operational_freeze();

-- For payments: block INSERT on force-closed projects, but permit updating existing receivables
CREATE OR REPLACE FUNCTION check_payment_create_operational_freeze()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    proj_status TEXT;
BEGIN
    SELECT status INTO proj_status FROM public.projects WHERE id = NEW.project_id;
    IF proj_status = 'force_closed' THEN
        RAISE EXCEPTION 'Operational freeze violation: Project % is force_closed. Adding new payment schedules is blocked.',
            NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_freeze_payment_insert_on_force_closed ON public.payments;
CREATE TRIGGER trg_freeze_payment_insert_on_force_closed
BEFORE INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION check_payment_create_operational_freeze();

-- 5. RPC: close_project (Normal closure gate)
CREATE OR REPLACE FUNCTION public.close_project(p_project_id UUID)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_project public.projects;
    v_unapproved_deliv_count INTEGER;
    v_contract_total BIGINT;
    v_paid_total BIGINT;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
    IF v_project.id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', p_project_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_project.workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: Caller is not a member of this workspace.';
    END IF;

    -- Gate 1: Check all deliverables are approved
    SELECT COUNT(*) INTO v_unapproved_deliv_count
    FROM public.deliverables
    WHERE project_id = p_project_id AND status != 'approved';

    IF v_unapproved_deliv_count > 0 THEN
        RAISE EXCEPTION 'Close gate violation: % deliverables have not reached approved status.', v_unapproved_deliv_count;
    END IF;

    -- Gate 2: Check project is fully paid
    SELECT COALESCE(SUM(unit_price * quantity), 0) INTO v_contract_total
    FROM public.project_services
    WHERE project_id = p_project_id;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid_total
    FROM public.payments
    WHERE project_id = p_project_id AND status = 'paid';

    IF v_paid_total < v_contract_total THEN
        RAISE EXCEPTION 'Close gate violation: Project has outstanding balance. (Paid: %, Contract: %)',
            v_paid_total, v_contract_total;
    END IF;

    UPDATE public.projects
    SET status = 'closed',
        closed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_project_id
    RETURNING * INTO v_project;

    RETURN v_project;
END;
$$;

GRANT EXECUTE ON FUNCTION public.close_project(UUID) TO authenticated;

-- 6. RPC: force_close_project (Owner override with permanent reason)
CREATE OR REPLACE FUNCTION public.force_close_project(
    p_project_id UUID,
    p_reason TEXT
)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_project public.projects;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) < 5 THEN
        RAISE EXCEPTION 'Validation error: A written reason of at least 5 characters is required to force-close.';
    END IF;

    SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
    IF v_project.id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', p_project_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_project.workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: Caller is not a member of this workspace.';
    END IF;

    UPDATE public.projects
    SET status = 'force_closed',
        force_closed_at = NOW(),
        force_close_reason = TRIM(p_reason),
        updated_at = NOW()
    WHERE id = p_project_id
    RETURNING * INTO v_project;

    RETURN v_project;
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_close_project(UUID, TEXT) TO authenticated;

-- 7. RPC: reopen_project
CREATE OR REPLACE FUNCTION public.reopen_project(p_project_id UUID)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_project public.projects;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authenticated.';
    END IF;

    SELECT * INTO v_project FROM public.projects WHERE id = p_project_id;
    IF v_project.id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', p_project_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = v_project.workspace_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Forbidden: Caller is not a member of this workspace.';
    END IF;

    UPDATE public.projects
    SET status = 'active',
        reopened_at = NOW(),
        updated_at = NOW()
    WHERE id = p_project_id
    RETURNING * INTO v_project;

    RETURN v_project;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reopen_project(UUID) TO authenticated;
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

    -- Apply each accepted field value to canonical brief_fields
    FOR elem IN SELECT * FROM jsonb_array_elements(p_accepted_fields) LOOP
        f_id := (elem->>'field_id')::UUID;
        f_val := elem->'value';

        UPDATE public.brief_fields
        SET value = f_val,
            updated_at = NOW()
        WHERE id = f_id;

        applied_count := applied_count + 1;
    END LOOP;

    -- Mark submission as reviewed
    UPDATE public.brief_submissions
    SET review_status = 'reviewed',
        reviewed_at = NOW()
    WHERE id = p_submission_id;

    -- Insert audit record
    INSERT INTO public.brief_submission_reviews (
        submission_id,
        reviewer_user_id,
        decisions,
        applied_at
    ) VALUES (
        p_submission_id,
        auth.uid(),
        p_accepted_fields,
        NOW()
    );

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
