import Link from "next/link";
import {
  IconHandshake,
  IconPhone,
  IconKerze,
  IconDokument,
  IconKalender,
  IconBrief,
  IconKurve,
  IconSchild,
  IconMenschen,
  IconBestatter,
  IconFriedhof,
  IconKrematorium,
  IconSarg,
  IconUrne,
  IconFamilie,
} from "./icons";

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center" data-reveal>
      <div className="mono-label text-[12px] text-stone">{kicker}</div>
      <h2 className="mb-12 mt-4 text-balance font-[family-name:var(--font-display)] text-[34px] leading-[1.15] md:text-[44px]">
        {title}
      </h2>
    </div>
  );
}

const whyItems = [
  { icon: <IconHandshake className="h-5 w-5" />, title: "Ein gemeinsamer Vorgang", text: "Alle Beteiligten und jeder Schritt in einem digitalen Fall — statt verteilter Zettel, Mails und Anrufe.", accent: true },
  { icon: <IconPhone className="h-5 w-5" />, title: "Weniger Telefonketten", text: "Statusänderungen, Freigaben und Benachrichtigungen laufen automatisch an die richtigen Stellen.", accent: false },
  { icon: <IconKerze className="h-5 w-5" />, title: "Familien eingebunden", text: "Angehörige sehen den Stand und ergänzen Angaben über einen einfachen Link — ohne Registrierung.", accent: false },
  { icon: <IconDokument className="h-5 w-5" />, title: "Lückenlos dokumentiert", text: "Jede Änderung wird protokolliert. Unterlagen und Zuständigkeiten sind jederzeit nachvollziehbar.", accent: false },
];

