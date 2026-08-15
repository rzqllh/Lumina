# Lumina — Release Candidate 1 Blockers & External Actions Ledger

**Pass:** Release Candidate 1 Final Release Gate Close<br />
**Date:** 2026-08-15<br />
**Verdict:** `RC1_READY_FOR_PRIVATE_USE`

---

## 1. Blocker Summary

| Identifier | Severity | Area | Status | Description |
|---|---|---|---|---|
| `RC-BLOCKER-SEC-001` | **RC-BLOCKER** | Security | `RESOLVED` | `service_role` rotated by operator; repo clean; `env.ts` requires explicit env vars. |
| `RC-BLOCKER-AUTH-001` | **RC-BLOCKER** | Auth (localhost) | `RESOLVED` | Live Google OAuth from localhost preview verified end-to-end. |
| `RC-BLOCKER-AUTH-002` | **RC-BLOCKER** | Auth (deployed origin) | `RESOLVED` | Deployed origin `https://lumina.rzqllh-labs.workers.dev` round-trip verified to authenticated Dashboard. |
| `RC-BLOCKER-DB-001` | **RC-BLOCKER** | Database | `RESOLVED` | Migration ledger aligned; 00023 applied; 118 pgTAP assertions PASSED; RLS & RPCs verified. |
| `RC-BLOCKER-DB-002` | **RC-ENGINEERING-DEBT** | Fresh Migration Replay | `DEFERRED_ENVIRONMENT` | No disposable runtime available. Release-engineering debt only, not a blocker for current private-use instance. |
| `RC-BLOCKER-DEP-001` | **RC-BLOCKER** | Deployment | `RESOLVED` | Deployed to Cloudflare Workers (`https://lumina.rzqllh-labs.workers.dev`); SPA routing, smoke, error boundaries, auth verified. |

**Active RC-BLOCKER Count: 0**

---

## 2. Itemized Blockers & Verification Evidence

### `RC-BLOCKER-SEC-001` — Service-Role Credential Rotation & Env Safety
- **Status:** `RESOLVED`
- **Evidence:**
  - Operator confirmed `service_role` rotation in Supabase Dashboard.
  - `.env` gitignored (verified `.gitignore:32:.env`).
  - `src/lib/env.ts` throws at startup if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are absent — no silent production project fallback.
  - `.env.example` contains only placeholder values; no real credentials.

---

### `RC-BLOCKER-AUTH-001` — Google OAuth (localhost preview)
- **Status:** `RESOLVED`
- **Evidence:**
  - Live interactive Google sign-in executed from `localhost:5173/login`.
  - Supabase Auth issued valid JWT and session.
  - `/auth/callback` → `bootstrap_personal_workspace` → Dashboard verified.

---

### `RC-BLOCKER-AUTH-002` — Google OAuth (deployed Cloudflare origin)
- **Status:** `RESOLVED`
- **Evidence:**
  - Started from `https://lumina.rzqllh-labs.workers.dev/login`
  - Google OAuth completed successfully
  - Supabase callback returned to deployed Cloudflare origin (`https://lumina.rzqllh-labs.workers.dev/auth/callback`)
  - Authenticated Lumina Dashboard loaded successfully
  - Final origin remained `https://lumina.rzqllh-labs.workers.dev`

---

### `RC-BLOCKER-DB-001` — Live Database Migration, pgTAP, RLS & RPC
- **Status:** `RESOLVED`
- **Evidence:**
  - Remote project: `veljyxvrsyptarfgunan` (Southeast Asia - Singapore).
  - Migration ledger aligned (00001–00022 via repair; 00023 as forward migration).
  - `supabase db push --dry-run` → 0 pending.
  - 12 pgTAP test suites (118 assertions) PASSED on `veljyxvrsyptarfgunan`.
  - 33 business tables verified RLS-enabled.
  - Anonymous REST access to private tables returned zero visible rows.
  - Unauthenticated RPC calls to sensitive functions rejected (401 / permission denied).

---

### `RC-BLOCKER-DB-002` — Fresh Migration Replay
- **Status:** `DEFERRED_ENVIRONMENT`
- **Classification:** Release-engineering debt, not a runtime blocker for the existing private-use instance.
- **Explanation:** The linked project `veljyxvrsyptarfgunan` was not an empty database at the start of RC validation. Fresh 00001→00023 sequential replay has not been proven on a clean database instance.
- **Resolution path (when ready):**
  1. Use a disposable Supabase project (free tier) or `supabase start` (local Docker), or a database branch.
  2. Apply `npx supabase db push` to the clean instance.
  3. Confirm all migrations apply without errors.
  4. Run pgTAP suite and verify 118 assertions pass.
  - **Constraint:** Do NOT reset or touch `veljyxvrsyptarfgunan`.

---

### `RC-BLOCKER-DEP-001` — Cloudflare Remote Deployment & Browser Smoke
- **Status:** `RESOLVED`
- **Evidence:**
  - Deployed: `https://lumina.rzqllh-labs.workers.dev`
  - SPA not-found fallback routing verified.
  - Mobile (390x844) and Desktop (1440x900) browser smoke passed.
  - Public `/share/:token` and `/brief/:token` error boundaries verified.
  - Deployed authentication round-trip verified.

---

## 3. Migration Lineage Correction Note

Migration `00021_brief_builder_and_intake_integrity.sql` was restored byte-for-byte to commit `b2e818b` (blob hash `e4c1d30638a7d42da6e1510cbd38c9862950b644`).
Migration `00023_fix_apply_brief_submission_review.sql` is the sole forward carrier of the runtime fix.
Remote pgTAP suites 11 and 12 re-verified after restoration: **PASS** (118/118 total assertions pass).

---

## 4. Final Status

All RC1 blockers are resolved. Active blocker count: **0**.

**Final Verdict: `RC1_READY_FOR_PRIVATE_USE`**
