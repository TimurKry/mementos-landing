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
} from "./icons";

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center">
      <div className="text-[11px] uppercase tracking-[.2em] text-stone">{kicker}</div>
      <h2 className="mb-9 mt-3 text-balance font-[family-name:var(--font-display)] text-[28px] font-medium md:text-[32px]">
        {title}
      </h2>
    </div>
  );
}

const whyItems = [
  { icon: <IconHandshake className="h-[22px] w-[22px]" />, title: "Ein gemeinsamer Vorgang", text: "Alle Beteiligten und jeder Schritt in einem digitalen Fall — statt verteilter Zettel, Mails und Anrufe.", w: "w1" },
  { icon: <IconPhone className="h-[22px] w-[22px]" />, title: "Weniger Telefonketten", text: "Statusänderungen, Freigaben und Benachrichtigungen laufen automatisch an die richtigen Stellen.", w: "w2" },
  { icon: <IconKerze className="h-[22px] w-[22px]" />, title: "Familien eingebunden", text: "Angehörige sehen den Stand und ergänzen Angaben über einen einfachen Link — ohne Registrierung.", w: "w3" },
  { icon: <IconDokument className="h-[22px] w-[22px]" />, title: "Lückenlos dokumentiert", text: "Jede Änderung wird protokolliert. Unterlagen und Zuständigkeiten sind jederzeit nachvollziehbar.", w: "w1" },
];

