# Lumina — Security & Privacy Specification

**Status:** Draft

## 1. Assets to protect

- owner account/session
- client personal/contact data
- project details
- internal briefs/notes/tasks
- financial data
- collaborator fees
- external file references
- Google OAuth credentials/tokens
- public share tokens

## 2. Security model

### Authentication
Define:
- provider(s)
- session behavior
- logout/revocation
- account recovery

### Authorization
- workspace-scoped owner access
- RLS for exposed tables
- server-side checks for privileged operations
- no authorization based solely on route/UI state

### Public links
- high-entropy token
- store hash where feasible
- revocable
- optional expiry
- allow-list public fields
- protect against ID enumeration
- rate limiting where appropriate

### Client brief submission
Treat input as untrusted.
- validate schema
- size limits
- file restrictions
- rate limiting
- owner review before canonical project mutation

## 3. Secrets

Never ship to client:
- Supabase service role key
- OAuth client secret where confidential
- Google refresh token
- private signing secrets

Document approved secret store and rotation approach.

## 4. OAuth

For Google integrations:
- request minimum required scope
- keep token lifecycle server-side
- handle revoked consent
- handle token expiry/refresh failure
- make disconnect behavior explicit

## 5. Storage

Define:
- allowed MIME types
- max attachment size
- public/private buckets
- signed URL policy
- RLS/storage policies
- malware/unsafe content handling expectations if public upload is enabled

Large production media remains external by default.

## 6. Threat model

Perform a focused STRIDE-style review for:
- public project links
- client brief forms
- Google OAuth
- file upload
- payment/expense mutations
- force close

| Threat | Surface | Impact | Mitigation | Test |
|---|---|---|---|---|
| ID enumeration | public share | private data leak | opaque token + projection | |
| workspace leak | DB query | cross-user data leak | RLS | |
| token theft | Google integration | Drive/Calendar access | secure token storage | |

## 7. Audit events

Candidate events:
- public link created/revoked
- client brief submitted
- brief changes accepted
- force-close
- payment deleted/edited
- Google integration connected/disconnected

## 8. Data retention/deletion

Define:
- project deletion vs archive
- account deletion
- attachment cleanup
- OAuth token revocation
- public-link invalidation
- backup implications
