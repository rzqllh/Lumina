# Lumina — Security & Privacy Specification

**Status:** Technical Consensus / Pass B Locked
**Last updated:** 2026-08-14

This document defines the security architecture, Row Level Security (RLS) policies, public share link security, OAuth token protection, and threat mitigations for Lumina.

---

## 1. Assets & Data Classification

| Data Category | Classification | Protection Mechanism | Access Boundary |
|---|---|---|---|
| **Owner Credentials & Sessions** | High Confidential | Supabase Auth, bcrypt/Argon2, HttpOnly JWT | Browser ↔ Supabase Auth |
| **Financial Data (Revenue, Expenses, Margins)** | High Confidential | Strict PostgreSQL RLS, Workspace Isolation | Authenticated Owner Only |
| **Collaborator Agreed Fees & Payments** | High Confidential | Strict PostgreSQL RLS, Workspace Isolation | Authenticated Owner Only |
| **Google OAuth Refresh Tokens** | Secret / High Risk | Server-side AES-256 Encryption at Rest | Supabase Edge Boundary Only |
| **Client Rolodex & Contact Information** | Confidential | PostgreSQL RLS | Authenticated Owner Only |
| **Internal Briefs, Notes & Private Tasks** | Confidential | PostgreSQL RLS, Field-level Visibility Checks | Authenticated Owner Only |
| **Public Project Status & Public Files** | Public Allow-list | Tokenized Opaque URL Hash, Edge Function Projection | Anonymous Public via Token |
| **Client Brief Intake Submission** | Untrusted Input | Rate Limiting, Zod Validation, Immutable Queue | Edge Function Intake Route |

---

## 2. Authentication & Session Management

- **Authentication Provider:** Supabase Auth (GoTrue) utilizing standard JSON Web Tokens (JWT).
- **Session Lifespan:** Short-lived access tokens (1 hour) with automatic background refresh via secure refresh tokens.
- **Session Revocation:** Triggering logout invalidates the local session and revokes the active refresh token.

---

## 3. Authorization & Row Level Security (RLS) Model

Every business table in Lumina has Row Level Security (RLS) enabled. Direct access is granted only to authenticated users who are verified members of the parent workspace.

### 3.1 Workspace Security Definer Function
To avoid expensive repetitive subqueries in RLS policies, PostgreSQL evaluates membership via a cached security definer helper:

```sql
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### 3.2 Comprehensive Table RLS Policy Matrix

| Table Name | Authenticated Workspace Member Access | Anonymous / Public Client Access |
|---|---|---|
| `workspaces` | `SELECT, UPDATE` if member of workspace | **DENIED (ALL)** |
| `workspace_members` | `SELECT` if member of workspace | **DENIED (ALL)** |
| `clients` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `client_contacts` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `project_contacts` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `services` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `packages` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `package_items` | `ALL` if parent package in user's workspace | **DENIED (ALL)** |
| `project_services` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `projects` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `sessions` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `workflow_templates` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `workflow_template_stages` | `ALL` if parent template in user's workspace | **DENIED (ALL)** |
| `project_workflow_stages` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `tasks` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `brief_templates` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `brief_template_sections` | `ALL` if parent template in user's workspace | **DENIED (ALL)** |
| `brief_template_fields` | `ALL` if parent template in user's workspace | **DENIED (ALL)** |
| `briefs` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `brief_sections` | `ALL` if parent brief in user's workspace | **DENIED (ALL)** |
| `brief_fields` | `ALL` if parent brief in user's workspace | **DENIED (ALL)** |
| `brief_submissions` | `SELECT, UPDATE` if parent brief in workspace | **DENIED DIRECT (Insert via Edge Function)** |
| `brief_submission_reviews` | `ALL` if parent submission in workspace | **DENIED (ALL)** |
| `deliverables` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `revisions` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `payments` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `expenses` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `collaborators` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `collaborator_engagements`| `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `file_references` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED (ALL)** |
| `public_share_links` | `ALL` if `is_workspace_member(workspace_id)` | **DENIED DIRECT (Resolved via Edge Function)** |

