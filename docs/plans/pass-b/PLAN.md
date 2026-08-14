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

To ensure speed without creating cross-document contradictions, Pass B is split into **4 coordinated workstreams**:

```text
                 ┌─ Workstream 1: Architecture Foundation ──────┐
Pass A locked ───┤                                              ├─ Integration Reconciliation
                 ├─ Workstream 2: Schema ↔ Security Co-Design ──┤
                 └─ Workstream 3: ADR Drafting & Consolidation ─┘
                                   ↓
                       Cross-Document Verification
```

### Parallel-Safe Workstreams:
- **Workstream 1 (Architecture Foundation):** Runtime environments, PWA service worker strategy, client/server boundaries, deployment topology.
- **Workstream 2 (Schema ↔ Security Co-Design):** Physical relational schema, RLS policies, constraints, indexes, and public projection design. (These *must* be designed together).
- **Workstream 3 (Integrations Design):** Google Drive Picker contract, Google Calendar sync direction, Supabase Storage buckets, and OAuth credential isolation.
- **Workstream 4 (ADR Consolidation):** Formalizing durable architectural decisions (0001–0007) based on locked technical consensus.

### Strict Coupling Rules (Do NOT parallelize independently):
- ⚠️ **Physical Schema vs. Tenancy/RLS:** Do not design table schemas without designing their workspace ownership and RLS access model in the same pass.
- ⚠️ **Public Share Schema vs. Security Projection:** Do not define public share database rows without defining the server boundary and allow-list query projection.
- ⚠️ **OAuth Token Storage vs. Integration Flow:** Do not specify integration features without locking server-side token encryption and lifecycle boundaries.
- ⚠️ **Template/Package Snapshot Tables vs. Snapshot Invariants:** Ensure `project_services`, `project_workflow_stages`, and `briefs` physical schemas enforce `INV-001` and `INV-015`.

---

## 3. Decision & Dependency Gates

Before certain schema components can be finalized, specific open decisions must be resolved:

```text
OD-001 (Post Force-Close Behavior)
  └─ Blocks: `projects` schema state fields & force-close transition constraints (Task PB-S05)

OD-002 (Payment Timing Labels) & OD-003 (Brief Field Palette)
  └─ Deferred: Non-blocking for Pass B physical schema
```

---

## 4. Execution Sequence

1. **Phase 1: Setup & Workstream Kickoff**
   - Create execution tracking ledger (`PLAN.md`, `TASKS.md`, `DECISIONS.md`, `VERIFICATION.md`).
   - Reconcile `OD-001` working recommendation in `DECISIONS.md`.

2. **Phase 2: Core Engineering Specifications**
   - Execute Workstream 1: Refine and lock `ARCHITECTURE.md`.
   - Execute Workstream 2: Co-design `DATABASE_SCHEMA.md` and `SECURITY.md`.
   - Execute Workstream 3: Define contract specifications in `INTEGRATIONS.md`.

3. **Phase 3: ADR Formalization**
   - Draft and accept ADRs 0001 through 0007 in `docs/decisions/`.

4. **Phase 4: Verification & Audit**
   - Run full cross-document consistency audit.
   - Populate `VERIFICATION.md` with concrete evidence.
   - Lock Pass B.
