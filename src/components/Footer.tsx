import { Logo } from "./icons";

export function Footer() {
  return (
    <footer className="bg-ink pb-7 pt-13 text-[13px] text-ash">
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="grid gap-9 border-b border-[#3a3a38] pb-9 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
          <div>
            <a href="#top" className="flex items-center gap-2.5 text-[17px] font-semibold text-paper">
              <Logo className="h-6 w-7" fill="#F7F5F1" />
              MementoOS
            </a>
            <p className="mt-3.5 max-w-[30ch]">
              Das Betriebssystem für die Bestattungsbranche. Ein Fall. Alle Beteiligten.
            </p>
          </div>
          <div>
            <h4 className="mb-3.5 text-xs font-semibold uppercase tracking-[.14em] text-paper">Plattform</h4>
            <ul className="grid gap-2">
              <li><a className="wavy-link hover:text-paper" href="#plattform">Überblick</a></li>
              <li><a className="wavy-link hover:text-paper" href="#ablauf">So funktioniert es</a></li>
              <li><a className="wavy-link hover:text-paper" href="#warum">Warum MementoOS</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3.5 text-xs font-semibold uppercase tracking-[.14em] text-paper">Für wen</h4>
            <ul className="grid gap-2">
              <li><a className="wavy-link hover:text-paper" href="#zielgruppen">Bestatter</a></li>
              <li><a className="wavy-link hover:text-paper" href="#zielgruppen">Krematorien</a></li>
              <li><a className="wavy-link hover:text-paper" href="#zielgruppen">Friedhöfe & Partner</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3.5 text-xs font-semibold uppercase tracking-[.14em] text-paper">Kontakt</h4>
            <ul className="grid gap-2">
              <li><a className="wavy-link hover:text-paper" href="mailto:timurkry.dev@gmail.com">timurkry.dev@gmail.com</a></li>
              <li>Leipzig, Deutschland</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-5 pt-5">
          <span>© 2026 Memora · MementoOS — Vorschau, in Entwicklung</span>
          <span>Impressum & Datenschutz folgen</span>
        </div>
      </div>
    </footer>
  );
}
