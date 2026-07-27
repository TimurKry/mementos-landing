import { istKeineBetreuung } from "@/lib/admin";

/* Ein Ladeversuch mit zwei unterscheidbaren Ausgängen.

   «Nicht zuständig» und «gerade gestört» sind zwei verschiedene Auskünfte:
   die erste ist endgültig, die zweite eine Bitte um Geduld. Die Datenbank
   trennt sie (errcode 42501), die Datenschicht reicht die Trennung durch,
   und hier wird daraus ein Wert, den die Seiten anzeigen können — statt
   eines Fehlerbildschirms mit Aufrufliste. */

export type Ladung<T> =
  | { ok: true; daten: T }
  | { ok: false; grund: "betreuung" | "technik" };

export async function laden<T>(fn: () => Promise<T>): Promise<Ladung<T>> {
  try {
    return { ok: true, daten: await fn() };
  } catch (e) {
    return { ok: false, grund: istKeineBetreuung(e) ? "betreuung" : "technik" };
  }
}
