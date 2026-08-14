# Lumina — Database Schema Specification

**Status:** Technical Consensus / Pass B Locked
**Database Platform:** PostgreSQL 16 (via Supabase)
**Last updated:** 2026-08-14

This document defines the physical relational schema, data types, constraints, indexes, Row Level Security (RLS) matrix, and migration strategy for Lumina.

---

## 1. Schema Conventions & Data Types

| Concern | Standard Choice | Rationale & Alternatives Evaluated |
|---|---|---|
| **Primary Keys** | `UUID v4` (`gen_random_uuid()`) | Prevents ID enumeration attacks on public endpoints, compatible with Supabase Auth `auth.uid()`, decentralized generation. |
| **Foreign Keys** | `UUID REFERENCES table(id)` | Explicit relational integrity with index on every FK column. |
| **Timestamps** | `TIMESTAMPTZ` (`DEFAULT NOW()`) | Stores UTC with timezone preservation; standard for calendar/deadline arithmetic. |
| **Money / Currency** | `BIGINT` (Integer Minor Units) | In Indonesian Rupiah (IDR), 1 unit = Rp 1. Avoids floating-point math bugs. For cents currencies, 1 unit = 1 cent. |
| **Identifiers & Columns** | `snake_case` (Plural tables) | Standard PostgreSQL naming conventions (`projects`, `client_contacts`). |
| **Enum Strategy** | `TEXT` with `CHECK` constraints | Avoids complex `ALTER TYPE ... ADD VALUE` migration locks while strictly enforcing domain states. |
| **JSON Storage** | `JSONB` | Used selectively for polymorphic brief field values and submission review payloads. |

---

## 2. Relational Table Specifications

### 2.1 Workspace & Tenancy Core

#### `workspaces`
Logical tenant boundary. Every business entity is scoped to a workspace.
```sql
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `workspace_members`
Junction mapping authenticated Supabase users to workspaces.
```sql
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, user_id)
);
```

---

### 2.2 Client Rolodex & Project Contacts

#### `clients`
Customer identity (individual, couple, organization, or custom).
```sql
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
```

#### `client_contacts`
Reusable contact persons belonging to a Client.
```sql
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role_label TEXT, -- e.g. "Primary PIC", "Finance PIC", "Event Coordinator"
    phone TEXT,
    email TEXT,
    notes TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `project_contacts`
Junction selecting Client Contacts that participate in a specific Project.
```sql
CREATE TABLE project_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_contact_id UUID NOT NULL REFERENCES client_contacts(id) ON DELETE CASCADE,
    role_label TEXT, -- Project-specific role override
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, client_contact_id)
);
```

---

### 2.3 Service Catalog, Packages & Snapshots

#### `services`
Reusable workspace service catalog.
```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- e.g. "Photography", "Videography", "Same Day Edit"
    default_unit_price BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `packages`
Reusable commercial package preset.
```sql
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `package_items`
Itemized line items within a package preset.
```sql
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
```

#### `project_services`
Historical project-owned pricing snapshot (`INV-001`, `INV-015`).
```sql
CREATE TABLE project_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price BIGINT NOT NULL DEFAULT 0,
    subtotal BIGINT NOT NULL DEFAULT 0, -- (quantity * unit_price)
    adjustment_label TEXT,
    adjustment_amount BIGINT NOT NULL DEFAULT 0,
    source_package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    source_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.4 Projects, Sessions, Workflows & Tasks

#### `projects`
Central unit of client work.
```sql
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
```
*Force-Close Operational Semantics (OD-001):*
- When `status = 'force_closed'`, operational production mutations (inserting/progressing stages, creating tasks, creating deliverables, starting revisions) are blocked via database trigger.
- Financial recording remains active: late incoming payments against existing receivables can still be inserted/updated.
- Explicit reopening (`force_closed -> active`) is supported via owner confirmation, recording `reopened_at` audit timestamp without altering historical task/deliverable states.

#### `sessions`
Scheduled shoots, meetings, or event days.
```sql
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
```

#### `workflow_templates` & `workflow_template_stages`
Catalog workflow stage templates.
```sql
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
```

#### `project_workflow_stages`
Project-owned editable workflow stages snapshot (`INV-008`).
```sql
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
```

#### `tasks`
Action items scoped to a project and optionally to a stage or deliverable (`INV-014`).
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES project_workflow_stages(id) ON DELETE SET NULL,
    deliverable_id UUID REFERENCES deliverables(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.5 1:1 Brief, Sections, Fields & Review Queue

#### `brief_templates`, `brief_template_sections`, `brief_template_fields`
Catalog templates for client intake briefs.
```sql
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
```

#### `briefs`
Project-owned brief document. Exactly one per project (`INV-011`).
```sql
CREATE TABLE briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    source_template_id UUID REFERENCES brief_templates(id) ON DELETE SET NULL,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
*Exact 1:1 Total Participation Guarantee (INV-011):*
- `briefs.project_id UUID NOT NULL UNIQUE REFERENCES projects(id)` guarantees *at most one* Brief per Project at the relational schema level.
- A database trigger / transactional creation workflow (`create_project_canonical_brief`) automatically instantiates the canonical Brief upon project creation, guaranteeing *at least one* Brief per Project (total participation).

