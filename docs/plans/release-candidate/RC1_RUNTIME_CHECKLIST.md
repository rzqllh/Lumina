# Lumina — RC1 External Runtime Checklist

This checklist tracks the exact external runtime prerequisites and execution gates required to advance Lumina from `RC1_VALIDATION_BLOCKED` to `RC1_READY_FOR_PRIVATE_USE`.

---

## Security prerequisites

- [x] service-role credential rotated (CONFIRMED_BY_OPERATOR)
- [x] repository secret audit clean
- [x] frontend environment contains public credentials only (`VITE_SUPABASE_URL` and publishable key)

## Auth prerequisites

- [x] Google OAuth client configured (Operator configured)
- [x] Supabase Google provider configured (Operator configured)
- [x] production/development redirect URI verified (Live Google OAuth round-trip verified to callback → session restore → bootstrap workspace → Dashboard)

## Database

- [x] runtime target identified (`veljyxvrsyptarfgunan` / Southeast Asia - Singapore)
- [x] migration history inspected and reconciled (00001–00023 applied)
- [x] migrations 00001–00023 execute successfully (`supabase db push` clean, 0 pending)
- [x] pgTAP executes against remote database (`npx supabase db query --linked`)
- [x] pgTAP passes (12 suites, 118 assertions passed, 0 failed)

## RLS & Multi-tenant Boundaries

- [x] anonymous private-table denial (workspaces, projects, clients, payments, expenses return 0 rows)
- [x] Workspace A own-row access (verified via pgTAP 01–12 & runtime client)
- [x] Workspace A → Workspace B denial (cross-workspace rejection verified in 06, 07, 08, 09, 10)
- [x] public status token projection (`get_public_project_status` omits expenses & internal fees)
- [x] public Brief token projection (`get_public_brief_intake` strips `internal_only` fields)
- [x] cross-purpose token denial & invalid token rejection (returns 400 with graceful user-facing error)

## RPCs

- [x] bootstrap_personal_workspace (live verified: provisioned owner workspace on real Google login)
- [x] duplicate_package (verified in pgTAP suite 05)
- [x] apply_workflow_template_to_project (verified in pgTAP suite 07)
- [x] create_deliverable_revision (verified in pgTAP suite 09)
- [x] close_project (verified in pgTAP suite 10: blocked on balance/unapproved, passes when criteria met)
- [x] force_close_project (verified in pgTAP suite 01, 07, 08, 09, 10: freezes operations, stores reason)
- [x] reopen_project (verified in pgTAP suite 10)
- [x] public Brief RPCs (generate, get_intake, submit, review verified in pgTAP 11 and migration 00023)
- [x] public Project Status RPCs (generate, get_status, revoke verified in pgTAP 12)

## Deployment

- [x] Cloudflare target authenticated (`npx wrangler deploy --temporary`)
- [x] frontend deployed (`https://lumina.checker-syzygy-fff.workers.dev`)
- [x] SPA nested-route refresh works (`not_found_handling = "single-page-application"`)
- [x] production environment values configured (bundled with publishable Supabase credentials)
- [x] PWA assets load (manifest.webmanifest, registerSW.js, sw.js precache registered)

## Browser Smoke

- [x] deployed mobile smoke (390x844: verified responsive login header, Google button)
- [x] deployed desktop smoke (1440x900: verified clean centered container layout)
- [x] deployed authenticated routes (verified dashboard greeting, navigation, project statistics)
- [x] deployed public routes (verified `/share/:token` and `/brief/:token` graceful error states)
- [x] console clean (0 uncaught exceptions)
- [x] network clean (Supabase REST/auth round-trips returning 200/204)

