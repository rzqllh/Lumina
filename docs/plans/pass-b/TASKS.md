# Pass B — Execution Tasks Checklist

**Status:** In Progress  
**Ledger Reference:** `docs/plans/pass-b/PLAN.md`

---

## Workstream 1: Architecture Foundation (`ARCHITECTURE.md`)

- [ ] `PB-A01` **Stack & Layer Commitments:** Finalize stack table (TypeScript, React, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Supabase, Cloudflare Pages/Workers).
- [ ] `PB-A02` **Trust Boundaries & Data Access Patterns:** Define exact boundaries between Browser Owner App, Public Client Browser, Edge/Server Functions, and External APIs.
- [ ] `PB-A03` **PWA & Offline Strategy:** Document app shell caching, read cache for active projects, write queuing vs disabled writes, and service worker approach.
- [ ] `PB-A04` **Error Handling & Standardized Error Categories:** Formalize system error shapes across client, edge, and database boundaries.
- [ ] `PB-A05` **Observability & Audit Logging:** Define required structured server logging, integration failure logging, and high-risk action audit trails.
- [ ] `PB-A06` **Deployment Topology & Environments:** Define local, preview, and production environments, Supabase project strategy, and Cloudflare configuration.

---

## Workstream 2: Schema ↔ Security Co-Design (`DATABASE_SCHEMA.md` & `SECURITY.md`)

- [ ] `PB-S01` **Conventions & Data Types:** Lock standard conventions (UUID v4 / `gen_random_uuid()`, `timestamptz`, integer minor units for IDR/currencies, snake_case).
- [ ] `PB-S02` **Workspace & Member Model:** Design `workspaces` and `workspace_members` with strict single-user-first owner role while preserving future multi-user safety.
- [ ] `PB-S03` **Client & Contact Rolodex:** Design `clients`, `client_contacts`, and `project_contacts` (junction table ensuring no duplicate identity columns).
- [ ] `PB-S04` **Service Catalog, Packages & Snapshots:** Design `services`, `packages`, `package_items`, and `project_services` enforcing historical snapshot invariant `INV-001` / `INV-015`.
- [ ] `PB-S05` **Project Core & Workflow Stages:** Design `projects`, `sessions`, `workflow_templates`, `workflow_template_stages`, `project_workflow_stages`, and `tasks` (incorporating `OD-001` resolution for force-close fields).
- [ ] `PB-S06` **1:1 Brief, Sections, Fields & Submissions:** Design `brief_templates`, `briefs`, `brief_sections`, `brief_fields` (with typed value storage model), and `brief_submissions` (with immutable review model).
- [ ] `PB-S07` **Deliverables & Revision Cycles:** Design `deliverables` and `revisions` enforcing unique constraint `(deliverable_id, revision_number)` and `INV-002`.
- [ ] `PB-S08` **Project Finance & Cost Separation:** Design `payments` (persisted status `pending`/`paid`/`waived`), `expenses` (generic costs only), and `collaborator_engagements` (agreed fees) enforcing `INV-013`.
- [ ] `PB-S09` **File References & Storage Metadata:** Design `file_references` for external links (Google Drive, external URL) and Supabase Storage attachments.
- [ ] `PB-S10` **Public Share Links & Projections:** Design `client_share_links` with hashed tokens, expiry, revocability, and server-projected allow-list views enforcing `INV-004`.
- [ ] `PB-S11` **Constraints, Triggers & Database Invariants:** Formalize database-level constraints (`DBI-001` through `DBI-015`) and integrity triggers.
- [ ] `PB-S12` **Row Level Security (RLS) Matrix:** Specify explicit RLS policies for every table for authenticated workspace members and verify zero direct public table leaks.

---

## Workstream 3: External Integrations Contract (`INTEGRATIONS.md`)

- [ ] `PB-I01` **Google OAuth & Token Lifecycle:** Define server-side token storage, encryption, refresh lifecycle, scope minimization, and disconnection behavior.
- [ ] `PB-I02` **Google Drive Integration Contract:** Specify Google Picker client flow, file/folder metadata extraction, permission boundary, and thumbnail handling.
- [ ] `PB-I03` **Google Calendar Integration Contract:** Specify dedicated Lumina calendar outbound sync, free/busy conflict checking, timezone handling, and sync idempotency.
- [ ] `PB-I04` **Supabase Storage Architecture:** Define private vs. public buckets, allowed MIME types, max file sizes (avatar, receipts, brief attachments), and signed URL policies.

---

## Workstream 4: Initial Architectural Decision Records (`docs/decisions/`)

- [ ] `PB-D01` **ADR-0001:** `0001-pwa-first-over-native-first.md`
- [ ] `PB-D02` **ADR-0002:** `0002-use-supabase-postgresql.md`
- [ ] `PB-D03` **ADR-0003:** `0003-workspace-boundary-from-day-one.md`
- [ ] `PB-D04` **ADR-0004:** `0004-snapshot-packages-and-templates.md`
- [ ] `PB-D05` **ADR-0005:** `0005-large-media-remains-external.md`
- [ ] `PB-D06` **ADR-0006:** `0006-tokenized-public-client-projection.md`
- [ ] `PB-D07` **ADR-0007:** `0007-google-calendar-sync-direction.md`
- [ ] `PB-D08` **ADR Index Update:** Update `docs/decisions/README.md` to reference all locked ADRs.

---

## Workstream 5: Verification & Cross-Document Audit (`VERIFICATION.md`)

- [ ] `PB-V01` **Domain Model ↔ Schema Completeness Audit:** Verify 1:1 mapping of all entities, fields, cardinality, and derived concepts.
- [ ] `PB-V02` **Security & Authorization Audit:** Confirm RLS matrix coverage, token security, and zero public data leaks.
- [ ] `PB-V03` **Invariant Enforcement Audit:** Ensure INV-001 through INV-015 are mapped to concrete database constraints or application rules.
- [ ] `PB-V04` **Integrations Contract & Boundary Audit:** Verify OAuth, Drive, Calendar, and Storage specs match security constraints.
- [ ] `PB-V05` **Populate VERIFICATION.md:** Record all audit commands, diffs, and verification evidence.
- [ ] `PB-V06` **Final Pass B Signoff:** Mark Pass B complete in README and planning logs.
