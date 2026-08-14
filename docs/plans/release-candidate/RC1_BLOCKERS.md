# Lumina — Release Candidate 1 Blockers & External Actions Ledger

**Pass:** Release Candidate 1 Verification & Evidence Correction<br />
**Date:** 2026-08-15<br />
**Verdict:** `RC1_VALIDATION_BLOCKED`

---

## 1. Blocker Summary

| Identifier | Severity | Area | Status | Description |
|---|---|---|---|---|
| `RC-BLOCKER-SEC-001` | **RC-BLOCKER** | Security | `CONFIRMED_BY_OPERATOR` | Remote Supabase `service_role` secret rotated in dashboard. |
| `RC-BLOCKER-AUTH-001` | **RC-BLOCKER** | Auth | `CONFIGURED_PENDING_LIVE_TEST` | Remote Google OAuth Client ID & Secret configured; live login/session test pending. |
| `RC-BLOCKER-DB-001` | **RC-BLOCKER** | Database | `RUNTIME_EXECUTION_PENDING` | Target project linked (`veljyxvrsyptarfgunan`); migrations 00001–00022, pgTAP, RLS, and RPC execution pending runtime pass. |
| `RC-BLOCKER-DEP-001` | **RC-BLOCKER** | Deployment | `DEPLOYMENT_EXECUTION_PENDING` | Remote Cloudflare Workers deployment and deployed edge browser smoke test pending. |

---

## 2. Itemized Blockers & External Actions

### `RC-BLOCKER-SEC-001` — Remote Supabase Service-Role Credential Rotation
- **Severity:** `RC-BLOCKER`
- **Area:** Security & Credential Hygiene
- **Status:** `CONFIRMED_BY_OPERATOR`
- **Issue:** The previously used Supabase `service_role` credential was present in past local configuration history.
- **Resolution:** Operator rotated the `service_role` secret in Supabase Dashboard and revoked legacy credentials.
- **Repository-Side Security Audit (PASS):**
  - `.env` ignored by git.
  - Zero `service_role` credentials tracked in repository history.
  - Zero `service_role` credentials present in `VITE_*` environment variables.
  - Browser bundle contains public publishable credentials only.

---

### `RC-BLOCKER-AUTH-001` — Remote Google OAuth Provider Configuration
- **Severity:** `RC-BLOCKER`
- **Area:** Authentication / Supabase Auth
- **Status:** `CONFIGURED_PENDING_LIVE_TEST`
- **Issue:** Remote Supabase project requires active Google OAuth credentials to authenticate owner accounts in production.
- **Resolution Status:** Operator configured Google OAuth Client ID & Secret in Google Cloud Console and Supabase Dashboard.
- **Scopes Verification:** Scopes restricted to identity **only**: `openid`, `email`, `profile` (zero Drive/Calendar scopes).
- **Pending Runtime Verification Flow (to be executed during live browser/auth pass):**
  1. Initiate Google login from `/login`.
  2. Supabase OAuth callback redirects to `/auth/callback`.
  3. Validates safe `returnTo` path.
  4. Establishes active owner session.
  5. Triggers workspace bootstrap check (`bootstrap_personal_workspace`).
  6. Perform explicit logout.
  7. Verify login again / session restore across reloads.

---

### `RC-BLOCKER-DB-001` — Live Database Migration, pgTAP, RLS & RPC Execution
- **Severity:** `RC-BLOCKER`
- **Area:** Database Runtime & Invariant Validation
- **Status:** `RUNTIME_EXECUTION_PENDING`
- **Status Categories:**
  - **Migrations:** Static review `PASS` | Remote history inspected `00001`–`00022` pending push | Runtime execution `NOT EXECUTED`.
  - **pgTAP:** Test authoring `COMPLETE` | Runtime execution `BLOCKED` locally (Docker unavailable); remote execution prepared.
  - **RLS:** Static policy review `PASS` | Mocked tests `PASS` | Runtime RLS verification `NOT EXECUTED`.
  - **RPC:** Static implementation review `PASS` | Runtime RPC verification `NOT EXECUTED`.
- **Remote Environment Discovery:**
  - Remote project linked: `veljyxvrsyptarfgunan` (`Lumina`, Southeast Asia / Singapore).
  - Classification: `REMOTE_TEST_ENV_AVAILABLE`.
- **Safe Remote Execution Protocol (for next execution pass):**
  1. Project linked: `supabase link --project-ref veljyxvrsyptarfgunan` (COMPLETE).
  2. Migration history inspected: `supabase migration list` (COMPLETE).
  3. Apply migrations safely: `supabase db push`.
  4. Execute database test suite / pgTAP against remote instance.
  5. Create disposable Workspace A / Workspace B test identities to test:
     - Anonymous private-table denial.
     - Workspace A own-row access.
     - Workspace A → Workspace B tenant boundary denial.
     - Public Project Status token projection.
     - Public Brief token projection.
     - Cross-purpose token access denial.
  6. Test critical RPCs:
     - `bootstrap_personal_workspace`
     - `duplicate_package`
     - `apply_workflow_template_to_project`
     - `create_deliverable_revision`
     - `close_project`
     - `force_close_project`
     - `reopen_project`
     - Public Brief RPCs & Project Status RPCs.
  7. **Safety Invariants:**
     - **NEVER** run `db reset` against remote instances.
     - **NEVER** assume remote environments are disposable.

---

### `RC-BLOCKER-DEP-001` — Cloudflare Remote Deployment & Live Browser Smoke
- **Severity:** `RC-BLOCKER`
- **Area:** Hosting / Production Infrastructure
- **Status:** `DEPLOYMENT_EXECUTION_PENDING`
- **Status Categories:**
  - **Cloudflare deployment configuration:** `READY` (`wrangler.toml` with SPA fallback).
  - **Actual Cloudflare deployment:** `NOT EXECUTED`.
  - **Deployed application smoke:** `NOT EXECUTED`.
  - **Local browser smoke (Vite preview):** `PASS` (Desktop 1440x900 & Mobile 390x844).
- **Required Action:**
  1. Authenticate Cloudflare target (`wrangler login` / API token).
  2. Execute deployment (`pnpm build && wrangler deploy`).
  3. Perform live browser smoke against deployed edge URL:
     - Direct deep link reload (e.g. `/projects/:id`, `/brief/:token`).
     - Mobile (390x844) and desktop (1440x900) layout.
     - Authenticated owner routes.
     - Public portal and brief routes.
     - Clean console and network logs.

---

## 3. Minimum Standard for `RC1_READY_FOR_PRIVATE_USE`

The project must remain at **`RC1_VALIDATION_BLOCKED`** until all runtime gates above are resolved through direct runtime verification evidence. Static analysis and mock test passes cannot substitute for live runtime gates.
