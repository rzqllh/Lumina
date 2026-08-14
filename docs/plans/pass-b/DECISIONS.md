# Pass B — Open Decisions & ADR Candidate Tracking

**Status:** Active Tracking  
**Ledger Reference:** `docs/plans/pass-b/PLAN.md`

---

## 1. Open Decisions Ledger

### `OD-001` — Post Force-Close Operational & Financial Lifecycle
- **Status:** `RESOLVING FOR PASS B` (Blocks Task `PB-S05`)
- **Area:** Project State Machine & Schema Design
- **Question:**
  When a project is force-closed:
  1. Is the project strictly read-only, or can late-arriving payments still be recorded?
  2. Can the owner reopen a force-closed project to `active` status?
- **Analysis & Real-World Workflow Context:**
  In real-world creative freelance/agency operations, projects are often force-closed due to client ghosting or stalled reviews. Later, the client may return to settle an outstanding invoice or request final delivery. Completely locking the database record against payment entry forces data corruption or untracked cash receipts.
- **Accepted Working Resolution:**
  - **Operational work is locked:** Stage transitions, task creation, and new deliverable creations are disabled while in `force_closed` status.
  - **Financial entry remains enabled:** Recording incoming late payments against existing invoices/receivables remains permitted so that actual cash flow is accurately captured.
  - **Explicit Reopening:** The owner may explicitly reopen a `force_closed` project back to `active` via a logged action.
  - **Schema impact:** `projects` table stores `force_closed_at`, `force_close_reason`, and tracks state cleanly; database constraints enforce operational locking while allowing payment inserts.

---

### `OD-002` — Payment Operational Timing Labels & Thresholds
- **Status:** `DEFERRED`
- **Area:** Dashboard & Payment UX Logic
- **Question:** How many days prior to `due_date` should an unpaid payment display as "Due" rather than "Upcoming"?
- **Resolution Plan:** Does not block physical storage model (payment lifecycle state is persisted as `pending`/`paid`/`waived` while timing conditions are dynamically derived). Resolve in Dashboard / Payment feature spec.

---

### `OD-003` — Brief Builder MVP Initial Field Palette
- **Status:** `DEFERRED`
- **Area:** Brief Builder Feature Design
- **Question:** Which subset of the 16+ planned brief field types should be prioritized in MVP v1?
- **Resolution Plan:** Does not block domain cardinality (1:1 Brief) or relational schema design (typed JSON/polymorphic field values). Resolve in Brief Builder feature spec.

---

## 2. ADR Candidates Map

The following architectural decision records are planned for formal drafting in `docs/decisions/` during Pass B:

| ADR ID | File Name | Title | Target Status | Primary Drivers |
|---|---|---|---|---|
| **ADR-0001** | `0001-pwa-first-over-native-first.md` | PWA-first architecture for mobile & desktop | Proposed → Accepted | Fast deployment, single codebase, cross-platform Android/Desktop, zero app store gate |
| **ADR-0002** | `0002-use-supabase-postgresql.md` | Supabase & PostgreSQL as backend platform | Proposed → Accepted | Managed PostgreSQL, robust RLS, built-in Auth, Storage, Edge Functions, free tier fit |
| **ADR-0003** | `0003-workspace-boundary-from-day-one.md` | Workspace tenancy boundary from day one | Proposed → Accepted | Single-user-first UX without painting into a single-tenant architectural corner |
| **ADR-0004** | `0004-snapshot-packages-and-templates.md` | Historical snapshot semantics for packages & templates | Proposed → Accepted | Data integrity, commercial auditability, package updates must not mutate past gig data |
| **ADR-0005** | `0005-large-media-remains-external.md` | Large production media stored externally | Proposed → Accepted | Cost control, avoid reinventing cloud storage/DAM, Google Drive specialization |
| **ADR-0006** | `0006-tokenized-public-client-projection.md` | Tokenized public client access via server projection | Proposed → Accepted | Frictionless client experience (no accounts), zero data leakage of internal financials |
| **ADR-0007** | `0007-google-calendar-sync-direction.md` | Outbound project calendar sync & conflict detection | Proposed → Accepted | Lumina remains canonical production calendar; avoid bidirectional sync race conditions |

---

## 3. Decision Lifecycle Rules

1. **Open Decision (`OD-xxx`):** An unresolved architectural or business question under analysis.
2. **Working Resolution:** A proposed consensus documented in `DECISIONS.md` for schema/security guidance.
3. **ADR Proposed:** A drafted decision record following `docs/decisions/_template.md`.
4. **ADR Accepted:** A locked decision verified against canonical specs and approved for implementation.
