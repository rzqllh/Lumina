# Lumina — External Integrations

**Status:** Draft

## Integration template

### Provider / Capability

**Product value:**  
**MVP status:**  
**Authentication:**  
**Scopes/permissions:**  
**Data read:**  
**Data written:**  
**Canonical source:** Lumina / provider / hybrid  
**Sync direction:**  
**Conflict behavior:**  
**Rate-limit behavior:**  
**Offline behavior:**  
**Revoked-auth behavior:**  
**Security boundary:**  
**User-visible error states:**  
**Test strategy:**  

---

## Google Drive

### Intended role
Large media remains in the user's Drive.

Lumina stores project-associated references/metadata.

Candidate capabilities:
- connect Google account
- use Picker to select file/folder
- store external ID + name + link + provider metadata
- associate link with project/deliverable/file slot
- open in Drive

Do not assume embedded Drive viewing is the canonical experience until tested.

### Open questions
- exact OAuth scopes
- folder creation in MVP?
- thumbnail handling
- shared-drive support?
- what happens when file permissions change?

---

## Google Calendar

### Intended role
Lumina remains the project production calendar.

Candidate synced event types:
- shoots/sessions
- meetings
- delivery deadlines
- revision deadlines
- payment due dates if useful

Initial direction:
- Lumina → dedicated Google Calendar
- read Google free/busy for conflict warning
- avoid importing all personal events into Lumina

### Open questions
- event ownership/canonical source
- deletion behavior
- timezone model
- recurrence support
- sync retry/idempotency

---

## Supabase Storage

Use for application-scale assets:
- avatar
- project cover
- brief attachment
- receipts
- small reference assets

Do not use as the default RAW/video archive.
