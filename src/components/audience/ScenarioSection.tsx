import Link from "next/link";
import { IconCheck } from "../icons";
import type { ScenarioBlock, BoardColumnSpec } from "./types";

/* Сценарий Steep — три взаимозаменяемых вида:
   loss  — сравнительная схема потерь (heute-цепочка + опц. mit-путь),
   board — канбан offen / in Arbeit / erledigt,
   access — что видит роль / что остаётся скрытым (для Familien).
   Все данные — Beispieldaten. */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

function Head({ heading, headingEm, sub }: { heading: string; headingEm: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-[680px] text-center" data-reveal>
      <h2 className={`${serif} text-balance text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
        {heading} <em className="italic">{headingEm}</em>.
      </h2>
      {sub && <p className={`${sans} mx-auto mt-4 max-w-[52ch] text-[16px] leading-[1.5] text-slate`}>{sub}</p>}
    </div>
  );
}

/* ── loss: где теряется информация ─────────────────────────── */

function LossView({ s }: { s: Extract<ScenarioBlock, { view: "loss" }> }) {
  const heute = (
    <div data-reveal className="rounded-[24px] bg-mist p-7">
      <div className={`${sans} mb-6 flex items-center justify-between`}>
        <span className="text-[14px] font-medium text-nero">Heute</span>
        {s.badge && <span className="rounded-full bg-white px-2.5 py-1 text-[11px] text-slate">{s.badge}</span>}
      </div>
      <div className="flex flex-col items-center">
        {s.heute.map((step, i) => (
          <div
            key={step.via + i}
            className="diagram-node flex w-full flex-col items-center"
            style={{ "--node-delay": `${0.1 + i * 0.14}s` } as React.CSSProperties}
          >
            <div className={`${sans} flex w-full items-center justify-center gap-2`}>
              <span className="artifact-quiet whitespace-nowrap px-3.5 py-1.5 text-[12.5px] text-nero">{step.from}</span>
              <span className="flex flex-col items-center px-1">
                <span className="text-[10px] uppercase tracking-wide text-ashen">{step.via}</span>
                <span aria-hidden="true" className="text-[13px] text-ashen">⇢</span>
              </span>
              <span className="artifact-quiet whitespace-nowrap px-3.5 py-1.5 text-[12.5px] text-nero">{step.to}</span>
            </div>
            <div
              className={`loss-pulse ${sans} my-3 flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[11.5px] text-sienna`}
            >
              <span aria-hidden="true">✕</span> {step.loss}
            </div>
            {i < s.heute.length - 1 && (
              <span aria-hidden="true" className="mb-3 block h-4 w-px border-l border-dashed border-ashen" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const mit = s.mit && (
    <div data-reveal style={{ transitionDelay: "120ms" }} className="artifact p-7">
      <div className={`${sans} mb-6 flex items-center justify-between`}>
        <span className="text-[14px] font-medium text-nero">Mit MementoOS</span>
        <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] text-slate">Ein Fall · ein Ort</span>
      </div>
      <div className="flex flex-col">
        {s.mit.map((step, i) => (
          <div
            key={step.title}
            className="diagram-node flex gap-3.5"
            style={{ "--node-delay": `${0.2 + i * 0.14}s` } as React.CSSProperties}
          >
            <div className="flex flex-col items-center">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-nero text-white">
                <IconCheck className="h-3 w-3" />
              </span>
              {i < s.mit!.length - 1 && <span aria-hidden="true" className="w-px flex-1 bg-mist" />}
            </div>
            <div className={`${sans} pb-6`}>
              <b className="block text-[14.5px] font-medium text-nero">{step.title}</b>
              <p className="mt-1 text-[13px] leading-[1.5] text-slate">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
      {s.foot && (
        <div className={`${sans} mt-1 rounded-[12px] bg-mist px-4 py-3 text-[12.5px] text-nero`}>{s.foot}</div>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <Head heading={s.heading} headingEm={s.headingEm} sub={s.sub} />
      {mit ? (
        <div className="mx-auto mt-12 grid max-w-[960px] gap-5 md:grid-cols-2">
          {heute}
          {mit}
        </div>
      ) : (
        <>
          <div className="mx-auto mt-12 max-w-[560px]">{heute}</div>
          {s.foot && (
            <p className={`${sans} mx-auto mt-6 max-w-[52ch] text-center text-[13px] text-slate`} data-reveal>
              {s.foot}
            </p>
          )}
        </>
      )}
    </section>
  );
}

/* ── board: канбан offen / in Arbeit / erledigt ────────────── */

function BoardColumn({ col, delay }: { col: BoardColumnSpec; delay: number }) {
  const { state } = col;
  return (
    <div className="diagram-node rounded-[24px] bg-mist p-3" style={{ "--node-delay": `${delay}s` } as React.CSSProperties}>
      <div className={`${sans} mb-3 flex items-center justify-between px-2 pt-1`}>
        <span className="text-[14px] font-medium text-nero">{col.title}</span>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[12px] text-slate">{col.tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {col.tasks.map((t) => (
          <div key={t.label} className={`artifact-quiet ${sans} p-3.5 ${state === "done" ? "opacity-70" : ""}`}>
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 flex h-[16px] w-[16px] flex-none items-center justify-center rounded-full ${
                  state === "done"
                    ? "bg-nero text-white"
                    : state === "doing"
                      ? "border-[5px] border-nero"
                      : "border border-dove"
                }`}
                aria-hidden="true"
              >
                {state === "done" && <IconCheck className="h-2.5 w-2.5" />}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-[13px] leading-snug ${state === "done" ? "text-slate line-through" : "text-nero"}`}
                >
                  {t.label}
                </span>
                <span className="mt-1 block text-[11px] text-dove">{t.meta}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardView({ s }: { s: Extract<ScenarioBlock, { view: "board" }> }) {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <Head heading={s.heading} headingEm={s.headingEm} sub={s.sub} />
      <div className="mx-auto mt-12 max-w-[960px]" data-reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {s.columns.map((c, i) => (
            <BoardColumn key={c.title} col={c} delay={0.1 + i * 0.12} />
          ))}
        </div>
        {s.foot && <p className={`${sans} mt-4 text-center text-[12px] text-dove`}>{s.foot}</p>}
      </div>
    </section>
  );
}

/* ── access: что видит роль / что скрыто (Familien, увязка с /datenmodell) ── */

function AccessView({ s }: { s: Extract<ScenarioBlock, { view: "access" }> }) {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <Head heading={s.heading} headingEm={s.headingEm} sub={s.sub} />
      <div className="mx-auto mt-12 grid max-w-[900px] gap-5 md:grid-cols-2">
        {/* видимое */}
        <div data-reveal className="artifact p-7">
          <div className={`${sans} mb-5 text-[14px] font-medium text-nero`}>Das sehen Sie</div>
          <ul className="flex flex-col gap-3">
            {s.visible.map((r) => (
              <li key={r.label} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-nero text-white">
                  <IconCheck className="h-2.5 w-2.5" />
                </span>
                <span className={`${sans} min-w-0`}>
                  <span className="block text-[14px] text-nero">{r.label}</span>
                  {r.note && <span className="text-[12px] text-slate">{r.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* скрытое */}
        <div data-reveal style={{ transitionDelay: "120ms" }} className="rounded-[24px] bg-mist p-7">
          <div className={`${sans} mb-5 text-[14px] font-medium text-slate`}>Das bleibt verborgen</div>
          <ul className="flex flex-col gap-3">
            {s.hidden.map((r) => (
              <li key={r.label} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border border-dove text-dove"
                >
                  ✕
                </span>
                <span className={`${sans} min-w-0`}>
                  <span className="block text-[14px] text-slate line-through">{r.label}</span>
                  {r.note && <span className="text-[12px] text-dove">{r.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {s.link && (
        <div className="mx-auto mt-8 max-w-[900px] text-center" data-reveal>
          <Link href={s.link.href} className={`quiet-link ${sans} text-[15px] text-nero`}>
            {s.link.label}
          </Link>
        </div>
      )}
    </section>
  );
}

export function ScenarioSection({ szenario }: { szenario: ScenarioBlock }) {
  switch (szenario.view) {
    case "loss":
      return <LossView s={szenario} />;
    case "board":
      return <BoardView s={szenario} />;
    case "access":
      return <AccessView s={szenario} />;
  }
}
