"use server";

/* Unterlagen: hochladen, prüfen, entfernen.

   Eigene Datei, weil hier etwas passiert, was sonst nirgends passiert: es
   kommt eine DATEI von aussen herein. Alles andere im Arbeitsbereich sind
   Felder mit bekannter Form. Eine Datei hat Grösse, Typ und Inhalt, und alle
   drei muss jemand begrenzen, bevor sie in die Ablage geht.

   Was geprüft wird — und warum:

   1. Grösse. Ohne Grenze ist der Eimer ein offener Speicher für jeden, der
      sich anmelden kann.
   2. Typ, gegen eine Liste erlaubter. Nicht «alles ausser gefährlich»:
      Sperrlisten sind immer unvollständig. In dieser Branche gehen
      Todesbescheinigung, Vollmacht, Antrag herum — PDF und Bilder reichen.
   3. Der vom Browser gemeldete Typ ist eine BEHAUPTUNG, keine Tatsache.
      Deshalb wird zusätzlich der Anfang der Datei angesehen: eine PDF
      beginnt mit %PDF-, ein JPEG mit FF D8 FF, ein PNG mit dem bekannten
      Achtbyter. Stimmt beides nicht überein, wird abgelehnt.
   4. Der Dateiname wandert nicht in den Pfad, sondern nur in die Spalte
      dateiname (siehe pfadName in data.ts).

   Ausgeliefert wird eine hochgeladene Datei später ausschliesslich als
   Anhang und mit nosniff — sie wird nie im Umkreis der Anwendung angezeigt.
   Siehe src/lib/unterlage-antwort.ts. */

import { revalidatePath } from "next/cache";
import {
  addUnterlage, istKeinZugriff, removeUnterlage, setUnterlageGeprueft,
} from "@/lib/data";
import { roleLabel } from "@/lib/access";
import type { Role } from "@/lib/types";
import { GRENZEN, ausListe, jaNein, kennung, meldung, pflichtText, pruefe } from "@/lib/eingaben";

const ROLLEN = Object.keys(roleLabel) as Role[];

const FEHLER_ZUGRIFF = "Für diesen Fall besteht kein Zugriff.";
const FEHLER_TECHNIK =
  "Der Vorgang war gerade nicht möglich. Bitte in einigen Minuten erneut versuchen.";
const FEHLER_KEINE_DATEI = "Bitte wählen Sie eine Datei aus.";
const FEHLER_ZU_GROSS = "Die Datei ist zu gross. Erlaubt sind bis zu 10 MB.";
const FEHLER_TYP =
  "Dieses Dateiformat wird nicht angenommen. Erlaubt sind PDF, JPEG und PNG.";

export type Ergebnis = { ok: true } | { ok: false; fehler: string };

const MAX_BYTES = 10 * 1024 * 1024;

/* Erlaubte Typen samt ihrer Signatur am Dateianfang. */
const ERLAUBT: Record<string, (b: Uint8Array) => boolean> = {
  "application/pdf": (b) =>
    b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46, // %PDF
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
};

export async function unterlageHochladenAction(
  caseId: string,
  formular: FormData,
): Promise<Ergebnis> {
  const datei = formular.get("datei");
  if (!(datei instanceof File) || datei.size === 0) {
    return { ok: false, fehler: FEHLER_KEINE_DATEI };
  }
  if (datei.size > MAX_BYTES) return { ok: false, fehler: FEHLER_ZU_GROSS };

  const roh = formular.getAll("sichtbar_fuer").map(String);

  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    docType: pflichtText("Bezeichnung", formular.get("doc_type"), GRENZEN.aufgabe),
    /* Jede Rolle einzeln gegen die Aufzählung — eine Liste aus dem Formular
       ist genauso wenig vertrauenswürdig wie ein einzelnes Feld. */
    sichtbar: roh.map((r) => ausListe("Sichtbar für", r, ROLLEN)),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const inhalt = await datei.arrayBuffer();
  const anfang = new Uint8Array(inhalt.slice(0, 8));

  const gemeldet = datei.type;
  const pruefer = ERLAUBT[gemeldet];
  if (!pruefer || !pruefer(anfang)) return { ok: false, fehler: FEHLER_TYP };

  try {
    await addUnterlage(g.wert.fall, {
      docType: g.wert.docType,
      visibleTo: g.wert.sichtbar,
      dateiname: datei.name,
      mime: gemeldet,
      groesse: datei.size,
      inhalt,
    });
    revalidatePath(`/fall/${g.wert.fall}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}

export async function unterlageEntfernenAction(
  caseId: string,
  docId: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Unterlage", docId),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  try {
    await removeUnterlage(g.wert.fall, g.wert.id);
    revalidatePath(`/fall/${g.wert.fall}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}

export async function unterlageGepruefetAction(
  caseId: string,
  docId: string,
  geprueft: unknown,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Unterlage", docId),
    wert: jaNein("Geprüft", geprueft),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  try {
    await setUnterlageGeprueft(g.wert.fall, g.wert.id, g.wert.wert);
    revalidatePath(`/fall/${g.wert.fall}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}
