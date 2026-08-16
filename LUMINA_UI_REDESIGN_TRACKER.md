# Lumina UI Redesign Tracker & Anti-Hallucination Contract

Status: **ACTIVE**

Purpose: canonical source of truth for the Lumina UI redesign.

This file exists to prevent UI drift, fake product behavior, duplicated design plans, and “looks cool so implement it” decisions.

## 0. Operating Rules

The redesign agent must:

- Read this file before changing UI code.
- Work only on items explicitly listed here.
- Update status after verified completion.
- Never invent a capability, metric, action, route, data field, or business rule to improve appearance.
- Never mark an item complete because a mockup, screenshot, or component exists.
- Preserve current product/domain behavior unless this tracker explicitly authorizes a bounded UI-supporting change.
- If a desired UI requires missing product/data support, record it under **Blocked / Requires Product Decision** and continue with a safe fallback.
- Stop when the currently authorized phase is complete or blocked.

Allowed task states:

```text
[ ] TODO
[x] DONE
[~] PARTIAL
[!] BLOCKED
[-] DEFERRED
```

---

# 1. Product Truth — Anti-Hallucination Rules

Lumina is a personal project operating system for photographers/videographers.

Do NOT add or imply:

- fake revenue trends
- fake weekly/monthly deltas
- fake percentages
- fake sparklines
- fake project completion percentage
- fixed sequential project workflow
- fixed photography workflow names
- Supabase/server health indicators in end-user UI
- New Invoice actions
- payment gateway behavior
- fake reminders
- generic CRM behavior
- team/assignee behavior
- AI-generated recommendations
- global search unless it already exists and is explicitly in scope
- command palette unless it already exists and is explicitly in scope
- fake Google Drive/Calendar connected states
- backend queries created only to decorate UI

## Workflow truth

Project workflow is:

- project-specific
- editable
- snapshot-based
- multiple active stages allowed
- skipped stages allowed
- not a fixed global pipeline
- not canonically percentage-based

Therefore:
- show actual active stage(s) if available
- never invent “80% complete”
- never invent a fixed milestone bar

## Finance truth

Canonical:

- Project Value
- Paid Amount
- Receivable = Project Value - Paid Amount
- Generic Expenses
- Committed Collaborator Cost
- Total Project Cost
- Projected Profit
- Margin

Do not introduce Invoice terminology unless a real invoice feature exists.

## Dashboard priority

1. Needs Attention
2. Today
3. Active Projects
4. Upcoming Sessions
5. Finance / supporting metrics

Operational urgency outranks decorative analytics.

---

# 2. Approved Visual Direction & Canonical Token Contract

**Calm Editorial Ops — Production Ledger**

Desired qualities:
- precise
- restrained
- premium
- editorial
- operational
- mobile-first
- desktop intentionally adapted

Reference qualities:
- Linear: hierarchy, density, and scannable precision
- Apple HIG: clarity, touch targets, and visual restraint
- Framer/editorial tools: subtle typographic character and clean structural rules

Avoid:
- heavy glassmorphism or blurred backdrop abuse
- neon cockpit / glowing AI-purple gradients
- generic admin-template feel
- giant drop shadows
- decorative camera clichés
- identical card styling everywhere
- saturated multi-colored metric noise

---

## 2.1 Color System: OKLCH Primitives & Semantic Tokens

All colors are defined in perceptual OKLCH space to guarantee uniform contrast, harmonic mixing, and WCAG 2.2 AA compliance (≥ 4.5:1 for normal text, ≥ 3:1 for large text and graphical UI components).

