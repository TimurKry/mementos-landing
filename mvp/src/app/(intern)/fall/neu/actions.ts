"use server";

/* Server Action zum Anlegen eines Vorgangs.

   Sie liegt bewusst hier und nicht in einem gemeinsamen Modul: das
   Action-Manifest bindet sie damit an diese Seite des inneren Umkreises.

   Zu den Rechten: cases.owner wird NICHT mitgeschickt. Die Spalte hat seit
   0010 den Vorgabewert auth.uid(), und die Regel cases_owner aus 0002 prüft
   das Ergebnis (with check owner = auth.uid()). Ein Fall auf fremden Namen
   ist deshalb auch dann nicht anlegbar, wenn diese Action direkt aufgerufen
   wird — hier steht keine zweite, selbstgebaute Prüfung, nur Formprüfungen.

   Der Name der verstorbenen Person erscheint in keiner Meldung und in keinem
   Suchparameter. Die Weiterleitung nach dem Anlegen trägt allein die Kennung
   des neuen Vorgangs. */

import { redirect } from "next/navigation";
import { createCase, istKeinZugriff } from "@/lib/data";
import { GRENZEN, meldung, optDatum, pflichtText, pruefe } from "@/lib/eingaben";

const FEHLER_ZUGRIFF = "Für diesen Vorgang besteht kein Zugriff.";
const FEHLER_TECHNIK =
  "Der Vorgang konnte gerade nicht angelegt werden. Bitte in einigen Minuten erneut versuchen.";

export type AnlegenEingabe = {
  bestattungsart: string;
  target_date: string;
  vorname: string;
  nachname: string;
};

/* Bei Erfolg kehrt die Action nicht zurück, sondern leitet weiter. */
export type AnlegenErgebnis = { ok: false; fehler: string };

export async function fallAnlegenAction(e: AnlegenEingabe): Promise<AnlegenErgebnis> {
  const geprueft = pruefe(() => ({
    bestattungsart: pflichtText("Bestattungsart", e?.bestattungsart, GRENZEN.bestattungsart),
    target_date: optDatum("Wunschtermin", e?.target_date),
    vorname: pflichtText("Vorname", e?.vorname, GRENZEN.name),
    nachname: pflichtText("Nachname", e?.nachname, GRENZEN.name),
  }));
  if (!geprueft.ok) return { ok: false, fehler: meldung(geprueft) };

  let id: string;
  try {
    id = await createCase(geprueft.wert);
  } catch (err) {
    return { ok: false, fehler: istKeinZugriff(err) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }

  /* Ausserhalb des try: redirect() arbeitet mit einer Ausnahme und dürfte
     sonst vom Fehlerzweig abgefangen werden. */
  redirect(`/fall/${id}`);
}
