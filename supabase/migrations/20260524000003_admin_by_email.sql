-- Replace has_role() check with email-based admin check.
-- Single-owner site: permsite1@gmail.com is the only admin.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND email = 'permsite1@gmail.com'
  )
$$;

-- Services
DROP POLICY IF EXISTS "admins manage services" ON public.services;
DROP POLICY IF EXISTS "public reads active services" ON public.services;
CREATE POLICY "public reads active services" ON public.services FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "admins manage services" ON public.services FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Pricing items
DROP POLICY IF EXISTS "admins manage pricing" ON public.pricing_items;
CREATE POLICY "admins manage pricing" ON public.pricing_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Projects
DROP POLICY IF EXISTS "admins manage projects" ON public.projects;
DROP POLICY IF EXISTS "public reads active projects" ON public.projects;
CREATE POLICY "public reads active projects" ON public.projects FOR SELECT USING (is_active OR public.is_admin());
CREATE POLICY "admins manage projects" ON public.projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Project photos
DROP POLICY IF EXISTS "admins manage photos" ON public.project_photos;
CREATE POLICY "admins manage photos" ON public.project_photos FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Leads
DROP POLICY IF EXISTS "admins read leads" ON public.leads;
DROP POLICY IF EXISTS "admins update leads" ON public.leads;
DROP POLICY IF EXISTS "admins delete leads" ON public.leads;
CREATE POLICY "admins read leads" ON public.leads FOR SELECT USING (public.is_admin());
CREATE POLICY "admins update leads" ON public.leads FOR UPDATE USING (public.is_admin());
CREATE POLICY "admins delete leads" ON public.leads FOR DELETE USING (public.is_admin());

-- Site settings
DROP POLICY IF EXISTS "admins manage settings" ON public.site_settings;
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage: site-images
DROP POLICY IF EXISTS "admins upload site-images" ON storage.objects;
DROP POLICY IF EXISTS "admins update site-images" ON storage.objects;
DROP POLICY IF EXISTS "admins delete site-images" ON storage.objects;
CREATE POLICY "admins upload site-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images' AND public.is_admin());
CREATE POLICY "admins update site-images" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images' AND public.is_admin());
CREATE POLICY "admins delete site-images" ON storage.objects FOR DELETE USING (bucket_id = 'site-images' AND public.is_admin());

-- Posts (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    DROP POLICY IF EXISTS "admins manage posts" ON public.posts;
    EXECUTE 'CREATE POLICY "admins manage posts" ON public.posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- Reviews (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    DROP POLICY IF EXISTS "admins manage reviews" ON public.reviews;
    EXECUTE 'CREATE POLICY "admins manage reviews" ON public.reviews FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())';
  END IF;
END $$;
