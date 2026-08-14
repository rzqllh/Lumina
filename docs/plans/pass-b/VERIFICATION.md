# Pass B — Verification & Cross-Document Audit Report

**Status:** Complete / Design Verified
**Ledger Reference:** `docs/plans/pass-b/PLAN.md`
**Last Run:** 2026-08-14

> [!NOTE]
> **Verification Scope Distinction:**
> - **Design Verification (Completed):** Verifies that technical specifications, data schemas, RLS policy matrices, invariant mappings, and integration contracts are complete, mutually consistent, and free of contradictions across all planning documents.
> - **Runtime Verification (Pending Implementation):** Verification of executable migration files, live pgTAP SQL tests, running Edge Functions, and end-to-end PWA execution will be conducted during the repository scaffold and implementation phases.

---

## 1. Domain Model ↔ Database Schema Alignment Audit

Verify that every domain noun and relationship from `docs/product/DOMAIN_MODEL.md` has an exact physical representation in `docs/engineering/DATABASE_SCHEMA.md`.

| Domain Concept | Schema Table(s) | Design Status | Audit Evidence & Physical Schema Mapping | Runtime Status |
|---|---|---|---|---|
| Workspace | `workspaces`, `workspace_members` | **DESIGN VERIFIED** | Enforces logical tenant boundary with `is_workspace_member()` RLS helper. | Pending Implementation |
| Client | `clients` | **DESIGN VERIFIED** | Supports `client_type` (`individual`, `couple`, `organization`, `custom`). | Pending Implementation |
| Client Contact | `client_contacts` | **DESIGN VERIFIED** | Scoped to Client; stores person identity (`name`, `role_label`, `phone`, `email`). | Pending Implementation |
| ProjectContact | `project_contacts` (junction) | **DESIGN VERIFIED** | True junction referencing `client_contacts(id)`; cross-client trigger enforces match. | Pending Implementation |
| Service | `services` | **DESIGN VERIFIED** | Reusable workspace catalog with `BIGINT` minor units. | Pending Implementation |
| Package / Item | `packages`, `package_items` | **DESIGN VERIFIED** | Relational line items referencing optional `services(id)`. | Pending Implementation |
| Project Service | `project_services` (snapshot) | **DESIGN VERIFIED** | Snapshotted line item with `source_package_id` `ON DELETE SET NULL`. | Pending Implementation |
| Session | `sessions` | **DESIGN VERIFIED** | Supports 5 session types, dates/times, and `google_calendar_event_id`. | Pending Implementation |
| Workflow Template | `workflow_templates`, `workflow_template_stages` | **DESIGN VERIFIED** | Reusable stage templates in workspace catalog. | Pending Implementation |
| Project Workflow Stage | `project_workflow_stages` (snapshot) | **DESIGN VERIFIED** | Snapshotted editable project stages with `source_template_id` audit reference. | Pending Implementation |
| Task | `tasks` | **DESIGN VERIFIED** | Scoped to project with optional `stage_id` and `deliverable_id` foreign keys. | Pending Implementation |
| Brief (1:1) | `brief_templates`, `briefs` | **DESIGN VERIFIED** | `briefs.project_id` has `UNIQUE NOT NULL` constraint + total participation creation trigger. | Pending Implementation |
| Brief Section & Field | `brief_sections`, `brief_fields` | **DESIGN VERIFIED** | `brief_fields.value` stores canonical typed values in `JSONB`. | Pending Implementation |
| Brief Submission | `brief_submissions`, `brief_submission_reviews` | **DESIGN VERIFIED** | `brief_submissions.submitted_values` is immutable `JSONB`; reviews stored separately. | Pending Implementation |
| Deliverable | `deliverables` | **DESIGN VERIFIED** | Tracks promises with status `planned`..`approved`. | Pending Implementation |
| Revision | `revisions` | **DESIGN VERIFIED** | `UNIQUE (deliverable_id, revision_number)` constraint enforces 1:1 revision parentage. | Pending Implementation |
| Payment | `payments` | **DESIGN VERIFIED** | Persisted status `pending`, `paid` with `BIGINT` minor units (`OD-005` resolved). | Pending Implementation |
| Expense | `expenses` | **DESIGN VERIFIED** | Generic project costs only; excludes collaborator fees. | Pending Implementation |
| Collaborator / Engagement | `collaborators`, `collaborator_engagements` | **DESIGN VERIFIED** | Independent agreed fee tracking with payment statuses `unpaid`, `partial`, `paid`. | Pending Implementation |
| File Reference | `file_references` | **DESIGN VERIFIED** | Supports `google_drive`, `app_storage`, `external_url` with optional deliverable scoping. | Pending Implementation |
| Public Share Link | `public_share_links` | **DESIGN VERIFIED** | Polymorphic table with `purpose` column and partial unique active index (`OD-004`). | Pending Implementation |

