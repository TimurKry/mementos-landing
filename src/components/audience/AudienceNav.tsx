import Link from "next/link";
import { Logo } from "../icons";

/* Навигация Steep-страниц: прозрачная, тихая. navLabel — подпись зоны,
   hasPricing — показывать ли якорь #preise. */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

export function AudienceNav({
  navLabel,
  hasPricing = true,
  soft = false,
}: {
  navLabel: string;
  hasPricing?: boolean;
  soft?: boolean;
}) {
  return (
    <header className="bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="MementoOS Startseite">
          <Logo className="h-[24px] w-[28px]" fill="#17191c" />
          <span className={`${serif} text-[22px] text-nero`}>MementoOS</span>
        </Link>
        <span className={`${sans} hidden text-[14px] text-ashen sm:block`}>{navLabel}</span>
        <nav className={`${sans} ml-auto flex items-center gap-6 text-[15px]`} aria-label="Seitennavigation">
          <Link href="/" className="quiet-link hidden text-slate sm:block">
            Startseite
          </Link>
          {hasPricing && (
            <a href="#preise" className="quiet-link hidden text-slate md:block">
              Preise
            </a>
          )}
          {soft ? (
            /* тихий вариант: одна спокойная ссылка, без напористых пилюль */
            <a href="#kontakt" className="btn-nero-ghost press px-5 py-2.5 text-[14px] text-nero">
              Kontakt
            </a>
          ) : (
            <>
              <Link href="/workspace/" className="btn-nero-ghost press hidden px-5 py-2.5 text-[14px] text-nero md:block">
                Selbst ausprobieren
              </Link>
              <a href="#kontakt" className="btn-nero press px-5 py-2.5 text-[14px]">
                Demo anfragen
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
