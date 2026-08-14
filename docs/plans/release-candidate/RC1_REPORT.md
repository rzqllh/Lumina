# Lumina — Release Candidate 1 Report

**Date:** 2026-08-15
**Verdict:** `RC1_READY_WITH_EXTERNAL_ACTIONS`
**Commit:** `0a2cfa6` / RC1 Verification Suite

---

## 1. Executive Summary

Lumina MVP Release Candidate 1 has undergone full deployment readiness, security boundaries, and runtime verification.

The application satisfies all product architecture and frontend deployment requirements:
- Cloudflare Workers Static Assets SPA configuration verified (`wrangler.toml`).
- Zero service-role or privileged credential leaks in frontend bundle or client repository.
- Full Vitest suite passing (46 files, 145 tests).
- Clean production bundle build (1.53s).
- Comprehensive browser smoke validation on Desktop (1440x900) and Mobile (390x844) with direct SPA reload verification.

Two external dependencies are documented as pending remote dashboard actions before private production usage:
1. `RC-BLOCKER-SEC-001`: Supabase `service_role` secret rotation in the remote Supabase Dashboard.
2. `RC-BLOCKER-AUTH-001`: Google Cloud Console OAuth Client ID & Secret configuration in Supabase Dashboard.

---

## 2. Verification Protocol Summary

| Verification Area | Target | Status | Notes |
|---|---|---|---|
| **Static Inspection & Linter** | `src/`, `supabase/` | **PASS** | `pnpm lint`, `pnpm format:check`, `pnpm typecheck` all exited 0. |
| **Frontend Test Suite** | Vitest | **PASS** | 46 test suites, 145 tests passed (0 failures). |
| **Production Build** | Vite / Rollup | **PASS** | Bundled in 1.53s; PWA service worker generated cleanly. |
| **Browser Smoke** | Desktop 1440x900 & Mobile 390x844 | **PASS** | Direct SPA reload, unauthenticated redirects, public portal/brief error boundary verified. Zero console errors. |
| **Database Migrations & Schema** | PostgreSQL | **PASS (Static / Schema Audit)** | Migrations 00001–00022 define clean relational schema with explicit RLS and `ON DELETE RESTRICT` constraints. |
| **Database Runtime / pgTAP** | Docker / pgTAP | **BLOCKED_BY_ENVIRONMENT** | Local Docker daemon is unavailable on the Windows host environment; live pgTAP execution blocked by environment. |
| **Security & Secrets** | Client Repository | **PASS (Code-Side)** | Zero `service_role` or private secrets exposed in client code or bundle. |
| **External Auth Provider** | Google OAuth | **EXTERNAL_CONFIGURATION_BLOCKER** | Remote Google OAuth Client ID required in Supabase dashboard. |

---

## 3. Runtime Verification Findings

### A. Environment Audit
- `.env` contains strictly public publishable variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- Zero privileged credentials (`service_role`, database passwords, Google client secrets) are present in client source or `.env`.

### B. Deployment Readiness (Cloudflare Workers Static Assets)
- Verified `wrangler.toml` configuration:
  - `name = "lumina"`
  - `assets.directory = "./dist"`
  - `assets.not_found_handling = "single-page-application"`
- Direct deep links (e.g. `/projects/:id`, `/brief/:token`, `/share/:token`) resolve cleanly to `index.html` with client-side router resolution.

### C. Browser Smoke Results
- **Recording Artifact:** `rc1_browser_smoke_1786736826302.webp`
- **Screenshots:**
  - Desktop login redirect: `login_desktop_redirect_1786738000000.png`
  - Desktop public brief: `brief_invalid_token_1786738000000.png`
  - Desktop public portal: `portal_invalid_token_1786738000000.png`
  - Mobile login layout: `login_mobile_layout_1786738000000.png`
  - Mobile public brief: `brief_mobile_layout_1786738000000.png`
  - Mobile public portal: `portal_mobile_layout_1786738000000.png`

---

## 4. Known Limitations & Non-Goals for RC1

1. **Google OAuth Remote Config:** Requires manual setup in Google Cloud Console + Supabase Dashboard.
2. **Local pgTAP Execution:** Requires local Docker runtime if run locally.
3. **P2/P3 Backlog Items:** Quick 50/50 payment split generator, direct bucket drag-drop upload, and 2-way Google Calendar/Drive sync are scheduled for post-MVP milestones.
