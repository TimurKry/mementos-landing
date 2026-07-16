import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { DemoFlow } from "@/components/demo/DemoFlow";

export const metadata: Metadata = {
  title: "MementoOS — Demo: der digitale Vorgang",
  description:
    "Klickbare Testversion: vom bestätigten Termin bis zum abgeschlossenen Fall — der ganze Ablauf in sechs Schritten.",
};

export default function DemoPage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b-[1.3px] border-ink bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-8 px-7">
          <Link href="/" className="flex items-center gap-2.5 text-[17px] font-semibold" aria-label="Zurück zur Startseite">
            <Logo className="h-[26px] w-[30px]" />
            MementoOS
          </Link>
          <Link href="/" className="wavy-link text-sm text-stone hover:text-ink">
            ← Zurück zur Startseite
          </Link>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-[880px] px-7 pb-8 pt-14 text-center">
          <span className="w-pill inline-block border border-ink bg-card px-3.5 py-1.5 text-[11px] uppercase tracking-[.18em] text-stone">
            Testversion · Beispieldaten
          </span>
          <h1 className="mt-5 text-balance font-[family-name:var(--font-display)] text-[32px] font-medium leading-tight md:text-[40px]">
            Der ganze Vorgang. Sechs Schritte.
          </h1>
          <p className="mx-auto mt-3 max-w-[52ch] text-stone">
            Klicken Sie sich durch: vom bestätigten Termin im Krematorium bis zum
            abgeschlossenen Fall — so fühlt sich MementoOS an.
          </p>
        </div>
        <DemoFlow />
      </main>
    </>
  );
}
