"use server";

/* Server Actions für die Einladungen eines Falls.

   Sie liegen bewusst hier und nicht in src/app/actions.ts: das Action-Manifest
   bindet sie damit an diese Seite des inneren Umkreises statt an jedes Bündel.

   Zum Token:
   - er wird nirgends protokolliert — weder hier, noch in einer Fehlermeldung,
     noch in irgendeinem Metadatenfeld;
   - er steht in keiner Adresszeile, keinem Suchparameter, keiner Weiterleitung
     und keinem revalidatePath-Argument. Sein einziger Weg führt vom
     Rückgabewert dieser Action in den Zustand der Client-Komponente, wo er bis
     zum nächsten Seitenaufbau lebt.

   Zu den Rechten: die Prüfung macht die Datenbank (is_case_owner in
   create_invite / revoke_invite, SECURITY DEFINER umgeht RLS). Hier steht
   keine zweite, selbstgebaute Prüfung — nur Formprüfungen, damit eine
   Direkteingabe gar nicht erst an der Datenbank landet. Dass die Seite
   geschützt ist, genügt nicht: eine Server Action ist direkt aufrufbar. */

import { revalidatePath } from "next/cache";
import { createInvite, revokeInvite, istKeinZugriff } from "@/lib/data";
import { istEinladbareRolle } from "@/lib/access";

const FEHLER_ZUGRIFF = "Für diesen Fall besteht kein Zugriff.";
const FEHLER_ROLLE = "Für diese Rolle wird kein Zugangslink ausgegeben.";
const FEHLER_TECHNIK =
  "Der Vorgang war gerade nicht möglich. Bitte in einigen Minuten erneut versuchen.";

/* Merkhilfe: freier Text des Hauses, deshalb begrenzt. */
const LABEL_MAX = 80;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ErzeugenErgebnis =
  | { ok: true; token: string }
  | { ok: false; fehler: string };

export type ZurueckziehenErgebnis =
  | { ok: true }
  | { ok: false; fehler: string };

export async function einladungErzeugenAction(
  caseId: string,
  rolle: string,
  label: string,
): Promise<ErzeugenErgebnis> {
  if (!istEinladbareRolle(rolle)) return { ok: false, fehler: FEHLER_ROLLE };

  const merk = label.trim().slice(0, LABEL_MAX) || null;

  try {
    const { token } = await createInvite(caseId, rolle, merk);
    /* Nur der Pfad des Falls — niemals der Token. */
    revalidatePath(`/fall/${caseId}`);
    return { ok: true, token };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}

/* Zurückziehen beendet in der Datenbank zugleich alle offenen Sitzungen dieser
   Einladung — der Entzug wirkt sofort, nicht erst nach Ablauf. */
export async function einladungZurueckziehenAction(
  caseId: string,
  inviteId: string,
): Promise<ZurueckziehenErgebnis> {
  if (!UUID_RE.test(inviteId)) return { ok: false, fehler: FEHLER_ZUGRIFF };

  try {
    await revokeInvite(inviteId);
    revalidatePath(`/fall/${caseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}
