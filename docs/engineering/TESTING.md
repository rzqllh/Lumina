# Lumina — Testing & Verification Strategy

**Status:** Draft

## 1. Verification principle

Tests must verify business invariants and security boundaries, not only component rendering.

## 2. Layers

### Unit
Use for:
- calculations
- state transition rules
- template snapshot logic
- validation
- date/money helpers

### Database
Use for:
- constraints
- RLS
- SQL functions
- finance views/functions
- snapshot/history invariants

For Supabase/Postgres, consider pgTAP for database-level testing.

### Component
Use for:
- brief field renderer
- forms
- complex project cards
- revision/payment interactions

### Integration
Use for:
- create project from template
- client brief submission/review
- force close
- Google integration boundaries with mocked provider

### E2E
Critical journeys:
1. login
2. create client/project from template
3. edit generated project workflow
4. record payment + expense
5. create deliverable and revision
6. open client share
7. submit client brief
8. review changes
9. close/force-close project

## 3. Security regression tests

Must prove:
- user cannot read another workspace
- public share cannot access internal fields
- revoked share token fails
- expired share token fails
- anonymous client cannot mutate project directly
- service role/secrets absent from client bundle
- RLS is enabled where expected

## 4. UI state testing

For high-value screens:
- loading
- empty
- error
- success
- offline
- permission denial
- slow network

## 5. Device/browser matrix

MVP priority:
- Android Chrome/PWA
- desktop Chrome
- one additional Chromium/Firefox/Safari target as chosen

Real-device Android testing is required before declaring installable/PWA UX complete.

## 6. Completion evidence

Every feature verification record should include:
- requirement IDs covered
- automated commands
- test output
- manual checks
- screenshots where useful
- unresolved limitations

## 7. Definition of done

A feature is not done because the UI exists.

Required:
- accepted requirements satisfied
- design states handled
- data/security rules enforced
- tests pass
- build succeeds
- durable docs updated if truth changed
- verification evidence recorded
