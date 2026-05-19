-- Remove broad SELECT on storage.objects (files still served via public bucket URL)
DROP POLICY IF EXISTS "Public can read site-images" ON storage.objects;

-- Lock down has_role so only the policy engine can call it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;