export function Why() {
  return (
    <section id="warum" className="mx-auto max-w-[1180px] px-7 py-16">
      <SectionHead kicker="Warum MementoOS" title="Für Klarheit gebaut. Mit Würde gestaltet." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {whyItems.map((it) => (
          <div key={it.title} className={`${it.w} flex items-start gap-3.5 border-[1.2px] border-ink bg-card p-5`}>
            <div className="w-circle flex h-10 w-10 flex-none items-center justify-center border-[1.1px] border-ink text-ink">
              {it.icon}
            </div>
            <div>
              <b className="mb-1 block text-[14.5px] font-semibold">{it.title}</b>
              <p className="text-[13px] leading-relaxed text-stone">{it.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { icon: <IconKalender className="h-[26px] w-[26px]" />, title: "Buchung beim Krematorium", text: "Der Termin wird bestätigt — und der Fall entsteht mit einem Link." },
  { icon: <IconBestatter className="h-[24px] w-[24px]" />, title: "Bestatter füllt den Vorgang", text: "Strukturierte Angaben statt Fax: alles, was für eine sichere Einäscherung nötig ist." },
  { icon: <IconHandshake className="h-[26px] w-[26px]" />, title: "Partner über einen Link", text: "Transport, Floristik, Zulieferer treten ohne Registrierung bei und bestätigen ihren Teil." },
  { icon: <IconDokument className="h-[26px] w-[26px]" />, title: "Unterlagen & Status", text: "Fehlende Dokumente fallen sofort auf — nicht erst vor Ort. Jeder sieht, was aussteht." },
  { icon: <IconKerze className="h-[26px] w-[26px]" />, title: "Würdevoller Abschluss", text: "Der Fall wird abgeschlossen, dokumentiert und archiviert — vollständig und nachvollziehbar." },
];

export function Process() {
  return (
    <section id="ablauf" className="mx-auto max-w-[1180px] px-7 py-16">
      <div className="w2 relative border-[1.2px] border-ink bg-[#EFECE4] px-7 py-12 md:px-10">
        <div className="pointer-events-none absolute inset-2 rounded-[inherit] border border-dashed border-ink/25" />
        <SectionHead kicker="Der Ablauf" title="Eine Plattform. Jeder Schritt. Alle verbunden." />
        <div className="grid gap-7 md:grid-cols-5 md:gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="w-circle mx-auto mb-3.5 flex h-[66px] w-[66px] items-center justify-center border-[1.2px] border-ink bg-card text-ink">
                {s.icon}
              </div>
              <span className="absolute left-[calc(50%+16px)] top-11 hidden h-[21px] w-[21px] items-center justify-center rounded-[50%_44%_52%_46%] bg-ink text-[11px] font-semibold text-paper md:flex">
                {i + 1}
              </span>
              <b className="mb-1 block text-sm font-semibold">{s.title}</b>
              <p className="text-[12.5px] leading-normal text-stone">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-9 text-center">
          <Link href="/demo/" className="w-btn inline-flex items-center gap-2.5 border-[1.3px] border-ink bg-card px-5 py-3 text-sm font-medium transition-transform hover:-translate-x-px hover:-translate-y-px">
            Den Ablauf im Demo durchspielen <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

const bandItems = [
  { icon: <IconMenschen className="h-[26px] w-[26px]" />, title: "Alle Beteiligten. Ein Ablauf.", text: "Eine gemeinsame Quelle der Wahrheit für jeden Fall — für alle Organisationen." },
  { icon: <IconBrief className="h-[26px] w-[26px]" />, title: "Weniger Anrufe, Mails und Fax.", text: "Rückfragen entfallen, weil der Stand für alle sichtbar ist." },
  { icon: <IconKurve className="h-[26px] w-[26px]" />, title: "Schnellere Koordination.", text: "Vom ersten Anruf bis zum Abschluss — ohne Wartezeiten zwischen den Stellen." },
  { icon: <IconSchild className="h-[26px] w-[26px]" />, title: "Prüfbar dokumentiert.", text: "Jeder Schritt protokolliert — Vertraulichkeit nach Rolle, DSGVO im Blick." },
];

export function ValueBand() {
  return (
    <section className="mx-auto max-w-[1180px] px-7 py-16">
      <div className="w1 hatch grid gap-7 border-[1.2px] border-ink bg-ink p-7 text-paper sm:grid-cols-2 lg:grid-cols-4 md:p-10">
        {bandItems.map((b) => (
          <div key={b.title}>
            <span className="mb-2.5 block text-ash">{b.icon}</span>
            <b className="block text-base font-semibold leading-snug">{b.title}</b>
            <p className="mt-1.5 text-[12.5px] leading-normal text-ash">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const audiences = [
  { icon: <IconBestatter className="h-11 w-11" />, title: "Bestattungsunternehmen", text: "Ein Vorgang statt zehn Anrufe — alles dokumentiert." },
  { icon: <IconFriedhof className="h-11 w-11" />, title: "Friedhofsverwaltungen", text: "Belegungen, Termine und Unterlagen im Überblick." },
  { icon: <IconKrematorium className="h-10 w-10" />, title: "Krematorien", text: "Vollständige Unterlagen vor der Anlieferung, digitale Annahme." },
  { icon: <IconSarg className="h-11 w-11" />, title: "Zulieferer", text: "Anfragen empfangen, Aufträge bestätigen, im Takt bleiben." },
  { icon: <IconUrne className="h-10 w-10" />, title: "Verbünde & Gruppen", text: "Einheitliche Abläufe über mehrere Standorte hinweg." },
];

export function Audiences() {
  return (
    <section id="zielgruppen" className="mx-auto max-w-[1180px] px-7 py-16">
      <SectionHead kicker="Für wen" title="Gebaut für jede Organisation der Branche." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {audiences.map((a, i) => (
          <div key={a.title} className={`overflow-hidden border-[1.2px] border-ink bg-card pb-5 text-center ${i % 2 ? "rotate-[.35deg]" : "-rotate-[.35deg]"}`}>
            <div className="hatch-bg flex h-28 items-center justify-center border-b-[1.2px] border-ink bg-[#F1EEE7] text-ink">
              {a.icon}
            </div>
            <b className="mx-3 mb-1 mt-4 block text-sm font-semibold">{a.title}</b>
            <p className="mx-3.5 text-xs leading-normal text-stone">{a.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ContactCta() {
  return (
    <section id="kontakt" className="mx-auto max-w-[1180px] px-7 pb-20 pt-16 text-center">
      <div className="text-[11px] uppercase tracking-[.2em] text-stone">Kontakt</div>
      <h2 className="mb-3 mt-3 text-balance font-[family-name:var(--font-display)] text-[28px] font-medium md:text-[32px]">
        Sehen, wie ein gemeinsamer Vorgang aussieht?
      </h2>
      <p className="mb-7 text-stone">Wir zeigen MementoOS in 20 Minuten — ruhig, konkret, ohne Verkaufsdruck.</p>
      <a
        href="mailto:timurkry.dev@gmail.com?subject=MementoOS%20Demo"
        className="w-btn hatch inline-flex items-center gap-2.5 border-[1.3px] border-ink bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:-translate-x-px hover:-translate-y-px"
      >
        Demo anfragen <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
