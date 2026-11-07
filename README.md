# Lumina

**Personal project operating system for photographers and videographers.**

Lumina helps a solo photographer or videographer manage client work from the moment a project is confirmed and the initial payment is received, through preparation, production, editing, revisions, delivery, payment completion, and project closure.

It is designed as a lightweight operational workspace — not a photo editor, video editor, accounting suite, or generic project-management platform.

---

## Status

> **Stage: Feature implementation and security hardening; enterprise production acceptance NOT complete** (7 November 2026).

The application contains implemented React routes and feature modules for dashboard, client/contact management, service/package catalog, project workflows, sessions, briefs, deliverables/revisions, finance, files, calendar and public link screens. Source presence and DOM test coverage do **not** establish live readiness.

| Evidence layer | Current interpretation |
| --- | --- |
| Source code | Modules, routes, schema migrations and unit/DOM tests exist. |
| GitHub CI | TypeScript, lint, DOM tests and build run on PRs. Exact SHA required to report a PASS. |
| Database | Migration `00024` (review authorization) and `00025` (public intake validation) are proposed in [draft PR #1](https://github.com/rzqllh/Lumina/pull/1). Local pgTAP workflow is proposed but must pass on the exact PR SHA. |
| Hosted Supabase | Historical project state was inactive. No authorized staging migration, multi-account RLS acceptance, restore drill or hosted JWT verification has been demonstrated. |
| Production | No release, security audit, enterprise assurance or production acceptance is implied by source, documentation or green frontend CI. |

See [Enterprise Readiness Gates](docs/engineering/ENTERPRISE_READINESS.md) for evidence, blockers and owner-controlled rollout. See [Bugs & Refinement draft PR #2](https://github.com/rzqllh/Lumina/pull/2) for the register, which is not yet on `master`.

---


## What Lumina Is

Lumina is built around one central object:

> **The Project**

A project can contain:

- multiple services
- multiple sessions or shoots
- editable workflow stages
- project tasks
- client contacts
- structured briefs
- deliverables
- revisions
- payments
- expenses
- collaborators
- file references
- production deadlines

The goal is to answer one operational question quickly:

> **What do I need to do today?**

---

## Project Lifecycle

A typical Lumina project follows this business journey:

```text
DP Received
→ Project Created
→ Preparation
→ Production / Shoot
→ Post-production
→ Delivery
→ Revision if needed
→ Client Approval
+ Full Payment
→ Closed
```

The actual project workflow remains customizable.

For example, a photography project may use:

```text
Preparation
→ Shoot
→ Selection
→ Editing
→ Delivery
```

while a video project may use:

```text
Pre-production
→ Production
→ Rough Cut
→ Client Review
→ Revision
→ Final Delivery
```

Workflow templates are starting points, not locked pipelines.

---

## Core Product Areas

### Projects

The project detail screen acts as the operational command center for each job.

A project may contain:

- client
- services
- pricing
- workflow
- sessions
- tasks
- brief
- deliverables
- revisions
- payments
- expenses
- collaborators
- file references

---

### Clients & Contacts

Lumina supports different client models:

```text
Individual
Couple
Organization
Custom identity
```

A client may have multiple contacts such as:

```text
Primary Contact
Finance PIC
Event Coordinator
```

Contacts can then be associated with individual projects using project-specific roles.

---

### Services & Packages

Services represent reusable types of work:

```text
Photography
Videography
Same Day Edit
Reels
Custom Service
```

Packages can combine multiple service items and pricing.

Example:

```text
Corporate Gathering

Photography         Rp3.000.000
Videography         Rp2.500.000
Extra Hour            Rp500.000
Travel                Rp300.000
Discount             -Rp300.000
──────────────────────────────
Project Value       Rp6.000.000
```

Package changes never rewrite historical project pricing.

When a package is used, Lumina stores a project-owned snapshot.

---

### Sessions

A single project may contain several scheduled sessions.

Examples:

```text
Shoot
Meeting
Pre-production
Event Day
Custom Session
```

This allows one project to represent multi-day or multi-session work without splitting it into unrelated projects.

---

### Deliverables

Deliverables represent what was promised to the client.

Examples:

```text
50 Edited Photos
1 Highlight Video
3 Reels
Full Event Documentation
```

Each deliverable can independently track:

- deadline
- progress
- delivery
- client review
- revisions
- approval
- associated files

---

### Revisions

Revisions belong to a specific deliverable.

Example:

```text
Highlight Video
└─ Revision #2
   ├─ Requested: Apr 16
   ├─ Due: Apr 17
   ├─ Status: In Progress
   └─ Feedback:
      "Replace footage at 00:31"
      "Increase ending logo size"
```

Each revision cycle remains part of the project history.

---

### Project Finance

Lumina tracks project economics without becoming full accounting software.

It supports:

```text
Project Value
DP
Installments
Final Payment
Receivable
Expenses
Collaborator Fees
Projected Profit
Margin
```

Example:

```text
Project Value            Rp4.500.000
Paid                     Rp2.000.000
Receivable               Rp2.500.000

Generic Expenses
Transport                   Rp250.000
Lens Rental                  Rp400.000

Collaborator Cost
Second Shooter               Rp500.000
─────────────────────────────────────
Total Project Cost         Rp1.150.000

Projected Profit          Rp3.350.000
Margin                          74%
```

Collaborator fees and generic expenses are intentionally stored separately.

---

## Brief Builder

Lumina is designed to support structured project briefs rather than relying only on free-form notes.

A project has one canonical Brief containing sections and fields.

Example:

```text
EVENT INFORMATION
├─ Event Name
├─ Date
├─ Venue
└─ PIC

OBJECTIVE
└─ Rich Text

MUST CAPTURE
└─ Checklist

STYLE / REFERENCES
├─ Links
└─ Reference Files

TIMELINE
└─ Structured Schedule

SPECIAL NOTES
└─ Rich Text
```

Brief templates remain customizable after being applied.

Client submissions are stored separately and reviewed before changing canonical project information.

---

## Client-Facing Links

Lumina is designed to support public client experiences without requiring a client account.

Initial purposes:

```text
Project Status Page
Client Brief Form
```

Public access uses opaque, revocable links.

A client-facing page may expose:

```text
Project Name
Current Stage
Progress
Relevant Session Information
Expected Delivery
Deliverable Status
Client-visible Files
```

Internal information is never intended for public projection, including:

```text
Profit
Expenses
Collaborator Fees
Internal Notes
Private Tasks
Private Brief Fields
Other Clients
```

---

## Files & Media

Lumina is **not** intended to become a RAW photo or video storage platform.

Small application assets may live inside Lumina storage:

```text
Avatar
Project Cover
Receipt
Brief Attachment
Small Reference File
```

Large production media remains external.

Primary integration direction:

```text
Google Drive
```

Lumina stores references and project associations instead of duplicating large media archives.

---

## Production Calendar

Lumina maintains a project-focused production calendar.

Relevant events include:

```text
Shoots
Sessions
Meetings
Delivery Deadlines
Revision Deadlines
Payment Due Dates
```

Google Calendar integration is designed around:

```text
Lumina
→ Dedicated "Lumina Projects" Google Calendar
```

with optional free/busy conflict checking.

Lumina is not intended to replace the user's personal calendar.

---

## Platform Strategy

Lumina is designed as a:

> **Mobile-first web application / PWA**

Android is the primary initial usage environment.

The same application also supports desktop web usage.

Future native Android packaging may use Capacitor if deeper native capabilities become necessary.

---

## Architecture

```text
                    ┌──────────────────────┐
                    │   React Web / PWA    │
                    │  Mobile + Desktop    │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
             ▼                                   ▼
   ┌───────────────────┐               ┌─────────────────────┐
   │     Supabase      │               │ Supabase Edge       │
   │                   │               │ Functions           │
   │ PostgreSQL        │               │                     │
   │ Auth              │               │ Public projections  │
   │ RLS               │               │ OAuth               │
   │ Storage           │               │ Google APIs         │
   └───────────────────┘               └──────────┬──────────┘
                                                 │
                              ┌──────────────────┴──────────────┐
                              ▼                                 ▼
                    ┌─────────────────┐               ┌─────────────────┐
                    │  Google Drive   │               │ Google Calendar │
                    └─────────────────┘               └─────────────────┘

Frontend hosting:
Cloudflare Workers Static Assets
```

Cloudflare is used only for static application hosting.

Supabase Edge Functions are the application server/runtime boundary for privileged operations.

---

## Technology Stack

### Frontend

- TypeScript
- React
- Vite
- Tailwind CSS
- shadcn/ui / Radix primitives
- TanStack Query
- React Hook Form
- Zod
- React Router

### Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security
- Supabase Storage
- Supabase Edge Functions

### Platform

- Progressive Web App
- Workbox-based service worker
- Cloudflare Workers Static Assets

### Testing & Quality

- TypeScript strict mode
- ESLint
- Prettier
- Vitest
- Testing Library
- pgTAP
- GitHub Actions

---

## Repository Structure

```text
Lumina/
├── src/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   └── test/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── tests/
│
├── docs/
│   ├── product/
│   ├── design/
│   ├── engineering/
│   ├── decisions/
│   ├── plans/
│   └── specs/
│
├── public/
├── .github/
└── package.json
```

---

## Documentation

Lumina uses documentation as durable product and engineering context.

### Product

```text
docs/product/PRD.md
docs/product/FEATURE_INVENTORY.md
docs/product/DOMAIN_MODEL.md
docs/product/WORKFLOWS.md
```

### Design

```text
docs/design/DESIGN.md
```

### Engineering

```text
docs/engineering/ARCHITECTURE.md
docs/engineering/DATABASE_SCHEMA.md
docs/engineering/SECURITY.md
docs/engineering/INTEGRATIONS.md
docs/engineering/TESTING.md
```

### Architecture Decisions

```text
docs/decisions/
```

### Feature Specifications

Individual features use:

```text
docs/specs/<feature>/
├── requirements.md
├── design.md
├── tasks.md
└── verification.md
```

---

## Development

### Requirements

- Node.js
- pnpm
- Docker-compatible container runtime for local Supabase

Install dependencies:

```bash
pnpm install
```

Start frontend development:

```bash
pnpm dev
```

Run quality checks:

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
```

---

## Local Supabase

The repository contains:

```text
supabase/config.toml
supabase/migrations/
supabase/tests/
supabase/functions/
```

Once a compatible container runtime is available:

```bash
pnpm supabase start
```

Reset the local database:

```bash
pnpm supabase db reset
```

Run database tests:

```bash
pnpm supabase test db
```

The migration and pgTAP suites are part of the repository foundation, but runtime database verification requires the local Supabase stack to be running.

---

## Development Principles

### Single-user-first

Lumina currently optimizes for one photographer/videographer.

The data model preserves a Workspace boundary so future small-team support remains possible without adding team complexity to the current product.

### Historical data stays historical

Editing:

```text
Package
Workflow Template
Brief Template
```

must never silently mutate existing project records.

### Public means explicitly public

Client-facing data is exposed through an explicit allow-list projection.

Internal project data remains private by default.

### Large media stays external

Lumina coordinates production media.

It does not attempt to replace Google Drive or become a digital asset management platform.

### Flexible, not generic

Lumina supports customizable workflows and templates without becoming an arbitrary project-management or database-building tool.

---

## Product Boundaries

Lumina intentionally does not include:

- photo editing
- video editing
- RAW processing
- AI photo culling
- full RAW/video cloud storage
- full bookkeeping/accounting
- payroll
- enterprise workflow administration
- generic personal calendar replacement
- arbitrary Notion-style databases

---

## Current Development Roadmap

- **Implemented in source:** the React feature modules and SQL migrations described above. Source-level verification is separate from user acceptance.
- **In draft review:** secure brief-review authorization, validated public brief intake, and automatic local DB/pgTAP CI gate.
- **Not yet accepted:** hosted Supabase migration/RLS, backup and restore, verified public-link revocation, physical-device flows, production observability and operational release gates.
- **Proposed or conditional:** direct R2 upload architecture, external media lifecycle and expanded enterprise controls. These are not implemented features or mandatory dependencies.

## Next Milestone

Follow the evidence-ordered release gates in [Enterprise Readiness](docs/engineering/ENTERPRISE_READINESS.md): pass local migration and pgTAP tests; confirm role-scoped staging REST/JWT behavior; complete backup/restore and multi-user E2E acceptance; then request an explicit production authorization. Never deploy a migration or silently change vendor configuration as a side effect of CI.

---

## License

No public license has been selected yet.

All rights reserved unless a license is added later.