export function Why() {
  return (
    <section id="warum" className="mx-auto max-w-[1200px] px-6 py-20">
      <SectionHead kicker="Warum MementoOS" title="Für Klarheit gebaut. Mit Würde gestaltet." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {whyItems.map((it, i) => (
          <div
            key={it.title}
            data-reveal
            style={{ transitionDelay: `${i * 80}ms` }}
            className={`card-hover relative overflow-hidden rounded-[28px] p-7 ${
              it.accent
                ? "bg-periwinkle"
                : "border border-hair bg-transparent"
            }`}
          >
            {it.accent && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-[36px]"
                style={{ background: "radial-gradient(circle, #ff9473 0%, #a0b5eb 60%, rgba(160,181,235,0) 100%)" }}
              />
            )}
            <div className="relative mb-5 text-ink">{it.icon}</div>
            <h3 className="mb-2.5 font-[family-name:var(--font-display)] text-[22px] leading-snug">
              {it.title}
            </h3>
            <p className="text-[13.5px] leading-relaxed text-graphite">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Вертикальный пайплайн (monad.com Managed Data Pipelines):
   белые карточки-узлы с тёмными портами, коннекторы-пилюли,
   ветвление в конце — на коралло-периwinkle заливке. */

function LinkGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6.5 9.5 9.5 6.5M7.8 4.2l.9-.9a2.55 2.55 0 0 1 3.6 3.6l-.9.9M8.2 11.8l-.9.9a2.55 2.55 0 0 1-3.6-3.6l.9-.9" />
    </svg>
  );
}

function Port() {
  return <span aria-hidden="true" className="block h-[5px] w-8 rounded-full bg-ink/75" />;
}

function FlowLine() {
  return <span aria-hidden="true" className="block h-4 w-px bg-hair" />;
}

function Connector({ label }: { label: string }) {
  return (
    <span className="mono-label inline-flex items-center gap-2 rounded-[10px] border border-blue bg-card px-4 py-2 text-[10px] text-blue">
      <LinkGlyph /> {label}
    </span>
  );
}

function FlowCard({
  icon,
  title,
  tag,
  text,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  tag: string;
  text?: string;
  delay: number;
}) {
  return (
    <div
      className="diagram-node soft-ambient w-full rounded-[16px] border border-line bg-card p-4 text-left"
      style={{ "--node-delay": `${delay}s` } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-hair text-ink">
          {icon}
        </span>
        <span className="min-w-0">
          <b className="block truncate text-[13.5px] font-medium text-charcoal">{title}</b>
          <span className="mono-label mt-1 inline-block rounded-[6px] border border-line bg-paper px-2 py-0.5 text-[9px] text-stone">
            {tag}
          </span>
        </span>
      </div>
      {text && <p className="mt-3 text-[11.5px] leading-relaxed text-stone">{text}</p>}
    </div>
  );
}

export function Process() {
  return (
    <section id="ablauf" className="mx-auto max-w-[1200px] px-6 py-20">
      <SectionHead kicker="Der Ablauf" title="Eine Plattform. Jeder Schritt. Alle verbunden." />
      <div
        data-reveal
        className="relative mx-auto max-w-[820px] overflow-hidden rounded-[40px] border border-line px-6 py-12 md:px-10"
        style={{
          background:
            "radial-gradient(circle at 50% 12%, rgba(255,148,115,0.4), rgba(255,148,115,0) 55%), radial-gradient(circle at 50% 95%, rgba(160,181,235,0.5), rgba(160,181,235,0) 60%), #f6f3f1",
        }}
      >
        <div className="mx-auto flex max-w-[400px] flex-col items-center">
          <FlowCard
            delay={0.1}
            icon={<IconKalender className="h-5 w-5" />}
            title="Buchung bestätigt"
            tag="Krematorium"
            text="Der Termin steht — der Fall entsteht mit einem Link."
          />
          <Port />
          <FlowLine />
          <Connector label="Per Link" />
          <FlowLine />
          <Port />
          <FlowCard
            delay={0.25}
            icon={<IconBestatter className="h-5 w-5" />}
            title="Vorgang ausgefüllt"
            tag="Bestatter"
            text="Strukturierte Angaben statt Fax — alles für eine sichere Einäscherung."
          />
          <Port />
          <FlowLine />
          <Connector label="Ohne Registrierung" />
          <FlowLine />
          <Port />
          <FlowCard
            delay={0.4}
            icon={<IconHandshake className="h-5 w-5" />}
            title="Partner treten bei"
            tag="Transport · Floristik"
            text="Zulieferer bestätigen ihren Teil direkt im Browser."
          />
          <Port />
          <FlowLine />
          <Connector label="Automatisch" />
          <FlowLine />
          <Port />
          <FlowCard
            delay={0.55}
            icon={<IconDokument className="h-5 w-5" />}
            title="Unterlagen vollständig"
            tag="MementoOS"
            text="Fehlendes fällt sofort auf — nicht erst vor Ort."
          />
          <Port />
          <FlowLine />
          <Connector label="Wenn vollständig" />
          {/* ветвление к двум финальным узлам */}
          <svg viewBox="0 0 100 26" className="h-[26px] w-full max-w-[300px]" preserveAspectRatio="none" aria-hidden="true">
            <path d="M50 0 V10 M25 10 H75 M25 10 V26 M75 10 V26" stroke="#cecac8" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="grid w-full grid-cols-2 gap-3">
            <FlowCard
              delay={0.7}
              icon={<IconKrematorium className="h-5 w-5" />}
              title="Einäscherung"
              tag="dokumentiert"
            />
            <FlowCard
              delay={0.8}
              icon={<IconUrne className="h-5 w-5" />}
              title="Abschluss"
              tag="archiviert"
            />
          </div>
        </div>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4" data-reveal>
        <Link href="/demo/" className="arrow-shift mono-label inline-flex items-center gap-2 text-[13px] text-ink">
          Im Demo durchspielen <span aria-hidden="true">→</span>
        </Link>
        <Link href="/datenmodell/" className="arrow-shift mono-label inline-flex items-center gap-2 text-[13px] text-ink">
          Wer sieht was <span aria-hidden="true">→</span>
        </Link>
        <Link href="/so-funktioniert-es/" className="arrow-shift mono-label inline-flex items-center gap-2 text-[13px] text-ink">
          So funktioniert es im Detail <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

const bandItems = [
  { icon: <IconMenschen className="h-6 w-6" />, title: "Alle Beteiligten. Ein Ablauf.", text: "Eine gemeinsame Quelle der Wahrheit für jeden Fall — für alle Organisationen." },
  { icon: <IconBrief className="h-6 w-6" />, title: "Weniger Anrufe, Mails und Fax.", text: "Rückfragen entfallen, weil der Stand für alle sichtbar ist." },
  { icon: <IconKurve className="h-6 w-6" />, title: "Schnellere Koordination.", text: "Vom ersten Anruf bis zum Abschluss — ohne Wartezeiten zwischen den Stellen." },
  { icon: <IconSchild className="h-6 w-6" />, title: "Prüfbar dokumentiert.", text: "Jeder Schritt protokolliert — Vertraulichkeit nach Rolle, DSGVO im Blick." },
];

/* Генерированная иллюстрация: перекрывающиеся полупрозрачные формы
   в пастельных градиентах (Monad «In-flight Transforms») */
function GradientArt() {
  return (
    <svg
      viewBox="0 0 420 360"
      className="h-full w-full"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="ga1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9473" />
          <stop offset="100%" stopColor="#a0b5eb" />
        </linearGradient>
        <linearGradient id="ga2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a0b5eb" />
          <stop offset="100%" stopColor="#a7fccd" />
        </linearGradient>
        <linearGradient id="ga3" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#ecda98" />
          <stop offset="100%" stopColor="#ff9473" />
        </linearGradient>
        <filter id="gab" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>
      {/* размытое дыхание фона */}
      <ellipse cx="220" cy="190" rx="170" ry="140" fill="url(#ga2)" opacity="0.5" filter="url(#gab)" />
      {/* чёткие перекрывающиеся формы */}
      <circle cx="150" cy="140" r="95" fill="url(#ga1)" opacity="0.82" />
      <circle cx="265" cy="185" r="110" fill="url(#ga2)" opacity="0.72" />
      <path d="M60 330 A 150 150 0 0 1 360 330 Z" fill="url(#ga3)" opacity="0.78" />
      <circle cx="305" cy="95" r="42" fill="#f6f3f1" opacity="0.85" />
      <circle cx="118" cy="255" r="24" fill="#f6f3f1" opacity="0.7" />
      {/* тонкие орбиты — язык схемографии */}
      <circle cx="210" cy="180" r="132" fill="none" stroke="#f6f3f1" strokeWidth="1" opacity="0.7" strokeDasharray="3 6" />
      <circle cx="210" cy="180" r="165" fill="none" stroke="#f6f3f1" strokeWidth="1" opacity="0.45" />
    </svg>
  );
}

export function ValueBand() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      {/* единственная цветная карта системы — Periwinkle с генерированным артом */}
      <div data-reveal className="relative overflow-hidden rounded-[40px] bg-periwinkle">
        <div className="grid items-stretch md:grid-cols-[1.25fr_1fr]">
          <div className="grid gap-8 p-8 sm:grid-cols-2 md:p-12">
            {bandItems.map((b, i) => (
              <div key={b.title} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="mb-4 block text-ink">{b.icon}</span>
                <h3 className="font-[family-name:var(--font-display)] text-[21px] leading-snug">
                  {b.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-charcoal/80">{b.text}</p>
              </div>
            ))}
          </div>
          <div className="relative hidden min-h-[360px] md:block">
            <div className="absolute inset-0">
              <GradientArt />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const audiences = [
  { icon: <IconBestatter className="h-8 w-8" />, title: "Bestattungsunternehmen", text: "Ein Vorgang statt zehn Anrufe — alles dokumentiert.", href: "/fuer-bestatter/" },
  { icon: <IconKrematorium className="h-8 w-8" />, title: "Krematorien", text: "Vollständige Unterlagen vor der Anlieferung, digitale Annahme.", href: "/fuer-krematorien/" },
  { icon: <IconFriedhof className="h-8 w-8" />, title: "Friedhofsverwaltungen", text: "Belegungen, Termine und Unterlagen im Überblick.", href: "/fuer-friedhoefe/" },
  { icon: <IconSarg className="h-8 w-8" />, title: "Zulieferer", text: "Anfragen empfangen, Aufträge bestätigen, im Takt bleiben.", href: "/fuer-zulieferer/" },
  { icon: <IconFamilie className="h-8 w-8" />, title: "Familien & Angehörige", text: "Den Stand sehen und Angaben ergänzen — über einen Link.", href: "/fuer-familien/" },
  { icon: <IconUrne className="h-8 w-8" />, title: "Verbünde & Gruppen", text: "Einheitliche Abläufe über mehrere Standorte hinweg.", href: "/fuer-verbuende/" },
];

export function Audiences() {
  return (
    <section id="ich-bin" className="mx-auto max-w-[1200px] px-6 py-20">
      <SectionHead kicker="Ich bin…" title="Wählen Sie Ihre Rolle." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {audiences.map((a, i) => {
          const inner = (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-hair text-ink">
                {a.icon}
              </div>
              <h3 className="mb-1.5 font-[family-name:var(--font-display)] text-[19px] leading-snug">
                {a.title}
              </h3>
              <p className="text-[12px] leading-relaxed text-stone">{a.text}</p>
              {a.href && (
                <span className="arrow-shift mono-label mt-4 inline-flex items-center gap-1.5 text-[10px] text-ink">
                  Eigene Seite <span aria-hidden="true">→</span>
                </span>
              )}
            </>
          );
          const cls = "card-hover block rounded-[28px] border border-hair p-6 text-center";
          const delay = { transitionDelay: `${i * 70}ms` };
          return a.href ? (
            <Link key={a.title} href={a.href} data-reveal style={delay} className={cls}>
              {inner}
            </Link>
          ) : (
            <div key={a.title} data-reveal style={delay} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ContactCta() {
  return (
    <section id="kontakt" className="hero-glow overflow-hidden border-t border-line">
      <div data-reveal className="mx-auto max-w-[760px] px-6 pb-24 pt-20 text-center">
        <div className="mono-label text-[12px] text-stone">Kontakt</div>
        <h2 className="mb-4 mt-4 text-balance font-[family-name:var(--font-display)] text-[34px] leading-[1.15] md:text-[46px]">
          Sehen, wie ein gemeinsamer Vorgang aussieht?
        </h2>
        <p className="mb-9 text-[15px] text-graphite">
          Wir zeigen MementoOS in 20 Minuten — ruhig, konkret, ohne Verkaufsdruck.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:timurkry.dev@gmail.com?subject=MementoOS%20Demo"
            className="btn-blue press arrow-shift mono-label inline-flex items-center gap-2.5 px-8 py-4 text-[13px]"
          >
            Demo anfragen <span aria-hidden="true">▸</span>
          </a>
          <Link
            href="/demo/"
            className="btn-ghost press mono-label inline-flex items-center gap-2 px-8 py-4 text-[13px]"
          >
            Demo selbst ansehen
          </Link>
        </div>
      </div>
    </section>
  );
}
