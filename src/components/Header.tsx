import Link from "next/link";
import { Logo } from "./icons";

const links = [
  { href: "#plattform", label: "Plattform" },
  { href: "#ablauf", label: "So funktioniert es" },
  { href: "/demo/", label: "Demo" },
  { href: "#zielgruppen", label: "Für wen" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-[1.3px] border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center gap-8 px-7">
        <a href="#top" className="flex items-center gap-2.5 text-[17px] font-semibold" aria-label="MementoOS Startseite">
          <Logo className="h-[26px] w-[30px]" />
          MementoOS
        </a>
        <nav className="ml-auto hidden gap-6 text-sm text-stone md:flex" aria-label="Hauptnavigation">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.href} href={l.href} className="wavy-link hover:text-ink">
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className="wavy-link hover:text-ink">
                {l.label}
              </Link>
            )
          )}
        </nav>
        <a href="#kontakt" className="w-btn ml-2 border-[1.3px] border-ink bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-transform hover:-translate-x-px hover:-translate-y-px">
          Demo anfragen <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
