# Lumina — Enterprise Readiness & Release Acceptance Contract

**Last inspected:** 2026-11-07. **Applies to:** source on [security draft PR #1](https://github.com/rzqllh/Lumina/pull/1) and findings in [documentation draft PR #2](https://github.com/rzqllh/Lumina/pull/2). **State:** NOT ENTERPRISE-ACCEPTED.

This is an evidence checklist, not an assertion of certification or that cloud controls exist. Preserve the single-project Supabase + React/Vite + Cloudflare architecture. All unapproved infrastructure, paid services, storage integrations and application behavior changes remain out of scope.

## Evidence and sign-off policy

- **CODE / REVIEW:** file and SHA inspected; does not establish application behavior.
- **CI PASS:** exact-head workflow job completed successfully. Frontend CI does not prove Postgres or Supabase REST behavior.
- **DB PASS:** the local database starts from a clean migrations set and `supabase test db` is green, including negative and cross-workspace cases.
- **STAGING ACCEPTED:** real HTTP/JWT calls by two independent disposable accounts, anon token holder, and unauthenticated attacker, each with explicit allow/deny assertions and sanitized log evidence.
- **OPERATIONAL ACCEPTED:** backup, restore, security response, monitoring, quota and deployment rollback are demonstrated against a non-production environment.
- **PRODUCTION APPROVED:** owner reviews live readiness evidence, costs, operations, legal/privacy policy and authorizes the specific deployment separately.

A `PATCH_DRAFT` or `PASS` at an earlier level never auto-promotes to a later gate.

## Release blockers and traceability

| ID | Area | Implementation in current drafts | Gate required before enterprise release |
| --- | --- | --- | --- |
| LUM-P0-01 | Brief-review cross-brief/cross-workspace authorization | Proposed `00024_secure_brief_submission_review.sql` and `13_brief_review_authorization.test.sql` | Local DB pgTAP plus actual cross-tenant HTTP/RPC negative cases; review authorized role policy and retry semantics |
| LUM-P0-02 | Inactive hosted Supabase | **BLOCKED**: Supabase console listed **Lumina INACTIVE** on 2026-11-07. No cloud DDL applied | Explicitly approved staging/restore or a separate authorized disposable project; migrations run and results archived |
| LUM-P0-03 | Live RLS and public-link isolation | Existing RLS source and pgTAP; not independently accepted | Two-user/two-workspace read, write, update, delete; anon link can only see allow-listed projection; JWT and expiry negative tests |
| LUM-P1-01 | Review decisions / idempotence | Partial patch in `00024`; no proof of idempotence of reviewed submissions or owner-only policy | Define decision rights and retry behavior, add negative DB cases and concurrency tests |
| LUM-P1-02 | Public status and intake links | Source has revocation/expiry and projections | Verify invalid/expired/revoked tokens, no internal data, no token in logs/referrers; test token rotation and user experience |
| LUM-P1-03 | Recovery, retention, RPO/RTO | **Not implemented or measured** | Owner chooses RPO, RTO, retention and cost ceiling; encrypted snapshots + signed restore drill; note external media is not in DB backup |
| LUM-P1-04/05 | Possible future R2 media uploads | **NOT IMPLEMENTED** and **NOT an active bug** | If approved, JWT/project authorization, short-lived scoped writes, object verification, quarantines, lifecycle/retention and service audit |
| LUM-P1-06 | Lifecycle and finance | UI/source and DOM/unit coverage exist | Staging e2e: DP→project→brief→sessions→revision→approval→payment→close; invoice/force-close negative paths |
| LUM-P1-07 | Public brief JSON validation | Proposed `00025_validate_public_brief_intake.sql` + `14_public_intake_validation.test.sql` and frontend filtering | DB pgTAP; real anon-token requests; review backwards compatibility of field types, required fields, size bounds, rate limiting and duplicate submission policy |
| LUM-P2-01 | Date-dependent payment test | Draft `PaymentsList.test.tsx` fake Date fix | Exact-head frontend CI green after test clock correction |
| LUM-P2-02/ P3-03 | Status docs and traceability | README rewritten in code PR; this contract added | Review source-to-test mappings and remove stale status claims before promotion |
| LUM-P2-03/ P3-04 | PWA / accessibility / mobile | Not yet physically accepted | Keyboard, VoiceOver/TalkBack, 320px/375px/tablet/desktop, offline/online retries, focus restoration, forms and error clarity |
| LUM-P2-04 | Observability / secret hygiene | No deployment proof | Review token/PII redaction, restricted log access, retention, alert routes, least privilege, CSP/CORS and runtime headers |
| LUM-P3-01/02 | Finance UX and previews | Backlog proposals | Explicit timezone/date rules and original-media preservation if media previews are approved |

## Reproducible source/CI verification

From a clean checkout on the approved source SHA:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
```

For a **disposable local database** with a Docker-compatible runtime (never `--linked` or production DB connection):

```sh
pnpm db:start
pnpm db:test
pnpm db:stop
```

A separate GitHub Actions workflow `.github/workflows/database-tests.yml` starts **only a local DB** for PRs that change migrations or DB tests. Read its **exact-head result**; a queued/missing/failed workflow is not a PASS. Supabase's official testing guidance uses CLI local DB and pgTAP; migration execution against a live hosted project is explicitly excluded from this action.

## Staging acceptance test matrix

| Identity | Expected allowed | Expected denied |
| --- | --- | --- |
| Workspace A owner | Read/update A project, review valid A submission | Access workspace B fields, approve values not submitted |
| Workspace B owner | Read/update B project | Any A project / finance / brief / file data |
| Authenticated nonmember | Own workspace only | All A/B private records and privileged RPCs |
| Anonymous bearer-link holder | Submit valid editable fields to matching unexpired token; view client-allowlisted status/brief | Internal-only/read-only submissions, foreign field IDs, oversized or malformed payloads, expired/revoked token use |
| Anonymous without valid token | None of A/B private resources | All data API tables and privileged operations |

For each row capture: SHA, target environment, auth context, timestamp, redacted request, expected response, observed response, defects and independent reviewer. Do not place raw access tokens, live customer records or exploit details in public issues/PRs.

## Operations contract (must be owned, not assumed)

| Operational control | Required decision / evidence | Status |
| --- | --- | --- |
| Backup and restore | Named owner, **RPO TBD**, **RTO TBD**, retention TBD, encryption, restore receipt and schedule | BLOCKED — not demonstrated |
| Secret lifecycle | Key inventory/rotation and minimal deploy scopes; never commit `service_role` or credentials | ACCEPTANCE_OPEN |
| Production CI/CD | Branch protections, at least one non-author review, required unit + DB checks, manual environment approval, rollback plan | OWNER_CONFIG_REQUIRED |
| Incident response | Sev definitions, contacts, audit/log retention, incident timeline and notification policy | OWNER_CONFIG_REQUIRED |
| External services | Supabase availability/cost, Cloudflare quota, potential Drive/OAuth connectivity and vendor exit strategy | ACCEPTANCE_OPEN |
| Privacy and data lifecycle | Client data access/export/deletion, retention, DPA/legal consent, incident reporting jurisdiction | OWNER_DECISION_REQUIRED |
| Browser/device acceptance | Chromium/WebKit and one physical mobile device for authenticated/public happy+negative flows | ACCEPTANCE_OPEN |
| Abuse resistance | Public-token submission throttling and duplicate/idempotency contract | PRODUCT_DECISION_REQUIRED |

## Safe deployment sequence

1. Review the final SQL/function signatures and frontend data contract against current master, record exact SHA.
2. Verify deterministic frontend CI and the local migration/pgTAP workflow. Fix or explicitly reject failing checks; never bypass them.
3. Request approval for **staging only**. Restore a scrubbed fixture or use a disposable project; never clone unredacted customers.
4. Apply migrations in order to staging; inspect `pg_proc.proacl`, RLS, security-definer boundaries and read/write cross-tenant tests.
5. Perform multi-account and bearer-link negative tests. Test duplicate/expired tokens, error redaction, and external quotas.
6. Independently review recovery, secrets, observability, access levels, mobile accessibility and Cloudflare deploy SHA.
7. Record reviewer sign-off and owner acceptance, then separately request production migration and deployment authorization.

**No automatic sign-off:** none of these tests, flags or checkboxes authorizes a production change. An observed blocker remains open regardless of source status.
