# Pass B — Execution Tasks Checklist

**Status:** Complete (All Pass B Tasks Verified)
**Ledger Reference:** `docs/plans/pass-b/PLAN.md`

---

## Workstream 1: Architecture Foundation (`ARCHITECTURE.md`)

- [x] `PB-A01` **Stack & Layer Commitments:** Finalized in `ARCHITECTURE.md` §2 (TypeScript, React current stable, Vite current supported stable, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form + Zod, Supabase PostgreSQL, Cloudflare Workers Static Assets).
- [x] `PB-A02` **Trust Boundaries & Data Access Patterns:** Defined in `ARCHITECTURE.md` §4 (Direct PostgREST for owner with RLS; single Supabase Edge Functions boundary for OAuth, public tokens, and Google APIs).
- [x] `PB-A03` **PWA & Offline Strategy:** Documented in `ARCHITECTURE.md` §5 (Workbox app shell caching, TanStack Query IndexedDB persistence for offline reading, disabled writes while offline in MVP).
- [x] `PB-A04` **Error Handling & Standardized Error Categories:** Formalized in `ARCHITECTURE.md` §6 (`AppErrorResponse` with standardized error codes).
- [x] `PB-A05` **Observability & Audit Logging:** Defined in `ARCHITECTURE.md` §7 (Structured JSON Edge logging, database `audit_logs` table for force-close, link revocation, and OAuth events).
- [x] `PB-A06` **Deployment Topology & Environments:** Defined in `ARCHITECTURE.md` §8 (Local Supabase CLI Docker, Cloudflare Workers Static Assets Preview/Production, Supabase staging/production).

---

## Workstream 2: Schema ↔ Security Co-Design (`DATABASE_SCHEMA.md` & `SECURITY.md`)

- [x] `PB-S01` **Conventions & Data Types:** Evaluated and locked in `DATABASE_SCHEMA.md` §1 (UUID v4 via `gen_random_uuid()`, `TIMESTAMPTZ`, `BIGINT` integer minor units for IDR/currencies, `snake_case`, `TEXT` + `CHECK` constraints).
- [x] `PB-S02` **Workspace & Member Model:** Designed in `DATABASE_SCHEMA.md` §2.1 (`workspaces`, `workspace_members` with `is_workspace_member()` RLS definer).
- [x] `PB-S03` **Client & Contact Rolodex:** Designed in `DATABASE_SCHEMA.md` §2.2 (`clients`, `client_contacts`, and `project_contacts` true junction with client match trigger).
- [x] `PB-S04` **Service Catalog, Packages & Snapshots:** Designed in `DATABASE_SCHEMA.md` §2.3 (`services`, `packages`, `package_items`, and `project_services` enforcing `INV-001`/`INV-015`).
- [x] `PB-S05` **Project Core & Workflow Stages:** Designed in `DATABASE_SCHEMA.md` §2.4 (`projects` with `force_closed_at`, `force_close_reason`, `reopened_at`, `sessions`, `workflow_templates`, `project_workflow_stages`, `tasks`; `OD-001` force-close operational freeze resolved).
- [x] `PB-S06` **1:1 Brief, Sections, Fields & Submissions:** Designed in `DATABASE_SCHEMA.md` §2.5 (`brief_templates`, `briefs` with 1:1 total participation trigger, `brief_sections`, `brief_fields` with JSONB values, `brief_submissions` immutable payload, and `brief_submission_reviews`).
- [x] `PB-S07` **Deliverables & Revision Cycles:** Designed in `DATABASE_SCHEMA.md` §2.6 (`deliverables`, `revisions` with unique `(deliverable_id, revision_number)` and `INV-002`).
- [x] `PB-S08` **Project Finance & Cost Separation:** Designed in `DATABASE_SCHEMA.md` §2.7 (`payments` with persisted `pending`/`paid`, `expenses` generic costs only, `collaborator_engagements` agreed fees; `OD-005` resolved).
- [x] `PB-S09` **File References & Storage Metadata:** Designed in `DATABASE_SCHEMA.md` §2.8 (`file_references` for Google Drive external URLs and Supabase Storage).
- [x] `PB-S10` **Public Share Links & Projections:** Designed in `DATABASE_SCHEMA.md` §2.8 & `SECURITY.md` §4 (`public_share_links` with `purpose` column, partial unique active index, and purpose allow-list projections; `OD-004` resolved).
- [x] `PB-S11` **Cross-Parent Constraints & Database Invariants:** Formalized in `DATABASE_SCHEMA.md` §3 (Triggers for ProjectContact↔Client, Task↔Project scope, FileReference↔Project scope, ForceClose freeze).
- [x] `PB-S12` **Row Level Security (RLS) Matrix:** Specified complete RLS matrix for all 20+ tables in `SECURITY.md` §3 and `DATABASE_SCHEMA.md` (zero direct public table access).

