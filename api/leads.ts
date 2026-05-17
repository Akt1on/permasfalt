import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { supabaseAdmin } from "./_lib/supabase-admin";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(20).regex(/^[\d+\s()-]+$/),
  service: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  source: z.string().trim().max(100).optional().nullable(),
  utm_source: z.string().trim().max(100).optional().nullable(),
  utm_medium: z.string().trim().max(100).optional().nullable(),
  utm_campaign: z.string().trim().max(100).optional().nullable(),
});

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

async function sendTelegram(lead: z.infer<typeof leadSchema>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const text =
    `🔔 <b>Новая заявка — Пермь Асфальт 59</b>\n\n` +
    `👤 <b>Имя:</b> ${escapeHtml(lead.name)}\n` +
    `📞 <b>Телефон:</b> ${escapeHtml(lead.phone)}\n` +
    (lead.service ? `🛠 <b>Услуга:</b> ${escapeHtml(lead.service)}\n` : "") +
    (lead.message ? `💬 <b>Сообщение:</b> ${escapeHtml(lead.message)}\n` : "") +
    (lead.source ? `\n📍 Источник: ${escapeHtml(lead.source)}` : "");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return res.ok;
  } catch (e) {
    console.error("[telegram] send failed", e);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const data = parsed.data;

  const telegramSent = await sendTelegram(data);

  const { data: inserted, error } = await supabaseAdmin
    .from("leads")
    .insert({
      name: data.name,
      phone: data.phone,
      service: data.service ?? null,
      message: data.message ?? null,
      source: data.source ?? null,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      telegram_sent: telegramSent,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[leads] insert failed", error);
    return res.status(500).json({ error: "Не удалось сохранить заявку. Попробуйте ещё раз." });
  }

  return res.status(200).json({ id: inserted.id, telegramSent });
}
