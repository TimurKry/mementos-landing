import Link from "next/link";
import { IconCheck } from "./icons";

/* Heute/Morgen (Monad): контраст «Papierweg» vs «gemeinsamer Fall».
   Слева нейтральная карта с цепочкой каналов и маркерами потери
   (в Monad sienna для UI запрещена — потери гасим stone+зачёркиванием),
   справа единственная periwinkle-карта секции с чек-шагами. */

// Heute — четыре смены канала, каждая теряет часть информации
const heuteSteps = [
  { from: "Familie", via: "Anruf", to: "Bestatter", loss: "Notizen auf Zetteln — nichts ist geteilt." },
  { from: "Bestatter", via: "Fax", to: "Krematorium", loss: "Warten auf Rückruf, Stand unklar." },
  { from: "Krematorium", via: "Rückfrage", to: "Bestatter", loss: "Angaben werden doppelt erfasst." },
  { from: "Bestatter", via: "Anrufe", to: "Partner", loss: "Jeder einzeln — niemand sieht das Ganze." },
];

// Mit MementoOS — четыре шага eines gemeinsamen Falls
const morgenSteps = [
  { title: "Ein Fall entsteht", text: "Mit der Buchung landen alle Angaben an einem Ort." },
  { title: "Alle treten per Link bei", text: "Familie, Krematorium und Partner — ohne Registrierung." },
  { title: "Aufgaben: offen oder erledigt", text: "Jeder sieht, was aussteht. Rückfragen entfallen." },
  { title: "Abschluss & Archiv", text: "Vollständig dokumentiert, nichts geht verloren." },
];

export function HeuteMorgen() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="mb-12" data-reveal>
        <div className="mono-label text-[12px] text-stone">Vom Papierweg zum gemeinsamen Fall</div>
        <h2 className="mt-4 max-w-[22ch] text-balance font-[family-name:var(--font-display)] text-[30px] leading-tight md:text-[40px]">
          Heute wechselt Information ständig den Kanal.
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Heute — нейтральная карта, каскад с маркерами потери */}
        <div data-reveal className="rounded-[28px] border border-hair bg-card p-7">
          <div className="mono-label mb-6 text-[11px] text-stone">Heute</div>
          <div className="grid gap-4">
            {heuteSteps.map((s, i) => (
              <div
                key={`${s.from}-${s.to}`}
                className="diagram-node"
                style={{ "--node-delay": `${0.1 + i * 0.09}s` } as React.CSSProperties}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mono-label rounded-full border border-hair bg-paper px-3 py-1.5 text-[10px] text-ink">
                    {s.from}
                  </span>
                  <span className="mono-label text-[10px] text-stone">— {s.via} →</span>
                  <span className="mono-label rounded-full border border-hair bg-paper px-3 py-1.5 text-[10px] text-ink">
                    {s.to}
                  </span>
                </div>
                <p className="mt-2 flex items-start gap-2 text-[12.5px] leading-relaxed text-stone line-through">
                  <span aria-hidden="true">✕</span> {s.loss}
                </p>
              </div>
            ))}
          </div>
          <div className="mono-label mt-6 inline-flex items-center gap-2 rounded-full border border-hair bg-paper px-3 py-1.5 text-[9.5px] text-stone">
            Telefon · Fax · Zettel · Beispieldaten
          </div>
        </div>

        {/* Mit MementoOS — единственная periwinkle-карта секции */}
        <div data-reveal className="rounded-[28px] bg-periwinkle p-7">
          <div className="mono-label mb-6 text-[11px] text-ink">Mit MementoOS</div>
          <div className="grid gap-5">
            {morgenSteps.map((s, i) => (
              <div
                key={s.title}
                className="diagram-node flex items-start gap-3.5"
                style={{ "--node-delay": `${0.1 + i * 0.09}s` } as React.CSSProperties}
              >
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ink text-paper">
                  <IconCheck className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-[19px] leading-snug text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-charcoal/80">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mono-label mt-6 rounded-full bg-paper/60 px-3.5 py-2 text-[9.5px] text-ink">
            Schneller und leichter — weil Information nie den Kanal wechselt.
          </div>
        </div>
      </div>

      <div className="mt-10" data-reveal>
        <Link href="/so-funktioniert-es/" className="arrow-shift mono-label inline-flex items-center gap-2.5 text-[13px] text-ink">
          So funktioniert es im Detail <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
