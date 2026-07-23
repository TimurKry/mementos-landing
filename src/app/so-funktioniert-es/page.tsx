import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HubDiagram } from "@/components/HubDiagram";

export const metadata: Metadata = {
  title: "MementoOS — So funktioniert es",
  description:
    "Von der Buchung bis zum Archiv: ein Fall, alle Beteiligten, jeder Schritt sichtbar. So läuft ein Vorgang in MementoOS — vom bestätigten Termin bis zum Abschluss.",
};

// Schritte 01–05 — der Weg eines Vorgangs
const steps = [
  {
    n: "01",
    title: "Der Fall entsteht",
    text: "Mit der bestätigten Buchung entsteht ein digitaler Vorgang — erreichbar über einen Link.",
  },
  {
    n: "02",
    title: "Beteiligte treten bei",
    text: "Krematorium, Transport, Floristik und Familie kommen per Link dazu — ohne Konto, ohne Installation.",
  },
  {
    n: "03",
    title: "Jeder sieht seinen Teil",
    text: "Der Zugriff ist feldgenau nach Rolle geregelt.",
    href: "/datenmodell/",
    linkLabel: "Wer sieht was",
  },
  {
    n: "04",
    title: "Aufgaben laufen sichtbar",
    text: "Offen oder erledigt — nie irgendwo dazwischen.",
    href: "/workspace/",
    linkLabel: "Arbeitsbereich ansehen",
  },
  {
    n: "05",
    title: "Abschluss & Archiv",
    text: "Vollständig dokumentiert, jede Änderung protokolliert.",
    href: "/demo/",
    linkLabel: "Im Demo durchspielen",
  },
];

const umstieg = [
  { title: "In Ihrem Tempo", text: "Sie starten mit einem einzelnen Fall, nicht mit einer Umstellung." },
  { title: "Neben Ihrer Software", text: "MementoOS ersetzt nicht, was funktioniert — es verbindet die Beteiligten eines Falls." },
  { title: "Papier und Fax bleiben möglich", text: "Wer nicht digital arbeitet, wird per Link oder Ausdruck eingebunden." },
];

export default function SoFunktioniertEsPage() {
  return (
    <>
      <Header />
      <main id="top">
        {/* hero + фирменная схема */}
        <section className="hero-glow overflow-hidden border-b border-line">
          <div className="mx-auto max-w-[1200px] px-6 pb-14 pt-14 md:pb-16">
            <div className="mono-label text-[11px] text-stone" data-reveal>So funktioniert es</div>
            <h1 className="mt-4 max-w-[20ch] text-balance font-[family-name:var(--font-display)] text-[40px] leading-[1.08] text-ink md:text-[64px]" data-reveal>
              Von der Buchung bis zum Archiv — ein Weg.
            </h1>
            <p className="mt-6 max-w-[64ch] text-[16px] leading-relaxed text-graphite md:text-[18px]" data-reveal>
              Ein Fall, alle Beteiligten, jeder Schritt sichtbar. So läuft ein Vorgang in MementoOS —
              vom bestätigten Termin bis zum Abschluss.
            </p>
            <div className="mt-12" data-reveal>
              <HubDiagram />
            </div>
          </div>
        </section>

        {/* Schritte 01–05 */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-10" data-reveal>
            <div className="mono-label text-[11px] text-stone">Der Weg</div>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-[28px] leading-tight text-ink md:text-[36px]">
              Fünf Schritte, ein Vorgang.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                data-reveal
                style={{ transitionDelay: `${i * 70}ms` }}
                className="card-hover flex flex-col rounded-[28px] border border-hair bg-card p-7"
              >
                <div className="mono-label text-[11px] text-blue">{s.n}</div>
                <h3 className="mb-2.5 mt-3 font-[family-name:var(--font-display)] text-[22px] leading-snug text-ink">
                  {s.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-graphite">{s.text}</p>
                {s.href && (
                  <Link href={s.href} className="arrow-shift mono-label mt-5 inline-flex items-center gap-2 text-[11px] text-ink">
                    {s.linkLabel} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Umstieg */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1200px] px-6 py-16">
            <div className="mb-10" data-reveal>
              <div className="mono-label text-[11px] text-stone">Umstieg</div>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[28px] leading-tight text-ink md:text-[36px]">
                Umstieg — ruhig und ohne Bruch
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {umstieg.map((u, i) => (
                <div
                  key={u.title}
                  data-reveal
                  style={{ transitionDelay: `${i * 70}ms` }}
                  className="rounded-[28px] border border-hair bg-card p-7"
                >
                  <h3 className="mb-2.5 font-[family-name:var(--font-display)] text-[21px] leading-snug text-ink">
                    {u.title}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-graphite">{u.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-[64ch] text-[13.5px] leading-relaxed text-stone" data-reveal>
              Wie sich MementoOS in Ihre Abläufe einfügt, klären wir in der Pilotphase gemeinsam.
            </p>
          </div>
        </section>

        {/* финальный CTA-ряд */}
        <section className="hero-glow overflow-hidden border-t border-line">
          <div data-reveal className="mx-auto max-w-[760px] px-6 pb-24 pt-20 text-center">
            <div className="mono-label text-[12px] text-stone">Weiter</div>
            <h2 className="mb-9 mt-4 text-balance font-[family-name:var(--font-display)] text-[32px] leading-[1.15] md:text-[44px]">
              Sehen, wie ein gemeinsamer Vorgang aussieht?
            </h2>
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
      </main>
      <Footer />
    </>
  );
}
