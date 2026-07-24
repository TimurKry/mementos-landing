import type { Metadata } from "next";
import Link from "next/link";
import { isMock } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: "MementoOS — Arbeitsbereich",
  description: "Ein gemeinsamer Fall über alle Beteiligten.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header className="hair sticky top-0 z-40 bg-void/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-4 px-5">
            <Link href="/" className="flex items-center gap-2 text-[15px] font-medium">
              <span className="flex gap-1" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white/70" />
                <span className="h-2 w-2 rounded-full bg-white/40" />
              </span>
              MementoOS
              <span className="ml-1 text-[13px] text-steel">Arbeitsbereich</span>
            </Link>
            {isMock && (
              <span className="badge badge-dim ml-auto">
                Mock-Modus · Beispieldaten
              </span>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1100px] px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
