import { HubDiagram } from "./HubDiagram";
import { IconCheck } from "./icons";

export function Hero() {
  return (
    <section id="plattform" className="mx-auto max-w-[1180px] px-7 pb-16 pt-16 md:pt-[72px]">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="w-pill inline-block border border-ink bg-card px-3.5 py-1.5 text-[11px] uppercase tracking-[.18em] text-stone">
            Das Betriebssystem für die Bestattungsbranche
          </span>
          <h1 className="mb-4 mt-5 text-balance font-[family-name:var(--font-display)] text-[38px] font-medium leading-[1.14] md:text-[50px]">
            Ein{" "}
            <em className="not-italic underline decoration-stone decoration-wavy decoration-[1.5px] underline-offset-8">
              Betriebssystem
            </em>{" "}
            für moderne Bestattungs&shy;koordination.
          </h1>
          <p className="max-w-[46ch] text-stone">
            MementoOS verbindet Bestatter, Krematorien, Friedhöfe, Transport und
            Zulieferer in einem gemeinsamen digitalen Vorgang — ohne
            Telefonketten, Fax und Papier.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <a href="#kontakt" className="w-btn hatch border-[1.3px] border-ink bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:-translate-x-px hover:-translate-y-px">
              Demo anfragen <span aria-hidden="true">↗</span>
            </a>
            <a href="#ablauf" className="w-btn border-[1.3px] border-ink px-5 py-3 text-sm font-medium transition-transform hover:-translate-x-px hover:-translate-y-px">
              So funktioniert es <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-[13px] text-stone">
            <IconCheck className="h-4 w-4" />
            Entwickelt in Leipzig — im direkten Austausch mit der Branche.
          </p>
        </div>
        <HubDiagram />
      </div>
    </section>
  );
}
