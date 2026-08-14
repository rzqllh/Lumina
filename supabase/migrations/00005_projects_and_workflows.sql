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
