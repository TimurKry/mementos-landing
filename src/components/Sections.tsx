import Link from "next/link";
import {
  IconHandshake,
  IconPhone,
  IconKerze,
  IconDokument,
  IconBrief,
  IconKurve,
  IconSchild,
  IconMenschen,
  IconBestatter,
  IconFriedhof,
  IconKrematorium,
  IconSarg,
  IconUrne,
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
            className={`card-hover rounded-[28px] p-7 ${
              it.accent
                ? "bg-periwinkle"
                : "border border-hair bg-transparent"
            }`}
          >
            <div className="mb-5 text-ink">{it.icon}</div>
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

const steps = [
  { title: "Buchung beim Krematorium", text: "Der Termin wird bestätigt — und der Fall entsteht mit einem Link." },
  { title: "Bestatter füllt den Vorgang", text: "Strukturierte Angaben statt Fax: alles, was für eine sichere Einäscherung nötig ist." },
  { title: "Partner über einen Link", text: "Transport, Floristik, Zulieferer treten ohne Registrierung bei und bestätigen ihren Teil." },
  { title: "Unterlagen & Status", text: "Fehlende Dokumente fallen sofort auf — nicht erst vor Ort. Jeder sieht, was aussteht." },
  { title: "Würdevoller Abschluss", text: "Der Fall wird abgeschlossen, dokumentiert und archiviert — vollständig und nachvollziehbar." },
];

export function Process() {
  return (
    <section id="ablauf" className="border-y border-line">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <SectionHead kicker="Der Ablauf" title="Eine Plattform. Jeder Schritt. Alle verbunden." />
        <div data-reveal className="relative">
          {/* линия процесса рисуется слева направо при появлении */}
          <div className="process-line absolute left-0 right-0 top-[19px] hidden h-px bg-hair md:block" aria-hidden="true" />
          <div className="grid gap-9 md:grid-cols-5 md:gap-5">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="diagram-node relative md:text-left"
                style={{ "--node-delay": `${0.25 + i * 0.12}s` } as React.CSSProperties}
              >
                <span className="mono-label relative z-10 inline-flex h-10 items-center rounded-full border border-hair bg-paper px-4 text-[12px] text-ink">
                  0{i + 1}
                </span>
                <h3 className="mb-1.5 mt-4 font-[family-name:var(--font-display)] text-[20px] leading-snug">
                  {s.title}
                </h3>
                <p className="text-[12.5px] leading-relaxed text-stone">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 text-center" data-reveal>
          <Link
            href="/demo/"
            className="arrow-shift mono-label inline-flex items-center gap-2.5 text-[13px] text-ink"
          >
            Den Ablauf im Demo durchspielen <span aria-hidden="true">→</span>
          </Link>
        </div>
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

export function ValueBand() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      {/* единственная цветная карта системы — Periwinkle с пастельной иллюстрацией */}
      <div data-reveal className="relative overflow-hidden rounded-[40px] bg-periwinkle p-8 md:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full opacity-70 blur-[70px]"
          style={{ background: "radial-gradient(circle at 40% 60%, #ff9473 0%, #a0b5eb 55%, #a7fccd 100%)" }}
        />
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}

const audiences = [
  { icon: <IconBestatter className="h-8 w-8" />, title: "Bestattungsunternehmen", text: "Ein Vorgang statt zehn Anrufe — alles dokumentiert." },
  { icon: <IconFriedhof className="h-8 w-8" />, title: "Friedhofsverwaltungen", text: "Belegungen, Termine und Unterlagen im Überblick." },
  { icon: <IconKrematorium className="h-8 w-8" />, title: "Krematorien", text: "Vollständige Unterlagen vor der Anlieferung, digitale Annahme." },
  { icon: <IconSarg className="h-8 w-8" />, title: "Zulieferer", text: "Anfragen empfangen, Aufträge bestätigen, im Takt bleiben." },
  { icon: <IconUrne className="h-8 w-8" />, title: "Verbünde & Gruppen", text: "Einheitliche Abläufe über mehrere Standorte hinweg." },
];

export function Audiences() {
  return (
    <section id="zielgruppen" className="mx-auto max-w-[1200px] px-6 py-20">
      <SectionHead kicker="Für wen" title="Gebaut für jede Organisation der Branche." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {audiences.map((a, i) => (
          <div
            key={a.title}
            data-reveal
            style={{ transitionDelay: `${i * 70}ms` }}
            className="card-hover rounded-[28px] border border-hair p-6 text-center"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-hair text-ink">
              {a.icon}
            </div>
            <h3 className="mb-1.5 font-[family-name:var(--font-display)] text-[19px] leading-snug">
              {a.title}
            </h3>
            <p className="text-[12px] leading-relaxed text-stone">{a.text}</p>
          </div>
        ))}
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
