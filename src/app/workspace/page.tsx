import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { BestatterWorkspace } from "@/components/workspace/BestatterWorkspace";

export const metadata: Metadata = {
  title: "MementoOS — Bestatter-Cockpit (Konzept)",
  description:
    "Interaktives Konzept-Mockup: Dashboard, Vorgangs-Pipeline, Beteiligten-Matrix und KI-Schnellerfassung für Bestattungsunternehmen.",
};

export default function WorkspacePage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-6 px-7">
          <Link href="/" className="flex items-center gap-2.5 text-[17px] font-semibold" aria-label="Zurück zur Startseite">
            <Logo className="h-[26px] w-[30px]" />
            MementoOS
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <span className="w-pill hidden border border-line bg-card px-3 py-1 text-[10.5px] uppercase tracking-[.16em] text-stone sm:inline-block">
              Konzept-Mockup · Beispieldaten
            </span>
            <Link href="/demo/" className="wavy-link text-stone">Prozess-Demo</Link>
            <Link href="/" className="wavy-link text-stone">← Startseite</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-7 pb-24 pt-10">
        <div className="mb-8">
          <div className="mono-label text-[11px] text-ink">Bestatter-Cockpit</div>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[30px] font-medium leading-tight">
            Guten Morgen. Hier steht alles.
          </h1>
        </div>
        <BestatterWorkspace />
      </main>
    </>
  );
}
