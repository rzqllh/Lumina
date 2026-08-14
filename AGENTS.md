# AGENTS.md — Lumina

This file contains durable repository-wide instructions for AI coding agents.

## 1. Read order

Before planning or modifying product behavior, read only the relevant canonical context:

1. `docs/product/PRD.md`
2. `docs/product/FEATURE_INVENTORY.md`
3. `docs/product/DOMAIN_MODEL.md`
4. `docs/product/WORKFLOWS.md`
5. `docs/design/DESIGN.md` for user-facing changes
6. `docs/engineering/ARCHITECTURE.md`
7. `docs/engineering/DATABASE_SCHEMA.md` for data changes
8. `docs/engineering/SECURITY.md` for auth/public/integration changes
9. Relevant ADRs
10. Relevant feature spec under `docs/specs/`

Do not load every document blindly when only a small subset is relevant.

## 2. Product guardrails

- Lumina is **not** an editing application.
- Lumina is a project-management operating system for a photographer/videographer.
- Primary user is currently one owner/operator.
- Architecture may remain future-team-safe, but do not introduce team-management complexity without an approved requirement.
- Large photo/video media belongs in external storage such as Google Drive, not Lumina application storage.
- Client-facing links are limited projections of project data; never expose internal project rows directly.
- Project templates are starting points, not locked workflows.
- Package/template changes must not silently mutate historical projects.
- Historical project values use snapshots.
- `Closed` normally requires client approval + full payment, but the owner may force-close with explicit confirmation and a recorded reason.

## 3. Change discipline

Before implementation:
- Inspect existing implementation and relevant specs.
- State assumptions where unresolved.
- Prefer the smallest change that satisfies the approved requirement.
- Do not introduce adjacent features or refactors without necessity.
- Do not silently change a durable business rule.

When a requirement conflicts with a canonical doc:
1. stop,
2. identify the conflict,
3. update/approve the canonical product decision first,
4. then implement.

## 4. Database discipline

- Schema changes must be represented as migrations.
- All exposed Supabase tables require appropriate RLS.
- Never rely on UI hiding as authorization.
- Prefer database constraints for invariants that the database can enforce.
- Document destructive migrations and rollback/forward-fix strategy.
- Do not store OAuth refresh tokens or privileged secrets in browser storage.
- Never expose service-role credentials to the client.

## 5. UI discipline

- Mobile-first.
- Desktop is supported, not treated as stretched mobile.
- Public/client surfaces must remain visually and permission-wise distinct from owner surfaces.
- Every asynchronous screen must define loading, empty, error, success, and retry behavior.
- Every destructive or irreversible action requires intentional confirmation.
- Avoid decorative complexity that weakens information hierarchy.

## 6. Verification

Do not claim completion without evidence.

For relevant changes, run:
- typecheck
- lint
- unit tests
- database/RLS tests where applicable
- integration tests where applicable
- focused E2E/smoke tests
- build

Report:
- files changed
- behavior changed
- commands run
- results
- unresolved risks

## 7. Documentation updates

Update durable docs only when their truth changed.

Do not rewrite large documentation sections just because implementation touched the area.

For a substantial feature:
- create/update `docs/specs/<feature>/requirements.md`
- create/update `design.md`
- execute from `tasks.md`
- record evidence in `verification.md`

For a consequential architectural decision, add an ADR.
