# Lumina — Release Candidate 1 Report

**Date:** 2026-08-15<br />
**Verdict:** `RC1_VALIDATION_BLOCKED`<br />
**Commit:** `afd0df5` / RC1 Verification Suite

---

## 1. Executive Summary

Lumina MVP Release Candidate 1 has completed local frontend test, build, lint, format, typecheck, and local production-build browser smoke verification.

The verdict is set to **`RC1_VALIDATION_BLOCKED`**.

This verdict does **NOT** indicate that the codebase is defective or broken. Rather, it reflects that release-candidate runtime validation remains incomplete pending real-world external runtime execution:
1. PostgreSQL migrations have not been applied against a live runtime.
2. pgTAP database tests have not been executed against a real PostgreSQL environment (blocked locally by lack of Docker daemon).
3. Row-Level Security (RLS) policies and stored procedures (RPCs) have not been verified against a real database instance.
4. Google OAuth remote credentials and Supabase Auth provider configuration are pending external manual setup.
5. Supabase `service_role` credential rotation requires operator confirmation.
6. Cloudflare Workers deployment has not been executed against live Cloudflare infrastructure.
7. Browser smoke testing has only run against local Vite preview (`localhost`), not against deployed infrastructure.

Deployment configuration is prepared; remote deployment remains unverified.

---

## 2. Evidence & Verification Category Matrix

| Verification Area | Category / Phase | Status | Evidence / Notes |
|---|---|---|---|
| **Static Inspection & Linter** | Static code analysis | **PASS** | `pnpm lint`, `pnpm format:check`, `pnpm typecheck` all exit 0 cleanly. |
| **Frontend Test Suite** | Mocked Vitest suite | **PASS** | 46 test suites, 145 tests passing (0 failures). |
| **Production Bundle Build** | Vite / Rollup build | **PASS** | `pnpm build` creates static assets in `./dist` (1.53s); PWA service worker generated cleanly. |
| **Local Browser Smoke** | Local Vite preview (`localhost`) | **PASS** | Desktop (1440x900) & Mobile (390x844) preview smoke passed. Local direct SPA reload, route protection, and token validation UI error boundaries verified with zero console errors. |
| **Database Migrations (Static)** | Static schema review | **PASS** | Migrations `00001`–`00022` reviewed; relational constraints, RLS policies, and immutable triggers cleanly specified. |
| **Database Migrations (Runtime)** | Live DB migration push | **NOT EXECUTED** | No live database runtime migration execution performed. |
| **Database Tests / pgTAP (Authoring)** | Test suite authoring | **COMPLETE** | Comprehensive pgTAP suites written in `supabase/tests/database/*.sql`. |
| **Database Tests / pgTAP (Runtime)** | Live DB test execution | **BLOCKED** | Local Docker daemon unavailable; remote test environment execution not yet linked. |
| **Row-Level Security (RLS) (Static)** | Static policy review | **PASS** | Multi-tenant isolation and public token projection policies authored on all public tables. |
| **Row-Level Security (RLS) (Mocked)** | Unit/integration mocks | **PASS** | Mocked frontend/integration query layers pass. |
| **Row-Level Security (RLS) (Runtime)** | Real database test | **NOT EXECUTED** | Live multi-tenant cross-boundary isolation not executed on live DB. |
| **Stored Procedures (RPC) (Static)** | Static implementation review | **PASS** | PL/pgSQL RPC definitions reviewed for transactional safety, status validation, and error guards. |
| **Stored Procedures (RPC) (Runtime)** | Real database RPC test | **NOT EXECUTED** | Live execution of RPCs against a real PostgreSQL instance not executed. |
| **Cloudflare Deployment Config** | Configuration readiness | **READY** | `wrangler.toml` configured for static assets with SPA fallback (`single-page-application`). |
| **Actual Cloudflare Deployment** | Remote infrastructure deployment | **NOT EXECUTED** | Remote `wrangler deploy` to live Cloudflare target has not been executed. |
| **Deployed Application Smoke** | Deployed infrastructure browser test | **NOT EXECUTED** | Remote URL smoke testing pending actual deployment. |
| **Security & Secrets (Repository)** | Client code audit | **PASS** | `.env` ignored; zero `service_role` credentials tracked; no `service_role` credentials in `VITE_*` vars; browser bundle contains public publishable credentials only. |
| **Service-Role Rotation** | Remote credential rotation | **EXTERNAL_MANUAL_ACTION_REQUIRED** | Operator confirmation required for Supabase dashboard key rotation (`RC-BLOCKER-SEC-001`). |
| **External Auth Provider (Google)** | Remote OAuth config | **EXTERNAL_CONFIGURATION_BLOCKER** | Client ID & Secret configuration in Google Cloud & Supabase Dashboards required (`RC-BLOCKER-AUTH-001`). |

---

## 3. Detailed Verification Findings

### A. Repository Security & Environment Hygiene
- `.env` strictly contains public client-side variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- No privileged secrets or service-role keys are committed in git history or client bundles.
- Secret rotation (`RC-BLOCKER-SEC-001`) remains an external operational gate.

### B. Deployment Readiness vs. Execution
- **Deployment configuration is prepared; remote deployment remains unverified.**
- `wrangler.toml` specifies:
  - `name = "lumina"`
  - `assets.directory = "./dist"`
  - `assets.not_found_handling = "single-page-application"`
- Remote deployment to Cloudflare Workers and testing of deep-link routing on deployed CDN edge have **NOT BEEN EXECUTED**.

### C. Local Browser Smoke Results (Vite Preview)
- Tested environment: local Vite production preview (`localhost:4173`).
- **Desktop (1440x900):** PASS (unauthenticated redirect, invalid brief token UI, invalid portal token UI, clean console).
- **Mobile (390x844):** PASS (responsive layout, navigation, touch target accommodation, clean console).
- **Deployed Browser Smoke:** NOT EXECUTED.

### D. Remote Database Environment Discovery
- `npx supabase projects list` was executed to discover accessible remote Supabase development/staging instances.
- Result: Supabase CLI platform authentication token is not present in local environment (`LegacyPlatformAuthRequiredError`).
- Classification: **`REMOTE_TEST_ENV_NOT_AVAILABLE`** (CLI not authenticated).
- Safe sequence for future runtime execution has been documented (see `RC1_BLOCKERS.md` and `RC1_RUNTIME_CHECKLIST.md`).

---

## 4. Minimum Criteria for `RC1_READY_FOR_PRIVATE_USE`

To transition from `RC1_VALIDATION_BLOCKED` to `RC1_READY_FOR_PRIVATE_USE`, the following mandatory runtime gates must be satisfied with real evidence:
1. `service_role` credential rotation confirmed by operator (`CONFIRMED_BY_OPERATOR`).
2. Google OAuth client and Supabase provider configured and tested through full live auth flow.
3. Migration chain (`00001`–latest) executed successfully against real Supabase runtime.
4. Database tests (pgTAP) executed and passing against live database.
5. Representative live RLS tests pass (anonymous denial, Workspace A own-row access, Workspace A → Workspace B denial, public token projections).
6. Critical business RPCs tested against live database.
7. Cloudflare deployment succeeds to live domain.
8. Deployed mobile and desktop browser smoke testing passes on live URL.
