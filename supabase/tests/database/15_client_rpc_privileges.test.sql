BEGIN;
SELECT plan(16);

-- Test actual function EXECUTE grants rather than trusting code comments.
SELECT ok(NOT has_function_privilege('anon', 'public.apply_brief_template(uuid,uuid)', 'EXECUTE'),
 'Anonymous user cannot apply brief templates');
SELECT ok(has_function_privilege('authenticated', 'public.apply_brief_template(uuid,uuid)', 'EXECUTE'),
 'Authenticated users may invoke template RPC (function enforces membership)');

SELECT ok(NOT has_function_privilege('anon', 'public.generate_brief_share_link(uuid)', 'EXECUTE'),
 'Anonymous user cannot create brief links');
SELECT ok(has_function_privilege('authenticated', 'public.generate_brief_share_link(uuid)', 'EXECUTE'),
 'Authenticated users may invoke brief-link RPC');

SELECT ok(NOT has_function_privilege('anon', 'public.apply_brief_submission_review(uuid,jsonb)', 'EXECUTE'),
 'Anonymous user cannot review any brief submission');
SELECT ok(has_function_privilege('authenticated', 'public.apply_brief_submission_review(uuid,jsonb)', 'EXECUTE'),
 'Authenticated users may invoke scoped review RPC');

SELECT ok(NOT has_function_privilege('anon', 'public.generate_project_status_share_link(uuid)', 'EXECUTE'),
 'Anonymous user cannot create status links');
SELECT ok(has_function_privilege('authenticated', 'public.generate_project_status_share_link(uuid)', 'EXECUTE'),
 'Authenticated users may invoke status-link creation');

SELECT ok(NOT has_function_privilege('anon', 'public.revoke_project_share_link(uuid)', 'EXECUTE'),
 'Anonymous user cannot revoke links');
SELECT ok(has_function_privilege('authenticated', 'public.revoke_project_share_link(uuid)', 'EXECUTE'),
 'Authenticated users may invoke revoke RPC');

SELECT ok(has_function_privilege('anon', 'public.get_public_brief_intake(text)', 'EXECUTE'),
 'Anonymous bearer token may view allowed brief projection');
SELECT ok(has_function_privilege('anon', 'public.submit_public_brief(text,jsonb)', 'EXECUTE'),
 'Anonymous bearer token may submit a validated brief');
SELECT ok(has_function_privilege('anon', 'public.get_public_project_status(text)', 'EXECUTE'),
 'Anonymous bearer token may view allowed status projection');

-- PUBLIC is a pseudo-role (ACL grantee OID 0), not a named role.
SELECT ok(NOT EXISTS (
 SELECT 1
 FROM pg_proc AS p
 CROSS JOIN LATERAL aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) AS acl
 WHERE p.oid = 'public.is_workspace_member(uuid)'::regprocedure
   AND acl.grantee = 0
   AND acl.privilege_type = 'EXECUTE'
), 'PUBLIC must not execute workspace membership helper');
SELECT ok(NOT has_function_privilege('anon', 'public.is_workspace_member(uuid)', 'EXECUTE'),
 'Anonymous user must not invoke membership helper');
SELECT ok(has_function_privilege('authenticated', 'public.is_workspace_member(uuid)', 'EXECUTE'),
 'Authenticated users may invoke workspace membership helper');

SELECT * FROM finish();
ROLLBACK;
