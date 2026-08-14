# Lumina — Product & Interface Design Specification

**Status:** Draft / Visual baseline established  
**Design source:** Existing Lumina mobile dashboard mockup  
**Primary surface:** Android-sized mobile web/PWA  
**Last updated:** 2026-08-14

This document defines durable UX and visual rules. It does **not** freeze the current dashboard layout. The existing mockup is the visual-language baseline, while information architecture and screen composition may evolve as the product model becomes clearer.

## 1. Experience statement

Lumina should feel like a calm, modern personal production console for a photographer/videographer.

It must not feel like:
- an enterprise project-management dashboard,
- a generic blue SaaS admin panel,
- an accounting application,
- a photo/video editor,
- or a Jira/Notion-style configuration surface.

The primary question on app open is:

> What do I need to do today?

The product should communicate urgency and next action quickly, while keeping the visual atmosphere light and controlled.

---

## 2. Current visual baseline

The existing mobile dashboard mockup establishes the current design language.

### 2.1 Overall character

The current visual direction is:

- clean
- light
- compact
- modern
- slightly youthful / Gen-Z
- spacious without becoming oversized
- soft rather than aggressively “tech”
- operational rather than decorative

The design should feel appropriate for a creative freelancer while still looking professional enough for client/project work.

### 2.2 Background and surfaces

Current baseline:

- page/app background uses a very light neutral with a slight lavender/grey cast
- primary cards use white or near-white surfaces
- borders are thin and low-contrast
- shadows are soft and subtle
- elevation should separate hierarchy without making the UI feel layered excessively
- large empty areas are acceptable when they improve scanning and calmness

Avoid:
- pure grey enterprise dashboards
- heavy drop shadows
- glassmorphism as a default treatment
- excessive gradients
- card-within-card nesting without hierarchy value

### 2.3 Accent usage

Purple is the primary action/accent family.

Use purple for:
- primary CTA
- selected navigation state
- focus/active affordances
- important but non-dangerous status emphasis
- lightweight visual identity

Red is reserved for:
- overdue
- destructive
- payment urgency
- failure/error
- critical attention

Do not use red as a decorative brand accent.

Secondary status colors may be introduced later, but must remain semantic and restrained.

### 2.4 Header pattern

Current baseline:
- elevated white rounded header surface
- avatar/profile identity on the left
- page title or contextual title
- lightweight utility actions on the right
- compact vertical height
- subtle separation from background

The dashboard title may evolve into a contextual greeting/date if it improves the “Today first” experience, but the same visual hierarchy should remain.

### 2.5 Section hierarchy

Current baseline uses small uppercase section labels such as:

- `NOTIFIKASI CEPAT`
- `AKSI CEPAT`
- `JANJI MENDATANG`

The final wording can change, but the visual pattern is useful:
- small
- uppercase or compact label styling
- muted color
- strong spacing before the section
- content card(s) directly below

For the product model, recommended dashboard section semantics are:

1. Needs Attention
2. Today
3. Active Projects
4. Upcoming Sessions / Shoots
5. Finance Snapshot

Do not give every section equal weight.

### 2.6 Cards

Current card direction:
- medium-to-large radius
- thin border
- compact internal spacing
- white/near-white surface
- clear content grouping
- no oversized decorative headers
- action aligned to the content need

Cards should remain dense enough for real project tracking.

Avoid:
- giant mobile cards with one line of information
- excessive rounded “bubble” UI
- repeating the same card treatment for all semantic levels

### 2.7 Navigation

Current mobile baseline:
- floating rounded bottom navigation container
- light/white navigation surface
- inactive items use lightweight outline icons
- active item uses a filled purple pill
- active label may be visible while inactive labels may be reduced/hidden depending on usability testing

Proposed primary owner navigation:
- Home
- Projects
- Calendar
- Clients

Profile/settings should not consume a primary navigation slot unless testing proves otherwise; they can be accessed from avatar/header.

### 2.8 Iconography

Direction:
- lightweight outline icons
- consistent stroke style
- simple silhouettes
- icons support text rather than replace unclear actions

Avoid mixing unrelated icon families.

### 2.9 Density and whitespace

Whitespace is intentional.

However, Lumina is still an operational application, so:
- preserve compact cards
- avoid unnecessary vertical padding
- use larger whitespace between groups than inside groups
- important actions should remain within thumb reach on mobile

The product should feel calm, not sparse to the point of inefficiency.

---

## 3. UX principles

