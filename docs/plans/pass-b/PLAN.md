# Pass B — Technical Design & Architecture Plan

**Status:** Active Execution Plan  
**Target:** Technical truth locked across architecture, schema, security, integrations, and initial ADRs  
**Prerequisites:** Pass A locked (`DOMAIN_MODEL.md`, `WORKFLOWS.md`, `PRD.md`)

---

## 1. Scope & Objectives

Pass B locks the technical architecture, data model, security boundaries, integration contracts, and foundational architecture decision records (ADRs) before any application scaffolding or implementation begins.

### Target Documents to Lock:
1. `docs/engineering/ARCHITECTURE.md` — Stack, runtime boundaries, environments, PWA/server model, deployment shape.
2. `docs/engineering/DATABASE_SCHEMA.md` — Physical tables, foreign keys, constraints, indexes, migration strategy, typed brief storage, money representation.
3. `docs/engineering/SECURITY.md` — Authentication, authorization, RLS matrix, public projection security, secrets/token storage.
4. `docs/engineering/INTEGRATIONS.md` — Google Drive & Google Calendar contracts, OAuth boundaries, Supabase storage policies.
5. `docs/decisions/0001` through `0007` — Durable Architectural Decision Records.

---

## 2. Workstreams & Parallelism Strategy

Pass B is organized into **5 coordinated workstreams**:

```text
                 ┌─ Workstream 1: Architecture Foundation ──────┐
                 │                                              │
Pass A locked ───┼─ Workstream 2: Schema ↔ Security Co-Design ──┼──► Workstream 5: Cross-Doc Verification
                 │                                              │
                 ├─ Workstream 3: External Integrations Contract ┤
                 │                                              │
                 └─ Workstream 4: ADR Drafting & Consolidation ─┘
```

### Parallel-Safe Workstreams (1–4):
- **Workstream 1 (Architecture Foundation):** Runtime environments, PWA service worker strategy, client/server boundaries, deployment topology.
- **Workstream 2 (Schema ↔ Security Co-Design):** Physical relational schema, RLS policies, constraints, indexes, and public projection design. (These *must* be designed together).
- **Workstream 3 (External Integrations Contract):** Google Drive Picker contract, Google Calendar sync direction, Supabase Storage buckets, and OAuth credential isolation.
- **Workstream 4 (ADR Drafting & Consolidation):** Formalizing durable architectural decisions (0001–0007) based on primary research and locked technical consensus.
- **Workstream 5 (Cross-Document Verification):** Convergence and holistic integrity audit (not a parallel authoring stream).

### Strict Coupling Rules (Do NOT parallelize independently):
- ⚠️ **Physical Schema vs. Tenancy/RLS:** Do not design table schemas without designing their workspace ownership and RLS access model in the same pass.
- ⚠️ **Public Share Schema vs. Security Projection:** Do not define public share database rows without defining the server boundary and allow-list query projection.
- ⚠️ **OAuth Token Storage vs. Integration Flow:** Do not specify integration features without locking server-side token encryption and lifecycle boundaries.
- ⚠️ **Template/Package Snapshot Tables vs. Snapshot Invariants:** Ensure `project_services`, `project_workflow_stages`, and `briefs` physical schemas enforce `INV-001` and `INV-015`.

---

## 3. Decision & Dependency Gates

Specific open decisions block finalization of dependent tasks:

```text
OD-001 (Post Force-Close Behavior)
  └─ Blocks: Finalization of `projects` force-close state constraints (Task PB-S05)

OD-004 (Public Link Model & History)
  └─ Blocks: Finalization of `public_share_links` schema & public endpoint contracts (Task PB-S10)

OD-005 (Payment Waiver Semantics)
  └─ Blocks: Finalization of financial close database constraints (Tasks PB-S08, PB-S11)

OD-002 (Payment Timing Labels) & OD-003 (Brief Field Palette)
  └─ Deferred: Non-blocking for Pass B physical schema
```

---

## 4. Execution Sequence

1. **Phase 0: Setup & Ledger Reconciliation**
   - Correct execution tracking ledger (`PLAN.md`, `TASKS.md`, `DECISIONS.md`, `VERIFICATION.md`).
   - Remove deliverable waiver wording in `WORKFLOWS.md`.

2. **Phase 1: Parallel Engineering Specifications**
   - Execute Workstream 1: Refine and lock `ARCHITECTURE.md`.
   - Execute Workstream 2: Co-design `DATABASE_SCHEMA.md` and `SECURITY.md` for all non-blocked tables.
   - Execute Workstream 3: Define contract specifications in `INTEGRATIONS.md`.
   - Execute Workstream 4: Draft ADRs 0001 through 0007 in `docs/decisions/`.

3. **Phase 2: Reconciliation, Verification & Status Ledger**
   - Run cross-document consistency audit across all workstreams.
   - Record blocked tasks in `TASKS.md` against open decisions `OD-001`, `OD-004`, `OD-005`.
   - Populate `VERIFICATION.md` with verified evidence.
