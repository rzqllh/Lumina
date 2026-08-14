# Lumina — Product Requirements Document

**Status:** Draft — consistency-checked against locked domain model  
**Owner:** TBD  
**Last updated:** 2026-08-14  
**Target:** MVP / Personal use

## 1. Product summary

Lumina is a mobile-first personal project operating system for a photographer/videographer.

It manages work after a prospective customer has paid the initial DP, through project planning, brief collection, sessions, production, editing, revisions, delivery, client approval, payment completion, and closure.

Lumina does **not** edit photos or videos.

## 2. Primary user

### Current user
A single photographer/videographer operating personal client projects.

### Future posture
The system should avoid architecture that makes later collaborator/team support impossible, but MVP must not carry unnecessary team-management complexity.

## 3. Problem statement

Capture the concrete problems observed in the real workflow.

Current candidates:
- project status is difficult to track across multiple simultaneous jobs
- deadlines for shooting, editing, revision, and delivery can become fragmented
- DP, installment, and final payment states need project-level visibility
- project briefs need reusable but editable structures
- one project can contain multiple services, sessions, deliverables, collaborators, fees, files, and revisions
- external file links are scattered
- actual project profitability is not immediately visible
- the owner needs a fast answer to: **“What do I need to do today?”**

## 4. Product principles

1. **Today first** — surface the next work and deadlines before analytics.
2. **Project as operating hub** — project detail is the command center.
3. **Flexible without becoming Jira** — templates and stages are editable, but workflow configuration remains understandable.
4. **Historical truth must stay stable** — package/template edits never rewrite old projects.
5. **External media by default** — Lumina manages references to large media rather than storing all production assets.
6. **Client visibility is explicit** — internal information is private unless specifically exposed.
7. **Financial clarity, not full accounting** — track project economics without becoming bookkeeping software.
8. **Mobile-first** — primary workflows must be fast on Android-sized screens.

## 5. Entry and exit boundary

### Project enters Lumina
A project is normally created after the initial DP has been received.

### Project closes
Default closure:
- final deliverables have been delivered
- client has approved
- project is fully paid

Owner can force-close with confirmation and a recorded reason.

## 6. Core product capabilities

> Do not finalize this list here. `FEATURE_INVENTORY.md` owns detailed feature prioritization.

High-level domains:
- projects
- clients / companies / contacts
- services and packages
- workflow stages
- sessions / shoots / meetings
- tasks
- briefs and brief templates
- deliverables
- revisions
- files / external links
- collaborators and fees
- payments
- expenses
- profitability
- production calendar
- client share view
- client brief form
- Google Drive integration
- Google Calendar integration

## 7. Canonical user journeys

### Journey A — Create a project from a package/template
1. DP received.
2. Owner creates project.
3. Selects one or more packages/services or custom items.
4. Applies project template.
5. Lumina snapshots pricing/template values.
6. Workflow, brief, tasks, deliverables, payment schedule, calendar items, file structure references, and client-share configuration are generated.
7. Owner customizes anything project-specific.

### Journey B — Daily work
1. Owner opens Lumina.
2. Dashboard answers “what do I need to do today?”
3. Owner sees overdue/urgent work.
4. Opens a project/task/session.
5. Completes or reschedules the work.
6. Project progress updates.

### Journey C — Client brief
1. Owner generates brief from template.
2. Customizes fields.
3. Sends shareable brief link.
4. Client completes form without an account.
5. Lumina stores submission separately.
6. Owner reviews proposed project changes.
7. Owner accepts/rejects changes.

### Journey D — Revision
1. Deliverable is sent.
2. Client requests revision.
3. Revision is created under that deliverable.
4. Feedback, deadline, and status are tracked.
5. Revised file is delivered.
6. Deliverable is approved or another revision begins.

### Journey E — Project close
1. Deliverables are approved.
2. Full payment is recorded.
3. Project becomes eligible to close.
4. Owner closes project.
5. Force-close remains available with explicit confirmation and reason.

## 8. Success criteria

### Product outcomes (core goals)
- The owner can immediately identify today's required work and critical deadlines upon opening the app.
- Every active project maintains an explicit, visible operational state and next action.
- Overdue tasks, deadlines, and payments are visible on the primary dashboard without opening individual projects.
- Projects can be initialized rapidly from reusable templates without duplicating configuration effort.
- Project profitability is directly calculable from recorded revenue, generic expenses, and committed collaborator costs.
- Client brief collection and project status viewing require zero client account creation.
- Public client links expose strictly allow-listed data and leak zero internal/financial fields.

### Initial validation targets & hypotheses
These are initial usability and performance benchmarks to test with real-world project workflows (not locked empirical requirements):

