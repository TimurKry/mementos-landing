import type { Metadata } from "next";
import { isMock } from "@/lib/data";
import { Logo } from "@/components/Logo";

/* Äußerer Umkreis: Zugang per Link, ohne Konto (Familie, Krematorium …).
   Bewusst ohne jede Verbindung in den Arbeitsbereich — keine Navigation,
   kein Logo-Link, kein Abmelden. Wer hier ist, sieht nur seinen Teil. */

export const metadata: Metadata = {
  title: "MementoOS — Zugang",
};

export default function ExternLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="hair">
        <div className="mx-auto flex h-14 max-w-[860px] items-center gap-3 px-5">
          <span className="flex items-center gap-2 text-[15px] font-medium">
            <Logo className="h-[15px] w-[16px]" />
            MementoOS
          </span>
          {isMock && (
            <span className="badge badge-dim ml-auto">
              <span className="hidden sm:inline">Mock-Modus ·</span>
              <span>Beispieldaten</span>
            </span>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-[860px] px-5 py-8">{children}</main>
    </>
  );
}
