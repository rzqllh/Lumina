-- Migration 00013: Client Contacts Workspace Index
-- Optimizes workspace client contact queries and joined lookups

CREATE INDEX IF NOT EXISTS idx_client_contacts_workspace_client
ON public.client_contacts(workspace_id, client_id);
