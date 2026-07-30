"use server";

/* Server Action für die Korrekturschlange (0016_quelle_je_angabe.sql).

   Sie liegt in einer eigenen Datei und nicht in actions.ts, weil sie einen
   anderen Charakter hat: hier wird nichts eingetragen, sondern über den
   Eintrag eines anderen entschieden.

   Die Rechteprüfung macht public.korrektur_entscheiden selbst — sie ist
   SECURITY DEFINER und umgeht RLS, deshalb steht die Eigentümerprüfung dort.
   Hier steht nur die Form: die Kennung muss eine Kennung sein, damit ein
   Direktaufruf nicht als Suchmuster taugt.

   Bemerkenswert: die Kennung des Falls ist KEIN Argument. Sie hängt am
   Vorschlag, und der Vorschlag hängt am Fall. Wer eine fremde
   Vorschlagskennung einsetzt, bekommt false — nicht, weil hier geraten wird,
   sondern weil die Datenbank die Eigentümerschaft an dieser Zeile prüft.
   Der Rückweg (revalidatePath) braucht den Fall trotzdem; er kommt aus dem
   Aufruf und wird nur für den Pfad benutzt, nie für die Entscheidung. */

import { revalidatePath } from "next/cache";
import { istKeinZugriff, korrekturEntscheiden } from "@/lib/data";
import { jaNein, kennung, meldung, pruefe } from "@/lib/eingaben";
import type { Ergebnis } from "./actions";

const FEHLER_ZUGRIFF = "Für diesen Vorschlag besteht kein Zugriff.";
const FEHLER_WEG =
  "Dieser Vorschlag ist nicht mehr offen — vermutlich wurde er inzwischen entschieden.";
const FEHLER_TECHNIK =
  "Der Vorgang war gerade nicht möglich. Bitte in einigen Minuten erneut versuchen.";

export async function korrekturEntscheidenAction(
  caseId: string,
  vorschlagId: string,
  annehmen: unknown,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Vorschlag", vorschlagId),
    annehmen: jaNein("Entscheidung", annehmen),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  try {
    const erledigt = await korrekturEntscheiden(g.wert.id, g.wert.annehmen);
    if (!erledigt) return { ok: false, fehler: FEHLER_WEG };
    revalidatePath(`/fall/${g.wert.fall}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}
