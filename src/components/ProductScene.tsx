import Link from "next/link";
import {
  IconBestatter,
  IconKrematorium,
  IconTransport,
  IconFamilie,
  IconDokument,
  IconCheck,
} from "./icons";

/* «Живой» продукт-кадр: окно Cockpit проживает один Fall по кругу —
   статус подтверждается, Unterlagen отмечаются, приходит Meldung.
   Чистый CSS-таймлайн (14s), при reduced-motion замирает завершённым.
   Все данные — Beispieldaten, как в /demo. */

const beteiligte = [
  { icon: <IconBestatter className="h-3.5 w-3.5" />, label: "Bestatter" },
  { icon: <IconKrematorium className="h-3.5 w-3.5" />, label: "Krematorium" },
  { icon: <IconTransport className="h-3.5 w-3.5" />, label: "Transport" },
  { icon: <IconFamilie className="h-3.5 w-3.5" />, label: "Familie" },
];

const unterlagen = [
  { label: "Sterbefallanzeige", n: 1 },
  { label: "Todesbescheinigung", n: 2 },
  { label: "Einäscherungsantrag", n: 3 },
  { label: "Freigabe Krematorium", n: 4 },
];

export function ProductScene() {
  return (
    <section id="produkt" className="border-y border-line">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-14 text-center" data-reveal>
          <div className="mono-label text-[12px] text-stone">Das Produkt</div>
          <h2 className="mx-auto mt-4 max-w-[26ch] text-balance font-[family-name:var(--font-display)] text-[34px] leading-[1.15] md:text-[46px]">
            Ein Fall, der sich selbst erklärt.
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[14px] leading-relaxed text-graphite">
            So sieht ein laufender Vorgang im Cockpit aus: Status, Beteiligte
            und Unterlagen — für alle sichtbar, ohne einen einzigen Anruf.
          </p>
        </div>

        <div data-reveal className="relative mx-auto max-w-[860px]">
          {/* окно продукта */}
          <div className="soft-ambient overflow-hidden rounded-[24px] border border-hair bg-card">
            {/* хром окна */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-hair" />
                <span className="h-2.5 w-2.5 rounded-full bg-hair" />
                <span className="h-2.5 w-2.5 rounded-full bg-hair" />
              </span>
              <span className="mono-label ml-2 flex-1 truncate rounded-full border border-line bg-paper px-4 py-1.5 text-[10px] text-stone">
                cockpit.mementos.app/fall/M-2026-0147
              </span>
              <span className="mono-label hidden rounded-full border border-hair px-3 py-1 text-[9px] text-stone sm:block">
                Beispieldaten
              </span>
            </div>

            {/* шапка кейса */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5 md:px-8">
              <div>
                <div className="mono-label text-[10px] text-stone">Fall M-2026-0147 · Einäscherung</div>
                <div className="mt-1.5 font-[family-name:var(--font-display)] text-[24px] leading-tight text-ink">
                  Bestattungshaus Weber, Leipzig
                </div>
              </div>
              {/* статус: ANFRAGE → BESTÄTIGT */}
              <div className="relative h-[30px] w-[126px]">
                <span className="scene-pill-a mono-label absolute inset-0 flex items-center justify-center rounded-full border border-ocker bg-[#f1eada] text-[10px] text-ocker">
                  Anfrage
                </span>
                <span className="scene-pill-b mono-label absolute inset-0 flex items-center justify-center rounded-full border border-wald bg-[#e7ece5] text-[10px] text-wald">
                  Bestätigt ✓
                </span>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-[1fr_1.35fr]">
              {/* участники */}
              <div className="border-b border-line p-6 md:border-b-0 md:border-r md:p-8">
                <div className="mono-label mb-4 text-[10px] text-stone">Beteiligte</div>
                <div className="flex flex-col items-start gap-2.5">
                  {beteiligte.map((b) => (
                    <span
                      key={b.label}
                      className="inline-flex items-center gap-2 rounded-full border border-hair bg-paper py-1.5 pl-3 pr-4"
                    >
                      <span className="text-ink">{b.icon}</span>
                      <span className="mono-label text-[10px] text-ink">{b.label}</span>
                      <span className="live-dot ml-0.5 inline-block h-1 w-1 rounded-full bg-blue" />
                    </span>
                  ))}
                </div>
                <div className="mono-label mt-6 flex items-center gap-1.5 text-[10px] text-stone">
                  Link für Angehörige aktiv
                  <span className="scene-cursor inline-block h-3 w-[5px] bg-ink/60" aria-hidden="true" />
                </div>
              </div>

              {/* документы + прогресс */}
              <div className="p-6 md:p-8">
                <div className="mono-label mb-4 flex items-center justify-between text-[10px] text-stone">
                  <span>Unterlagen</span>
                  <span className="flex items-center gap-1.5">
                    <IconDokument className="h-3 w-3" /> 4 erforderlich
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {unterlagen.map((u) => (
                    <li
                      key={u.label}
                      className="flex items-center justify-between rounded-[12px] border border-line bg-paper px-4 py-2.5"
                    >
                      <span className="text-[12px] text-charcoal">{u.label}</span>
                      <span className="relative h-4 w-4" aria-hidden="true">
                        <span className="absolute inset-0 rounded-full border border-hair" />
                        <span className={`scene-check scene-check-${u.n} absolute inset-0 flex items-center justify-center rounded-full bg-wald text-paper`}>
                          <IconCheck className="h-2.5 w-2.5" />
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-line">
                    <div className="scene-bar h-full w-full rounded-full bg-blue" />
                  </div>
                  <div className="mono-label mt-2 text-[9px] text-stone">Vollständigkeit des Vorgangs</div>
                </div>
              </div>
            </div>
          </div>

          {/* тост-уведомление */}
          <div className="scene-toast soft-ambient absolute -bottom-5 left-1/2 flex w-max -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink py-2.5 pl-3.5 pr-5 text-paper">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wald">
              <IconCheck className="h-3 w-3" />
            </span>
            <span className="mono-label text-[10px]">Krematorium hat den Termin bestätigt</span>
          </div>

          {/* плавающие карточки */}
          <div className="float-a soft-ambient absolute left-0 top-[30%] hidden -translate-x-[88%] items-center gap-2 rounded-full border border-hair bg-paper px-4 py-2 lg:flex">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-blue" />
            <span className="mono-label text-[10px] text-ink">Status für alle sichtbar</span>
          </div>
          <div className="float-b soft-ambient absolute right-0 top-[58%] hidden translate-x-[88%] items-center gap-2 rounded-full border border-hair bg-paper px-4 py-2 lg:flex">
            <IconDokument className="h-3.5 w-3.5 text-ink" />
            <span className="mono-label text-[10px] text-ink">Lückenlos dokumentiert</span>
          </div>
        </div>

        <div className="mt-16 text-center" data-reveal>
          <Link
            href="/demo/"
            className="arrow-shift mono-label inline-flex items-center gap-2.5 text-[13px] text-ink"
          >
            Selbst durchklicken — das interaktive Demo <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
