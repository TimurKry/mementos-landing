import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { Reveal } from "@/components/Reveal";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
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
    <html lang="de" className={`${cormorant.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <Reveal />
        {children}
      </body>
    </html>
  );
}
