"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { angabenErgaenzen, endInviteSession, terminBestaetigen } from "@/lib/data";
import { ZUGANG_COOKIE, isSessionId } from "@/lib/zugang";
import { VON_AUSSEN_SCHREIBBAR, feldLabel } from "@/lib/access";
import type { Deceased } from "@/lib/types";
import {
  GRENZEN, kennung, meldung, optDatum, optMehrzeilig, optText, pruefe,
  zeitfensterGeprueft,
} from "@/lib/eingaben";

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

/* hinweis ist kein Fehler: der Aufruf ist durchgegangen, aber nicht alles
   davon ist schon eine Angabe im Vorgang. Seit 0016 kann ein Teil als
   Vorschlag beim Haus liegen (siehe angabenErgaenzenAction). */
export type BestaetigenErgebnis =
  | { ok: true; hinweis?: string }
  | { ok: false; fehler: string };

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

/* ── Angaben ergänzen ────────────────────────────────────────────
   Die Familie trägt ein, was nur sie weiss: Geburtsdatum, Konfession, letzte
   Anschrift. Bisher lief das über einen Anruf und jemanden, der mitschreibt —
   drei Gelegenheiten, etwas falsch zu übernehmen, an einem Tag, an dem
   niemand konzentriert ist.

   Dieselbe Bauart wie beim Bestätigen eines Termins: weder Fall-Kennung noch
   Rolle kommen von aussen, beide hängen an der Sitzung im Cookie. Geprüft
   wird hier nur die FORM. Welche Felder eine Rolle ändern darf, entscheidet
   allein app.felder_schreibbar in der Datenbank — die Liste unten ist eine
   Formhürde gegen einen Direktaufruf, keine zweite Wahrheit.

   Die Meldung nennt bei einem Fehler das FELD, nie seinen Inhalt: eine
   Anschrift in einer Fehlermeldung landet im Protokoll des Browsers und auf
   Bildschirmfotos. */

const FEHLER_ANGABEN =
  "Diese Angaben lassen sich über Ihren Zugang nicht ändern.";
const FEHLER_SPEICHERN =
  "Das Speichern war gerade nicht möglich. Bitte in einigen Minuten erneut versuchen.";

/* Längen je Feld — dieselben Zahlen wie app.feld_grenze in 0012. */
const LAENGE: Partial<Record<keyof Deceased, number>> = {
  vorname: GRENZEN.name,
  nachname: GRENZEN.name,
  konfession: GRENZEN.konfession,
  anschrift: GRENZEN.anschrift,
};

export async function angabenErgaenzenAction(
  eingaben: Record<string, string>,
): Promise<BestaetigenErgebnis> {
  const session = (await cookies()).get(ZUGANG_COOKIE)?.value;
  if (!isSessionId(session)) return { ok: false, fehler: FEHLER_SITZUNG };

  const g = pruefe(() => {
    const felder: Partial<Deceased> = {};
    for (const feld of VON_AUSSEN_SCHREIBBAR) {
      if (!(feld in eingaben)) continue;
      const roh = eingaben[feld];
      const name = feldLabel[feld];
      (felder as Record<string, unknown>)[feld] =
        feld === "geburtsdatum"
          ? optDatum(name, roh)
          : optText(name, roh, LAENGE[feld] ?? GRENZEN.name);
    }
    return felder;
  });
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  if (Object.keys(g.wert).length === 0) return { ok: false, fehler: FEHLER_ANGABEN };

  try {
    const ergebnis = await angabenErgaenzen(session, g.wert);
    if (!ergebnis.ok) return { ok: false, fehler: FEHLER_ANGABEN };

    revalidatePath("/zugang");

    /* Seit 0016 ist «gespeichert» nicht mehr die ganze Wahrheit. Was eine
       fremde Quelle hatte, liegt als Vorschlag beim Bestattungshaus — und wer
       das nicht erfährt, geht davon aus, seine Korrektur stehe schon.
       Genannt werden die Feldnamen, nicht die Werte. */
    if (ergebnis.vorgeschlagen.length > 0) {
      const namen = ergebnis.vorgeschlagen.map((f) => feldLabel[f]).join(", ");
      return {
        ok: true,
        hinweis: ergebnis.uebernommen.length > 0
          ? `Gespeichert. Für ${namen} liegt bereits eine andere Angabe vor — Ihre Fassung geht als Vorschlag an das Bestattungshaus.`
          : `Für ${namen} liegt bereits eine andere Angabe vor. Ihre Fassung geht als Vorschlag an das Bestattungshaus; bis zur Rückmeldung bleibt die bisherige stehen.`,
      };
    }
  } catch {
    return { ok: false, fehler: FEHLER_SPEICHERN };
  }

  return { ok: true };
}
