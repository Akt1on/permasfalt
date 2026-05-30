# Деплой Пермь Асфальт 59

## ⚡ Быстрый старт (5 минут)

### 1. Переменные окружения

Создайте в Vercel Dashboard → Settings → Environment Variables:

| Переменная | Где взять | Обязательно |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API → anon public | ✅ |
| `SUPABASE_URL` | то же самое (для SSR/API routes) | ✅ |
| `SUPABASE_PUBLISHABLE_KEY` | то же самое | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Service role key (секретный!) | ✅ для admin API |
| `VITE_SUPABASE_PROJECT_ID` | ID проекта из URL Supabase | ✅ |
| `TELEGRAM_BOT_TOKEN` | от @BotFather | опционально |
| `TELEGRAM_CHAT_ID` | ID чата/группы для уведомлений | опционально |
| `ALLOWED_ORIGIN` | `https://permasfalt59.ru` | рекомендуется |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` используется только в серверных API-функциях (api/_lib/supabase-admin.ts).
> Никогда не используйте его на клиенте — он даёт полный доступ к БД без RLS.

> ⚠️ `.env` файл добавлен в `.gitignore` — **никогда не коммитьте реальные токены**.

### 2. База данных Supabase

```bash
# Способ 1: Supabase CLI (рекомендуется)
supabase login
supabase link --project-ref <your-project-id>
supabase db push

# Способ 2: вручную в SQL Editor Supabase
# Выполните файлы из supabase/migrations/ в хронологическом порядке
```

### 3. RLS политики (обязательно!)

В Supabase → Authentication → Policies убедитесь:

```sql
-- leads: анонимы могут вставлять, видеть только администратор
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert leads" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admins can select leads" ON leads FOR SELECT TO authenticated USING (is_admin());

-- site_settings, services, projects, posts, reviews: публичное чтение
-- (уже настроено в миграциях)
```

### 4. Деплой

```bash
# Vercel CLI
npx vercel --prod

# Или через GitHub:
# Build Command:   bun run build
# Output Dir:      dist/client
# Install Command: bun install --ignore-scripts
```

### 5. Настройка администратора

1. Перейдите на `https://permasfalt59.ru/auth`
2. Войдите под вашим e-mail (созданным в Supabase Auth)
3. В Supabase → SQL Editor выполните:

```sql
-- Назначить роль admin по email
SELECT grant_admin_by_email('your@email.com');
-- Функция определена в миграции 20260524000003_admin_by_email.sql
```

### 6. Чеклист после деплоя

- [ ] `/sitemap.xml` — открывается, все URL правильные
- [ ] `/robots.txt` — содержит `Sitemap: https://...`
- [ ] Форма обратной связи на главной — отправка работает
- [ ] Telegram-бот получает уведомления
- [ ] `/admin` — вход работает, редирект для non-admin
- [ ] Все услуги отображаются в `/services`
- [ ] Google Search Console — добавить сайт и проверить индексацию
- [ ] Яндекс Вебмастер — добавить сайт, обновить verification code в `__root.tsx`

---

## Архитектура

```
┌─────────────────────────────────────────┐
│  Vercel (SPA prerender + Edge Functions) │
│                                          │
│  dist/client/        ← статика (CDN)     │
│  api/                ← Serverless        │
│    leads.ts          ← POST /api/leads   │
│    notify-lead.ts    ← Telegram          │
│    sitemap.ts        ← GET /sitemap.xml  │
│    admin/            ← защищённые API    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Supabase                                │
│  - services, projects, posts, reviews    │
│  - leads (входящие заявки)              │
│  - site_settings (настройки сайта)       │
│  - Storage: site-images                 │
│  - Auth: admin panel access             │
└─────────────────────────────────────────┘
```

## Стек

- **Frontend**: React 19 + TanStack Router + Tailwind CSS 4 + Framer Motion
- **Backend**: Vercel Serverless Functions (TypeScript)
- **Database**: Supabase (PostgreSQL + RLS + Storage)
- **Deploy**: Vercel (SPA prerender для SEO)
- **Уведомления**: Telegram Bot API