---

## Workstream 3: External Integrations Contract (`INTEGRATIONS.md`)

- [x] `PB-I01` **Google OAuth & Token Lifecycle:** Defined in `INTEGRATIONS.md` §1 (AES-256 encrypted refresh tokens in `oauth_credentials`, server-side refresh, scope minimization, revocation endpoint).
- [x] `PB-I02` **Google Drive Integration Contract:** Specified in `INTEGRATIONS.md` §2 (Google Picker browser flow, short-lived token, metadata extraction to `file_references`).
- [x] `PB-I03` **Google Calendar Integration Contract:** Specified in `INTEGRATIONS.md` §3 (Outbound sync to dedicated "Lumina Projects" calendar, free/busy conflict checking, idempotency via `google_calendar_event_id`).
- [x] `PB-I04` **Supabase Storage Architecture:** Defined in `INTEGRATIONS.md` §4 and `SECURITY.md` §7 (Private vs public CDN buckets: `avatars`, `receipts`, `brief-attachments`, `project-covers`).

---

## Workstream 4: Initial Architectural Decision Records (`docs/decisions/`)

- [x] `PB-D01` **ADR-0001:** `0001-pwa-first-over-native-first.md` (Status: Accepted)
- [x] `PB-D02` **ADR-0002:** `0002-use-supabase-postgresql.md` (Status: Accepted)
- [x] `PB-D03` **ADR-0003:** `0003-workspace-boundary-from-day-one.md` (Status: Accepted)
- [x] `PB-D04` **ADR-0004:** `0004-snapshot-packages-and-templates.md` (Status: Accepted)
- [x] `PB-D05` **ADR-0005:** `0005-large-media-remains-external.md` (Status: Accepted)
- [x] `PB-D06` **ADR-0006:** `0006-tokenized-public-client-projection.md` (Status: Accepted — `OD-004` resolved)
- [x] `PB-D07` **ADR-0007:** `0007-google-calendar-sync-direction.md` (Status: Accepted)
- [x] `PB-D08` **ADR Index Update:** Updated `docs/decisions/README.md` referencing all 7 Accepted ADRs.

---

## Workstream 5: Verification & Cross-Document Audit (`VERIFICATION.md`)

- [x] `PB-V01` **Domain Model ↔ Schema Completeness Audit:** Verified 1:1 mapping of all 20 entities in `VERIFICATION.md` §1.
- [x] `PB-V02` **Security & Authorization Audit:** Verified RLS matrix coverage and zero direct public leaks in `VERIFICATION.md` §3.
- [x] `PB-V03` **Invariant Enforcement Audit:** Verified INV-001 through INV-015 mapped to physical schema/triggers in `VERIFICATION.md` §2.
- [x] `PB-V04` **Integrations Contract & Boundary Audit:** Verified OAuth token encryption and Drive/Calendar isolation in `VERIFICATION.md` §4.
- [x] `PB-V05` **Populate VERIFICATION.md:** Populated concrete audit evidence in `VERIFICATION.md`.
- [x] `PB-V06` **Final Pass B Signoff:** Pass B technical design validated and mutually consistent.