1. **Today first** — prioritize the user’s next action over analytics.
2. **Exceptions before passive data** — overdue, due today, and blocked work surface first.
3. **Project as command center** — Project Detail is the primary operational surface.
4. **Separate states that mean different things** — workflow stage, payment state, deliverable approval, and project closure must not be collapsed into one generic status.
5. **Progressive disclosure** — overview first, detail on demand.
6. **Templates over blank configuration** — users start from sensible structure.
7. **Templates remain editable** — project copies can be changed freely.
8. **Client visibility is explicit** — owner/internal information stays private by default.
9. **Flexible without becoming Jira** — configurable workflows/briefs must remain understandable to a solo creative professional.
10. **Mobile-first, desktop-capable** — mobile drives interaction decisions; desktop gains density and layout, not a separate product.

---

## 4. Primary information architecture

### Mobile owner navigation

Primary:
- Home
- Projects
- Calendar
- Clients

Secondary:
- Finance
- Packages & Templates
- Settings/Profile

Potential global create action:
- New Project
- New Client
- Add Task
- Add Payment
- Add Expense

The final global action pattern must be validated during screen design.

---

## 5. Dashboard hierarchy

The current dashboard mockup is **not** a frozen final layout.

Recommended information hierarchy:

### 5.1 Needs Attention
Examples:
- overdue payment
- deliverable due today
- revision due
- project blocked
- client brief awaiting review

Each card should answer:
- what happened?
- which project?
- how urgent?
- what is the next action?

### 5.2 Today
Show work that is actionable today:
- shoots/sessions
- meetings
- due tasks
- delivery deadlines
- revision deadlines

Do not pollute this with low-priority future work.

### 5.3 Active Projects
Compact project progress:
- project name
- workflow stage
- next action/deadline
- relevant progress signal

### 5.4 Upcoming Sessions / Shoots
Prioritize operational information:
- date/time
- project
- location
- session type
- relevant CTA such as `View Brief`

### 5.5 Finance Snapshot
Keep high-level:
- received
- outstanding
- expenses
- projected profit

Do not turn Home into an accounting report.

---

## 6. Project Detail

Project Detail is the operational command center and should be designed before most secondary screens.

Potential information structure:

- project identity/status
- next action
- workflow/progress
- sessions
- tasks
- brief
- deliverables
- revisions
- payments
- expenses/profit
- collaborators
- files
- client/contacts
- activity/history

Not all sections should be visible with equal weight at once.

The top of the screen should answer:
1. What project is this?
2. Where is it in the workflow?
3. What needs to happen next?
4. Is anything overdue or blocked?

---

## 7. Status language

Avoid vague labels such as:
- `Dalam Proses`
- `Process`
- `Ongoing`

when a more concrete operational state exists.

Prefer:
- Preparing
- Shoot Tomorrow
- Selecting Photos
- Editing
- Awaiting Client Review
- Revision #2
- Final Delivery Due Today
- Payment Overdue

Owner-facing language may be concise and operational.

Client-facing language must be plain and non-technical.

---

## 8. Public / client surfaces

Client-facing pages must:
- require no account for the approved MVP flows
- use tokenized access
- expose only explicitly client-visible data
- have fewer controls than the owner app
- keep financial/internal information private by default
- communicate current stage and expected next step clearly

Potential public surfaces:
- Project Status
- Client Brief Form
- Client-visible Deliverables / Files
- Revision feedback later

Public surfaces should visually belong to Lumina but may use a simpler layout than the owner app.

---

## 9. Brief Builder interaction model

Brief Builder is a structured form/document editor, not merely a rich-text note.

A brief can contain:
- sections
- structured typed fields
- instruction text
- rich content
- reference links/files

Builder actions:
- add section
- reorder section
- rename section
- add field
- duplicate field
- delete field
- reorder field
- mark required
- set client visibility/editability
- add helper text
- save as template

Field terminology shown to the user must be simple and non-technical.

Avoid exposing implementation terms such as:
- JSON schema
- database type
- object
- array

### Visibility modes

Each field can be configured as:
- Internal Only
- Client Can View
- Client Can/Must Fill

Exact labels can be refined in UX copy.

---

## 10. Template UX

Templates are starting points, not locked product rules.

User must be able to:
- preview template
- apply template
- edit the project copy
- add/remove/reorder generated stages/tasks/fields
- save a modified project structure as a new template
- edit an existing template for future projects
- duplicate a template
- archive/delete a template when appropriate

The interface must clearly distinguish:

- `Edit this project`
- `Edit template for future projects`

Package/template edits must never silently change historical project values.

---

## 11. Interaction states

Every asynchronous or data-dependent screen must define:

| State | Expected behavior |
|---|---|
| Loading | stable skeleton/spinner appropriate to context |
| Empty | explain why it is empty and offer the most useful next action |
| Error | clear human-readable issue with retry/recovery |
| Offline | explain what remains available |
| Success | visible completion without excessive toast spam |
| Permission denied | safe explanation without leaking hidden data |
| Provider disconnected | explain impact and reconnect action |

