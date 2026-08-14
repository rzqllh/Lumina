# Lumina — MVP Stabilization Backlog

**Status:** Pass 1 Complete (P0 & P1 Resolved)  
**Audit Reference:** `docs/plans/mvp-audit/AUDIT.md`  
**Verification Record:** `docs/plans/mvp-audit/STABILIZATION_VERIFICATION.md`  
**Purpose:** Prioritized stabilization and technical debt punch-list following Features 01–12 implementation.

---

## Priority Legend

- **P0 (Critical / Correctness):** Data integrity, table schema alignment, security, runtime blockers.
- **P1 (MVP Blocking):** Core operational flow blockers (e.g. inability to add new collaborators).
- **P2 (Production UX & Reliability):** Mobile ergonomics, query coordination, financial conveniences.
- **P3 (Polish & Deferred):** Composite templates, outbound third-party API sync, operational next action synthesis.

---

## 1. Backlog Items

### `STAB-P0-001` — Service-Role Key Audit & Dashboard Rotation
- **Priority:** `P0`
- **Area:** Security & Secrets Management
- **Problem:** A local service-role credential was referenced in past setup documentation notes.
- **Resolution Status:** `RESOLVED_CODE_SIDE` (Audited `src/lib/env.ts`, `src/lib/supabase.ts`, and all source code; verified zero client-side references or exposures of `service_role_key`. Logged `EXTERNAL_MANUAL_ACTION_REQUIRED` for Supabase project dashboard rotation).
- **Verification:** Security audit pass across all `src/` modules.

---

### `STAB-P0-002` — Fix Dashboard Tasks Table Query Target
- **Priority:** `P0`
- **Area:** Dashboard & Task Integrity
- **Problem:** `src/features/dashboard/api/dashboardApi.ts` line 66 queried `supabase.from('project_tasks')`. The canonical PostgreSQL schema table is named `tasks`.
- **Resolution Status:** `RESOLVED` (Updated `dashboardApi.ts` query target to `supabase.from('tasks')`, updated test mocks and verified).
- **Verification:** `src/test/dashboard/DashboardRoute.test.tsx` passes regression test asserting `tasks` is queried and `project_tasks` is not called.

---

### `STAB-P0-003` — Align Dashboard Receivables Calculation Semantics
- **Priority:** `P0`
- **Area:** Finance Domain Consistency
- **Problem:** Dashboard computed unpaid receivables strictly as $\sum \text{Pending Payment records}$. Project Detail computed receivables from the commercial contract value as $\max(0, \text{Contract Value} - \text{Paid Revenue})$.
- **Resolution Status:** `RESOLVED` (Created pure domain calculation `src/features/finance/utils/financialCalculations.ts` using canonical formula: $\text{Contract Value} = \sum (\text{subtotal} + \text{adjustment\_amount})$, $\text{Receivable} = \max(0, \text{Contract Value} - \text{Paid Revenue})$. Updated both `useProjectFinancialSummary` and `fetchWorkspaceDashboardData` to share this exact calculation).
- **Verification:** `src/test/finance/financialCalculations.test.ts` (4 unit tests) + `src/test/dashboard/DashboardRoute.test.tsx` pass.

---

### `STAB-P1-001` — Workspace Collaborator Catalog & Inline Creation
- **Priority:** `P1`
- **Area:** Finance & Crew Management
- **Problem:** The `collaborators` database table existed, but there was no UI route or modal to manage workspace collaborators.
- **Resolution Status:** `RESOLVED` (Implemented `createCollaborator`, `updateCollaborator`, `deleteCollaborator` API, `CollaboratorFormModal`, `CollaboratorsList`, `/settings/collaborators` & `/collaborators` routes, link in `SettingsRoute`, and inline "+ New Crew Member" creation inside `CollaboratorEngagementModal` with auto-selection).
- **Verification:** `src/test/finance/CollaboratorsRoute.test.tsx` (3 tests) and `src/test/finance/CollaboratorEngagementModal.test.tsx` (2 tests) pass.

---

### `STAB-P1-002` — Project Detail Information Hierarchy & Mobile Progressive Disclosure
- **Priority:** `P1` / `P2`
- **Area:** Mobile UX & Section Navigation
- **Problem:** Vertically stacking 8 full-width cards in `ProjectDetailRoute` created high scroll friction on mobile viewports.
- **Resolution Status:** `RESOLVED` (Refactored `ProjectDetailRoute.tsx` with responsive Section Tab bar: `All Overview`, `Workflow & Tasks`, `Sessions & Deliverables`, `Pricing & Finance`, `Brief & Files`. Coordinated query data from parent `useProject` and `useProjectStages`).
- **Verification:** `src/test/projects/ProjectDetailRoute.test.tsx` (3 tests) pass.

---

## 2. Remaining Roadmap Backlog (P2 / P3)

### `STAB-P2-002` — Quick Payment Schedule Generator
- **Priority:** `P2`
- **Area:** Finance UX
- **Action:** Add 1-click "Generate Standard Schedule (50/50 or 30/40/30)" action in `ProjectFinancialsSection`.

---

### `STAB-P2-003` — Direct File Storage Bucket Uploads
- **Priority:** `P2`
- **Area:** Files & Attachments
- **Action:** Add drag-and-drop file upload to `FileReferenceModal` targeting private Supabase storage buckets.

---

### `STAB-P3-001` — Operational Next Action Synthesis
- **Priority:** `P3`
- **Area:** Project Overview & Dashboard
- **Action:** Synthesize earliest incomplete task/session/brief into a top-level badge.

---

### `STAB-P3-002` — Composite Project Templates
- **Priority:** `P3`
- **Area:** Templates (`F-101`)
- **Action:** Multi-domain composite templates (Workflow + Package + Deliverables + Brief).

---

### `STAB-P3-003` — Google OAuth Outbound Sync (Calendar & Drive)
- **Priority:** `P3`
- **Area:** Integrations (`F-118`, `F-120`)
- **Action:** Supabase Edge Function OAuth token exchange for live 2-way Google Calendar / Drive synchronization.
