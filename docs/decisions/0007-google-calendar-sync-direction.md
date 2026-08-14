# ADR-0007: Google Calendar Sync Direction and Conflict Detection

- **Status:** Accepted
- **Date:** 2026-08-14
- **Decision owners:** Lumina Core Architecture

## Context and problem statement

Solo creators manage client shoots, meetings, and deadlines in Lumina while frequently checking their primary Google Calendar on mobile devices for daily scheduling. We must define the calendar integration model: whether sync is bidirectional (two-way multi-master), outbound-only, or inbound-only, and how schedule conflicts are detected.

## Decision drivers

- **Single Source of Truth:** Lumina is the canonical production calendar for client gigs.
- **Avoid Synchronization Race Conditions:** Two-way calendar sync often results in duplicate events, deleted notes, and conflicting timestamps.
- **Privacy & Simplicity:** Avoid importing personal doctor appointments or family events into Lumina’s business database.

## Considered options

1. **Option A (Outbound Sync to Dedicated Secondary Calendar + Free/Busy Conflict Check) — Selected**
2. **Option B (Full Bidirectional Two-Way Mirroring with Primary Calendar)**
3. **Option C (Manual ICS / iCal Subscription Feed Export)**

## Decision outcome

Chosen: **Option A (Outbound Sync to Dedicated Calendar + Free/Busy Conflict Check)**.
- **Dedicated Project Calendar:** Lumina creates and manages a dedicated secondary Google Calendar (e.g. `"Lumina Projects"`).
- **Outbound Event Sync:** Sessions (shoots, meetings, event days) created in Lumina are pushed directly to this calendar via the Google Calendar API.
- **Idempotency:** The Google Event ID is stored in `sessions.google_calendar_event_id` to handle updates and cancellations gracefully.
- **Free/Busy Conflict Check:** When scheduling in Lumina, an Edge Function queries Google's `freeBusy` endpoint across all the owner's calendars and displays an inline collision warning if a conflict exists.

### Positive consequences
- Lumina remains the undisputed single source of truth for project dates and session locations.
- Zero clutter: personal events stay in Google Calendar and are never copied into Lumina's database.
- Conflict detection alerts the owner before booking double gigs.

### Negative consequences / trade-offs
- Edits made directly in Google Calendar do not flow backward into Lumina (the owner must edit sessions within Lumina).

## Rejected alternatives

### Option B: Bidirectional Two-Way Mirroring
- *Why rejected:* High synchronization fragility, complex conflict-resolution state machines, and risks polluting business data with private personal calendar entries.

## Confirmation

Verified by confirming `INTEGRATIONS.md` §3 and checking that `sessions` table includes `google_calendar_event_id`.

## Follow-up / revisit trigger

None for MVP.
