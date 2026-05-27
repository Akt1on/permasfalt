# Настройка и запуск — Пермь Асфальт 59

## Быстрый старт

### 1. Переменные окружения
Создайте `.env` в корне проекта:
```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhb...
```

### 2. Применить миграции Supabase
В Supabase Dashboard → SQL Editor выполните **в порядке**:
```
supabase/migrations/00000000000001_ultimate_schema.sql
supabase/migrations/20260524000003_admin_by_email.sql
supabase/migrations/20260526000001_fix_schema_final.sql   ← обязательно последней
```

Или через CLI:
```bash
supabase db push
```

### 3. Создать аккаунт администратора
1. Откройте `/auth` на своём сайте
2. Нажмите «Создать аккаунт»
3. Введите email: **permsite1@gmail.com** (именно этот, прописан в `is_admin()`)
4. Подтвердите email по письму от Supabase
5. Войдите → откроется `/admin`

> Если нужен другой email — выполните в Supabase SQL Editor:
> ```sql
> CREATE OR REPLACE FUNCTION public.is_admin()
> RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
>   SELECT (
>     public.has_role(auth.uid(), 'admin')
>     OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'ВАШ@EMAIL.RU')
>   )
> $$;
> ```

---

## Что умеет Админ-панель

| Раздел | Функции |
|--------|---------|
| **Дашборд** | Счётчики, последние заявки, быстрый доступ |
| **Услуги** | CRUD, сортировка ↑↓, вкл/выкл, SEO-поля (hero, includes, faq), прайс-позиции |
| **Портфолио** | CRUD проектов, фотогалерея к каждому, сортировка |
| **Отзывы** | CRUD с рейтингом, компанией, фото |
| **Блог** | Статьи с markdown, публикация/черновик |
| **Заявки** | Журнал лидов, фильтр по статусу, обновление статуса |
| **Настройки** | Контакты, hero-экран, раздел «О компании» |

---

## Загрузка фото

- Формат: JPG, PNG, WebP, GIF
- Максимальный размер: **10 МБ**
- Поддерживается drag-and-drop
- Файлы сохраняются в Supabase Storage bucket **`site-images`**

---

## Исправленные баги (история)

| Баг | Статус |
|-----|--------|
| `checkIsAdmin` читал пустую `user_roles` вместо `is_admin()` | ✅ Исправлен |
| Bucket `site-images` терял политику публичного чтения | ✅ Исправлен |
| `site_settings` — конфликт форматов `{id,data}` vs `{key,value}` | ✅ Исправлен |
| Телефон в `site.ts` не совпадал с телефонами по всему сайту | ✅ Исправлен |
| Цена «от 1500 ₽» в meta-тегах не совпадала с реальным прайсом | ✅ Исправлен |
| INSERT падал из-за передачи `id/created_at` в payload | ✅ Исправлен |
| `ImageUpload` не показывал причину ошибки | ✅ Исправлен |
| Нет полей `hero`, `includes`, `faq` в форме услуги | ✅ Исправлен |
