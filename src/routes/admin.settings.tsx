import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSettings } from "@/lib/site-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [contacts, setContacts] = useState<any>({});
  const [hero, setHero] = useState<any>({});
  const [about, setAbout] = useState<any>({});

  useEffect(() => {
    if (settings) {
      setContacts(settings.contacts ?? {});
      setHero(settings.hero ?? {});
      setAbout(settings.about ?? {});
    }
  }, [settings]);

  const save = async (key: string, value: any) => {
    const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено"); qc.invalidateQueries({ queryKey: ["settings"] });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6">Настройки сайта</h1>
      <div className="space-y-6">
        <Card title="Контакты" onSave={() => save("contacts", contacts)}>
          {(["phone","phone2","email","address","work_hours","whatsapp","telegram","max"] as const).map((k) => (
            <Field key={k} label={k}><Input value={contacts[k] ?? ""} onChange={(v) => setContacts({ ...contacts, [k]: v })} /></Field>
          ))}
        </Card>
        <Card title="Главный экран (hero)" onSave={() => save("hero", hero)}>
          <Field label="Заголовок"><Input value={hero.title ?? ""} onChange={(v) => setHero({ ...hero, title: v })} /></Field>
          <Field label="Подзаголовок"><Input value={hero.subtitle ?? ""} onChange={(v) => setHero({ ...hero, subtitle: v })} /></Field>
          <Field label="Бейдж"><Input value={hero.badge ?? ""} onChange={(v) => setHero({ ...hero, badge: v })} /></Field>
        </Card>
        <Card title="О компании" onSave={() => save("about", about)}>
          <Field label="Заголовок"><Input value={about.title ?? ""} onChange={(v) => setAbout({ ...about, title: v })} /></Field>
          <Field label="Текст">
            <textarea value={about.text ?? ""} onChange={(e) => setAbout({ ...about, text: e.target.value })} rows={5}
              className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" />
          </Field>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, onSave, children }: { title: string; onSave: () => void; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-lg sm:text-xl font-bold">{title}</h2>
        <button onClick={onSave} className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold">Сохранить</button>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</label>{children}</div>;
}
function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} className="bg-input border border-border rounded-lg px-4 py-2.5 w-full focus:border-primary focus:outline-none" />;
}
