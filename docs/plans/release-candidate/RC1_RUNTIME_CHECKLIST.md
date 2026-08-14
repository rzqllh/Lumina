# Lumina — RC1 External Runtime Checklist

This checklist tracks the exact external runtime prerequisites and execution gates required to advance Lumina from `RC1_VALIDATION_BLOCKED` to `RC1_READY_FOR_PRIVATE_USE`.

---

## Security prerequisites

- [ ] service-role credential rotated
- [ ] repository secret audit clean
- [ ] frontend environment contains public credentials only

## Auth prerequisites

- [ ] Google OAuth client configured
- [ ] Supabase Google provider configured
- [ ] production/development redirect URI verified

## Database

- [ ] runtime target identified
- [ ] migration history inspected
- [ ] migrations 00001-latest execute successfully
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
