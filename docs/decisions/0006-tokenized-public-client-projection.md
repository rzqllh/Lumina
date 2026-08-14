# ADR-0006: Tokenized Public Client Access via Server Projection

- **Status:** Accepted
- **Date:** 2026-08-14
- **Decision owners:** Lumina Core Architecture

## Context and problem statement

Lumina must provide public web interfaces for clients to view project progress, inspect approved deliverables, and fill intake briefs without requiring clients to register an account or log in. We must provide this frictionless experience while strictly preventing unauthorized access, ID enumeration attacks, and leakage of confidential financial information (`INV-004`).

## Decision drivers

- **Zero-Friction Client UX:** Clients open links directly from WhatsApp or email without password setup.
- **Zero Financial Data Leakage:** Internal project values, expenses, profit margins, and collaborator fees must never be exposed.
- **Revocability & Security:** Public links must be revocable by the owner at any time.
- **Unified Public Model (`OD-004`):** Single extensible schema supporting multiple public client experiences (`status_page`, `brief_intake`) with audit history.

## Considered options

1. **Option A (Polymorphic Public Share Link + Edge Function Projection) — Selected**
2. **Option B (Direct Public Read Access via Supabase RLS Policies on Project Tables)**
3. **Option C (Separate Dedicated Tables e.g. `project_share_links` and `brief_share_links`)**

## Decision outcome

Chosen: **Option A (Polymorphic Public Share Link)**.
- **Polymorphic Storage:** A single `public_share_links` table stores token hashes scoped by `(project_id, purpose)` where `purpose IN ('status_page', 'brief_intake')`.
- **Token Security:** Public URLs contain high-entropy 256-bit random tokens; only `SHA-256(token)` is persisted in `public_share_links.token_hash`.
- **Historical Retention:** Regenerating a token marks the old token `is_active = FALSE, revoked_at = NOW()`, preserving rows for audit. A partial unique index (`WHERE is_active = TRUE`) guarantees at most one active token per (project, purpose).
- **Server Projection:** Anonymous clients resolve tokens via Supabase Edge Functions (`/public-project`, `/public-brief`). The Edge Function checks the token hash, enforces purpose isolation, and returns an explicit allow-list JSON projection.
- **Zero Direct Public Table Access:** Direct PostgreSQL table access from anonymous clients is strictly disabled (`DENIED ALL`).

### Positive consequences
- Single unified table for all public client link features with zero schema bloat.
- Cryptographically impossible to guess or enumerate project IDs.
- Zero risk of database-level projection leakage (financial columns are never in the query).
- Instant revocation and clean audit log of rotated tokens.

### Negative consequences / trade-offs
- Requires Edge Function routing for public views rather than direct client-side PostgREST queries.

## Confirmation

Verified by design audit of `DATABASE_SCHEMA.md` and `SECURITY.md` confirming `public_share_links` table definition, unique active index, and purpose-specific allow-list projections.

## Follow-up / revisit trigger

Revisit if client interactions require authenticated client accounts (e.g. multi-project client portals) in a post-MVP roadmap.
