# ADR-0003: Workspace Tenancy Boundary from Day One

- **Status:** Accepted
- **Date:** 2026-08-14
- **Decision owners:** Lumina Core Architecture

## Context and problem statement

Lumina is currently designed for a single owner/operator. However, single-user applications that hardcode user-specific tables or omit tenant identifiers require painful, breaking database migrations if multi-workspace or team capabilities are introduced later. We must establish a multi-tenancy model that supports future growth without adding UI complexity to the MVP.

## Decision drivers

- **Future Architecture Safety:** Avoid irreversible single-tenant schema locks.
- **MVP Simplicity:** Zero team-management UI in the initial product.
- **Security & RLS Isolation:** Simple, uniform RLS policies based on `workspace_id`.

## Considered options

1. **Option A (Multi-Tenant Schema with Single-User MVP UI) — Selected**
2. **Option B (Direct `user_id` Foreign Keys on All Tables)**
3. **Option C (Single-Tenant SQLite / Local-Only Storage)**

## Decision outcome

Chosen: **Option A (Workspace Boundary from Day One)**. Every business table (`clients`, `projects`, `services`, `packages`, `payments`, etc.) includes a `workspace_id` foreign key. The `workspace_members` junction table links users to workspaces with a default `'owner'` role. The MVP UI transparently operates within the owner's default workspace without exposing workspace selector screens.

### Positive consequences
- 100% of RLS policies use a uniform helper: `is_workspace_member(workspace_id)`.
- Adding team members or agency collaboration in the future requires zero database schema redesign.
- Catalog items (services, templates, packages) are naturally scoped to an organization.

### Negative consequences / trade-offs
- Slight data overhead (storing a UUID `workspace_id` on each root table row).
- Requires inserting a default workspace on user sign-up via an auth trigger.

## Rejected alternatives

### Option B: Direct `user_id` FK on all tables
- *Why rejected:* Tying every business entity directly to an individual auth user prevents delegating projects, sharing client rolodexes, or transferring ownership to a partner later.

## Confirmation

Verified by testing that all table queries in `DATABASE_SCHEMA.md` enforce `workspace_id` scoping and RLS policies correctly isolate records.

## Follow-up / revisit trigger

Revisit when multi-user team roles (e.g. Associate Photographer, Editor, Bookkeeper) are prioritized in a post-MVP roadmap.
