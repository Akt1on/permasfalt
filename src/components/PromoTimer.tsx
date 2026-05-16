import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

// Countdown to the end of the current day (resets daily — creates urgency without lying)
function getEndOfDay() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function PromoTimer({ compact = false }: { compact?: boolean }) {
  const [target] = useState(() => getEndOfDay());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 font-numeric text-base tracking-wider text-[var(--gold)]">
        <Flame className="h-3.5 w-3.5" />
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 backdrop-blur">
      <Flame className="h-4 w-4 text-[var(--gold)]" />
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        Скидка 10% сегодня
      </span>
      <span className="font-numeric text-xl leading-none tracking-wider text-[var(--gold)]">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}
