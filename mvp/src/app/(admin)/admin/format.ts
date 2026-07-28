/* Anzeige-Formate der Plattform-Übersicht — reines Modul, keine Daten.

   Feste Zeitzone (UTC): sonst entschiede die Uhr des Browsers über das Datum
   und der erste Renderdurchlauf wiche vom zweiten ab. Auf den Bildschirmen
   steht der Hinweis dazu. */

const fDatum = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
});

const fZeitpunkt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", timeZone: "UTC",
});

const fZahl = new Intl.NumberFormat("de-DE");

export function datum(wert?: string | null): string {
  if (!wert) return "—";
  const d = new Date(wert);
  return Number.isNaN(d.getTime()) ? "—" : fDatum.format(d);
}

export function zeitpunkt(wert?: string | null): string {
  if (!wert) return "—";
  const d = new Date(wert);
  return Number.isNaN(d.getTime()) ? "—" : fZeitpunkt.format(d);
}

export function zahl(wert: number): string {
  return fZahl.format(wert);
}

/* Die Beschriftungen des Journals liegen seit 0013 in src/lib/verlauf.ts:
   der Arbeitsbereich zeigt dasselbe Journal, und zwei Listen für dieselben
   Kürzel laufen auseinander, sobald eine Aktion dazukommt. Hier bleiben nur
   die Namen stehen, unter denen die Bildschirme der Übersicht sie kennen. */
export { aktionLabel as aktion, akteurLabel as akteur } from "@/lib/verlauf";
