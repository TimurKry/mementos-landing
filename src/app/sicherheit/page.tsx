import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IconSchild, IconDokument, IconCheck, IconMenschen } from "@/components/icons";

export const metadata: Metadata = {
  title: "MementoOS — Datenschutz & Vertrauen",
  description:
    "Sensible Daten verdienen klare Regeln. In MementoOS sieht jede Organisation nur, was sie betrifft — feldgenauer Zugriff nach Rolle, lückenloses Protokoll, DSGVO im Blick.",
};

// Vier Vertrauens-Bausteine (Vorschau — keine verbindlichen Angaben)
const blocks = [
  {
    icon: <IconMenschen className="h-5 w-5" />,
    title: "Zugriff nach Rolle",
    text: "Jede Rolle liest genau die Feldgruppen, die sie braucht — feldgenau, nicht mehr.",
    href: "/datenmodell/",
    linkLabel: "Datenmodell & Zugriff ansehen",
  },
  {
    icon: <IconDokument className="h-5 w-5" />,
    title: "Lückenloses Protokoll",
    text: "Jede Änderung, jeder Zugriff und jeder Upload wird protokolliert und ist nachvollziehbar.",
  },
  {
    icon: <IconSchild className="h-5 w-5" />,
    title: "DSGVO im Blick",
    text: "Die Datenverarbeitung orientiert sich an der DSGVO. Umfang, Auftragsverarbeitung und Löschfristen legen wir in der Pilotphase gemeinsam und transparent fest.",
  },
  {
    icon: <IconCheck className="h-5 w-5" />,
    title: "Entwickelt in Leipzig",
    text: "MementoOS entsteht in Leipzig, im direkten Austausch mit der Branche — nah an der Praxis, die es abbildet.",
  },
];

export default function SicherheitPage() {
  return (
    <>
      <Header />
      <main id="top">
        {/* hero */}
        <section className="hero-glow overflow-hidden border-b border-line">
          <div className="mx-auto max-w-[1200px] px-6 pb-14 pt-14 md:pb-16">
            <div className="mono-label text-[11px] text-stone" data-reveal>Datenschutz & Vertrauen</div>
            <h1 className="mt-4 max-w-[20ch] text-balance font-[family-name:var(--font-display)] text-[40px] leading-[1.08] text-ink md:text-[64px]" data-reveal>
              Vertraulich — für jede Beteiligte.
            </h1>
            <p className="mt-6 max-w-[64ch] text-[16px] leading-relaxed text-graphite md:text-[18px]" data-reveal>
              Sensible Daten verdienen klare Regeln. In MementoOS sieht jede Organisation nur, was sie
              betrifft — und jede Änderung bleibt nachvollziehbar.
            </p>
            <p className="mono-label mt-8 inline-flex items-center gap-2 rounded-full border border-hair bg-paper px-3.5 py-1.5 text-[10px] text-ink" data-reveal>
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-blue" /> Vorschau · in Entwicklung
            </p>
          </div>
        </section>

        {/* vier Bausteine */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="grid gap-4 md:grid-cols-2">
            {blocks.map((b, i) => (
              <div
                key={b.title}
                data-reveal
                style={{ transitionDelay: `${i * 70}ms` }}
                className="flex flex-col rounded-[28px] border border-hair bg-card p-7"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-hair text-ink">
                  {b.icon}
                </div>
                <h2 className="mb-2.5 font-[family-name:var(--font-display)] text-[22px] leading-snug text-ink">
                  {b.title}
                </h2>
                <p className="text-[13.5px] leading-relaxed text-graphite">{b.text}</p>
                {b.href && (
                  <Link href={b.href} className="arrow-shift mono-label mt-5 inline-flex items-center gap-2 text-[11px] text-ink">
                    {b.linkLabel} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* единственная periwinkle-карта — дисклеймер */}
          <div data-reveal className="mt-4 rounded-[28px] bg-periwinkle p-7">
            <div className="mono-label mb-3 inline-flex items-center gap-2 text-[10px] text-ink">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-blue" /> Vorschau · in Entwicklung
            </div>
            <p className="max-w-[72ch] text-[14px] leading-relaxed text-charcoal/80">
              Verbindliche Angaben zu Verträgen, Hosting und möglichen Zertifizierungen folgen mit der
              Pilotphase.
            </p>
          </div>

          <p className="mono-label mt-8 text-[10px] text-stone" data-reveal>
            Impressum und Datenschutzerklärung folgen.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
