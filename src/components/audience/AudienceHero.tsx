import Link from "next/link";
import type { HeroSpec } from "./types";
import { Artifact } from "./Artifacts";

/* Hero-коллаж (Steep): заголовок по центру, до четырёх плавающих
   артефактов вокруг него на desktop (absolute + лёгкий поворот),
   стопкой на mobile. rise — появление при загрузке, data-reveal — карты. */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

/* фиксированные позиции коллажа по индексу артефакта (до 4) */
const slots = [
  "float-a absolute left-0 top-2 -rotate-2",
  "float-b absolute right-0 top-16 rotate-2",
  "absolute bottom-4 left-10 rotate-1",
  "absolute -bottom-2 right-16 -rotate-1",
];

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

export function AudienceHero({ hero }: { hero: HeroSpec }) {
  const artifacts = hero.artifacts.slice(0, slots.length);
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="relative">
          {/* артефакты вокруг заголовка (desktop) */}
          {artifacts.map((a, i) => (
            <div key={i} className={`hidden lg:block ${slots[i]}`} data-reveal>
              <Artifact spec={a} />
            </div>
          ))}

          {/* заголовок */}
          <div className="mx-auto max-w-[720px] py-4 text-center lg:max-w-[560px] lg:py-28">
            {hero.kicker && (
              <div className={`rise ${sans} mb-4 text-[13px] uppercase tracking-wide text-ashen`}>{hero.kicker}</div>
            )}
            <h1
              className={`rise ${serif} text-balance text-[48px] leading-[1.15] text-nero md:text-[76px] md:tracking-[-2px]`}
              style={{ "--rise-delay": "0s" } as React.CSSProperties}
            >
              {hero.headlineLead}
              <em className="italic">{hero.headlineEm}</em>
              {hero.headlineTail}
            </h1>
            <p
              className={`rise ${sans} mx-auto mt-6 max-w-[46ch] text-[16px] leading-[1.5] text-slate md:text-[18px]`}
              style={{ "--rise-delay": "0.12s" } as React.CSSProperties}
            >
              {hero.sub}
            </p>
            <div
              className="rise mt-9 flex flex-wrap items-center justify-center gap-3.5"
              style={{ "--rise-delay": "0.24s" } as React.CSSProperties}
            >
              <Action href={hero.primary.href} className={`btn-nero press ${sans} px-7 py-3.5 text-[15px]`}>
                {hero.primary.label}
              </Action>
              {hero.secondary && (
                <Action
                  href={hero.secondary.href}
                  className={`btn-nero-ghost press ${sans} px-7 py-3.5 text-[15px]`}
                >
                  {hero.secondary.label}
                </Action>
              )}
            </div>
          </div>

          {/* артефакты стопкой (mobile/tablet) */}
          <div className="mt-10 flex flex-wrap items-start justify-center gap-4 lg:hidden" data-reveal>
            {artifacts.map((a, i) => (
              <Artifact key={i} spec={a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