### A. Neutral & Canvas Ramp (Lavender-tinted cool neutral, Hue 280)
| Token | OKLCH Value | Approx Hex | Semantic Purpose |
|---|---|---|---|
| `--color-canvas-bg` | `oklch(0.965 0.006 280)` | `#f4f4f6` | Application canvas / page background |
| `--color-surface` | `oklch(0.995 0.002 280)` | `#fcfcfd` | Standard card surface, ledger rows, panels |
| `--color-surface-muted` | `oklch(0.945 0.008 280)` | `#efeff2` | Inset backgrounds, table headers, disabled states |
| `--color-surface-elevated` | `oklch(1.000 0.000 0)` | `#ffffff` | Floating headers, popovers, dropdowns, sheets |
| `--color-text-primary` | `oklch(0.200 0.015 280)` | `#1c1b22` | Headings, primary titles, ledger numbers (14.5:1 on surface) |
| `--color-text-secondary` | `oklch(0.420 0.015 280)` | `#54525d` | Labels, table headers, descriptions (5.8:1 on surface) |
| `--color-text-muted` | `oklch(0.520 0.012 280)` | `#6e6c77` | Helper text, timestamps, captions, breadcrumbs (4.6:1 on surface) |
| `--color-border-subtle` | `oklch(0.915 0.008 280)` | `#e6e6eb` | Dividers, row borders, quiet container separation |
| `--color-border-default` | `oklch(0.865 0.010 280)` | `#d8d8de` | Standard card borders, structural outlines |
| `--color-border-interactive` | `oklch(0.720 0.015 280)` | `#adabb5` | Input borders, hover boundaries, active segment outlines |

### B. Brand Primary (Lumina Violet, Hue 272)
| Token | OKLCH Value | Approx Hex | Semantic Purpose |
|---|---|---|---|
| `--color-primary` | `oklch(0.520 0.200 272)` | `#5b4feb` | Primary CTA, active nav pill, key operational focus |
| `--color-primary-hover` | `oklch(0.460 0.200 272)` | `#4b3ed9` | Primary button hover / active press state |
| `--color-primary-foreground` | `oklch(0.995 0.002 280)` | `#ffffff` | Text / icon on primary solid background |
| `--color-primary-subtle` | `oklch(0.960 0.030 272)` | `#f2f0fe` | Subtle selected row tint, soft active background |
| `--color-primary-border` | `oklch(0.880 0.060 272)` | `#dcd7fc` | Primary subtle border / focus container ring |
| `--color-primary-text` | `oklch(0.480 0.200 272)` | `#5043e0` | Text/link using primary color on light surface (5.0:1) |
| `--color-ring` | `oklch(0.520 0.200 272)` | `#5b4feb` | Accessible focus ring outline (2px offset 2px) |

### C. Status Semantics (Strictly Functional, Never Decorative)
| State | Solid Token | Text / Icon Token (WCAG AA) | Subtle Bg Token | Subtle Border Token | Intended Semantic Usage |
|---|---|---|---|---|---|
| **Danger / Overdue** | `oklch(0.52 0.20 25)` | `oklch(0.48 0.21 25)` | `oklch(0.96 0.03 25)` | `oklch(0.88 0.06 25)` | Overdue payment, blocked stage, destructive confirmation |
| **Warning / Attention** | `oklch(0.62 0.16 75)` | `oklch(0.46 0.15 75)` | `oklch(0.96 0.04 75)` | `oklch(0.87 0.07 75)` | Needs Attention, due today, pending approval, review queue |
| **Success / Approved** | `oklch(0.54 0.16 148)` | `oklch(0.42 0.14 148)` | `oklch(0.96 0.03 148)` | `oklch(0.88 0.05 148)` | Paid in full, client approved, session completed |
| **Info / Scheduled** | `oklch(0.55 0.14 240)` | `oklch(0.44 0.13 240)` | `oklch(0.96 0.025 240)` | `oklch(0.88 0.04 240)` | Scheduled shoot, neutral workflow stage, upcoming milestone |

---

## 2.2 Typography Scale & Text Contract

Typography uses a system font stack for instant performance and native OS clarity, paired with explicit tabular numerals for financial and operational data scanning.

### Font Stacks
- **UI Sans:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Tabular Numerals (Ledger Data):** `font-variant-numeric: tabular-nums lining-nums;` (strictly applied to all monetary figures, dates, counts, and timelines)
- **Monospace (IDs/Metadata):** `ui-monospace, "SF Mono", "Menlo", monospace`

