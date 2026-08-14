# Lumina — Product Requirements Document

**Status:** Draft  
**Owner:** TBD  
**Last updated:** YYYY-MM-DD  
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

For MVP, define measurable outcomes based on real use rather than vanity metrics.

Candidate measures:
- owner can determine today’s required work in under 10 seconds
- every active project has a visible next action or explicit “no action”
- overdue project work and payment are visible without opening each project
- project creation from a saved template takes under N minutes
- project profit can be calculated from recorded revenue and expenses
- client brief submission requires no client account
- project public link leaks zero internal-only fields

Replace candidates with accepted values before implementation.

## 9. Functional requirements

Use stable requirement IDs.

Example format:

### PRJ-001 — Create project after DP
**Requirement:** Owner can create a project after a DP has been received.  
**Rules:**
- one project can contain multiple services
- one project can contain multiple sessions
- package values must be snapshotted
- workflow remains editable after creation

**Acceptance:**
- [ ] ...
- [ ] ...

Add requirements here only at product level. Feature-specific behavior belongs in feature specs.

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

Initial candidates:
- photo/video editing
- RAW processing
- AI culling
- full cloud media storage
- payroll
- team permission administration
- general-purpose accounting
- payment gateway
- full client account/portal
- generic personal calendar replacement

Confirm in `FEATURE_INVENTORY.md`.

## 13. Risks and assumptions

| ID | Type | Statement | How to validate | Status |
|---|---|---|---|---|
| A-001 | Assumption | PWA is sufficient for initial Android use | real-device test | Open |
| A-002 | Assumption | Drive links are sufficient for large media | real projects | Open |
| R-001 | Risk | flexible templates can become configuration-heavy | usability test | Open |

## 14. Open questions

Only unresolved product questions belong here.

- ...
