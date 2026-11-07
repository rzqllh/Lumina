-- 00026: Explicitly bound exposed SECURITY DEFINER RPC execution.
-- PostgreSQL grants EXECUTE to PUBLIC by default. Prior migrations only GRANTed
-- named roles; those GRANT statements did not revoke the implicit PUBLIC access.
-- Keep intentionally public bearer-token projections/submission callable by anon.
-- No live/linked DB execution is authorized by this source migration.

REVOKE ALL ON FUNCTION public.apply_brief_template(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_brief_template(UUID, UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.generate_brief_share_link(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_brief_share_link(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.apply_brief_submission_review(UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_brief_submission_review(UUID, JSONB) TO authenticated;

REVOKE ALL ON FUNCTION public.generate_project_status_share_link(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_project_status_share_link(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_project_share_link(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_project_share_link(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.get_public_brief_intake(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_brief_intake(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.submit_public_brief(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_public_brief(TEXT, JSONB) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.get_public_project_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_project_status(TEXT) TO anon, authenticated;
