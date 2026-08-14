-- Migration 00001: Extensions and Security Definer Helpers
-- Lumina Database Schema Baseline

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to verify workspace membership for authenticated users
-- Hardened with explicit empty search_path and fully-qualified schema names
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id
          AND user_id = (SELECT auth.uid())
    );
END;
$$;

-- Restrict execution: only authenticated users can invoke membership helper
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(UUID) TO authenticated;
