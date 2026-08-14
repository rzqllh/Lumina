# Lumina — API / Server Contracts

**Status:** Draft

Use this document for operations that cross a server boundary, Edge Function, RPC, or external integration.

Simple RLS-protected owner CRUD does not need fake REST endpoint documentation unless a custom server contract exists.

## Contract template

### `OPERATION_NAME`

**Purpose:**  
**Caller:** owner / public client / system  
**Auth:**  
**Idempotency:** required / not required  
**Rate limit:**  
**Input:**

```json
{}
```

**Output:**

```json
{}
```

**Errors:**

| Code | Meaning | User action |
|---|---|---|
| `VALIDATION_ERROR` | | |
| `UNAUTHORIZED` | | |
| `FORBIDDEN` | | |
| `CONFLICT` | | |
| `PROVIDER_ERROR` | | |

**Data mutations:**  
**Audit/logging:**  
**Security notes:**  
**Tests:**  

---

## Candidate privileged/public operations

- resolve client project share
- submit client brief
- review/apply brief submission
- generate/revoke public share link
- Google OAuth callback
- Google Drive picker/metadata operation
- Google Calendar sync
- force-close project
