# Architectural Decision Records (ADRs)

This directory contains durable architectural decision records for Lumina following the MADR format.

---

## Index of Architectural Decisions

| ADR Number | Title | Status | Date |
|---|---|---|---|
| [`0001`](file:///c:/Users/Hafizh%20Rizqullah/Documents/Code/Lumina/docs/decisions/0001-pwa-first-over-native-first.md) | PWA-First Architecture for Mobile & Desktop | **Accepted** | 2026-08-14 |
| [`0002`](file:///c:/Users/Hafizh%20Rizqullah/Documents/Code/Lumina/docs/decisions/0002-use-supabase-postgresql.md) | Use Supabase and PostgreSQL as Backend Platform | **Accepted** | 2026-08-14 |
| [`0003`](file:///c:/Users/Hafizh%20Rizqullah/Documents/Code/Lumina/docs/decisions/0003-workspace-boundary-from-day-one.md) | Workspace Tenancy Boundary from Day One | **Accepted** | 2026-08-14 |
| [`0004`](file:///c:/Users/Hafizh%20Rizqullah/Documents/Code/Lumina/docs/decisions/0004-snapshot-packages-and-templates.md) | Historical Snapshot Semantics for Packages & Templates | **Accepted** | 2026-08-14 |
| [`0005`](file:///c:/Users/Hafizh%20Rizqullah/Documents/Code/Lumina/docs/decisions/0005-large-media-remains-external.md) | Large Production Media Stored Externally | **Accepted** | 2026-08-14 |
| [`0006`](file:///c:/Users/Hafizh%20Rizqullah/Documents/Code/Lumina/docs/decisions/0006-tokenized-public-client-projection.md) | Tokenized Public Client Access via Server Projection | **Accepted** | 2026-08-14 |
| [`0007`](file:///c:/Users/Hafizh%20Rizqullah/Documents/Code/Lumina/docs/decisions/0007-google-calendar-sync-direction.md) | Google Calendar Sync Direction & Conflict Detection | **Accepted** | 2026-08-14 |

---

## Guidelines for Adding ADRs

1. Copy `_template.md` to `NNNN-short-title.md`.
2. Document context, drivers, considered options with honest trade-offs, and decision outcome.
3. Keep ADRs durable: update status to `Superseded` or `Deprecated` when an architectural decision is replaced.
