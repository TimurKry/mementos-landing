import Link from "next/link";
import { Logo, IconKalender, IconHandshake } from "../icons";

/* Тихий футер Steep-страниц: логотип, статус-подпись, место и контакт. */

const sans = "font-[family-name:var(--font-sans)]";

export function AudienceFooter() {
  return (
    <footer className="border-t border-mist bg-white">
      <div
        className={`${sans} mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-[13px] text-slate`}
      >
        <Link href="/" className="flex items-center gap-2" aria-label="MementoOS Startseite">
          <Logo className="h-4 w-5" fill="#777b86" />
          MementoOS — Vorschau, in Entwicklung
        </Link>
        <span className="flex items-center gap-5">
          <span className="hidden items-center gap-1.5 sm:flex">
            <IconKalender className="h-3.5 w-3.5" /> Leipzig
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <IconHandshake className="h-3.5 w-3.5" /> Mit der Branche entwickelt
          </span>
          <a className="quiet-link text-nero" href="mailto:timurkry.dev@gmail.com">
            Kontakt
          </a>
        </span>
      </div>
    </footer>
  );
}
