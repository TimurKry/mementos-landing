import type { Metadata } from "next";
import Link from "next/link";
import { isMock } from "@/lib/data";
import { Logo } from "@/components/Logo";

/* Dritter Umkreis: die Plattform-Betreuung — unser eigenes Team.
   Bewusst getrennt vom Arbeitsbereich eines Hauses: aus dem Arbeitsbereich
   führt kein Link hierher, und von hier führt keiner in einen Fall. Diese
   Oberfläche zeigt Metadaten und Verbindungen, nie den Inhalt eines Vorgangs. */

export const metadata: Metadata = {
  title: "MementoOS — Plattform-Übersicht",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="hair sticky top-0 z-40 bg-void/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-5 sm:gap-4">
          <Link href="/admin" className="flex items-center gap-2 text-[15px] font-medium">
            <Logo className="h-[15px] w-[16px]" />
            MementoOS
            <span className="ml-1 hidden text-[13px] text-steel sm:inline">Plattform</span>
          </Link>

          {/* Auf schmalen Geräten würde die Zeile sonst über den Rand laufen —
              wie im Arbeitsbereich tritt die Navigation dort zurück; der Weg
              zu den Ereignissen steht auf der Übersicht selbst. */}
          <nav className="ml-2 hidden items-center gap-4 sm:flex">
            <Link href="/admin" className="text-[12.5px] text-fog transition-colors hover:text-white">
              Übersicht
            </Link>
            <Link href="/admin/ereignisse" className="text-[12.5px] text-fog transition-colors hover:text-white">
              Ereignisse
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            {isMock && (
              <span className="badge badge-dim">
                <span className="hidden sm:inline">Mock-Modus ·</span>
                <span>Beispieldaten</span>
              </span>
            )}
            <form action="/auth/abmelden" method="post">
              <button type="submit" className="btn-ghost px-3 py-1.5 text-[12px]">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1180px] px-5 py-8">{children}</main>
    </>
  );
}
