"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endInviteSession, terminBestaetigen } from "@/lib/data";
import { ZUGANG_COOKIE, isSessionId } from "@/lib/zugang";
import { GRENZEN, kennung, meldung, optMehrzeilig, pruefe, zeitfensterGeprueft } from "@/lib/eingaben";

/* Zugang beenden: Sitzung serverseitig schliessen (end_session) und das
   Cookie entfernen. Beides — eines allein genügt nicht: ohne end_session
   bliebe die Sitzung auf dem Server offen, ohne Cookie-Löschung bliebe sie
   auf dem Gerät liegen. Der Einladungslink selbst bleibt gültig. */
export async function zugangBeendenAction() {
  const jar = await cookies();
  const session = jar.get(ZUGANG_COOKIE)?.value;

  if (isSessionId(session)) {
    try {
      await endInviteSession(session);
    } catch {
      /* Das Cookie wird trotzdem entfernt — auf diesem Gerät ist Schluss. */
    }
  }
  jar.delete(ZUGANG_COOKIE);

  redirect("/einladung/ungueltig?grund=beendet");
}

/* ── Termin bestätigen ───────────────────────────────────────────
   Der einzige schreibende Weg des äusseren Umkreises. Ein Fahrdienst trägt
   ein, wann er tatsächlich kommt; ein Krematorium, wann eingeäschert wird.

   Was hier NICHT hereinkommt: die Kennung des Falls und die Rolle. Beide
   stehen an der Sitzung, und die Sitzung steht im httpOnly-Cookie — nicht im
   Formular. Wer eine fremde Termin-Kennung einsetzt, kommt damit nicht weit:
   public.termin_bestaetigen (0011) prüft, ob der Termin zu genau dem Fall
   dieser Sitzung gehört, und ob die Rolle diese Terminart bestätigen darf.
   Hier steht keine zweite, selbstgebaute Prüfung — nur die Form.

   false von der Datenbank heisst «nicht erlaubt oder Sitzung abgelaufen».
   Das wird als solches gemeldet und nicht als Störung: sonst versucht es
   jemand zehnmal, dem es schlicht nicht zusteht. */

export type BestaetigenErgebnis = { ok: true } | { ok: false; fehler: string };

const FEHLER_SITZUNG =
  "Dieser Zugang ist nicht mehr gültig. Bitte den Link erneut öffnen.";
const FEHLER_NICHT_ERLAUBT =
  "Dieser Termin lässt sich über Ihren Zugang nicht bestätigen.";
const FEHLER_TECHNIK =
  "Die Bestätigung war gerade nicht möglich. Bitte in einigen Minuten erneut versuchen.";

export async function terminBestaetigenAction(
  terminId: string,
  von: string,
  bis: string,
  hinweis: string,
): Promise<BestaetigenErgebnis> {
  const session = (await cookies()).get(ZUGANG_COOKIE)?.value;
  if (!isSessionId(session)) return { ok: false, fehler: FEHLER_SITZUNG };

  const g = pruefe(() => ({
    id: kennung("Termin", terminId),
    zeit: zeitfensterGeprueft("Beginn", "Ende", von, bis),
    hinweis: optMehrzeilig("Hinweis", hinweis ?? "", GRENZEN.termin_hinweis),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  try {
    const erlaubt = await terminBestaetigen(
      session, g.wert.id, g.wert.zeit.von, g.wert.zeit.bis, g.wert.hinweis,
    );
    if (!erlaubt) return { ok: false, fehler: FEHLER_NICHT_ERLAUBT };
  } catch {
    return { ok: false, fehler: FEHLER_TECHNIK };
  }

  /* Nur der eigene Pfad — die Kennung des Falls ist hier nicht bekannt und
     hat in einer Adresse ohnehin nichts zu suchen. */
  revalidatePath("/zugang");
  return { ok: true };
}
