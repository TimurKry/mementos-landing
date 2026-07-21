import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { BestatterWorkspace } from "@/components/workspace/BestatterWorkspace";

export const metadata: Metadata = {
  title: "MementoOS — Der Arbeitsbereich (Konzept)",
  description:
    "Interaktives Konzept-Mockup: Dashboard, Vorgangs-Pipeline, Beteiligten-Matrix und KI-Schnellerfassung für Bestattungsunternehmen.",
};

/* «Default» dark-CRM chrome: void-холст, sticky-навигация 72px с
   hairline-границей, костяная CTA. Контент — BestatterWorkspace. */

export default function WorkspacePage() {
  return (
    <div className="dk min-h-screen">
      <header
        className="sticky top-0 z-40 bg-[#0b0c0e]/85 backdrop-blur-md"
        style={{ boxShadow: "0 0.5px 0 rgba(255,255,255,0.07)" }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-6 px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Zurück zur Startseite">
            <Logo className="h-[22px] w-[26px]" fill="#ffffff" />
            <span className="text-[15px] font-medium text-white">MementoOS</span>
            <span className="ml-1 text-[13px] text-[#71717a]">Arbeitsbereich</span>
          </Link>
          <div className="ml-auto flex items-center gap-5 text-[13px]">
            <span className="badge-dk badge-dk-green hidden sm:inline-flex">
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
              Konzept · Beispieldaten
            </span>
            <Link href="/demo/" className="text-white/70 transition-colors hover:text-white">
              Prozess-Demo
            </Link>
            <Link href="/" className="hidden text-white/70 transition-colors hover:text-white sm:block">
              Startseite
            </Link>
            <a
              href="mailto:timurkry.dev@gmail.com?subject=MementoOS%20Demo"
              className="btn-bone press px-4 py-2 text-[13px]"
            >
              Demo anfragen
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-6 pb-24 pt-10">
        <div className="mb-8">
          <div className="text-[11px] font-medium text-[#3b82f6]">Arbeitsbereich</div>
          <h1 className="mt-2 text-[32px] font-normal leading-tight tracking-[-0.64px] text-white md:text-[42px] md:tracking-[-0.88px]">
            Guten Morgen. Hier steht alles.
          </h1>
          <p className="mt-2 max-w-[52ch] text-[14px] leading-[1.43] tracking-[-0.32px] text-[#858687]">
            Klicken Sie sich durch das Konzept: Vorgänge öffnen, Status setzen,
            Aufgaben abhaken — alles reagiert.
          </p>
        </div>
        <BestatterWorkspace />
      </main>

      <footer className="pb-8" style={{ boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.07)" }}>
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-6 pt-6 text-[12px] text-[#858687]">
          <span>MementoOS — Vorschau, in Entwicklung · Leipzig</span>
          <span className="flex gap-5">
            <Link href="/fuer-bestatter/" className="transition-colors hover:text-white">Für Bestatter</Link>
            <Link href="/" className="transition-colors hover:text-white">Startseite</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