### Typographic Hierarchy Scale
| Level | Font Size | Line Height | Weight | Tracking | Intended Usage |
|---|---|---|---|---|---|
| `text-2xl` | 22px / 24px (desktop) | 1.20 | 600 (Semibold) | `-0.025em` | Canonical Page Title (Projects, Schedule, Settings) |
| `text-xl` | 20px | 1.25 | 600 (Semibold) | `-0.020em` | Section Header, Large Monetary Display |
| `text-lg` | 17px | 1.30 | 500 / 600 | `-0.015em` | Module Title, Financial Snapshot Metric Value |
| `text-base` | 15px | 1.40 | 500 (Medium) | `-0.010em` | Primary List Row Title, Primary Button Label, Form Field Text |
| `text-sm` | 13px | 1.45 | 400 / 500 | `-0.005em` | Body Copy, Client Name, Secondary Metadata, Table Cell |
| `text-xs` | 11px | 1.35 | 500 / 600 | `+0.020em` (caps) / `0` | Status Badge, Tag, Eyebrow Label, Timestamp, Table Header |

---

## 2.3 Spacing, Density & Layout Contract

Base grid: 4px / 8px linear rhythm.

### Spacing Scale
| Token | Value | Rem | Usage |
|---|---|---|---|
| `--space-0.5` | 2px | `0.125rem` | Hairline alignment, micro-gap between stacked text |
| `--space-1` (`--space-xs`) | 4px | `0.25rem` | Badge internal vertical padding, icon-label tight gap |
| `--space-2` (`--space-sm`) | 8px | `0.5rem` | Intra-element gap, button internal padding, compact card gap |
| `--space-3` (`--space-md`) | 12px | `0.75rem` | List row padding, card internal padding (compact), input padding |
| `--space-4` (`--space-lg`) | 16px | `1.0rem` | Standard card padding, section gap on mobile, page gutter mobile |
| `--space-6` (`--space-xl`) | 24px | `1.5rem` | Module separation, section gap desktop, page gutter tablet/desktop |
| `--space-8` (`--space-2xl`) | 32px | `2.0rem` | Major dashboard group separation, header margin |
| `--space-12` (`--space-3xl`) | 48px | `3.0rem` | Top-level layout breathing room |

### Responsive Containers & Gutters
- **Mobile (360px – 639px):** Page gutter `px-4` (16px), 1-column layout, bottom navigation clearance `pb-24`
- **Tablet (640px – 1023px):** Page gutter `px-6` (24px), 2-column metrics and project grids
- **Desktop (1024px+):** Page gutter `px-8` (32px), container `max-w-6xl` (1152px) or `max-w-7xl` (1280px) centered, multi-column operational ledger layout
- **Control Heights:**
  - Standard Button & Form Input: 38px desktop (`h-[38px]`), 44px mobile (`h-11`) for Apple HIG touch targets
  - Compact Button & Filter Pill: 32px (`h-8`), min 44px touch target on mobile via padding
  - Status Badge / Chip: 22px (`h-[22px]`, `px-2`)

---

## 2.4 Radii, Elevation & Shadows Contract

Shape consistency rule: No random mixed corner radii.

### Radius Scale
| Token | Value | Applied To |
|---|---|---|
| `--radius-xs` | 4px (`rounded`) | Micro status tags, color dots |
| `--radius-sm` | 6px (`rounded-md`) | Status badges, chips, count tags |
| `--radius-md` | 8px (`rounded-lg`) | Buttons, form inputs, segmented control pills |
| `--radius-lg` | 10px (`rounded-[10px]`) | Operational ledger rows, nested sub-cards |
| `--radius-xl` | 12px (`rounded-xl`) | Primary module containers, cards, dialogs |
| `--radius-2xl` | 16px (`rounded-2xl`) | Floating bottom nav container, popover sheets |
| `--radius-full` | 9999px (`rounded-full`) | Avatars, active pill indicators, circular icon buttons |

### Elevation & Tinted Shadows
Shadows are subtly tinted with the canvas hue (`oklch(0.20 0.015 280)`), avoiding raw black drops:
| Token | CSS Shadow Definition | Applied To |
|---|---|---|
| `--shadow-none` | `none` | Flat list rows, embedded elements |
| `--shadow-subtle` | `0 1px 2px 0 oklch(0.20 0.015 280 / 0.04), 0 0 0 1px oklch(0.865 0.010 280 / 0.6)` | Standard cards, ledger modules |
| `--shadow-elevated` | `0 4px 12px -2px oklch(0.20 0.015 280 / 0.08), 0 0 0 1px oklch(0.865 0.010 280 / 0.8)` | Floating header, dropdowns, floating bottom nav |
| `--shadow-sheet` | `0 12px 32px -4px oklch(0.20 0.015 280 / 0.12), 0 0 0 1px oklch(0.865 0.010 280 / 0.5)` | Modals, action sheets |

