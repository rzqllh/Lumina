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
