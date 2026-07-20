import { HeroMockup } from "./HeroMockup";
import { IconCheck } from "./icons";

export function Hero() {
  return (
    <section id="plattform" className="hero-glow overflow-hidden">
      <div className="mx-auto grid max-w-[1200px] items-stretch gap-5 px-6 pb-16 pt-10 md:grid-cols-[1.02fr_1fr] md:pt-14">
        {/* левая панель — Keylime Wash (Ease hero) */}
        <div className="step-in rounded-[20px] bg-keylime px-8 py-10 md:px-11 md:py-14">
          <span className="mono-label inline-flex items-center gap-2 rounded-full bg-paper px-3.5 py-1.5 text-[11px] text-ink">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-ink" />
            Betriebssystem der Bestattungsbranche
          </span>
          <h1 className="mb-5 mt-6 text-balance font-[family-name:var(--font-display)] text-[44px] font-light leading-[1.08] tracking-[-0.02em] md:text-[60px]">
            Ein Betriebssystem für moderne Bestattungs&shy;koordination.
          </h1>
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-charcoal/80">
            MementoOS verbindet Bestatter, Krematorien, Friedhöfe, Transport und
            Zulieferer in einem gemeinsamen digitalen Vorgang — ohne
            Telefonketten, Fax und Papier.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <a href="#kontakt" className="btn-premium press inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-medium">
              Demo anfragen <span aria-hidden="true">→</span>
            </a>
            <a href="#ablauf" className="press inline-flex items-center gap-2 rounded-full border border-ink/50 px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-paper">
              So funktioniert es
            </a>
          </div>
          <p className="mt-8 flex items-center gap-2 text-[13px] text-stone">
            <IconCheck className="h-4 w-4 text-ink" />
            Entwickelt in Leipzig — im direkten Austausch mit der Branche.
          </p>
        </div>

        {/* правая панель — Slate Hush, дом для продукт-превью */}
        <div className="step-in flex items-center rounded-[20px] bg-slate px-5 py-8 md:px-8" style={{ animationDelay: "0.14s", animationFillMode: "backwards" }}>
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
