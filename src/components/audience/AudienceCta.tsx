import Link from "next/link";
import type { AudienceData } from "./types";

/* Заключительный CTA Steep. id="kontakt" — сюда ведут якоря страницы.
   mailto собирается из mailSubject (ruhig, ohne Verkaufsdruck). */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

export function AudienceCta({ cta }: { cta: AudienceData["cta"] }) {
  const mailto = `mailto:timurkry.dev@gmail.com?subject=${encodeURIComponent(cta.mailSubject)}`;
  return (
    <section id="kontakt" className="border-t border-mist bg-fog">
      <div className="mx-auto max-w-[720px] px-6 py-20 text-center" data-reveal>
        <h2 className={`${serif} text-balance text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
          {cta.heading}
        </h2>
        <p className={`${sans} mx-auto mt-4 max-w-[44ch] text-[16px] text-slate`}>{cta.sub}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <a href={mailto} className={`btn-nero press ${sans} px-7 py-3.5 text-[15px]`}>
            Demo anfragen
          </a>
          <Link href="/workspace/" className={`btn-nero-ghost press ${sans} px-7 py-3.5 text-[15px]`}>
            Selbst ausprobieren
          </Link>
          <Link href="/" className={`quiet-link ${sans} px-2 py-3.5 text-[15px] text-nero`}>
            Zur Startseite →
          </Link>
        </div>
        <p className={`${sans} mt-10 text-[13px] text-ashen`}>
          Weitere Bereiche folgen: Krematorien · Friedhöfe · Familien
        </p>
      </div>
    </section>
  );
}
