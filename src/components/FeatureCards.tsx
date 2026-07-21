import {
  IconSchild,
  IconHandshake,
  IconTransport,
  IconFloristik,
  IconSarg,
  IconCheck,
} from "./icons";

/* Две большие фиче-карты (monad.com «Rule-Based Routing» и «Deploy
   Your Way»): большая иконка, serif-заголовок, mono-текст и мини-UI
   иллюстрация на цветном свечении. */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono-label rounded-[6px] border border-line bg-paper px-2 py-1 text-[9px] text-graphite">
      {children}
    </span>
  );
}

function RuleConnector({ label }: { label: string }) {
  return (
    <span className="mono-label rounded-[10px] border border-blue bg-card px-3.5 py-1.5 text-[10px] text-blue">
      {label}
    </span>
  );
}

/* мини-UI: правила видимости по ролям — на мятном свечении */
function RulesArt() {
  return (
    <div
      className="relative mt-8 rounded-[24px] px-4 py-8 md:px-8"
      style={{
        background:
          "radial-gradient(circle at 50% 45%, rgba(167,252,205,0.55), rgba(167,252,205,0) 70%)",
      }}
    >
      <div className="mb-4 flex items-center justify-center gap-3">
        <RuleConnector label="Rolle" />
        <RuleConnector label="Und" />
        <RuleConnector label="Vorgang" />
      </div>
      <div className="soft-ambient mx-auto max-w-[400px] rounded-[16px] border border-line bg-card p-5">
        <div className="mono-label mb-4 text-[10px] text-stone">Aktuelle Regeln</div>
        <div className="flex flex-col gap-4">
          <div className="rounded-[12px] border border-line bg-paper/60 p-3.5">
            <div className="flex items-baseline gap-2 text-[12px] text-charcoal">
              <span className="mono-label text-[10px] text-stone">1</span>
              Rolle <Chip>Krematorium</Chip> sieht:
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5 pl-4">
              <Chip>Unterlagen</Chip>
              <Chip>Termine</Chip>
              <Chip>Status</Chip>
            </div>
          </div>
          <div className="rounded-[12px] border border-line bg-paper/60 p-3.5">
            <div className="flex items-baseline gap-2 text-[12px] text-charcoal">
              <span className="mono-label text-[10px] text-stone">2</span>
              Rolle <Chip>Familie</Chip> sieht:
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5 pl-4">
              <Chip>Status</Chip>
              <Chip>Eigene Angaben</Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* мини-UI: перекрывающиеся карточки партнёров — на золотом свечении */
function PartnerCard({
  icon,
  title,
  tags,
  className,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  tags: string[];
  className: string;
  delay: number;
}) {
  return (
    <div
      className={`diagram-node soft-ambient absolute w-[180px] rounded-[16px] border border-line bg-card p-4 ${className}`}
      style={{ "--node-delay": `${delay}s` } as React.CSSProperties}
    >
      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-wald text-paper" aria-hidden="true">
        <IconCheck className="h-3 w-3" />
      </span>
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-hair text-ink">
        {icon}
      </span>
      <b className="mt-3 block text-[14px] font-medium text-charcoal">{title}</b>
      <div className="mt-2.5 flex flex-col items-start gap-1.5">
        {tags.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
    </div>
  );
}

function PartnersArt() {
  return (
    <div
      className="relative mt-8 h-[420px] rounded-[24px] md:h-[340px]"
      style={{
        background:
          "radial-gradient(circle at 55% 55%, rgba(236,218,152,0.6), rgba(255,148,115,0.25) 55%, rgba(255,148,115,0) 75%)",
      }}
      data-reveal
    >
      {/* пунктирные «призраки» позади */}
      <span aria-hidden="true" className="absolute left-[38%] top-[10%] h-[150px] w-[170px] rounded-[16px] border border-dashed border-hair" />
      <span aria-hidden="true" className="absolute left-[60%] top-[42%] h-[150px] w-[170px] rounded-[16px] border border-dashed border-hair" />
      <PartnerCard
        delay={0.15}
        icon={<IconTransport className="h-5 w-5" />}
        title="Transport"
        tags={["Per Link dabei", "Ohne Konto"]}
        className="left-0 top-[2%] md:left-[8%] md:top-[8%]"
      />
      <PartnerCard
        delay={0.3}
        icon={<IconFloristik className="h-5 w-5" />}
        title="Floristik"
        tags={["Auftrag bestätigt"]}
        className="left-[17%] top-[34%] md:left-[34%] md:top-[30%]"
      />
      <PartnerCard
        delay={0.45}
        icon={<IconSarg className="h-5 w-5" />}
        title="Särge & Urnen"
        tags={["Lieferung geplant", "Im Takt"]}
        className="left-[34%] top-[58%] md:left-[62%] md:top-[52%]"
      />
    </div>
  );
}

export function FeatureCards() {
  return (
    <section id="funktionen" className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="grid gap-4 lg:grid-cols-2">
        <div data-reveal className="overflow-hidden rounded-[40px] border border-hair bg-card p-7 md:p-10">
          <IconSchild className="h-8 w-8 text-ink" />
          <h3 className="mt-6 font-[family-name:var(--font-display)] text-[28px] leading-[1.15] md:text-[34px]">
            Vertraulichkeit nach Rolle
          </h3>
          <p className="mt-4 max-w-[46ch] text-[13.5px] leading-relaxed text-graphite">
            Jede Organisation sieht genau das, was sie betrifft — nicht mehr.
            Zugriffe folgen klaren Regeln, jede Änderung bleibt nachvollziehbar.
          </p>
          <RulesArt />
        </div>

        <div data-reveal style={{ transitionDelay: "100ms" }} className="overflow-hidden rounded-[40px] border border-hair bg-card p-7 md:p-10">
          <IconHandshake className="h-8 w-8 text-ink" />
          <h3 className="mt-6 font-[family-name:var(--font-display)] text-[28px] leading-[1.15] md:text-[34px]">
            Partner in Minuten dabei
          </h3>
          <p className="mt-4 max-w-[46ch] text-[13.5px] leading-relaxed text-graphite">
            Transport, Floristik und Zulieferer treten über einen Link bei —
            ohne Registrierung, ohne Schulung. Jeder bestätigt seinen Teil.
          </p>
          <PartnersArt />
        </div>
      </div>
    </section>
  );
}
