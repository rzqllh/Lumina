# Lumina — Release Candidate 1 Blockers & External Actions Ledger

**Pass:** Release Candidate 1 Verification & Evidence Correction<br />
**Date:** 2026-08-15<br />
**Verdict:** `RC1_VALIDATION_BLOCKED`

---

## 1. Blocker Summary

| Identifier | Severity | Area | Status | Description |
|---|---|---|---|---|
| `RC-BLOCKER-SEC-001` | **RC-BLOCKER** | Security | `EXTERNAL_MANUAL_ACTION_REQUIRED` | Remote Supabase `service_role` secret rotation pending operator confirmation. |
| `RC-BLOCKER-AUTH-001` | **RC-BLOCKER** | Auth | `EXTERNAL_CONFIGURATION_BLOCKER` | Remote Google OAuth Client ID & Secret configuration in Supabase Dashboard pending. |
| `RC-BLOCKER-DB-001` | **RC-BLOCKER** | Database | `RUNTIME_EXECUTION_PENDING` | Live migration execution, pgTAP test runner, runtime RLS checks, and live RPC validation pending real PostgreSQL environment. |
| `RC-BLOCKER-DEP-001` | **RC-BLOCKER** | Deployment | `DEPLOYMENT_EXECUTION_PENDING` | Remote Cloudflare Workers deployment and deployed edge browser smoke test pending. |

---

## 2. Itemized Blockers & External Actions

### `RC-BLOCKER-SEC-001` — Remote Supabase Service-Role Credential Rotation
- **Severity:** `RC-BLOCKER`
- **Area:** Security & Credential Hygiene
- **Status:** `EXTERNAL_MANUAL_ACTION_REQUIRED`
- **Issue:** The previously used Supabase `service_role` credential was present in past local configuration history.
- **Required Action:**
  1. Operator opens Supabase Project Dashboard → Project Settings → API.
  2. Generate a new `service_role` secret and revoke the legacy key.
  3. Ensure the new secret is never committed to git or exposed in client `.env`.
  4. Operator explicitly confirms completion.
- **State Transition:** Mark as `CONFIRMED_BY_OPERATOR` once confirmation is provided.
- **Repository-Side Security Audit (PASS):**
  - `.env` ignored by git.
  - Zero `service_role` credentials tracked in repository history.
  - Zero `service_role` credentials present in `VITE_*` environment variables.
  - Browser bundle contains public publishable credentials only.

---

### `RC-BLOCKER-AUTH-001` — Remote Google OAuth Provider Configuration
- **Severity:** `RC-BLOCKER`
- **Area:** Authentication / Supabase Auth
- **Status:** `EXTERNAL_CONFIGURATION_BLOCKER`
- **Issue:** Remote Supabase project requires active Google OAuth credentials to authenticate owner accounts in production.
- **Prerequisites Needed:**
  - Google Cloud Console: OAuth 2.0 Client ID & Client Secret.
  - Authorized Redirect URI: Configured according to the actual Supabase project callback URL (`https://<supabase-project-ref>.supabase.co/auth/v1/callback`).
  - Scopes: Lumina requests identity scopes **only**: `openid`, `email`, `profile`.
  - **Constraint:** Do NOT request Google Drive or Google Calendar scopes.
- **Required Runtime Verification Flow (post-configuration):**
  1. Initiate Google login from `/login`.
  2. Supabase OAuth callback redirects to `/auth/callback`.
  3. Validates safe `returnTo` path.
  4. Establishes active owner session.
  5. Triggers workspace bootstrap check (`bootstrap_personal_workspace`).
  6. Perform explicit logout.
  7. Verify login again / session restore across reloads.
- **Completion Standard:** Must be verified via live interactive authentication; static/mock validation is insufficient.

---

### `RC-BLOCKER-DB-001` — Live Database Migration, pgTAP, RLS & RPC Execution
- **Severity:** `RC-BLOCKER`
- **Area:** Database Runtime & Invariant Validation
- **Status:** `RUNTIME_EXECUTION_PENDING`
- **Status Categories:**
  - **Migrations:** Static review `PASS` | Runtime execution `NOT EXECUTED`.
  - **pgTAP:** Test authoring `COMPLETE` | Runtime execution `BLOCKED` (Docker unavailable locally).
  - **RLS:** Static policy review `PASS` | Mocked tests `PASS` | Runtime RLS verification `NOT EXECUTED`.
  - **RPC:** Static implementation review `PASS` | Runtime RPC verification `NOT EXECUTED`.
- **Remote Environment Inspection Result:**
  - Command: `npx supabase projects list`
  - Result: `REMOTE_TEST_ENV_NOT_AVAILABLE` (Supabase CLI authentication token not present).
- **Safe Remote Execution Protocol (for next execution pass):**
  1. Authenticate CLI (`supabase login` or `SUPABASE_ACCESS_TOKEN`).
  2. Link dedicated staging/development project (`supabase link --project-ref <ref>`).
  3. Inspect migration history (`supabase migration list`).
  4. Apply migrations sequentially (`00001`–latest).
  5. Run pgTAP test suites.
  6. Create disposable Workspace A / Workspace B test identities to test:
     - Anonymous private-table denial.
     - Workspace A own-row access.
     - Workspace A → Workspace B tenant boundary denial.
     - Public Project Status token projection.
     - Public Brief token projection.
     - Cross-purpose token access denial.
  7. Test critical RPCs:
     - `bootstrap_personal_workspace`
     - `duplicate_package`
     - `apply_workflow_template_to_project`
     - `create_deliverable_revision`
     - `close_project`
     - `force_close_project`
     - `reopen_project`
     - Public Brief RPCs & Project Status RPCs.
  8. **Safety Invariants:**
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

The project must remain at **`RC1_VALIDATION_BLOCKED`** until all four blockers above are resolved through direct runtime verification evidence. Static analysis and mock test passes cannot substitute for live runtime gates.
