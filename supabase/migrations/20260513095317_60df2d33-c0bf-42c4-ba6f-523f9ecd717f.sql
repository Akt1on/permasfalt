
-- Create admin user if not exists
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@permasfalt59.ru';
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'admin@permasfalt59.ru', crypt('arsen.admin0', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_id, format('{"sub":"%s","email":"%s"}', admin_id, 'admin@permasfalt59.ru')::jsonb, 'email', admin_id::text, now(), now(), now());
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text,
  content text NOT NULL,
  rating int NOT NULL DEFAULT 5,
  photo_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads active reviews" ON public.reviews
  FOR SELECT USING (is_active OR has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage reviews" ON public.reviews
  FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_reviews_touch BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.reviews (author_name, author_role, content, rating, sort_order) VALUES
  ('Алексей В.', 'Директор ТЦ "Колизей"', 'Заасфальтировали парковку 4000 м² за 5 дней. Качество отличное, второй год без единой трещины. Рекомендую.', 5, 1),
  ('Мария С.', 'Управляющая ЖК "Центральный"', 'Уложили тротуарную плитку во дворе — красиво и аккуратно. Бригада работала профессионально, убрали за собой.', 5, 2),
  ('Игорь П.', 'Главный инженер', 'Делали подъездные пути к складу. Сделали в срок, цена не изменилась после подписания договора. Молодцы.', 5, 3);
