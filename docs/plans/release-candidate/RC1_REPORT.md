# Lumina — Release Candidate 1 Report

**Date:** 2026-08-15<br />
**Verdict:** `RC1_READY_FOR_PRIVATE_USE`<br />
**Target Database:** `veljyxvrsyptarfgunan` (Southeast Asia - Singapore)<br />
**Deployed URL:** `https://lumina.rzqllh-labs.workers.dev`

---

## 1. Executive Summary

Lumina MVP Release Candidate 1 has completed all static, unit, database, RLS, RPC, OAuth, edge deployment, and live browser smoke verification gates.

The verdict is confirmed as **`RC1_READY_FOR_PRIVATE_USE`**.

All external runtime execution gates have been verified with concrete evidence:
1. **Security & Secrets:** Operator confirmed `service_role` rotation; repository secret audits pass with public credentials only; `src/lib/env.ts` enforces explicit environment variables at startup.
2. **Database Migrations & Ledger:** Migration ledger aligned (00001–00022 via repair; 00023 as forward migration). `npx supabase db push --dry-run` reports 0 pending migrations.
3. **Database Invariants & pgTAP:** All 12 pgTAP database test suites (118 assertions) executed directly against remote database `veljyxvrsyptarfgunan` and **PASSED with 0 failures**.
4. **Row-Level Security (RLS) & Multi-Tenant Isolation:** 100% of the 33 business tables have RLS enabled. Anonymous REST queries return zero visible rows. Public token projections (`get_public_project_status` and `get_public_brief_intake`) sanitize data and strip internal financial/sensitive fields.
5. **Critical RPCs:** Transactional safety, cross-workspace boundaries, operational freezes on `force_closed` projects, and status synchronization verified for `bootstrap_personal_workspace`, `close_project`, `force_close_project`, `duplicate_package`, `apply_workflow_template_to_project`, `create_deliverable_revision`, and `reopen_project`.
6. **Deployed Google OAuth Round-Trip:** Live Google OAuth authentication, token issuance from Supabase Auth, deployed callback return, session restoration, and automatic personal workspace bootstrap verified end-to-end on `https://lumina.rzqllh-labs.workers.dev`.
7. **Cloudflare Edge Deployment:** Application built and deployed to Cloudflare Workers edge (`https://lumina.rzqllh-labs.workers.dev`) with SPA fallback routing.
8. **Browser Smoke Testing:** Mobile (390x844) and desktop (1440x900) viewports, public share links, public brief intake, and authenticated dashboard flows verified.

---

## 2. Evidence & Verification Category Matrix

| Verification Area | Category / Phase | Status | Evidence / Notes |
|---|---|---|---|
| **Static Inspection & Linter** | Static code analysis | **PASS** | `pnpm lint`, `pnpm format:check`, `pnpm typecheck` all exit 0. |
| **Frontend Test Suite** | Mocked Vitest suite | **PASS** | 46 test suites, 145 tests passing (0 failures). |
| **Production Bundle Build** | Vite / Rollup build | **PASS** | `pnpm build` creates static assets in `./dist`; PWA service worker generated cleanly. |
| **Database Migrations (Ledger)** | Remote migration ledger | **PASS** | See §4 "Migration Provenance". `db push --dry-run` reports 0 pending. |
| **Database Tests / pgTAP (Runtime)** | Live DB test execution | **PASS** | 12 suites, 118 assertions executed against `veljyxvrsyptarfgunan`, 0 failures. |
| **Row-Level Security (RLS)** | Real database test | **PASS** | 33 tables RLS-enabled; anonymous REST inspection returned zero visible rows on all private tables. |
| **Stored Procedures (RPC) (Runtime)** | Real database RPC test | **PASS** | All 12 pgTAP suites verify RPC invariants, security definer guards, and operational freezes. |
| **Public Projections & Intake** | Public RPC & RLS test | **PASS** | Verified stripping of `internal_only` brief fields; omission of expenses in public status. |
| **Google OAuth (Deployed Origin)** | Live OAuth integration | **PASS** | `https://lumina.rzqllh-labs.workers.dev/login` → Google → Supabase → deployed `/auth/callback` → Dashboard. |
| **Cloudflare Deployment** | Remote infrastructure deployment | **PASS** | Deployed to `https://lumina.rzqllh-labs.workers.dev`. |
| **Deployed Application Smoke** | Deployed infrastructure browser test | **PASS** | Mobile (390x844), Desktop (1440x900), public error routes, and authenticated flows verified live. |
| **Security & Secrets (Repository)** | Client code audit | **PASS** | `.env` gitignored; `env.ts` fails on startup if required vars are missing — no silent production fallback. |
| **Service-Role Rotation** | Remote credential rotation | **PASS** | Operator confirmed key rotation (`CONFIRMED_BY_OPERATOR`). |
| **Fresh Migration Replay** | Reproducible provisioning | **DEFERRED_ENVIRONMENT** | See §4. Release-engineering debt only, not a blocker for current private-use instance. |

---

## 3. Detailed Verification Findings

