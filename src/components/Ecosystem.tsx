import { HubDiagram } from "./HubDiagram";

export function Ecosystem() {
  return (
    <section id="oekosystem" className="border-y border-line">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-14 text-center" data-reveal>
          <div className="mono-label text-[12px] text-stone">Das Ökosystem</div>
          <h2 className="mx-auto mt-4 max-w-[24ch] text-balance font-[family-name:var(--font-display)] text-[34px] leading-[1.15] md:text-[46px]">
            Ein Fall. Alle Beteiligten. Ein System.
          </h2>
        </div>
        <div data-reveal>
          <HubDiagram />
        </div>
      </div>
    </section>
  );
}