---

## 12. Confirmation model

Require explicit confirmation for consequential actions such as:
- force-close project
- delete project
- delete recorded payment
- delete expense
- revoke public link
- overwrite/reapply template-generated data
- disconnect Google integration when project data references it

Force-close specifically requires:
- warning
- explicit confirmation
- recorded reason

---

## 13. Responsive strategy

### Mobile

Primary interaction target.

Design for:
- Android-sized screens first
- one-handed usage where practical
- bottom navigation
- clear touch targets
- compact scanning distance
- sheets/drawers for contextual actions
- no horizontal table dependency

### Desktop

Use width intentionally:
- split views
- persistent secondary navigation
- denser tables where genuinely useful
- side-by-side project context
- multi-column dashboards where hierarchy is preserved

Do not simply enlarge mobile cards.

---

## 14. PWA behavior

Before implementation, explicitly decide:
- install prompt strategy
- app shell caching
- last-viewed project caching
- offline read scope
- whether offline writes are supported
- mutation queue/conflict strategy
- “new version available” behavior
- push notification scope, if any

Do not imply full offline support unless it exists.

---

## 15. Visual tokens

Do not lock a full numeric palette until visual exploration is approved.

Use semantic tokens rather than raw color usage:

```text
surface
surface-muted
surface-elevated

text-primary
text-secondary
text-muted

border
border-strong

action-primary
action-primary-hover
action-primary-muted

status-success
status-warning
status-danger
status-info

focus-ring
```

Current brand direction:
- primary family: purple
- danger/overdue: red
- background: very light neutral/lavender-grey
- surfaces: white/near-white

Exact values remain TBD.

---

## 16. Typography

Define before implementation:
- font family
- title scale
- section label scale
- body scale
- label/caption scale
- numeric style for finance
- line heights
- weights

Current direction:
- modern sans-serif
- compact UI labels
- high readability
- avoid overly geometric/futuristic display fonts

---

## 17. Component candidates

Canonical components may eventually include:
- AppHeader
- PageHeader
- BottomNav
- SectionHeader
- ProjectCard
- AttentionCard
- SessionCard
- StatusChip
- DeadlineBadge
- MoneyValue
- EmptyState
- ErrorState
- ActionMenu
- ConfirmDialog
- FormFieldRenderer
- BriefSection
- DeliverableCard
- RevisionCard
- PaymentRow
- ExpenseRow
- TimelineItem

Do not create a component solely because a mockup contains a rectangle.

Extract canonical components only after repeated behavior or semantics are established.

---

## 18. Accessibility

Minimum expectations:
- semantic HTML first
- visible focus states
- keyboard operability on desktop web
- accessible labels
- status never conveyed by color alone
- appropriate contrast
- sufficient touch targets
- reduced-motion consideration
- logical focus behavior in dialogs/sheets
- form error messages associated with fields

Accessibility targets should become testable before implementation.

---

## 19. Screen inventory

| Screen | Surface | Priority | Current design status |
|---|---|---|---|
| Dashboard | Owner | MVP Core | Early mockup exists; hierarchy needs redesign/refinement |
| Projects | Owner | MVP Core | TBD |
| Project Detail | Owner | MVP Core | Design next; highest priority |
| Calendar | Owner | MVP Core | TBD |
| Clients | Owner | MVP Core | TBD |
| Finance | Owner | MVP Core | TBD |
| Package Management | Owner | MVP Core | TBD |
| Template Management | Owner | MVP High-value | TBD |
| Brief Builder | Owner | MVP High-value | TBD |
| Client Project Status | Public | MVP High-value | TBD |
| Client Brief Form | Public | MVP High-value | TBD |
| Settings / Integrations | Owner | MVP High-value | TBD |

---

## 20. Design acceptance checklist

For every feature/screen:

- [ ] primary task is obvious within a few seconds
- [ ] next action is visually clear
- [ ] loading state exists
- [ ] empty state exists
- [ ] error/retry state exists
- [ ] mobile layout is intentional
- [ ] desktop behavior is defined where relevant
- [ ] public/private visibility is explicit
- [ ] status wording is concrete
- [ ] destructive actions are protected
- [ ] no new component duplicates an existing canonical pattern
- [ ] purple/red usage remains semantic
- [ ] information hierarchy is stronger than decoration
- [ ] current Lumina visual character remains recognizable

---

## 21. What is intentionally not locked yet

The following remain open until later design work:
- exact color hex values
- exact font family
- final spacing scale
- final radius scale
- exact shadow tokens
- final dashboard card arrangement
- exact active bottom-nav treatment
- exact icon library
- animation language
- final desktop shell

The current mockup is a **visual baseline, not pixel-level specification**.
