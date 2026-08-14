# Lumina — MVP Stabilization Backlog

**Status:** Backlog Established  
**Audit Reference:** `docs/plans/mvp-audit/AUDIT.md`  
**Purpose:** Prioritized stabilization and technical debt punch-list following Features 01–12 implementation.

---

## Priority Legend

- **P0 (Critical / Correctness):** Data integrity, table schema alignment, security, runtime blockers.
- **P1 (MVP Blocking):** Core operational flow blockers (e.g. inability to add new collaborators).
- **P2 (Production UX & Reliability):** Mobile ergonomics, query coordination, financial conveniences.
- **P3 (Polish & Deferred):** Composite templates, outbound third-party API sync, operational next action synthesis.

---

## 1. Backlog Items

### `STAB-P0-001` — Service-Role Key Rotation
- **Priority:** `P0`
- **Area:** Security & Secrets Management
- **Problem:** A local service-role credential was previously committed in documentation history.
- **Recommended Action:** Rotate the Supabase service-role secret in environment settings.
- **Blocking Relationship:** External / Non-code blocker.

---

### `STAB-P0-002` — Fix Dashboard Tasks Table Query Target
- **Priority:** `P0`
- **Area:** Dashboard & Task Integrity
- **Problem:** `src/features/dashboard/api/dashboardApi.ts` line 66 queries `supabase.from('project_tasks')`. The canonical Supabase table is named `tasks`. This causes a runtime table-not-found error on real Supabase instances.
- **Recommended Action:** Change `.from('project_tasks')` to `.from('tasks')` in `dashboardApi.ts` and ensure test mocks align.
- **Blocking Relationship:** Blocks production Dashboard execution.

---

### `STAB-P0-003` — Align Dashboard Receivables Calculation Semantics
- **Priority:** `P0`
- **Area:** Finance Domain Consistency
- **Problem:** Dashboard computes unpaid receivables strictly as $\sum \text{Pending Payment records}$. Project Detail computes receivables from the commercial contract value as $\max(0, \text{Contract Value} - \text{Paid Revenue})$. If future payments have not yet been manually inserted as rows, Dashboard underreports unbilled receivables.
- **Recommended Action:** Derive workspace unpaid receivables in `dashboardApi.ts` by summing project contract values minus paid revenue for all active projects, aligning with `useProjectFinancialSummary`.
- **Blocking Relationship:** Affects financial metric accuracy across screens.

---

### `STAB-P1-001` — Workspace Collaborator Catalog & Inline Creation
- **Priority:** `P1`
- **Area:** Finance & Crew Management
- **Problem:** The `collaborators` database table exists, but there is no Settings page or UI modal to add new collaborators into the workspace catalog. In `CollaboratorEngagementModal`, if the catalog is empty, the user is permanently blocked from assigning crew.
- **Recommended Action:**
  1. Add a Collaborators section in Settings (`/settings/collaborators` or tab under Settings).
  2. Add an inline "+ New Collaborator" button directly inside `CollaboratorEngagementModal` to create and select a collaborator on the fly.
- **Blocking Relationship:** Blocks Feature 09 crew cost tracking when starting with an empty workspace.

---

### `STAB-P1-002` — Project Detail Query Coordination & Suspense Boundaries
- **Priority:** `P1`
- **Area:** Project Detail Performance & Network Concurrency
- **Problem:** `ProjectDetailRoute` triggers 12 concurrent React Query fetches across 8 child modules on mount, leading to staggered layout popping on mobile connections.
- **Recommended Action:** Structure section loading states with consistent skeletons or coalesce project-scoped subresource queries where appropriate.
- **Blocking Relationship:** Improves real-world network resilience.

---

### `STAB-P2-001` — Project Detail Mobile Ergonomics & Section Tabs
- **Priority:** `P2`
- **Area:** Mobile UX & Information Architecture
- **Problem:** Vertically stacking 8 full-width cards in `ProjectDetailRoute` produces a ~2500px tall page on mobile, making workflow stages and tasks difficult to reach.
- **Recommended Action:** Introduce lightweight tab/segmented control or collapsible sections on mobile viewports (`Overview`, `Commercial & Finance`, `Production & Workflow`, `Deliverables & Files`).
- **Blocking Relationship:** Enhances daily mobile operating speed.

---

### `STAB-P2-002` — Quick Payment Schedule Generator
- **Priority:** `P2`
- **Area:** Finance UX
- **Problem:** Creating standard 50% DP / 50% Final payment splits requires calculating amounts and creating multiple individual payment records manually.
- **Recommended Action:** Add a 1-click "Generate Standard Schedule (50/50 or 30/40/30)" action in `ProjectFinancialsSection` that automatically computes installment amounts from current contract value.
- **Blocking Relationship:** Quality of life improvement.

---

### `STAB-P2-003` — Direct File Storage Bucket Uploads
- **Priority:** `P2`
- **Area:** Files & Attachments
- **Problem:** `FileReferenceModal` currently only accepts manual URL inputs. Small app attachments (PDF briefs, invoices) cannot yet be dragged-and-dropped directly to Supabase storage buckets.
- **Recommended Action:** Add file picker / dropzone to `FileReferenceModal` that uploads directly to the private `brief-attachments` or `receipts` Supabase Storage bucket and creates a `file_references` row.
- **Blocking Relationship:** Completes `F-030`.

---

### `STAB-P3-001` — Operational Next Action Synthesis
- **Priority:** `P3`
- **Area:** Project Overview & Dashboard
- **Problem:** Neither Project Detail nor Project Cards render a synthesized "Next Action" string (`F-033`).
- **Recommended Action:** Implement a helper function `computeProjectNextAction(project)` that evaluates earliest incomplete task, upcoming session, unsubmitted brief, or pending delivery deadline, rendering a prominent badge in Project Detail.
- **Blocking Relationship:** Enhances glanceability.

---

### `STAB-P3-002` — Composite Project Templates
- **Priority:** `P3`
- **Area:** Templates (`F-101`)
- **Problem:** Full multi-domain project templates (Workflow + Package + Deliverables + Brief Template) do not exist.
- **Recommended Action:** Create `project_templates` schema and UI when multi-gig repeatability warrants composite templates.
- **Blocking Relationship:** Deferred High-Value feature.

---

### `STAB-P3-003` — Google OAuth Outbound Sync (Calendar & Drive)
- **Priority:** `P3`
- **Area:** Integrations (`F-118`, `F-120`)
- **Problem:** Google Calendar sync and Google Drive picker remain manual/deferred.
- **Recommended Action:** Implement Supabase Edge Function OAuth token exchange and Google API client when external cloud integration is scheduled.
- **Blocking Relationship:** Deferred High-Value feature.