---

## 2. Invariant Enforcement Mapping

| Invariant ID | Invariant Statement | Enforcement Mechanism | Design Status | Runtime Status |
|---|---|---|---|---|
| `INV-001` | Package/template edits never mutate historical projects | Physical snapshot tables `project_services`, `project_workflow_stages`, `briefs` | **DESIGN VERIFIED** | Pending Implementation |
| `INV-002` | Revision belongs to exactly one deliverable | Foreign key `revisions.deliverable_id` + `UNIQUE (deliverable_id, revision_number)` | **DESIGN VERIFIED** | Pending Implementation |
| `INV-003` | Client brief submissions require owner review | Immutable `brief_submissions` + separate `brief_submission_reviews` table | **DESIGN VERIFIED** | Pending Implementation |
| `INV-004` | Public client views never expose internal-only fields | Token hash lookup + server-side allow-list JSON projection in Edge Function | **DESIGN VERIFIED** | Pending Implementation |
| `INV-005` | Project force-close requires confirmation + reason; operational freeze + late payments allowed | Mandatory `force_close_reason` & `force_closed_at`; freeze trigger (`OD-001`) | **DESIGN VERIFIED** | Pending Implementation |
| `INV-006` | One project may contain multiple services | 1:N foreign key `project_services.project_id` | **DESIGN VERIFIED** | Pending Implementation |
| `INV-007` | One project may contain multiple sessions | 1:N foreign key `sessions.project_id` | **DESIGN VERIFIED** | Pending Implementation |
| `INV-008` | Project workflow is editable after template application | Project-owned `project_workflow_stages` table editable independently | **DESIGN VERIFIED** | Pending Implementation |
| `INV-009` | Large production media is external by default | `file_references` provider routing to Google Drive URLs; app storage limited | **DESIGN VERIFIED** | Pending Implementation |
| `INV-010` | Project belongs to exactly one client | `projects.client_id UUID NOT NULL REFERENCES clients(id)` | **DESIGN VERIFIED** | Pending Implementation |
| `INV-011` | Brief belongs to exactly one project (1:1 total participation) | `briefs.project_id UUID NOT NULL UNIQUE` + project creation trigger | **DESIGN VERIFIED** | Pending Implementation |
| `INV-012` | Brief submissions are immutable after creation | Append-only submission records + RLS update restriction | **DESIGN VERIFIED** | Pending Implementation |
| `INV-013` | Collaborator fees are separate from generic expenses | Independent tables `expenses` vs `collaborator_engagements` | **DESIGN VERIFIED** | Pending Implementation |
| `INV-014` | Task belongs to one project, optional stage/deliverable scope | `tasks.project_id NOT NULL`, nullable `stage_id` & `deliverable_id` + check trigger | **DESIGN VERIFIED** | Pending Implementation |
| `INV-015` | Project service values are snapshots; audit-only source FKs | Snapshotted columns (`label`, `unit_price`, `quantity`); `source_package_id ON DELETE SET NULL` | **DESIGN VERIFIED** | Pending Implementation |

---

## 3. Security & Row Level Security (RLS) Specification Coverage

