import Link from "next/link";
import type { AudienceData } from "./types";

/* Fog-полоса из трёх тихих bg-mist карт: tag, serif-нейтральный
   заголовок карты (sans medium), текст, quiet-link со стрелкой. */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

/* внутренняя ссылка → next/link (basePath!), якорь → <a> */
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

export function WarumSection({ warum }: { warum: AudienceData["warum"] }) {
  return (
    <section className="bg-fog">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="max-w-[640px]" data-reveal>
          <h2 className={`${serif} text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
            {warum.heading} <em className="italic">{warum.headingEm}</em>.
          </h2>
          {warum.sub && <p className={`${sans} mt-4 text-[16px] leading-[1.5] text-slate`}>{warum.sub}</p>}
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {warum.cards.map((c, i) => (
            <div
              key={c.title}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
              className="rounded-[24px] bg-mist p-7"
            >
              <div className={`${sans} text-[13px] text-ashen`}>{c.tag}</div>
              <h3 className={`${sans} mt-2 text-[19px] font-medium text-nero`}>{c.title}</h3>
              <p className={`${sans} mt-2.5 text-[14.5px] leading-[1.5] text-slate`}>{c.text}</p>
              <Action href={c.href} className={`quiet-link ${sans} mt-5 inline-block text-[14.5px] text-nero`}>
                {c.link}
              </Action>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
