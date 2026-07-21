import { Logo } from "./icons";

export function Footer() {
  return (
    <footer className="bg-forest-deep pb-8 pt-14 text-[13px] text-ash">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid gap-10 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
          <div>
            <a href="#top" className="flex items-center gap-2.5" aria-label="MementoOS Startseite">
              <Logo className="h-6 w-7" fill="#f6f3f1" />
              <span className="font-[family-name:var(--font-display)] text-[20px] text-paper">
                MementoOS
              </span>
            </a>
            <p className="mt-4 max-w-[32ch] leading-relaxed">
              Das Betriebssystem für die Bestattungsbranche. Ein Fall. Alle Beteiligten.
            </p>
          </div>
          <div>
            <h4 className="mono-label mb-4 text-[11px] text-paper">Plattform</h4>
            <ul className="grid gap-2.5">
              <li><a className="wavy-link hover:text-paper" href="#plattform">Überblick</a></li>
              <li><a className="wavy-link hover:text-paper" href="#ablauf">So funktioniert es</a></li>
              <li><a className="wavy-link hover:text-paper" href="#warum">Warum MementoOS</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mono-label mb-4 text-[11px] text-paper">Für wen</h4>
            <ul className="grid gap-2.5">
              <li><a className="wavy-link hover:text-paper" href="#zielgruppen">Bestatter</a></li>
              <li><a className="wavy-link hover:text-paper" href="#zielgruppen">Krematorien</a></li>
              <li><a className="wavy-link hover:text-paper" href="#zielgruppen">Friedhöfe & Partner</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mono-label mb-4 text-[11px] text-paper">Kontakt</h4>
            <ul className="grid gap-2.5">
              <li><a className="wavy-link hover:text-paper" href="mailto:timurkry.dev@gmail.com">timurkry.dev@gmail.com</a></li>
              <li>Leipzig, Deutschland</li>
            </ul>
          </div>
        </div>
        <div className="mono-label flex flex-wrap justify-between gap-5 pt-6 text-[10px]">
          <span>© 2026 Memora · MementoOS — Vorschau, in Entwicklung</span>
          <span>Impressum & Datenschutz folgen</span>
        </div>
      </div>
    </footer>
  );
}
