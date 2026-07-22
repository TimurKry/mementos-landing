import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { entities, roles, tierMeta, sections } from "@/components/datamodel/data";
import type { RoleId } from "@/components/datamodel/data";
import { EntityDiagram } from "@/components/datamodel/EntityDiagram";
import { EntityCard } from "@/components/datamodel/EntityCard";
import { DocTable } from "@/components/datamodel/DocTable";
import { RoleHead, GroupKey } from "@/components/datamodel/ui";

export const metadata: Metadata = {
  title: "MementoOS — Datenmodell & Zugriff",
  description:
    "Das Datenmodell von MementoOS: Tabellen mit Feldern, wer sie schreibt und welche Rolle welche Feldgruppe liest — feldgenauer Zugriff für jede Beteiligte.",
};

const roleOrder: RoleId[] = [
  "bestatter", "familie", "krematorium", "transport", "friedhof",
  "floristik", "klinik", "standesamt", "steinmetz", "redner", "verbund",
];

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px]">
      <span className="inline-flex items-center gap-2.5">
        <span className="inline-block h-0 w-6 border-t-2 border-ink" /> schwarz — schreibt / legt an
      </span>
      <span className="inline-flex items-center gap-2.5">
        <span className="inline-block h-0 w-6 border-t-2 border-dashed border-blue" /> blau — liest (Zugriff)
      </span>
      <span className="inline-flex items-center gap-3">
        {(["kern", "org", "op", "sens"] as const).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5"><GroupKey tier={t} /> {tierMeta[t].label}</span>
        ))}
      </span>
    </div>
  );
}

function SectionHead({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <div className="mb-8" data-reveal>
      <div className="mono-label text-[11px] text-stone">{n}</div>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-[28px] leading-tight text-ink md:text-[36px]">{title}</h2>
      {sub && <p className="mt-3 max-w-[70ch] text-[14px] leading-relaxed text-graphite">{sub}</p>}
    </div>
  );
}

function EntityHead({ n, e }: { n: string; e: (typeof entities)[number] }) {
  return (
    <div className="mb-5" data-reveal>
      <div className="mono-label text-[10px] text-blue">{n}</div>
      <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-[24px] leading-tight text-ink md:text-[28px]">{e.name}</h3>
      <p className="mt-2 max-w-[72ch] text-[13px] leading-relaxed text-graphite">{e.desc}</p>
    </div>
  );
}

