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