| ID | Outcome / Area | Target Hypothesis | Validation Method | Status |
|---|---|---|---|---|
| VH-001 | Daily orientation | Owner determines today's required work in ≤10 seconds from app open | Usability testing | Hypothesis |
| VH-002 | Project intake speed | Project creation from saved template in ≤2 minutes | Time-to-complete test | Hypothesis |
| VH-003 | Action clarity | 100% of active projects display next action or explicit "no action needed" | Workspace audit | Hypothesis |
| VH-004 | Public link safety | Zero internal-only / financial fields exposed via public projection | Security testing | Security Target |

## 9. Functional requirements

Detailed functional requirements are distributed across canonical documents:

| Concern | Canonical owner |
|---|---|
| Feature scope and priority | `FEATURE_INVENTORY.md` |
| Entity definitions and invariants | `DOMAIN_MODEL.md` |
| State machines and business flows | `WORKFLOWS.md` |
| Per-feature detail | `docs/specs/<feature>/` |

This section captures cross-cutting product-level requirements not owned by any single feature.

### PRJ-001 — Create project after DP
**Requirement:** Owner can create a project after a DP has been received.  
**Rules:**
- one project can contain multiple services
- one project can contain multiple sessions
- package values must be snapshotted at project creation
- workflow remains editable after creation

### PRJ-002 — Project closure rules
**Requirement:** Projects close normally when deliverables are approved and payment is complete. Owner can force-close with confirmation and reason.  
**Rules:**
- normal close requires: all deliverables approved + fully paid
- force-close requires: explicit confirmation + written reason + timestamp
- force-close must not mark unpaid balances as paid
- see `WORKFLOWS.md` §2 for full state rules

### PRJ-003 — Template/package snapshot invariant
**Requirement:** Editing a package or template must never change values in existing projects.  
**Rules:**
- project services are snapshots of package/service values at creation time
- source references are audit-only, not live bindings
- see `DOMAIN_MODEL.md` INV-001, INV-015

### PRJ-004 — Client brief submission safety
**Requirement:** Client brief submissions must not silently overwrite canonical project data.  
**Rules:**
- submissions are stored as immutable records
- owner reviews per-field before applying changes
- see `DOMAIN_MODEL.md` INV-003, INV-012

### PRJ-005 — Public link security
**Requirement:** Public project links must expose only allow-listed fields.  
**Rules:**
- tokenized, revocable access
- never expose: profit, expenses, collaborator fees, internal notes, internal tasks, private brief fields, other clients
- see `DOMAIN_MODEL.md` INV-004

## 10. Non-functional requirements

Define explicit targets before implementation.

### Performance
- initial target:
- dashboard target:
- public page target:

### Reliability
- data mutation expectations:
- offline behavior:
- sync behavior:

### Security
- owner data protected by authorization/RLS
- public links expose allow-listed projections only
- privileged credentials never shipped to browser

### Accessibility
- keyboard behavior for web desktop
- focus states
- semantic labels
- minimum contrast target
- touch target expectations

### Compatibility
- Android Chrome/PWA is primary
- modern desktop browsers supported
- Capacitor/native shell may be added later without rewriting product logic

## 11. Constraints

Current architecture direction:
- free-tier-first
- TypeScript
- React
- Vite
- PWA
- Supabase/PostgreSQL/Auth/RLS/Storage
- Google Drive for large media references
- Google Calendar integration
- Cloudflare hosting
- Capacitor later if APK/AAB is needed

Architecture details are owned by `ARCHITECTURE.md`.

## 12. Out of scope

The following are explicitly not part of Lumina. See `FEATURE_INVENTORY.md` §5 for the full locked list.

- photo/video editing
- RAW processing
- AI culling
- full cloud media storage / Drive replacement
- payroll
- team permission administration
- general-purpose accounting
- payment gateway
- full client account/portal
- generic personal calendar replacement
- enterprise workflow engine
- arbitrary Notion-style database builder
- generic CRM lead pipeline before DP

## 13. Risks and assumptions

| ID | Type | Statement | How to validate | Status |
|---|---|---|---|---|
| A-001 | Assumption | PWA is sufficient for initial Android use | Real-device testing | Open |
| A-002 | Assumption | Drive links are sufficient for large media | Real project use | Open |
| R-001 | Risk | Flexible templates can become configuration-heavy | Usability testing | Open |
| R-002 | Risk | Brief Builder field types may need iteration after real use | Field usage analytics | Open |
| R-003 | Risk | Google Calendar sync direction may need revision after API integration | Integration testing | Open |

### Revisit triggers
- **Brief cardinality:** Revisit 1:1 Brief per Project if real Lumina usage demonstrates a recurring need for independently managed Briefs inside one Project.

## 14. Open questions

Only unresolved product questions belong here.

- Post-force-close lifecycle: Should force-closed projects become strictly read-only, or should reopening to active and recording late payments be supported?
- Payment due window: How many days before due_date should an unpaid payment be highlighted as "Due" on the dashboard?
- Brief Builder v1 field subset: What is the priority subset of field types to implement in MVP v1?
