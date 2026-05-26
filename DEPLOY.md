# Деплой Пермь Асфальт 59 на Vercel

## Быстрый старт

### 1. Переменные окружения (обязательно до деплоя)

В Vercel Dashboard → Settings → Environment Variables добавить:

| Переменная | Где взять |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API → anon public |
| `VITE_SUPABASE_URL` | то же самое |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | то же самое |
| `VITE_SUPABASE_PROJECT_ID` | id проекта из URL Supabase |
| `TELEGRAM_BOT_TOKEN` | опционально — от @BotFather |
| `TELEGRAM_CHAT_ID` | опционально — id чата для заявок |

> ⚠️ Файл `.env` уже в `.gitignore` — он не попадёт в репозиторий.

### 2. База данных Supabase

```bash
# Применить миграции (если используете Supabase CLI)
supabase db push

# Или вручную в SQL Editor Supabase — выполнить файлы из supabase/migrations/ по порядку
```

### 3. Деплой

```bash
# Vercel CLI
vercel --prod

# или через GitHub: подключить репозиторий в Vercel Dashboard
# Build Command: bun run build
# Output Directory: dist/client
# Install Command: bun install --ignore-scripts
```

### 4. Настройки Supabase RLS

Убедитесь, что настроены Row Level Security политики:
- `leads` — INSERT для anon (публичная форма), SELECT только для authenticated
- `services`, `projects`, `posts`, `reviews`, `site_settings` — SELECT для anon, все операции для authenticated

### 5. Проверка после деплоя

- [ ] `https://permasfalt59.ru/sitemap.xml` — открывается, нет `X-Robots-Tag: noindex`
- [ ] `https://permasfalt59.ru/robots.txt` — корректно
- [ ] Форма заявки — отправляет лид в Supabase
- [ ] Telegram — приходит уведомление о заявке
- [ ] OG-карточка в соцсетях — проверить через https://cards-dev.twitter.com/validator
- [ ] Google Search Console — подать sitemap
- [ ] Яндекс.Вебмастер — подать sitemap

## Структура проекта

```
src/
  routes/          — страницы (TanStack Router)
  components/site/ — компоненты сайта
  components/admin/— компоненты админки
  integrations/    — Supabase клиент
  lib/             — утилиты и данные
api/               — Vercel serverless functions
supabase/          — миграции БД
public/            — статичные файлы
```

## Производительность

- Hero-изображение (`hero-asphalt.jpg`) — рекомендуется конвертировать в WebP для экономии ~60% размера
- Все изображения используют `loading="lazy"` кроме hero (`loading="eager"`)
- Vercel автоматически применяет Brotli-сжатие и CDN-кэширование