---

## 2.5 Iconography Sizing & Stroke Contract

- **Icon Family:** `lucide-react`
- **Stroke Rules:** `strokeWidth: 1.75` for small/medium icons (≤16px); `strokeWidth: 1.5` for large icons (≥18px).
- **Sizes:**
  - Micro (Inline text-xs): 12px (`size-3`)
  - Compact (Badge / Button icon): 14px (`size-3.5`) / 16px (`size-4`)
  - Standard (Navigation / Action / Metric icon): 18px (`size-[18px]`)
  - Display / Empty State: 24px–28px (`size-6` / `size-7`)
- **Rule:** Icon-only controls must always have `aria-label` or accessible screen-reader text. No decorative camera clichés.

---

## 2.6 Motion & Micro-Interactions Contract

- **Durations:**
  - `--duration-instant`: 80ms (tap feedback, active states)
  - `--duration-fast`: 140ms (hover, focus ring, tooltip, status transition)
  - `--duration-normal`: 220ms (dropdown, collapse/expand, tabs)
  - `--duration-deliberate`: 320ms (modal, sheet slide-in)
- **Easing:**
  - `--ease-standard`: `cubic-bezier(0.2, 0, 0, 1)` (Apple/Linear deceleration)
  - `--ease-out`: `cubic-bezier(0, 0, 0.2, 1)`
- **Tactile Feedback:** Buttons use `active:scale-[0.985]` or `active:translate-y-[0.5px]`.
- **Accessibility:** Under `@media (prefers-reduced-motion: reduce)`, all transitions collapse to `0.01ms` and transforms are disabled.

---

## 2.7 Visual System Hard Rules & Token Governance

1. **Canonical Baseline Status:** The token values defined above are a validated, canonical baseline. Agents must NOT alter them on a per-component whim. If browser/WCAG verification shows a genuine contrast or layout issue, fixes must be made at the token source (`src/index.css`), not via ad-hoc component magic values.
2. **Zero Raw Colors:** No arbitrary hex (`#...`), RGB, or OKLCH values in JSX/TSX components. All styling must consume semantic CSS variables or Tailwind `@theme` classes (`bg-surface`, `text-primary`, `border-subtle`, `bg-status-danger-subtle`, etc.).
3. **Zero Arbitrary Scales:** No arbitrary spacing, radii, typography, or shadow bracket values (`p-[13px]`, `rounded-[7px]`, `text-[17.5px]`, `shadow-[0_5px_...]`). Use the defined token scale.
4. **No Per-Screen Drift:** Screens and features cannot invent one-off card styles or button variants.
5. **Documented Exceptions Only:** Rare optical exceptions (e.g. 1px hairline icon alignment) must be functional, minimal, and accompanied by a code comment explaining why the token scale was insufficient.
6. **Dark Mode Decision:**
   - The semantic token architecture is dark-ready / theme-agnostic.
   - Phase 1 scope is strictly **light-only**.
   - Do NOT implement dark mode classes (`dark:`), dark theme toggle, speculative dark values, or dark mode QA.

---

# 3. Global Design System

## G-001 — Canonical Page Header
Status: [x] DONE

Create one reusable page-header pattern for:
- title
- optional description
- optional contextual actions
- optional metadata
- mobile/desktop behavior

Avoid landing-page hero headers.

Verification:
- Projects, Schedule, Clients, Settings use one coherent hierarchy.

---

## G-002 — Surface / Section Hierarchy
Status: [x] DONE

Define three visual levels:

### Level 1 — Operational focal
Needs Attention / critical Today state.

### Level 2 — Primary modules
Active Projects / Upcoming Sessions / main page content.

### Level 3 — Supporting information
Metrics / filters / helper / empty states.

Not every content block should become an independent bordered card.

---

## G-003 — Metric Tile
Status: [x] DONE

Support:
- label
- value
- restrained icon/accent
- optional existing semantic context only

Requirements:
- readable large currency
- compact mobile 2-column layout
- tabular numeric treatment where appropriate

Forbidden:
- fabricated trend/delta/sparkline.

