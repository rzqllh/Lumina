# Lumina — RC1 External Runtime Checklist

This checklist tracks the exact external runtime gates required to advance Lumina through its release-candidate verification.

Current verdict: **`RC1_READY_FOR_PRIVATE_USE`**

---

## Security prerequisites

- [x] `service_role` credential rotated (CONFIRMED_BY_OPERATOR)
- [x] Repository secret audit clean (no service_role in tracked files or bundles)
- [x] `src/lib/env.ts` requires explicit env vars; fails loudly if absent — no silent production fallback
- [x] `.env.example` contains placeholder values only

## Auth prerequisites

- [x] Google OAuth Client ID & Secret configured by operator (Google Cloud Console + Supabase Dashboard)
- [x] Supabase Google provider enabled
- [x] OAuth round-trip verified from localhost (`localhost:5173/login` → Google → Supabase → `/auth/callback` → Dashboard)
- [x] **Deployed-origin OAuth round-trip** — Verified from deployed origin `https://lumina.rzqllh-labs.workers.dev/login` → Google → Supabase → deployed `/auth/callback` → authenticated Dashboard

## Database

- [x] Runtime target identified: `veljyxvrsyptarfgunan` (Southeast Asia - Singapore)
- [x] Remote migration ledger aligned (00001–00022 via repair; 00023 as forward migration)
- [x] `supabase db push --dry-run` returns 0 pending migrations
- [x] pgTAP executes against remote database (`npx supabase db query --linked`)
- [x] pgTAP passes: 12 suites, 118 assertions, 0 failures (2026-08-15)
- [ ] **Fresh migration replay** (00001→00023 on clean database): `DEFERRED_ENVIRONMENT` (release-engineering debt, not a runtime blocker for current private-use instance)

## Migration Lineage Integrity

- [x] Migration `00021` historical content verified byte-for-byte (blob hash `e4c1d30638a7d42da6e1510cbd38c9862950b644`)
- [x] Migration `00021` restored to exact `b2e818b` content — no diff
- [x] Migration `00023_fix_apply_brief_submission_review.sql` is the sole forward carrier of the runtime fix
- [x] Migrations `00001`–`00022` are immutable and unmodified

## RLS & Multi-tenant Boundaries

- [x] Anonymous REST inspection of private tables returned zero visible rows
- [x] Workspace own-row access verified (pgTAP suites 01–12)
- [x] Cross-workspace access denial verified (pgTAP suites 06, 07, 08, 09, 10)
- [x] Public status token projection verified (`get_public_project_status` omits expenses & internal fees)
- [x] Public brief token projection verified (`get_public_brief_intake` strips `internal_only` fields)
- [x] Invalid/revoked token rejection verified (returns structured error, no crash)

## RPCs

- [x] `bootstrap_personal_workspace` (pgTAP suite 02 + live OAuth session)
- [x] `duplicate_package` (pgTAP suite 05)
- [x] `apply_workflow_template_to_project` (pgTAP suite 07)
- [x] `create_deliverable_revision` (pgTAP suite 09)
- [x] `close_project` (pgTAP suite 10: blocked on balance/unapproved, passes when criteria met)
- [x] `force_close_project` (pgTAP suites 01, 07, 08, 09, 10)
- [x] `reopen_project` (pgTAP suite 10)
- [x] Public Brief RPCs: `generate_brief_share_link`, `get_public_brief_intake`, `submit_public_brief`, `apply_brief_submission_review` (pgTAP suite 11)
- [x] Public Status RPCs: `generate_project_status_share_link`, `get_public_project_status`, `revoke_project_share_link` (pgTAP suite 12)

## Deployment

- [x] Cloudflare Workers deployment active
- [x] Frontend deployed: `https://lumina.rzqllh-labs.workers.dev`
- [x] SPA not-found fallback routing works (`not_found_handling = "single-page-application"`)
- [x] Production bundle built with publishable credentials from `.env` (no hardcoded defaults)
- [x] PWA assets present: `manifest.webmanifest`, `registerSW.js`, `sw.js`
- [x] Deployed Cloudflare authentication round-trip PASS

## Browser Smoke

- [x] Deployed mobile smoke (390x844): responsive login, brand header, Google button
- [x] Deployed desktop smoke (1440x900): centered container, responsive typography
- [x] Deployed public routes: `/share/:token` and `/brief/:token` handle invalid tokens gracefully
- [x] Deployed authenticated routes: Dashboard navigation verified on deployed origin
- [x] Console clean (0 uncaught exceptions observed)

## Automated Verification (Frontend)

- [x] `pnpm format:check` — PASS
- [x] `pnpm typecheck` — PASS (exit 0)
- [x] `pnpm lint` — PASS (exit 0)
- [x] `pnpm test:run` — PASS (46 suites, 145 tests)
- [x] `pnpm build` — PASS

## Summary Table

| Gate | Status | Impact |
|---|---|---|
| Runtime Database & Migrations | **PASS** | 12/12 pgTAP suites, 118 assertions green on `veljyxvrsyptarfgunan` |
| RLS & RPC Invariants | **PASS** | 33 tables isolated, transactional RPCs validated |
| Deployed Cloudflare OAuth | **PASS** | Round-trip verified from `https://lumina.rzqllh-labs.workers.dev` |
| Fresh migration replay (clean DB) | `DEFERRED_ENVIRONMENT` | Release-engineering debt only; non-blocking for current private instance |