| Table | Owner Policy (Authenticated Member) | Public / Anonymous Access | RLS Specified | Design Audit Result |
|---|---|---|---|---|
| `workspaces` | `is_workspace_member(id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `workspace_members` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `clients` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `client_contacts` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `project_contacts` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `projects` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `services` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `packages` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `package_items` | Via parent package workspace | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `project_services` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `sessions` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `workflow_templates` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `workflow_template_stages` | Via parent template workspace | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `project_workflow_stages` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `tasks` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `brief_templates` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `brief_template_sections` | Via parent template workspace | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `brief_template_fields` | Via parent template workspace | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `briefs` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `brief_sections` | Via parent brief workspace | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `brief_fields` | Via parent brief workspace | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `brief_submissions` | Via parent brief workspace | INSERT-only via Edge boundary | YES | **DESIGN VERIFIED** |
| `brief_submission_reviews` | Via parent submission workspace | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `deliverables` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `revisions` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `payments` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `expenses` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `collaborators` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `collaborator_engagements`| `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `file_references` | `is_workspace_member(workspace_id)` | DENIED (ALL) | YES | **DESIGN VERIFIED** |
| `public_share_links` | `is_workspace_member(workspace_id)` | READ by token hash via Edge | YES | **DESIGN VERIFIED** |

---

## 4. Integration Security & Boundary Checklist

- [x] **OAuth Token Security:** Refresh tokens encrypted with AES-256-GCM in `oauth_credentials`; never sent to browser client.
- [x] **Drive Picker Flow:** Short-lived access token requested via Edge Function; file references stored as external URL metadata.
- [x] **Calendar Sync Isolation:** Synced exclusively to dedicated `"Lumina Projects"` calendar; free/busy query checks collisions without reading personal event titles.
- [x] **Storage Bucket Partitioning:** Private buckets (`receipts`, `brief-attachments`) require signed URLs; public CDN buckets (`avatars`, `project-covers`) cache static assets.

---

## 5. Architectural Decision Records (ADRs) Audit

| ADR ID | Title | Status | Audit Findings |
|---|---|---|---|
| `ADR-0001` | PWA-First Architecture for Mobile & Desktop | **Accepted** | Full trade-off analysis completed; aligned with `ARCHITECTURE.md`. |
| `ADR-0002` | Use Supabase and PostgreSQL as Backend Platform | **Accepted** | Relational integrity and RLS drivers documented; aligned with `DATABASE_SCHEMA.md`. |
| `ADR-0003` | Workspace Tenancy Boundary from Day One | **Accepted** | Tenancy and RLS isolation drivers documented; aligned with `SECURITY.md`. |
| `ADR-0004` | Historical Snapshot Semantics for Packages & Templates | **Accepted** | Invariant enforcement (`INV-001`, `INV-015`) documented; aligned with `DOMAIN_MODEL.md`. |
| `ADR-0005` | Large Production Media Stored Externally | **Accepted** | Google Drive specialization and cost control documented; aligned with `INTEGRATIONS.md`. |
| `ADR-0006` | Tokenized Public Client Access via Server Projection | **Accepted** | Polymorphic `public_share_links` and allow-list projection locked; aligned with `SECURITY.md`. |
| `ADR-0007` | Google Calendar Sync Direction & Conflict Detection | **Accepted** | Outbound sync and free/busy collision detection documented; aligned with `INTEGRATIONS.md`. |

---

## 6. Pass B Verification Signoff

Pass B (Technical Architecture, Schema, Security, Integrations, and ADR Design) is **COMPLETE**.

- **Cross-document consistency:** 100% aligned across `PRD.md`, `DOMAIN_MODEL.md`, `WORKFLOWS.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `SECURITY.md`, `INTEGRATIONS.md`, and ADRs 0001–0007.
- **Approved Decisions Applied:** `OD-001` (force-close freeze/reopen), `OD-004` (public_share_links), `OD-005` (remove waived payment).
- **Deferred Decisions Preserved:** `OD-002` (payment due thresholds) and `OD-003` (brief field subset) are cleanly deferred to feature specification passes.
- **Implementation Status:** No application code or migrations created. The project is ready for **Pass C (Repository Foundation / Scaffold)**.
