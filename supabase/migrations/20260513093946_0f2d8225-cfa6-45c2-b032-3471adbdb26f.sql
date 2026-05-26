
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  price_from NUMERIC,
  price_unit TEXT DEFAULT 'м²',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active services" ON public.services FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Pricing items (per service)
CREATE TABLE public.pricing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'м²',
  price NUMERIC NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads pricing" ON public.pricing_items FOR SELECT USING (true);
CREATE POLICY "admins manage pricing" ON public.pricing_items FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Projects (portfolio)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  cover_image TEXT,
  location TEXT,
  completed_at DATE,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active projects" ON public.projects FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Project photos
CREATE TABLE public.project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads project photos" ON public.project_photos FOR SELECT USING (true);
CREATE POLICY "admins manage photos" ON public.project_photos FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  service TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone creates leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read leads" ON public.leads FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update leads" ON public.leads FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete leads" ON public.leads FOR DELETE USING (public.has_role(auth.uid(),'admin'));

-- Site settings (key-value)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER t_services_upd BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_projects_upd BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_settings_upd BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images','site-images', true) ON CONFLICT DO NOTHING;
CREATE POLICY "public read site-images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "admins upload site-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update site-images" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete site-images" ON storage.objects FOR DELETE USING (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));

-- Seed services
INSERT INTO public.services (slug, title, short_description, description, icon, price_from, price_unit, sort_order) VALUES
('asfaltirovanie','Асфальтирование','Асфальтирование дорог, дворов и территорий любой площади','Полный цикл работ: подготовка основания, укладка щебня, утрамбовка, укладка асфальта. Гарантия 3 года.','Road',1500,'м²',1),
('ukladka-plitki','Укладка тротуарной плитки','Профессиональная укладка тротуарной плитки','Качественная укладка плитки с подготовкой основания и установкой бордюров.','LayoutGrid',1200,'м²',2),
('demontazh','Демонтаж зданий и сооружений','Снос зданий и вывоз строительного мусора','Безопасный демонтаж объектов любой сложности с последующим вывозом мусора.','Hammer',800,'м³',3),
('zemlyanye-raboty','Земляные работы','Все виды земляных работ','Копка котлованов, траншей, планировка участков спецтехникой.','Shovel',500,'м³',4),
('nerudnye-materialy','Доставка нерудных материалов','Песок, щебень, ПГС с доставкой','Доставка нерудных материалов любого объёма. Собственный автопарк.','Truck',900,'м³',5),
('arenda-spectexniki','Аренда спецтехники','Экскаваторы, самосвалы, катки','Современная техника с опытными операторами по часам или сменам.','Construction',2500,'час',6),
('vyvoz-snega','Уборка и вывоз снега','Механизированная уборка снега','Очистка территорий от снега и наледи, вывоз самосвалами.','Snowflake',150,'м³',7),
('vyvoz-musora','Вывоз строительного мусора','Контейнеры и самосвалы','Оперативный вывоз строительного и крупногабаритного мусора.','Trash2',7000,'рейс',8),
('kronirovanie','Кронирование деревьев','Спил и обрезка деревьев','Безопасное кронирование и удаление деревьев в труднодоступных местах.','TreePine',2000,'шт',9);

-- Seed settings
INSERT INTO public.site_settings (key, value) VALUES
('contacts', '{"phone":"+7 (342) 277-77-10","phone2":"+7 999 126 30 70","email":"info@permasfalt59.ru","address":"г. Пермь, Шоссе Космонавтов, 328Л","work_hours":"Круглосуточно, без выходных","whatsapp":"+79991263070","telegram":"@permasfalt59"}'::jsonb),
('hero', '{"title":"Пермь Асфальт 59","subtitle":"Асфальтирование, благоустройство и спецтехника в Перми и Пермском крае","badge":"Работаем с 2010 года • Гарантия 3 года"}'::jsonb),
('about', '{"title":"О компании","text":"Мы — команда профессионалов с 2010 года. Выполняем полный комплекс работ по благоустройству территорий: от асфальтирования и укладки плитки до демонтажа зданий и вывоза снега. Собственный автопарк, опытные операторы и гарантия качества на все работы.","stats":[{"label":"Лет на рынке","value":"15+"},{"label":"Объектов сдано","value":"500+"},{"label":"м² уложено","value":"250 000+"},{"label":"Гарантия","value":"3 года"}]}'::jsonb);
