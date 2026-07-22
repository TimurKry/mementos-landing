import Link from "next/link";
import { IconCheck } from "../icons";
import type { PricingSpec, PricingPlan } from "./types";
import { defaultPlans } from "./data";

/* Общий прайсинг-блок Steep-страниц. section id="preise" — сюда
   ведёт якорь навигации. Kernmodell — единственная приподнятая карта
   (.artifact), остальные тихие bg-mist. Данные — из PricingSpec/defaultPlans. */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

/* внутренняя ссылка → next/link (basePath!), якорь/mailto → <a> */
function Action({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function PlanCard({ plan, delay }: { plan: PricingPlan; delay: number }) {
  const hi = plan.highlight;
  return (
    <div
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex flex-col p-7 ${hi ? "artifact" : "rounded-[24px] bg-mist"}`}
    >
      <span className={`${sans} text-[12px] font-medium uppercase tracking-wide ${hi ? "text-sienna" : "text-ashen"}`}>
        {plan.badge}
      </span>
      <h3 className={`${serif} mt-2 text-[30px] text-nero`}>{plan.name}</h3>
      <p className={`${sans} mt-1 text-[14px] text-slate`}>{plan.sub}</p>
      <ul className={`${sans} mt-5 flex flex-1 flex-col gap-2.5 text-[13.5px] text-nero`}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${
                hi ? "bg-nero text-white" : "border border-slate text-slate"
              }`}
            >
              <IconCheck className="h-2.5 w-2.5" />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <p className={`${sans} mt-5 text-[12.5px] text-slate`}>{plan.condition}</p>
      <Action
        href={plan.cta.href}
        className={
          hi
            ? `btn-nero press ${sans} mt-4 self-start px-6 py-3 text-[14px]`
            : `quiet-link ${sans} mt-4 self-start py-2 text-[14px] text-nero`
        }
      >
        {plan.cta.label}
      </Action>
    </div>
  );
}

export function Pricing({ spec }: { spec: PricingSpec }) {
  const plans = spec.plans ?? defaultPlans;

  return (
    <section id="preise" className="mx-auto max-w-[1200px] px-6 pb-20 pt-8">
      <div className="mx-auto max-w-[680px] text-center" data-reveal>
        {spec.roleLabel && (
          <div className={`${sans} mb-3 text-[13px] uppercase tracking-wide text-ashen`}>{spec.roleLabel}</div>
        )}
        <h2 className={`${serif} text-balance text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
          {spec.heading} <em className="italic">{spec.headingEm}</em>.
        </h2>
        {spec.sub && (
          <p className={`${sans} mx-auto mt-4 max-w-[52ch] text-[16px] leading-[1.5] text-slate`}>{spec.sub}</p>
        )}
      </div>

      {spec.variant === "partner-note" ? (
        /* партнёр присоединяется к чужому Fall — без собственной лицензии */
        <div className="mx-auto mt-12 max-w-[640px]" data-reveal>
          <div className="rounded-[24px] bg-mist p-8 md:p-10">
            <b className={`${sans} block text-[18px] font-medium text-nero`}>
              Sie treten dem Fall bei — ohne eigene Lizenz.
            </b>
            <p className={`${sans} mt-3 text-[15px] leading-[1.6] text-slate`}>{spec.note}</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-12 grid max-w-[1000px] gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <PlanCard key={p.name} plan={p} delay={i * 90} />
          ))}
        </div>
      )}

      {spec.foot && (
        <p className={`${sans} mt-6 text-center text-[12px] text-dove`} data-reveal>
          {spec.foot}
        </p>
      )}
    </section>
  );
}
