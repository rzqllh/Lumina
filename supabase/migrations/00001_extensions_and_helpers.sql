-- Migration 00001: Extensions and Security Definer Helpers
-- Lumina Database Schema Baseline

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to verify workspace membership for authenticated users
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
