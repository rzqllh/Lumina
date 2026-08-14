# Feature Technical Design — <Feature Name>

**Status:** Draft  
**Requirements:** `requirements.md`

## 1. Design summary

One concise paragraph describing the proposed implementation.

## 2. Constraints

- product constraints
- architecture constraints
- security constraints
- external provider constraints

## 3. Existing system impact

What existing modules/routes/tables/components are involved?

## 4. Proposed design

### UI / interaction

Reference mockups and `docs/design/DESIGN.md`.

Define:
- happy path
- loading
- empty
- error
- retry
- destructive action
- mobile behavior
- desktop behavior

### Domain logic

State transitions, calculations, invariants.

### Data model

Tables/columns/constraints/migrations changed.

### API/server boundary

Contracts or functions changed.

### Security

RLS/auth/public token implications.

### Integrations

Provider interaction, retries, idempotency, revoked auth.

## 5. Alternatives considered

At least meaningful alternatives, not invented strawmen.

| Option | Pros | Cons | Decision |
|---|---|---|---|
| A | | | |
| B | | | |

## 6. Failure modes

| Failure | Expected behavior | Recovery |
|---|---|---|
| network unavailable | | |
| stale data | | |
| provider error | | |

## 7. Migration / compatibility

How existing data/users are handled.

## 8. Testing strategy

Map requirements to tests.

## 9. Rollout / rollback

For risky features only.

## 10. Open design questions

Must be resolved before tasks are final.
