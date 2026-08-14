# Lumina — Release Candidate 1 Blockers & External Actions Ledger

**Pass:** Release Candidate 1 Verification  
**Date:** 2026-08-15  
**Status:** 2 External Blockers / 0 Repository Defects  

---

## 1. Blocker Summary

| Severity | Count | Description |
|---|---|---|
| **RC-BLOCKER** | 2 | External manual setup actions required before private production launch. |
| **RC-P0** | 0 | Zero repository-side data/security/correctness issues. |
| **RC-P1** | 0 | Zero repository-side workflow reliability issues. |
| **RC-P2** | 0 | Non-blocking polish/convenience items recorded in backlog. |

---

## 2. Itemized External Actions

### `RC-BLOCKER-SEC-001` — Remote Supabase Service-Role Credential Rotation
- **Severity:** `RC-BLOCKER`
- **Area:** Security & Credential Hygiene
- **Issue:** The previously used Supabase `service_role` credential was referenced in past local configuration history.
- **Evidence:** Historical commit audit and security guidelines (`docs/engineering/SECURITY.md`).
- **Required Action:** 
  1. Open Supabase Project Dashboard → Project Settings → API.
  2. Generate a new `service_role` secret and revoke the legacy key.
  3. Ensure the newly rotated key is stored solely in secure server/CI environment secrets and never in local `.env` or client code.
- **Owner:** Project Operator / Workspace Administrator
- **Status:** `EXTERNAL_MANUAL_ACTION_REQUIRED`

### `RC-BLOCKER-AUTH-001` — Remote Google OAuth Provider Configuration
- **Severity:** `RC-BLOCKER`
- **Area:** Authentication / Supabase Auth
- **Issue:** Remote Supabase project requires active Google OAuth Client ID and Client Secret to authenticate live owner users.
- **Evidence:** Production authentication gate redirects to Supabase Google OAuth provider.
- **Required Action:**
  1. Create an OAuth 2.0 Client ID in Google Cloud Console.
  2. Add Authorized Redirect URI: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`.
  3. Enter Google Client ID and Client Secret into Supabase Dashboard → Authentication → Providers → Google.
  4. Enable Google Provider with standard scopes (`openid`, `email`, `profile`).
- **Owner:** Project Operator / Workspace Administrator
- **Status:** `EXTERNAL_CONFIGURATION_BLOCKER`
