# Lumina

**Personal project operating system for photographers and videographers.**

Lumina helps a solo photographer or videographer manage client work from the moment a project is confirmed and the initial payment is received, through preparation, production, editing, revisions, delivery, payment completion, and project closure.

It is designed as a lightweight operational workspace — not a photo editor, video editor, accounting suite, or generic project-management platform.

---

## Status

> **Current stage: Repository Foundation**

Lumina is currently in active development.

The product model, workflow rules, technical architecture, database design, security boundaries, and integration strategy have been defined.

The repository foundation is also in place, including:

- React + TypeScript application shell
- Vite build system
- Tailwind CSS design foundation
- client-side routing
- PWA foundation
- Supabase local project structure
- PostgreSQL migrations
- Row Level Security design
- pgTAP database test suite
- Supabase Edge Function foundation
- GitHub Actions CI
- Cloudflare Workers Static Assets configuration

Product feature implementation has **not** started yet.

The current UI contains only foundational layout and placeholder routes.

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

```text
Product Discovery
        ✓

Domain & Workflow Model
        ✓

Technical Architecture
        ✓

Database & Security Design
        ✓

Repository Foundation
        ◐

Feature Specifications
        ↓

Feature Implementation
        ↓

Production Validation
```

Repository Foundation currently includes the application scaffold, database migrations, test infrastructure, and CI.

Local database and RLS runtime verification remains part of foundation hardening before feature implementation proceeds.

---

## Next Milestone

The next milestone is to select the first Lumina product feature and create its specification:

```text
requirements.md
→ design.md
→ tasks.md
→ implementation
→ verification.md
```

Feature implementation begins only after the feature's scope and behavior are explicitly defined.

---

## License

No public license has been selected yet.

All rights reserved unless a license is added later.