import type { Metadata } from "next";
import Link from "next/link";
import { isMock } from "@/lib/data";
import { Logo } from "@/components/Logo";

/* Innerer Umkreis: Arbeitsbereich des Hauses (Dashboard, Fälle).
   Nur hier gibt es Navigation und Abmelden. */

export const metadata: Metadata = {
  title: "MementoOS — Arbeitsbereich",
};

export default function InternLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="hair sticky top-0 z-40 bg-void/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-3 px-5 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-medium">
            <Logo className="h-[15px] w-[16px]" />
            MementoOS
            <span className="ml-1 hidden text-[13px] text-steel sm:inline">Arbeitsbereich</span>
          </Link>

          <nav className="ml-2 hidden sm:block">
            <Link href="/" className="text-[12.5px] text-fog transition-colors hover:text-white">
              Vorgänge
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
      <main className="mx-auto max-w-[1100px] px-5 py-8">{children}</main>
    </>
  );
}
