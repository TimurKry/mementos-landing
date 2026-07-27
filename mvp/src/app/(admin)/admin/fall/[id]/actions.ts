"use server";

/* Server Actions der Plattform-Übersicht: Zugang zurückziehen, Sitzung
   beenden.

   Sie liegen bei der Seite, zu der sie gehören, und nicht in einer
   gemeinsamen Datei: das Action-Manifest bindet sie damit an diesen einen
   Bildschirm der Betreuung statt an jedes Bündel der Anwendung.

   Zu den Rechten: geprüft wird ausschliesslich in der Datenbank
   (admin_zugang_zurueckziehen / admin_sitzung_beenden sind SECURITY DEFINER
   und prüfen die Mitgliedschaft in platform_admins selbst, Ablehnung mit
   errcode 42501). Hier steht keine zweite, selbstgebaute Prüfung — nur
   Formprüfungen, damit eine Direkteingabe gar nicht erst an der Datenbank
   landet. Dass die Seite hinter der Anmeldung liegt, genügt dafür nicht: eine
   Server Action ist direkt aufrufbar. */

import { revalidatePath } from "next/cache";
import {
  adminSitzungBeenden,
  adminZugangZurueckziehen,
  istKeineBetreuung,
} from "@/lib/admin";

const FEHLER_ZUGRIFF = "Diese Übersicht ist der Plattform-Betreuung vorbehalten.";
const FEHLER_FORM = "Die Kennung ist nicht gültig.";
const FEHLER_TECHNIK =
  "Der Vorgang war gerade nicht möglich. Bitte in einigen Minuten erneut versuchen.";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/* Der Fallbezug landet nur im Pfad von revalidatePath — deshalb eng begrenzt. */
const PFAD_RE = /^[A-Za-z0-9-]{1,64}$/;

export type AdminErgebnis = { ok: true } | { ok: false; fehler: string };

async function ausfuehren(
  fallId: string,
  kennung: string,
  tun: (kennung: string) => Promise<void>,
): Promise<AdminErgebnis> {
  if (!UUID_RE.test(kennung)) return { ok: false, fehler: FEHLER_FORM };

  try {
    await tun(kennung);
    if (PFAD_RE.test(fallId)) revalidatePath(`/admin/fall/${fallId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, fehler: istKeineBetreuung(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}

/* Wirkt sofort: der Zugang wird ungültig und seine offenen Sitzungen enden. */
export async function zugangZurueckziehenAction(
  fallId: string,
  zugangId: string,
): Promise<AdminErgebnis> {
  return ausfuehren(fallId, zugangId, adminZugangZurueckziehen);
}

/* Beendet eine einzelne Sitzung; der Zugang selbst bleibt gültig. */
export async function sitzungBeendenAction(
  fallId: string,
  sitzungId: string,
): Promise<AdminErgebnis> {
  return ausfuehren(fallId, sitzungId, adminSitzungBeenden);
}
