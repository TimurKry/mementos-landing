import { HeroMockup } from "./HeroMockup";
import { IconCheck } from "./icons";

export function Hero() {
  return (
    <section id="plattform" className="hero-glow overflow-hidden">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-7 pb-20 pt-16 md:grid-cols-[1.05fr_1fr] md:pt-24">
        <div className="step-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[11px] uppercase tracking-[.18em] text-stone elev-md">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-kirsche" />
            Das Betriebssystem für die Bestattungsbranche
          </span>
          <h1 className="mb-5 mt-6 text-balance font-[family-name:var(--font-display)] text-[42px] font-medium leading-[1.08] tracking-[-0.01em] md:text-[58px]">
            Ein <span className="text-kirsche">Betriebssystem</span> für moderne Bestattungs&shy;koordination.
          </h1>
          <p className="max-w-[48ch] text-[17px] leading-relaxed text-stone">
            MementoOS verbindet Bestatter, Krematorien, Friedhöfe, Transport und
            Zulieferer in einem gemeinsamen digitalen Vorgang — ohne
            Telefonketten, Fax und Papier.
          </p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <a href="#kontakt" className="btn-premium press inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium">
              Demo anfragen <span aria-hidden="true">↗</span>
            </a>
            <a href="#ablauf" className="press inline-flex items-center gap-2 rounded-[10px] border border-line bg-card px-6 py-3.5 text-sm font-medium transition-shadow hover:shadow-[var(--shadow-md)]">
              So funktioniert es <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="mt-7 flex items-center gap-2 text-[13px] text-stone">
            <IconCheck className="h-4 w-4 text-wald" />
            Entwickelt in Leipzig — im direkten Austausch mit der Branche.
          </p>
        </div>

        <div className="step-in" style={{ animationDelay: "0.14s", animationFillMode: "backwards" }}>
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
