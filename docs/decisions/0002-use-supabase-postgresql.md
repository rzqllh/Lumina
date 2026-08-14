# ADR-0002: Use Supabase and PostgreSQL as Backend Platform

- **Status:** Accepted
- **Date:** 2026-08-14
- **Decision owners:** Lumina Core Architecture

## Context and problem statement

Lumina requires a relational data store with robust transactional guarantees, relational foreign keys, row-level security for multi-tenancy, user authentication, file storage, and serverless execution for OAuth and public projections. We must choose a backend infrastructure that fits a free-tier-first model while offering a clean migration path for future growth.

## Decision drivers

- **Relational Integrity:** Essential for foreign keys across clients, projects, sessions, deliverables, revisions, and payments.
- **Security by Default:** Database-level Row Level Security (RLS) to prevent cross-tenant data leakage.
- **Operational Simplicity:** All-in-one managed platform (Database + Auth + Storage + Edge Functions).
- **Free-Tier Viability:** Predictable zero cost during personal single-operator stage.

## Considered options

1. **Option A (Supabase with Managed PostgreSQL 16) — Selected**
2. **Option B (Custom Node.js/Express Backend + Self-hosted PostgreSQL on VPS)**
3. **Option C (Firebase Firestore / NoSQL Document Store)**

## Decision outcome

Chosen: **Option A (Supabase)**, because it delivers an enterprise-grade PostgreSQL relational database with integrated Auth, Storage, Edge Functions, and native Row Level Security. Authenticated client applications query the database directly via PostgREST with RLS, eliminating the need to write and maintain boilerplate CRUD API endpoints.

### Positive consequences
- Zero boilerplate REST controllers for standard CRUD operations.
- Native PostgreSQL triggers, check constraints, and composite indexes.
- Integrated JWT authentication and S3-compatible storage.
- Free-tier covers database, auth, and edge functions comfortably for solo use.

### Negative consequences / trade-offs
- Vendor coupling to Supabase extensions and PostgREST querying syntax.
- PostgreSQL migrations must be strictly managed via Supabase CLI.

## Rejected alternatives

### Option C: Firebase Firestore (NoSQL)
- *Why rejected:* NoSQL document modeling makes financial aggregations, relational integrity, cascade deletes, and snapshot invariants error-prone and expensive to query.

## Confirmation

Verified by running local database migrations with Supabase CLI, enforcing RLS policies on all tables, and executing automated SQL constraint tests.

## Follow-up / revisit trigger

Revisit if database storage or connection limits exceed Supabase free-tier thresholds, at which point upgrade to Supabase Pro or migrate to self-hosted PostgreSQL via standard `pg_dump`.
