import type { AudienceData } from "./types";
import { IconCheck } from "../icons";

/* Ablauf: вертикальный мини-путь с IconCheck-узлами (diagram-node),
   соединённые тонкой линией. Спокойный порядок «Schritt für Schritt». */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

export function StepsSection({ ablauf }: { ablauf: AudienceData["ablauf"] }) {
  return (
    <section className="bg-fog">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mx-auto max-w-[680px] text-center" data-reveal>
          <h2 className={`${serif} text-balance text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
            {ablauf.heading} <em className="italic">{ablauf.headingEm}</em>.
          </h2>
          {ablauf.sub && (
            <p className={`${sans} mx-auto mt-4 max-w-[52ch] text-[16px] leading-[1.5] text-slate`}>{ablauf.sub}</p>
          )}
        </div>
        <div className="mx-auto mt-12 max-w-[600px]" data-reveal>
          {ablauf.steps.map((step, i) => (
            <div
              key={step.title}
              className="diagram-node flex gap-4"
              style={{ "--node-delay": `${0.15 + i * 0.12}s` } as React.CSSProperties}
            >
              <div className="flex flex-col items-center">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-nero text-white">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                {i < ablauf.steps.length - 1 && <span aria-hidden="true" className="w-px flex-1 bg-mist" />}
              </div>
              <div className={`${sans} pb-8`}>
                <b className="block text-[16px] font-medium text-nero">{step.title}</b>
                <p className="mt-1.5 text-[14px] leading-[1.5] text-slate">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
