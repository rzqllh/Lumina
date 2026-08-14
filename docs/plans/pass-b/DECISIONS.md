# Pass B — Open Decisions & ADR Candidate Tracking

**Status:** Decisions Resolved & Locked
**Ledger Reference:** `docs/plans/pass-b/PLAN.md`

---

## 1. Open Decisions Ledger

### `OD-001` — Post Force-Close Operational & Financial Lifecycle
- **Status:** `APPROVED (Option B — Operational Freeze + Late Payments + Explicit Reopen)`
- **Area:** Project State Machine & Schema Design
- **Approved Resolution:**
  - When `status = 'force_closed'`, operational production mutations (inserting/progressing stages, creating tasks, creating deliverables, starting revisions) are blocked.
  - All existing tasks, pending deliverables, and active stages remain preserved in their current state.
  - Late incoming payments against existing project receivables ARE allowed to be recorded to preserve accurate cashflow history.
  - The owner may explicitly reopen a `force_closed` project back to `active` via a confirmed owner action (recording a `reopened_at` audit timestamp) without altering existing task/deliverable states.

---

### `OD-002` — Payment Operational Timing Labels & Thresholds
- **Status:** `DEFERRED`
- **Area:** Dashboard & Payment UX Logic
- **Resolution Plan:** Does not block physical storage model (persisted states are `pending` and `paid`; timing conditions `Upcoming`, `Due`, `Overdue` are dynamically derived). Resolve in Dashboard / Payment feature spec.

---

### `OD-003` — Brief Builder MVP Initial Field Palette
- **Status:** `DEFERRED`
- **Area:** Brief Builder Feature Design
- **Resolution Plan:** Does not block domain cardinality (1:1 Brief) or relational schema design (typed JSONB field values). Resolve in Brief Builder feature spec.

---

### `OD-004` — Public Link Purpose, Cardinality & History
- **Status:** `APPROVED (Option A — Single Polymorphic Public Share Link Model with Historical Token Retention)`
- **Area:** Public Sharing Architecture & Security
- **Approved Resolution:**
  - Unified table `public_share_links` with `purpose TEXT NOT NULL CHECK (purpose IN ('status_page', 'brief_intake'))`.
  - Cardinality: 0..N historical tokens per project, with at most one active token per `(project_id, purpose)` enforced via partial unique index (`WHERE is_active = TRUE`).
  - Regenerating a token marks old token `is_active = FALSE, revoked_at = NOW()`, preserving rows for audit.
  - Public requests resolve via dedicated Edge Functions with purpose-specific allow-list projections.

---

### `OD-005` — Payment Waiver & Financial Completion Semantics
- **Status:** `APPROVED (Option C — Remove Payment waived from MVP; commercial price reductions recorded via ProjectService adjustments)`
- **Area:** Finance Domain & Project Closure Invariants
- **Approved Resolution:**
  - Payment persisted lifecycle is strictly `pending -> paid`.
  - If owner agrees to a fee reduction with a client, the commercial reduction is recorded via a Project Service price adjustment or discount line, directly reducing `Project Value`.
  - `Project Value = SUM(Project Service net line totals)`, `Paid Amount = SUM(Payment.amount WHERE status = 'paid')`, `Receivable = Project Value − Paid Amount`.
  - Normal Close financial eligibility remains `Receivable == 0` (`Paid Amount == Project Value`).

---

## 2. ADR Candidates Map

| ADR ID | File Name | Title | Status | Primary Drivers |
|---|---|---|---|---|
| **ADR-0001** | `0001-pwa-first-over-native-first.md` | PWA-first architecture for mobile & desktop | **Accepted** | Fast deployment, single codebase, cross-platform Android/Desktop, zero app store gate |
| **ADR-0002** | `0002-use-supabase-postgresql.md` | Supabase & PostgreSQL as backend platform | **Accepted** | Managed PostgreSQL, robust RLS, built-in Auth, Storage, Edge Functions, free tier fit |
| **ADR-0003** | `0003-workspace-boundary-from-day-one.md` | Workspace tenancy boundary from day one | **Accepted** | Single-user-first UX without painting into a single-tenant architectural corner |
| **ADR-0004** | `0004-snapshot-packages-and-templates.md` | Historical snapshot semantics for packages & templates | **Accepted** | Data integrity, commercial auditability, package updates must not mutate past gig data |
| **ADR-0005** | `0005-large-media-remains-external.md` | Large production media stored externally | **Accepted** | Cost control, avoid reinventing cloud storage/DAM, Google Drive specialization |
| **ADR-0006** | `0006-tokenized-public-client-projection.md` | Tokenized public client access via server projection | **Accepted** | Frictionless client experience (no accounts), zero data leakage of internal financials |
| **ADR-0007** | `0007-google-calendar-sync-direction.md` | Outbound project calendar sync & conflict detection | **Accepted** | Lumina remains canonical production calendar; avoid bidirectional sync race conditions |

---

## 3. Decision Lifecycle Summary

- `OD-001`: APPROVED (Resolved in `WORKFLOWS.md`, `DATABASE_SCHEMA.md`, `SECURITY.md`)
- `OD-002`: DEFERRED (To Dashboard / Payment feature spec)
- `OD-003`: DEFERRED (To Brief Builder feature spec)
- `OD-004`: APPROVED (Resolved in `DATABASE_SCHEMA.md`, `SECURITY.md`, `ADR-0006`)
- `OD-005`: APPROVED (Resolved in `DOMAIN_MODEL.md`, `WORKFLOWS.md`, `DATABASE_SCHEMA.md`)
