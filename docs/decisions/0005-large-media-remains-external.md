# ADR-0005: Large Production Media Stored Externally

- **Status:** Accepted
- **Date:** 2026-08-14
- **Decision owners:** Lumina Core Architecture

## Context and problem statement

Professional photography and videography generate massive amounts of unstructured binary data (hundreds of gigabytes of RAW camera files, multi-gigabyte 4K ProRes video files, and high-resolution JPEG delivery archives). Storing, buffering, or streaming this media directly through application servers or Supabase Storage would rapidly exceed free-tier quotas and require high cloud infrastructure costs.

## Decision drivers

- **Cost Containment:** Avoid multi-terabyte cloud storage egress and hosting bills.
- **Workflow Fit:** Photographers already have established cloud storage solutions (primarily Google Drive / Google Workspace).
- **Core Value Focus:** Lumina is a project operating system, not a media processing pipeline or generic Digital Asset Management (DAM) platform.

## Considered options

1. **Option A (External Cloud Media References via Google Drive API & Picker) — Selected**
2. **Option B (Direct Media Hosting on S3 / Supabase Storage with Upload Pipelines)**
3. **Option C (Custom Self-Hosted MinIO Media Server)**

## Decision outcome

Chosen: **Option A (External Media References)**. Large production assets remain stored in the user's existing external Google Drive. Lumina uses the Google Picker API to select files or folders and stores only metadata references (`file_references` table: `provider`, `display_name`, `url_or_path`, `mime_type`, `size_bytes`). Supabase Storage is strictly reserved for small application assets (avatars, expense receipts, brief PDF attachments).

### Positive consequences
- Zero media bandwidth or storage costs incurred by Lumina backend.
- Leverages Google Drive’s native file syncing, desktop streaming, and permissions.
- Photographers maintain complete ownership and physical custody of their RAW assets.

### Negative consequences / trade-offs
- Lumina cannot generate custom server-side thumbnails for RAW camera formats (e.g. `.ARW`, `.CR3`).
- File sharing permissions (e.g. making deliverable folders public) depend on Google Drive access settings.

## Rejected alternatives

### Option B: Direct S3 / Supabase Media Hosting
- *Why rejected:* Costs hundreds of dollars monthly in storage and egress for solo operators, duplicating functionality that Google Drive already provides at fixed costs.

## Confirmation

Verified by confirming `INV-009` in `DOMAIN_MODEL.md` and verifying that `file_references` stores metadata URLs rather than raw byte buffers.

## Follow-up / revisit trigger

Revisit if client proofing gallery features (e.g. lightweight compressed JPEG web galleries with favorites selection) are prioritized in a post-MVP roadmap.