---

## G-004 — Operational List Row / Card
Status: [x] DONE

Reusable structural pattern for:
- attention item
- active project
- upcoming session
- directory rows where appropriate

Goal: faster scanning, less empty card space.

---

## G-005 — Status Badge
Status: [x] DONE

Unify existing semantic states.

Requirements:
- text + semantic styling
- not color-only
- compact
- consistent across screens

---

## G-006 — Filter / Segmented Control
Status: [x] DONE

Unify:
- Project filters
- Client filters
- Month / Agenda
- Schedule type filters

No new filtering semantics.

---

## G-007 — Empty State
Status: [x] DONE

Create:
- compact section empty state
- page-level empty state

Avoid oversized empty containers.

---

## G-008 — Action Hierarchy
Status: [x] DONE

Define:
- primary
- secondary
- tertiary/text
- icon action

Rules:
- one dominant action per local context
- mobile full-width only where useful
- no invented actions

---

## G-009 — Base Semantic Color System Implementation
Status: [x] DONE

Wire the canonical OKLCH primitives and semantic color tokens into `src/index.css` under `@theme` and `:root`.
- Map neutral canvas, surface, text, and border tokens.
- Map Lumina Violet brand primary tokens and focus ring.
- Map functional status tokens (danger, warning, success, info) with both solid and subtle/border variants.
- Remove legacy ad-hoc hex values and replace with the canonical OKLCH contract.

Verification:
- Zero raw hex values outside `index.css` token definitions.
- Contrast verified WCAG 2.2 AA compliant across all semantic pairs.

---

## G-010 — Typography, Numerics & Spacing Scale Implementation
Status: [x] DONE

Wire the canonical typography scale, tabular numeral utility, and spacing/gutter tokens into `src/index.css`.
- Configure system font stacks for UI sans and monospace.
- Wire text scale (`text-2xl` down to `text-xs`) with exact tracking and line-heights.
- Enforce `.tabular-nums` (`font-variant-numeric: tabular-nums lining-nums;`) for all monetary/date/count ledger displays.
- Wire 4px/8px spacing tokens and responsive container constraints.

Verification:
- Currency and numerical tables align tabularly without layout jitter.
- Page title and section hierarchies conform across all viewports.

---

## G-011 — Primitives, Elevation, Motion & Icon Contract Implementation
Status: [x] DONE

Wire the canonical radii scale, border scales, tinted shadow tokens, transition durations/easings, and icon sizing/stroke contract.
- Wire radius tokens (`--radius-xs` through `--radius-2xl` and full).
- Wire tinted shadow tokens (`--shadow-subtle`, `--shadow-elevated`, `--shadow-sheet`).
- Wire motion tokens (`--duration-fast`, `--duration-normal`, `--ease-standard`) with reduced-motion fallback.
- Enforce standard control heights (38px/44px) and Lucide icon stroke/size standards across primitive components.

Verification:
- Cards, rows, and buttons exhibit uniform corner radius and tinted elevation.
- Tap feedback and focus rings behave consistently.

---

# 4. App Shell / Navigation

## NAV-001 — Header
Status: [x] DONE

Desktop:
- workspace identity
- primary navigation
- account/action area
- whitespace allowed

Mobile:
- lightweight
- no duplication of bottom nav
- workspace identity remains visible

Do NOT add:
- fake workspace switcher
- command bar
- Supabase status

---

## NAV-002 — Bottom Navigation
Status: [x] DONE

Routes:
- Overview
- Projects
- Schedule
- Clients
- Settings

Requirements:
- active route obvious
- safe touch targets
- content not covered
- quieter than primary page content

---

## NAV-003 — Desktop Navigation
Status: [x] DONE

Requirements:
- active state clear
- restrained selected treatment
- not mobile nav stretched across desktop
- intentional horizontal-space use

---

# 5. Dashboard

## DASH-001 — Intro
Status: [x] DONE

Keep:
- greeting
- existing date/workspace context
- New Project
- Add Client

Improve:
- hierarchy
- compactness
- editorial character

No fake stats.

---

## DASH-002 — Needs Attention
Status: [x] DONE

Make this the strongest operational focal module.

Use existing urgency only.

