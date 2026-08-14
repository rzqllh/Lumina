# Pass B — Verification & Cross-Document Audit Report

**Status:** Draft / Execution Template  
**Ledger Reference:** `docs/plans/pass-b/PLAN.md`  
**Last Run:** Not yet executed

---

## 1. Domain Model ↔ Database Schema Alignment Audit

Verify that every domain noun and relationship from `docs/product/DOMAIN_MODEL.md` has an exact physical representation in `docs/engineering/DATABASE_SCHEMA.md`.

| Domain Concept | Schema Table(s) | Status | Audit Notes |
|---|---|---|---|
| Workspace | `workspaces`, `workspace_members` | Pending | |
| Client | `clients` | Pending | |
| Client Contact | `client_contacts` | Pending | |
| ProjectContact | `project_contacts` (junction) | Pending | |
| Service | `services` | Pending | |
| Package / Item | `packages`, `package_items` | Pending | |
| Project Service | `project_services` (snapshot) | Pending | |
| Session | `sessions` | Pending | |
| Workflow Template | `workflow_templates`, `workflow_template_stages` | Pending | |
| Project Workflow Stage | `project_workflow_stages` (snapshot) | Pending | |
| Task | `tasks` | Pending | |
| Brief (1:1) | `brief_templates`, `briefs` | Pending | |
| Brief Section & Field | `brief_sections`, `brief_fields` | Pending | |
| Brief Submission | `brief_submissions`, `brief_submission_values` | Pending | |
| Deliverable | `deliverables` | Pending | |
| Revision | `revisions` | Pending | |
| Payment | `payments` | Pending | |
| Expense | `expenses` | Pending | |
| Collaborator / Engagement | `collaborators`, `collaborator_engagements` | Pending | |
| File Reference | `file_references` | Pending | |
| Client Share Link | `client_share_links` | Pending | |

---

## 2. Invariant Enforcement Mapping

| Invariant ID | Invariant Statement | Enforcement Mechanism | Verification Result |
|---|---|---|---|
| `INV-001` | Package/template edits never mutate historical projects | Snapshot tables (`project_services`, `project_workflow_stages`, `briefs`) | Pending |
| `INV-002` | Revision belongs to exactly one deliverable | `revisions.deliverable_id` FK + unique `(deliverable_id, revision_number)` | Pending |
| `INV-003` | Client brief submissions require owner review | Immutable `brief_submissions` + review queue | Pending |
| `INV-004` | Public client views never expose internal-only fields | Server-side projection / allow-list views | Pending |
| `INV-005` | Project force-close requires confirmation + reason; preserves history | `projects` status fields + non-destructive state transitions | Pending |
| `INV-006` | One project may contain multiple services | `project_services` 1:N FK | Pending |
| `INV-007` | One project may contain multiple sessions | `sessions` 1:N FK | Pending |
| `INV-008` | Project workflow is editable after template application | Project-owned `project_workflow_stages` | Pending |
| `INV-009` | Large production media is external by default | `file_references` provider routing | Pending |
| `INV-010` | Project belongs to exactly one client | `projects.client_id` NOT NULL FK | Pending |
| `INV-011` | Brief belongs to exactly one project (1:1) | `briefs.project_id` UNIQUE NOT NULL FK | Pending |
| `INV-012` | Brief submissions are immutable after creation | Append-only submission records + RLS update restriction | Pending |
| `INV-013` | Collaborator fees are separate from generic expenses | Independent tables `expenses` vs `collaborator_engagements` | Pending |
| `INV-014` | Task belongs to one project, optional stage/deliverable scope | `tasks.project_id` NOT NULL, `stage_id` & `deliverable_id` nullable FKs | Pending |
| `INV-015` | Project service values are snapshots; audit-only source FKs | Snapshotted price columns; source FK `ON DELETE SET NULL` | Pending |

---

## 3. Security & Row Level Security (RLS) Coverage Matrix

| Table | Owner Policy (Authenticated Member) | Public / Anonymous Access | RLS Enabled | Status |
|---|---|---|---|---|
| `workspaces` | Member check | DENIED | YES | Pending |
| `workspace_members` | Member check | DENIED | YES | Pending |
| `clients` | Workspace match | DENIED | YES | Pending |
| `client_contacts` | Workspace match | DENIED | YES | Pending |
| `project_contacts` | Workspace match | DENIED | YES | Pending |
| `projects` | Workspace match | DENIED | YES | Pending |
| `services` | Workspace match | DENIED | YES | Pending |
| `packages` | Workspace match | DENIED | YES | Pending |
| `package_items` | Workspace match | DENIED | YES | Pending |
| `project_services` | Workspace match | DENIED | YES | Pending |
| `sessions` | Workspace match | DENIED | YES | Pending |
| `workflow_templates` | Workspace match | DENIED | YES | Pending |
| `workflow_template_stages` | Workspace match | DENIED | YES | Pending |
| `project_workflow_stages` | Workspace match | DENIED | YES | Pending |
| `tasks` | Workspace match | DENIED | YES | Pending |
| `brief_templates` | Workspace match | DENIED | YES | Pending |
| `brief_template_sections` | Workspace match | DENIED | YES | Pending |
| `brief_template_fields` | Workspace match | DENIED | YES | Pending |
| `briefs` | Workspace match | DENIED | YES | Pending |
| `brief_sections` | Workspace match | DENIED | YES | Pending |
| `brief_fields` | Workspace match | DENIED | YES | Pending |
| `brief_submissions` | Workspace match | INSERT-only via Edge boundary | YES | Pending |
| `deliverables` | Workspace match | DENIED | YES | Pending |
| `revisions` | Workspace match | DENIED | YES | Pending |
| `payments` | Workspace match | DENIED | YES | Pending |
| `expenses` | Workspace match | DENIED | YES | Pending |
| `collaborators` | Workspace match | DENIED | YES | Pending |
| `collaborator_engagements` | Workspace match | DENIED | YES | Pending |
| `file_references` | Workspace match | DENIED | YES | Pending |
| `client_share_links` | Workspace match | READ by token hash via Edge | YES | Pending |

---

## 4. Integration Security & Boundary Checklist

- [ ] Google OAuth refresh tokens stored encrypted on server; never sent to browser client.
- [ ] Google Drive Picker client receives short-lived restricted token; file references stored as metadata.
- [ ] Google Calendar integration isolates project events to dedicated calendar; no personal event leakage.
- [ ] Supabase Storage separates private buckets (receipts, briefs) from public CDN assets (avatars).

---

## 5. Architectural Decision Records (ADRs) Audit

- [ ] `ADR-0001`: `0001-pwa-first-over-native-first.md` (Status: Accepted)
- [ ] `ADR-0002`: `0002-use-supabase-postgresql.md` (Status: Accepted)
- [ ] `ADR-0003`: `0003-workspace-boundary-from-day-one.md` (Status: Accepted)
- [ ] `ADR-0004`: `0004-snapshot-packages-and-templates.md` (Status: Accepted)
- [ ] `ADR-0005`: `0005-large-media-remains-external.md` (Status: Accepted)
- [ ] `ADR-0006`: `0006-tokenized-public-client-projection.md` (Status: Accepted)
- [ ] `ADR-0007`: `0007-google-calendar-sync-direction.md` (Status: Accepted)

---

## 6. Execution Evidence & Audit Log

*(To be populated upon Pass B execution completion)*
