import Link from "next/link";
import { Logo } from "./icons";

const links = [
  { href: "#produkt", label: "Produkt" },
  { href: "#ich-bin", label: "Für wen" },
  { href: "/datenmodell/", label: "Zugriff" },
  { href: "/demo/", label: "Demo" },
  { href: "/preise/", label: "Preise" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  return (
    <>
      <div className="bg-forest-deep text-paper">
        <div className="mx-auto flex h-10 max-w-[1200px] items-center justify-center gap-4 px-6">
          <span className="mono-label text-[11px] text-ash">
            Vorschau · MementoOS ist in Entwicklung — Pilotpartner willkommen
          </span>
          <a
            href="#kontakt"
            className="mono-label hidden rounded-full border border-paper/60 px-3 py-1 text-[10px] text-paper transition-colors hover:bg-paper hover:text-ink sm:inline-block"
          >
            Kontakt
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-8 px-6">
          <a href="#top" className="flex items-center gap-2.5" aria-label="MementoOS Startseite">
            <Logo className="h-[24px] w-[28px]" />
            <span className="font-[family-name:var(--font-display)] text-[22px] text-ink">
              MementoOS
            </span>
          </a>
          <nav className="mono-label ml-auto hidden gap-7 text-[12px] text-graphite md:flex" aria-label="Hauptnavigation">
            {links.map((l) =>
              l.href.startsWith("#") ? (
                <a key={l.href} href={l.href} className="wavy-link">
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} href={l.href} className="wavy-link">
                  {l.label}
                </Link>
              )
            )}
          </nav>
          <a
            href="#kontakt"
            className="btn-blue press arrow-shift mono-label ml-2 inline-flex items-center gap-2 px-5 py-2.5 text-[12px]"
          >
            Demo anfragen <span aria-hidden="true">▸</span>
          </a>
        </div>
      </header>
    </>
  );
}
