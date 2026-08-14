-- Migration 00011: Audit Logs and OAuth Credentials
-- High-consequence audit logging and encrypted OAuth storage

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE oauth_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'google' CHECK (provider = 'google'),
    encrypted_refresh_token TEXT NOT NULL,
    access_token TEXT,
    access_token_expires_at TIMESTAMPTZ,
    google_calendar_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view audit logs"
ON audit_logs FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

-- OAuth credentials accessible only via Service Role (Edge functions)
CREATE INDEX idx_audit_logs_workspace_event ON audit_logs(workspace_id, event_type);
