type LeadNotification = {
  name?: string | null;
  phone: string;
  message?: string | null;
  source?: string | null;
};

export async function notifyLead(data: LeadNotification) {
  try {
    const response = await fetch("/api/notify-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return { ok: false };
    return (await response.json()) as { ok: boolean; reason?: string };
  } catch {
    return { ok: false };
  }
}