Each item should prioritize:
- urgency/status
- project/client
- context
- date/amount where already available
- navigation affordance

Empty state must be compact and calm.

---

## DASH-003 — Today
Status: [x] DONE

Present existing agenda data clearly:
- time
- type
- project
- location
- existing status

Do not rename to Call Sheet unless Lumina actually models one.

---

## DASH-004 — Metrics
Status: [x] DONE

Use existing metrics only.

Improve:
- hierarchy
- numeric typography
- compactness
- semantic accent

No new analytics.

---

## DASH-005 — Active Projects
Status: [x] DONE

Show existing truth only:
- project title
- client
- status
- active stage(s) if already available to this component
- existing relevant metadata
- navigation affordance

Do not add:
- fake completion percentage
- fixed stage progression
- extra decorative query

Prefer compact operational rows if better than current CRUD cards.

---

## DASH-006 — Upcoming Sessions
Status: [x] DONE

Use existing:
- date
- time
- type
- project
- location

Compact empty state.

---

## DASH-007 — Desktop Composition
Status: [x] DONE

Desktop must not remain a narrow mobile column in a huge viewport.

Use intentional responsive composition without turning it into an analytics dashboard.

---

# 6. Projects

## PROJ-001 — Page Header
Status: [x] DONE

Refine title, description, and Create Project action.

---

## PROJ-002 — Search + Filters
Status: [x] DONE

Current semantics remain:
- search
- All
- Active
- Draft
- Archived

Improve grouping, density, and selected state.

---

## PROJ-003 — Project Directory Item
Status: [x] DONE

Use current data only.

Possible:
- title
- client
- project status
- client type where useful
- active stages only if already available without decorative query

No fake progress.

---

## PROJ-004 — Loading / Empty / Error
Status: [x] DONE

Apply canonical global patterns.

---

# 7. Schedule

## CAL-001 — Header / Month Navigation
Status: [x] DONE

Refine:
- title
- month navigation
- Today action
- workspace context only if useful

---

## CAL-002 — Month / Agenda Toggle
Status: [x] DONE

Use global segmented-control pattern.

---

## CAL-003 — Event Filters
Status: [x] DONE

Current:
- All
- Shoots
- Deliverables
- Payments

Improve density and count presentation.

No new event types.

---

## CAL-004 — Calendar Grid
Status: [x] DONE

Improve:
- current day
- selected day
- out-of-month days
- event markers
- touch/readability

No fake events.

---

## CAL-005 — Agenda Mode
Status: [x] DONE

If implemented:
- improve scanning.

If not implemented:
- do not invent it
- mark actual limitation.

---

# 8. Clients

## CLIENT-001 — Page Header
Status: [x] DONE

Refine title, description, New Client action.

---

## CLIENT-002 — Search + Filter
Status: [x] DONE

Use canonical filter-control pattern.

---

## CLIENT-003 — Directory Item
Status: [x] DONE

Use existing data only.

Possible:
- name
- type
- existing contact information/count only if already queried

Do not add:
- last interaction
- active project count
- relationship analytics
unless already part of current query/product behavior.

---

## CLIENT-004 — Loading / Empty / Error
Status: [x] DONE

Apply global patterns.

---

# 9. Settings

## SET-001 — Header
Status: [x] DONE

Refine title/description hierarchy.

---

## SET-002 — Grouping
Status: [x] DONE

Current catalog:
- Services
- Packages
- Workflow Templates
- Crew & Collaborators

Improve:
- row hierarchy
- icon treatment
- grouping
- navigation affordance

---

## SET-003 — Planned Integrations
Status: [x] DONE

Google Calendar & Drive are planned.

Requirements:
- clearly planned/disabled
- not fake-connected
- no fake route/action
- no OAuth work

---

# 10. Detail / Form Surfaces — Phase 2

## DETAIL-001 — Project Detail
Status: [x] DONE

## DETAIL-002 — Client Detail
Status: [x] DONE

## DETAIL-003 — Catalog Pages
Status: [x] DONE

## DETAIL-004 — Create/Edit Forms
Status: [x] DONE

## DETAIL-005 — Dialogs / Modals / Sheets
Status: [x] DONE

---

