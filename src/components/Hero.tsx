import { IconCheck } from "./icons";

/* Типографический hero (Monad): никакого скриншота — заголовок-серif,
   mono-подтекст, две пилюли. Атмосфера — дрейфующие градиентные заливки. */
export function Hero() {
  return (
    <section id="plattform" className="hero-glow overflow-hidden">
      <div className="mx-auto flex max-w-[880px] flex-col items-center px-6 pb-14 pt-16 text-center md:pb-20 md:pt-24">
        <span
          className="rise mono-label inline-flex items-center gap-2.5 rounded-full border border-hair bg-paper px-4 py-2 text-[11px] text-ink"
          style={{ "--rise-delay": "0s" } as React.CSSProperties}
        >
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-blue" />
          Betriebssystem der Bestattungsbranche
        </span>

        <h1
          className="rise mb-6 mt-7 text-balance font-[family-name:var(--font-display)] text-[52px] leading-[1.1] md:text-[84px]"
          style={{ "--rise-delay": "0.12s" } as React.CSSProperties}
        >
          Ein Vorgang.
          <br />
          Alle Beteiligten.
        </h1>

        <p
          className="rise max-w-[52ch] text-[16px] leading-[1.55] text-graphite md:text-[19px]"
          style={{ "--rise-delay": "0.24s" } as React.CSSProperties}
        >
          MementoOS verbindet Bestatter, Krematorien, Friedhöfe, Transport und
          Zulieferer in einem gemeinsamen digitalen Vorgang — ohne
          Telefonketten, Fax und Papier.
        </p>

        <div
          className="rise mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ "--rise-delay": "0.36s" } as React.CSSProperties}
        >
          <a
            href="#kontakt"
            className="btn-blue press arrow-shift mono-label inline-flex items-center gap-2.5 px-8 py-4 text-[13px]"
          >
            Demo anfragen <span aria-hidden="true">▸</span>
          </a>
          <a
            href="#oekosystem"
            className="btn-ghost press mono-label inline-flex items-center gap-2 px-8 py-4 text-[13px]"
          >
            So funktioniert es
          </a>
        </div>

        <p
          className="rise mt-9 flex items-center gap-2 text-[12.5px] text-stone"
          style={{ "--rise-delay": "0.48s" } as React.CSSProperties}
        >
          <IconCheck className="h-4 w-4 text-ink" />
          Entwickelt in Leipzig — im direkten Austausch mit der Branche.
        </p>
      </div>
    </section>
  );
}