export default function DatenmodellPage() {
  let counter = 0;
  const num = () => String(++counter).padStart(2, "0");

  return (
    <>
      <Header />
      <main id="top">
        {/* hero */}
        <section className="hero-glow overflow-hidden border-b border-line">
          <div className="mx-auto max-w-[1240px] px-6 pb-14 pt-14 md:pb-16">
            <div className="mono-label text-[11px] text-stone" data-reveal>Datenmodell & Zugriff · Entwurf</div>
            <h1 className="mt-4 max-w-[20ch] text-balance font-[family-name:var(--font-display)] text-[40px] leading-[1.08] text-ink md:text-[68px]" data-reveal>
              Jede Tabelle: wer sie schreibt, wer welche Felder liest.
            </h1>
            <p className="mt-6 max-w-[64ch] text-[16px] leading-relaxed text-graphite md:text-[18px]" data-reveal>
              Der Fall ist ein Datenmodell — Tabellen mit Feldern, wie in einer Datenbank. Schwarze
              Pfeile zeigen, wer eine Tabelle anlegt und pflegt. Blaue Pfeile zeigen, welche Rolle
              welche Feldgruppe lesen darf. So ist feldgenau sichtbar, wer was sieht.
            </p>
            <div className="mt-8" data-reveal><Legend /></div>
            <p className="mono-label mt-6 inline-flex items-center gap-2 rounded-full bg-periwinkle px-3.5 py-1.5 text-[10px] text-ink" data-reveal>
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-blue" /> Entwurf · alle Angaben Beispieldaten
            </p>
          </div>
        </section>

        {/* роли */}
        <section className="mx-auto max-w-[1240px] px-6 py-16">
          <SectionHead n="Die Beteiligten" title="Elf Rollen, klare Verantwortung." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
            {roleOrder.map((id) => (
              <div key={id} className="rounded-[16px] border border-hair bg-card p-4">
                <RoleHead role={id} />
                <p className="mt-2.5 text-[12px] leading-relaxed text-stone">{roles[id].note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* сущности по секциям */}
        {sections.map((sec) => {
          const items = entities.filter((e) => e.section === sec);
          const subMap: Record<string, string> = {
            Stammdaten: "Die Kern-Tabellen des Falls — Person und Auftraggeber.",
            Ablauf: "Wünsche und Termine, die den Ablauf bestimmen.",
            Partner: "Aufträge an die durchführenden Partner — feldgenauer Zugriff.",
            Kaufmännisch: "Abrechnung, Prozess und lückenloses Protokoll.",
          };
          return (
            <section key={sec} className="border-t border-line">
              <div className="mx-auto max-w-[1240px] px-6 py-16">
                <SectionHead n={`Bereich · ${sec}`} title={sec} sub={subMap[sec]} />
                <div className="grid gap-14">
                  {items.map((e) => (
                    <div key={e.id} id={e.id}>
                      <EntityHead n={`Tabelle ${num()}`} e={e} />
                      <div data-reveal>
                        {e.kind === "diagram" ? <EntityDiagram entity={e} /> : <EntityCard entity={e} />}
                      </div>
                    </div>
                  ))}

                  {/* документы врезаются в Stammdaten */}
                  {sec === "Stammdaten" && (
                    <div id="dokumente">
                      <div className="mb-5" data-reveal>
                        <div className="mono-label text-[10px] text-blue">Tabelle {num()}</div>
                        <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-[24px] leading-tight text-ink md:text-[28px]">Dokumente</h3>
                        <p className="mt-2 max-w-[72ch] text-[13px] leading-relaxed text-graphite">
                          Jedes Dokument weiß, wer es hochgeladen hat und für wen es sichtbar ist —
                          sortiert je Beteiligtem und Typ, versioniert, jeder Upload protokolliert.
                        </p>
                      </div>
                      <div data-reveal><DocTable /></div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {/* открытые вопросы */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1240px] px-6 py-16">
            <SectionHead n="Zur Klärung" title="Offene Punkte" />
            <div className="grid gap-3 md:grid-cols-2" data-reveal>
              {[
                ["Felder & Typen", "Stimmen Feldnamen, Gruppen und Typen? Fehlt ein Feld oder eine ganze Tabelle?"],
                ["Feld vs. Gruppe", "Zugriff ist je Feldgruppe geregelt. Braucht ein einzelnes Feld eine Ausnahme?"],
                ["Quellen als Rollen", "Klinik/Arzt und Standesamt als schreibende Rollen bestätigen — oder speist der Bestatter ein?"],
                ["Verbund-Zentrale", "Soll die Aufsichtsrolle über mehrere Häuser voll ausgearbeitet werden?"],
              ].map(([t, d]) => (
                <div key={t} className="rounded-[12px] border border-l-[3px] border-hair border-l-blue bg-card px-5 py-4">
                  <div className="mono-label text-[10px] text-blue">{t}</div>
                  <p className="mt-2 text-[13px] leading-relaxed text-graphite">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3.5" data-reveal>
              <Link href="/workspace/" className="btn-blue press arrow-shift mono-label inline-flex items-center gap-2.5 px-7 py-3.5 text-[13px]">
                Arbeitsbereich ansehen <span aria-hidden="true">▸</span>
              </Link>
              <Link href="/" className="btn-ghost press mono-label inline-flex items-center gap-2 px-7 py-3.5 text-[13px]">
                Zur Startseite
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