#### `brief_sections` & `brief_fields`
Sections and typed canonical fields within a Brief.
```sql
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
    value JSONB, -- Stores canonical typed value
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `brief_submissions` & `brief_submission_reviews`
Immutable client submission history and field-level owner review queue (`INV-003`, `INV-012`).
```sql
CREATE TABLE brief_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
    submitted_values JSONB NOT NULL, -- Immutable snapshot of client submission: { [field_id]: value }
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed')),
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE brief_submission_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES brief_submissions(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES brief_fields(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected')),
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (submission_id, field_id)
);
```

---

### 2.6 Deliverables & Revision Cycles

#### `deliverables`
Promised client deliverables.
```sql
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- e.g. "50 Edited Photos", "Highlight Video"
    quantity INTEGER,
    type_label TEXT,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'delivered', 'awaiting_review', 'approved', 'revision_requested')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `revisions`
Rework and feedback loops belonging to a deliverable (`INV-002`).
```sql
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
```

---

### 2.7 Payments, Expenses & Collaborators

#### `payments`
Incoming project payment records.
```sql
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
```
*Commercial Reductions (OD-005):* Price reductions agreed with clients are recorded via Project Service adjustments/discounts reducing `Project Value` directly. Payment status is strictly `pending` or `paid`. Normal close requires `Paid Amount == Project Value` (`Receivable == 0`).

#### `expenses`
Generic project costs (transport, gear rental, venue fees). Excludes collaborator fees (`INV-013`).
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    category TEXT,
    receipt_file_id UUID REFERENCES file_references(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `collaborators` & `collaborator_engagements`
Non-user freelance collaborators and project-specific fee tracking (`INV-013`).
```sql
CREATE TABLE collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    specialty TEXT, -- e.g. "Second Shooter", "Editor"
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
```

---

### 2.8 File References & Public Share Links

#### `file_references`
Metadata references for external storage (Drive) or local Supabase attachments (`INV-009`).
```sql
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
```

#### `public_share_links`
Tokenized public access configuration (`INV-004`, `OD-004`).
```sql
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
```

---

## 3. Cross-Parent Relational Integrity Checks

To guarantee absolute data integrity across hierarchical relationships:

| Relation Check | Rule | Enforcement Mechanism | Design Status |
|---|---|---|---|
| **ProjectContact ↔ Client Match** | `client_contacts.client_id == projects.client_id` | Database Trigger (`check_project_contact_client_match`) | Designed |
| **Task Context Scope** | `stage_id` & `deliverable_id` must belong to same `project_id` | Database Trigger (`check_task_project_scope`) | Designed |
| **FileReference Context Scope** | `deliverable_id` & `revision_id` must belong to same `project_id` | Database Trigger (`check_file_ref_project_scope`) | Designed |
| **Force-Close Operational Freeze** | Blocks mutation of stages/tasks/deliverables/revisions when project `force_closed` | Database Trigger (`check_project_operational_freeze`) | Designed |
| **Workspace Catalog Isolation** | Referenced catalog items must share same `workspace_id` | Composite Foreign Keys / Validation Trigger | Designed |

---

## 4. Indexing Strategy

Indexes are created specifically for query performance on high-frequency operational surfaces:

```sql
-- Active Projects by Workspace
CREATE INDEX idx_projects_workspace_status ON projects(workspace_id, status);

-- Task Operational Dashboard (Due today / Overdue)
CREATE INDEX idx_tasks_workspace_status_due ON tasks(workspace_id, status, due_date);

-- Schedule & Calendar Event Queries
CREATE INDEX idx_sessions_workspace_date ON sessions(workspace_id, date);

-- Payment Receivables & Cashflow
CREATE INDEX idx_payments_workspace_status_due ON payments(workspace_id, status, due_date);

-- Deliverable Deadlines
CREATE INDEX idx_deliverables_workspace_status ON deliverables(workspace_id, status, deadline);

-- Public Token Resolution (Instant O(1) hash lookup)
CREATE INDEX idx_public_share_links_token_hash ON public_share_links(token_hash) WHERE is_active = TRUE;
```

---

## 5. Migration & Evolution Strategy

- All database changes are authored as sequential SQL migration files in `supabase/migrations/<timestamp>_<name>.sql`.
- Invariants are enforced via database constraints and triggers rather than relying solely on client-side validation.
- Rollback strategy: Every migration is paired with a documented forward-fix migration script.