---

## 4. Public Share Link Security & Data Projection (`INV-004`, `OD-004`)

Public links allow clients to inspect project progress or submit brief details without creating an account:

### 4.1 Token Generation, Storage & Cardinality
- Tokens are 256-bit cryptographically secure random base64url strings.
- **Never store plain tokens in the database.** Only the cryptographic hash `SHA-256(token)` is persisted in `public_share_links.token_hash`.
- **Cardinality & History:** A project can have historical revoked tokens preserved for audit, but at most one active token per `(project_id, purpose)` enforced via partial unique index.
- Tokens are revocable at any time by the owner (setting `is_active = FALSE` and `revoked_at = NOW()`).

### 4.2 Edge Projection Contract & Purpose Separation
Public requests are handled by dedicated Supabase Edge Functions:
1. **Status Page (`purpose = 'status_page'`):**
   - Edge Function `/public-project` verifies token hash and `purpose = 'status_page'`.
   - Returns explicit **allow-list projection**: project title, client display name, public workflow stages, public deliverable status, public file links.
   - Strictly omits: financial data, profit/margin, expenses, collaborator fees, private notes, internal tasks, private brief fields.
2. **Brief Intake (`purpose = 'brief_intake'`):**
   - Edge Function `/public-brief` verifies token hash and `purpose = 'brief_intake'`.
   - Returns brief sections and fillable fields (`visibility IN ('client_can_fill', 'client_must_fill', 'client_can_view')`).
   - `internal_only` fields and all project financial data are strictly excluded.

---

## 5. Client Brief Submission Protection (`INV-003`, `INV-012`)

1. **Untrusted Input Pipeline:** Public client forms submit to Edge Function `/submit-brief`.
2. **Schema & Rate Validation:** Payload is validated with Zod against the brief's field schema (type checks, length bounds). IP-based rate limiting (max 10 requests / hour / IP) prevents spam.
3. **Immutable Storage:** Valid submissions are inserted into `brief_submissions.submitted_values` as an immutable JSONB snapshot with `review_status = 'pending'`.
4. **Zero Silent Overwrites:** No canonical brief field values are modified during submission. Only the owner can review and apply accepted changes.

---

## 6. Google OAuth & Secret Management

- **Privileged Secrets:** `GOOGLE_CLIENT_SECRET`, `SERVICE_ROLE_KEY`, and encryption keys are stored exclusively in Supabase Edge Secrets.
- **Token Isolation:** Google OAuth refresh tokens are encrypted at rest using AES-256-GCM before storage in a private `oauth_credentials` table (accessible only to Edge service role).
- **No Client Exposure:** Refresh tokens and raw client secrets are never transmitted to the browser application.
- **Scope Minimization:** OAuth requests only the minimum required scopes:
  - Google Drive: `https://www.googleapis.com/auth/drive.file` (access only to files created or opened by Lumina).
  - Google Calendar: `https://www.googleapis.com/auth/calendar.events` (access only to Lumina-managed project events).

---

## 7. Storage Bucket Security

| Bucket Name | Visibility | Allowed MIME Types | Max Size | Access Policy |
|---|---|---|---|---|
| `avatars` | Public CDN | `image/jpeg`, `image/png`, `image/webp` | 2 MB | Owner CRUD, Public Read |
| `receipts` | Private | `image/jpeg`, `image/png`, `application/pdf` | 5 MB | Authenticated Workspace Members Only |
| `brief-attachments` | Private | Images, PDFs, Documents | 10 MB | Authenticated Workspace Members Only |
| `project-covers` | Public CDN | `image/jpeg`, `image/png`, `image/webp` | 5 MB | Owner CRUD, Public Read |

Large media (RAW photo shoots, 4K video exports) is strictly prohibited from app storage and routed to external Google Drive references (`INV-009`).
