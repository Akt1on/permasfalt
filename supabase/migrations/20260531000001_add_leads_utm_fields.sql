-- Add UTM tracking and Telegram notification flag to leads table
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS telegram_sent BOOLEAN NOT NULL DEFAULT FALSE;
