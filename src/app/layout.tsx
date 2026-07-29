import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { Reveal } from "@/components/Reveal";
import { Schema } from "@/components/Schema";
import { SITE_URL, seite, softwareSchema } from "@/lib/site";
import "./globals.css";

/* Пара «serif объявляет, mono инструктирует» — сигнатура системы.
   Instrument Serif только в 400 — заголовки никогда не жирные.
   Курсив нужен страницам аудиторий (Steep-манера: italic-вставка). */
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

/* Sans для Steep-страниц аудиторий (/fuer-*) */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

/* metadataBase ist die Voraussetzung dafür, dass Next relative Adressen in
   Metadaten überhaupt auflöst. Ohne sie bleiben Vorschaubild und kanonische
   Adresse relativ — und ein relativer Pfad in einem og:image-Tag wird von
   LinkedIn und WhatsApp verworfen, ohne Fehlermeldung. Die Kachel bleibt
   einfach leer, und man merkt es erst, wenn jemand teilt.

   Keine Titel-Vorlage: die Titel der Unterseiten tragen den Markennamen
   schon selbst, eine Vorlage würde ihn verdoppeln. Siehe seite(). */
const STARTTITEL = "MementoOS — Das Betriebssystem für die Bestattungsbranche";

export const metadata: Metadata = {
  ...seite({
    titel: STARTTITEL,
    beschreibung:
      "MementoOS verbindet Bestatter, Krematorien, Friedhöfe, Transport und Partner in einem gemeinsamen digitalen Vorgang.",
  }),
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${serif.variable} ${mono.variable} ${inter.variable}`}>
      <body>
        <Schema daten={softwareSchema()} />
        <Reveal />
        {children}
      </body>
    </html>
  );
}
