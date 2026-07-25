import type { Metadata } from "next";
import "./globals.css";

/* Wurzel-Layout: nur Dokumentrahmen und Metadaten.
   Die Navigation gehört den beiden Umkreisen — (intern) für das Haus,
   (extern) für Eingeladene. So sieht eine Familie nie den Arbeitsbereich. */

export const metadata: Metadata = {
  title: "MementoOS",
  description: "Ein gemeinsamer Fall über alle Beteiligten.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