### A. Database Verification Summary (pgTAP — 2026-08-15)

Executed against remote `veljyxvrsyptarfgunan` via `npx supabase db query --linked`:

- `01_invariants_and_rls.test.sql` (14 assertions): **PASS**
- `02_auth_workspace_bootstrap.test.sql` (6 assertions): **PASS**
- `03_clients_and_contacts.test.sql` (6 assertions): **PASS**
- `04_projects_foundation.test.sql` (6 assertions): **PASS**
- `05_services_and_packages.test.sql` (6 assertions): **PASS**
- `06_project_services_pricing.test.sql` (16 assertions): **PASS**
- `07_project_workflow_tasks.test.sql` (13 assertions): **PASS**
- `08_project_sessions.test.sql` (9 assertions): **PASS**
- `09_deliverables_revisions.test.sql` (10 assertions): **PASS**
- `10_finance_and_closure.test.sql` (12 assertions): **PASS**
- `11_briefs_and_intake.test.sql` (13 assertions): **PASS**
- `12_status_portal.test.sql` (7 assertions): **PASS**
- **Total: 118 assertions, 12 suites, 0 failures.**

### B. Security & Runtime Isolation Summary

- Anonymous REST inspection of `workspaces`, `projects`, `clients`, `payments`, `expenses` returned zero visible rows (RLS actively blocking unauthorized access).
- Unauthenticated RPC calls to `bootstrap_personal_workspace`, `close_project`, `force_close_project` are rejected with `401 Unauthorized` / permission denied.
- `get_public_project_status` and `get_public_brief_intake` called with invalid/revoked tokens fail gracefully with sanitized error responses.

### C. Live Cloudflare & Browser Smoke Summary

- Deployed URL: `https://lumina.rzqllh-labs.workers.dev`
- **Mobile (390x844):** Clean responsive layout, brand header, Google OAuth sign-in button.
- **Desktop (1440x900):** Clean centered container, responsive typography, zero layout shift.
- **Public Routes:** `/share/:token` and `/brief/:token` render gracefully for invalid tokens (no console crashes).
- **Authenticated Dashboard:** Renders active project statistics, production calendar preview, and responsive navigation on the deployed origin.

---

## 4. Migration Provenance

### Historical Remote Baseline

The linked Supabase project `veljyxvrsyptarfgunan` was not provisioned as a clean empty database. It already contained schema objects prior to the RC validation run.

### Migration Ledger Alignment

- `npx supabase db push --dry-run` showed migration `00001` as pending.
- `npx supabase db push` applied migration `00001` cleanly.
- Migrations `00002`–`00022` were already present in the remote schema (pre-existing). Their ledger entries were aligned with `supabase migration repair --status applied`.
- Migration `00023_fix_apply_brief_submission_review.sql` was authored during RC verification and applied as a real forward migration.

### Status Summary

| Step | Status |
|---|---|
| Remote schema runtime compatibility | **PASS** |
| Remote migration ledger alignment (00001–00022) | **PASS** |
| Forward migration 00023 execution | **PASS** |
| Fresh 00001→00023 migration replay on clean database | **DEFERRED_ENVIRONMENT** |

> `db push --dry-run` returning zero pending means the migration ledger is synchronized, **not** that fresh migration reproducibility is proven.

### Fresh Migration Replay

No disposable Supabase runtime (Docker, separate project, or database branch) was available during this RC pass. Running `db reset --linked` against `veljyxvrsyptarfgunan` is prohibited per safety invariants.

**Fresh migration replay is classified as `DEFERRED_ENVIRONMENT`.** This is release-engineering debt, not a runtime product blocker for the existing private-use instance whose schema is verified passing all tests.

To clear this debt, use one of:
1. A disposable Supabase project (free tier)
2. A local Docker Supabase instance (`supabase start`)
3. A Supabase database branch, if available

### Migration Immutability

Migration `00021_brief_builder_and_intake_integrity.sql` was restored to its exact byte-for-byte content at commit `b2e818b` (blob hash `e4c1d30638a7d42da6e1510cbd38c9862950b644`).

The behavior fix for `apply_brief_submission_review` is carried exclusively by migration `00023_fix_apply_brief_submission_review.sql` as the single canonical forward migration. The remote database's live RPC reflects `00023`'s corrected implementation (verified by pgTAP suite 11: 13/13 PASS).

---

## 5. Deployed OAuth Gate

**Status: `PASS`**

Deployed OAuth round-trip was executed and confirmed:
- Started from `https://lumina.rzqllh-labs.workers.dev/login`
- Google OAuth completed successfully
- Supabase callback returned to deployed Cloudflare origin (`https://lumina.rzqllh-labs.workers.dev/auth/callback`)
- Authenticated Lumina Dashboard loaded successfully
- Final origin remained `https://lumina.rzqllh-labs.workers.dev`

---

## 6. Conclusion

Lumina Release Candidate 1 is fully validated against live PostgreSQL, Supabase Auth, and Cloudflare Workers infrastructure.

**Final Status: `RC1_READY_FOR_PRIVATE_USE`**
