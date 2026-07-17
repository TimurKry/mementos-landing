import { HubDiagram } from "./HubDiagram";

export function Ecosystem() {
  return (
    <section className="mx-auto max-w-[1180px] px-7 py-20">
      <div className="mb-12 text-center" data-reveal>
        <div className="text-[11px] uppercase tracking-[.2em] text-kirsche">Das Ökosystem</div>
        <h2 className="mx-auto mt-3 max-w-[20ch] text-balance font-[family-name:var(--font-display)] text-[28px] font-medium md:text-[34px]">
          Ein Fall. Alle Beteiligten. Ein System.
        </h2>
      </div>
      <div data-reveal>
        <HubDiagram />
      </div>
    </section>
  );
}
