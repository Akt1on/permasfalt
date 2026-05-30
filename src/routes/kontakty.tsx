import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { FadeInUp } from "@/components/ui-blocks";
import { SITE } from "@/data/site";
import { Seo } from "@/components/Seo";
import { Phone, MapPin, Clock, MessageCircle, Send, Mail } from "lucide-react";

export const Route = createFileRoute("/kontakty")({
  component: ContactsPage,
});

const CARDS = [
  { icon: Phone, label: "Телефон", value: SITE.phone, href: `tel:${SITE.phoneRaw}` },
  { icon: MessageCircle, label: "WhatsApp", value: "Написать в WhatsApp", href: SITE.whatsapp },
  { icon: Send, label: "Telegram", value: "Написать в Telegram", href: SITE.telegram },
  { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: MapPin, label: "Адрес", value: SITE.address },
  { icon: Clock, label: "Режим работы", value: SITE.hours },
];

function ContactsPage() {
  return (
    <SiteLayout>
      <Seo title="Контакты — Пермь Асфальт 59" description="Свяжитесь с нами. Перезвоним в течение 15 минут." />
      <PageHeader
        breadcrumbs={[{ label: "Контакты" }]}
        eyebrow="Связаться"
        title="Контакты"
        description="Звоните, пишите, приезжайте в офис. Перезвоним в течение 15 минут."
      />

      <section className="pb-16">
        <div className="container-x grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 self-start">
            {CARDS.map((c, i) => {
              const inner = (
                <>
                  <div className="h-12 w-12 grid place-items-center rounded-xl bg-gradient-gold text-background mb-4 group-hover:scale-110 transition-transform">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {c.label}
                  </div>
                  <div className="mt-1 font-heading font-bold text-foreground">{c.value}</div>
                </>
              );
              return (
                <FadeInUp key={c.label} delay={(i % 2) * 0.08}>
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="group block h-full rounded-2xl border border-border bg-surface-1 p-6 hover:border-[var(--gold)]/50 hover:bg-surface-2 transition-all"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="group h-full rounded-2xl border border-border bg-surface-1 p-6">
                      {inner}
                    </div>
                  )}
                </FadeInUp>
              );
            })}
          </div>

          <FadeInUp delay={0.15}>
            <div id="zayavka">
              <h2 className="font-display text-3xl tracking-wide mb-4">Оставить заявку</h2>
              <ContactForm />
            </div>
          </FadeInUp>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-x">
          <div className="rounded-2xl overflow-hidden gold-border h-[480px]">
            <iframe
              title="Карта"
              src={SITE.yandexMapEmbed}
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
