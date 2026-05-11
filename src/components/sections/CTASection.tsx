import { ContactForm } from "@/components/ContactForm";
import { FadeInUp } from "@/components/ui-blocks";

export function CTASection({ defaultService }: { defaultService?: string }) {
  return (
    <section className="section-y relative overflow-hidden" id="zayavka">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[oklch(0.18_0.05_75)] pointer-events-none" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-radial-gold opacity-60 blur-2xl" />
      <div className="container-x relative grid lg:grid-cols-2 gap-12 items-center">
        <FadeInUp>
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] mb-4">
            Бесплатный расчёт
          </div>
          <h2 className="font-display text-4xl md:text-6xl tracking-wide leading-tight">
            Получите смету <br />
            <span className="text-gradient-gold">за 5 минут</span>
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            Оставьте заявку — перезвоним в течение 15 минут, согласуем выезд замерщика
            и подготовим точную смету бесплатно.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-foreground/80">
            <li>✓ Выезд и замер — бесплатно</li>
            <li>✓ Фиксированная цена в договоре</li>
            <li>✓ Гарантия 3 года</li>
          </ul>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <ContactForm defaultService={defaultService} />
        </FadeInUp>
      </div>
    </section>
  );
}
