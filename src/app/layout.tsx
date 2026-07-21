import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { Reveal } from "@/components/Reveal";
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

export const metadata: Metadata = {
  title: "MementoOS — Das Betriebssystem für die Bestattungsbranche",
  description:
    "MementoOS verbindet Bestatter, Krematorien, Friedhöfe, Transport und Partner in einem gemeinsamen digitalen Vorgang.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${serif.variable} ${mono.variable} ${inter.variable}`}>
      <body>
        <Reveal />
        {children}
      </body>
    </html>
  );
}
