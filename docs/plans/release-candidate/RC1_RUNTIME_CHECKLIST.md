# Lumina — RC1 External Runtime Checklist

This checklist tracks the exact external runtime prerequisites and execution gates required to advance Lumina from `RC1_VALIDATION_BLOCKED` to `RC1_READY_FOR_PRIVATE_USE`.

---

## Security prerequisites

- [x] service-role credential rotated (CONFIRMED_BY_OPERATOR)
- [x] repository secret audit clean
- [x] frontend environment contains public credentials only

## Auth prerequisites

- [x] Google OAuth client configured (Operator configured)
- [x] Supabase Google provider configured (Operator configured)
- [ ] production/development redirect URI verified (pending live interactive round-trip)

## Database

- [x] runtime target identified (`veljyxvrsyptarfgunan` / Southeast Asia)
- [x] migration history inspected (00001–00022 unapplied on remote)
- [ ] migrations 00001-latest execute successfully (`supabase db push`)
- [ ] pgTAP executes
- [ ] pgTAP passes

## RLS

- [ ] anonymous private-table denial
- [ ] Workspace A own-row access
- [ ] Workspace A → Workspace B denial
- [ ] public status token projection
- [ ] public Brief token projection
- [ ] cross-purpose token denial

## RPCs

- [ ] bootstrap_personal_workspace
- [ ] duplicate_package
- [ ] apply_workflow_template_to_project
- [ ] create_deliverable_revision
- [ ] close_project
- [ ] force_close_project
- [ ] reopen_project
- [ ] public Brief RPCs
- [ ] public Project Status RPCs

## Deployment

- [ ] Cloudflare target authenticated
- [ ] frontend deployed
- [ ] SPA nested-route refresh works
- [ ] production environment values configured
- [ ] PWA assets load

## Browser

- [ ] deployed mobile smoke
- [ ] deployed desktop smoke
- [ ] deployed authenticated routes
- [ ] deployed public routes
- [ ] console clean
- [ ] network clean
