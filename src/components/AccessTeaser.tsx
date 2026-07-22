import Link from "next/link";
import { IconBestatter, IconFamilie, IconTransport } from "./icons";

/* Тизер модели доступа на главной (Monad). Мини-иллюстрация «одно
   событие — две сихты» + ссылка на полную ER-схему /datenmodell. */
export function AccessTeaser() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-16">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1.05fr]">
        <div data-reveal>
          <div className="mono-label text-[11px] text-stone">Transparenz nach Rolle</div>
          <h2 className="mb-4 mt-3 text-balance font-[family-name:var(--font-display)] text-[30px] leading-tight md:text-[40px]">
            Jeder sieht genau seinen Teil — <span className="text-blue">feldgenau</span>.
          </h2>
          <p className="max-w-[48ch] text-[15px] leading-relaxed text-graphite">
            Ein Ereignis wird einmal gespeichert und für jede Rolle unterschiedlich aufgelöst.
            Die Familie sieht Fahrzeugtyp und Ankunftszeit — Fahrer, Kennzeichen und Konditionen
            bleiben verborgen. Das gilt für jedes Feld, für jede Beteiligte.
          </p>
          <Link href="/datenmodell/" className="arrow-shift mono-label mt-6 inline-flex items-center gap-2.5 text-[13px] text-ink">
            Vollständiges Datenmodell ansehen <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* мини-схема: событие → две сихты */}
        <div data-reveal className="rounded-[28px] border border-hair bg-card p-6 md:p-8">
          <div className="mono-label mb-4 inline-flex items-center gap-2 rounded-full border border-hair bg-paper px-3 py-1.5 text-[10px] text-ink">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-blue" /> Transport hat bestätigt
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: <IconBestatter className="h-4 w-4" />, who: "Bestatter", tag: "Vollzugriff", items: ["Fahrzeug + Zeit", "Fahrer & Kennzeichen", "Konditionen"], all: true },
              { icon: <IconFamilie className="h-4 w-4" />, who: "Familie", tag: "gefiltert", items: ["Fahrzeugtyp", "Ankunftszeit"], hidden: ["Fahrer", "Konditionen"] },
            ].map((c) => (
              <div key={c.who} className="rounded-[16px] border border-hair bg-paper p-4">
                <div className="mb-3 flex items-center gap-2 text-ink">
                  {c.icon}
                  <b className="text-[13px] font-semibold">{c.who}</b>
                  <span className="mono-label ml-auto rounded-full border border-hair px-2 py-0.5 text-[8.5px] text-stone">{c.tag}</span>
                </div>
                <ul className="grid gap-1.5">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-[12px] text-ink">
                      <span aria-hidden="true" className={c.all ? "text-ink" : "text-blue"}>✓</span> {it}
                    </li>
                  ))}
                  {c.hidden?.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-[12px] text-stone line-through">
                      <span aria-hidden="true">✕</span> {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mono-label mt-4 flex items-center gap-2 text-[10px] text-stone">
            <IconTransport className="h-3.5 w-3.5" /> Dasselbe Ereignis · zwei Sichten
          </div>
        </div>
      </div>
    </section>
  );
}
