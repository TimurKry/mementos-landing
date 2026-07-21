import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Reveal } from "@/components/Reveal";
import "./globals.css";

/* Пара «serif объявляет, mono инструктирует» — сигнатура системы.
   Instrument Serif только в 400 — заголовки никогда не жирные. */
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
    <html lang="de" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <Reveal />
        {children}
      </body>
    </html>
  );
}