# 11. Verification Gate
 
 No tracker item is DONE until relevant verification passes.
 
 ## Automated
 - [x] `pnpm format:check`
 - [x] `pnpm typecheck`
 - [x] `pnpm lint`
 - [x] `pnpm test:run`
 - [x] `pnpm build`
 - [x] `git diff --check`
 
 ## Browser
 - [x] Mobile ~390x844
 - [x] Tablet ~768px
 - [x] Desktop ~1440x900
 
 ## Visual
 - [x] no horizontal overflow
 - [x] long names safe
 - [x] large Rupiah values fit
 - [x] selected states obvious
 - [x] empty states compact
 - [x] hierarchy visible within ~2 seconds
 - [x] desktop uses width intentionally
 - [x] mobile remains compact
 
 ## Accessibility
 - [x] focus-visible
 - [x] keyboard navigation
 - [x] touch targets
 - [x] readable contrast
 - [x] status not color-only
 - [x] icon-only controls have accessible names
 
 ## Design-System Integrity & Token Drift
 - [x] zero raw hex/rgb color strings outside token definitions in `src/index.css`
 - [x] zero arbitrary magic spacing, radius, or shadow bracket classes in components (`p-[...]`, `rounded-[...]`)
 - [x] WCAG 2.2 AA contrast verified across all semantic text and status states
 - [x] tabular numerals applied to all monetary (Rupiah) and date displays
 - [x] light-only scope preserved (no speculative dark mode tokens or dark: classes)
 
 ## Product truth
 - [x] no fake metric
 - [x] no fake percentage
 - [x] no invented action
 - [x] no invented route
 - [x] no finance semantic change
 - [x] no workflow semantic change
 - [x] no migration touched
 
 ---
 
 # 12. Blocked / Requires Product Decision
 
 When blocked, append:
 
 ```text
 ID:
 Screen:
 Desired improvement:
 Missing product/data support:
 Decision required:
 Safe UI fallback:
 ```
 
 Current:
 None.
 
 ---
 
 # 13. Deferred Non-UI Work
 
 Do NOT execute during redesign:
 
 - repository dump/dead-code cleanup
 - public/internal/shared surface reconciliation
 - tenant cleanup
 - migration-lineage audit
 - Google Drive implementation
 - Google Calendar implementation
 - direct Storage upload feature
 - payment schedule helper
 - derived Next Action capability
 - fresh migration replay
 
 These return after UI redesign is closed.
 
 ---
 
 # 14. Progress Summary
 
 ## Global
 TODO: 0
 DONE: 11
 
 ## Navigation
 TODO: 0
 DONE: 3
 
 ## Dashboard
 TODO: 0
 DONE: 7
 
 ## Projects
 TODO: 0
 DONE: 4
 
 ## Schedule
 TODO: 0
 DONE: 5
 
 ## Clients
 TODO: 0
 DONE: 4
 
 ## Settings
 TODO: 0
 DONE: 3
 
 ## Detail / Forms
 TODO: 0
 DONE: 5
 
 ## Current Status

**Phase 1 (Overview Surfaces) & Phase 2 (Detail, Catalog, Form, Modal & Sheet Surfaces) — 100% RECONCILED & VERIFIED**

Historical Context & Reconciliation Notes:
- Phase 2 detail/form/catalog surfaces were executed in the initial redesign cycle (commit `41e9a65`) prior to post-redesign reconciliation.
- Comprehensive reconciliation pass completed under anti-slop `AFTER` mode:
  - **49 test files** verified passing across all domain features (corrected from earlier claim of 48).
  - **Zero database changes**: confirmed 0 diffs in `supabase/migrations/`, `supabase/tests/database/`, `supabase/config.toml`.
  - **Query & Mutation Parity**: 100% parity across all forms, modals, RPCs, and query keys.
  - **Domain Terminology**: fully reconciled to canonical domain model (`Project Value`, `Paid Amount`, `Receivable`, `Projected Profit`, `Expenses`, `Scheduled payment milestones`, `Shared Files`).
  - **Token Source Contrast**: `--color-border-interactive` calibrated to `oklch(0.66 0.015 280)` in `src/index.css` to guarantee WCAG 2.2 AA compliance (3.08:1 on surface) without component-level overrides.
  - **Anti-slop Delivery Gate**: verified across all 5 skills (Core, UI, Copywriting, Human, Layoutmobile).
