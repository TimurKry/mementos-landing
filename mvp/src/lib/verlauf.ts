/* Der Wortschatz des Journals — für beide Umkreise, die es anzeigen:
   den Arbeitsbereich des Hauses (Verlauf eines Vorgangs) und die
   Plattform-Übersicht (Ereignisse).

   Er lag vorher nur in (admin)/admin/format.ts. Als das Haus seinen eigenen
   Verlauf bekam, hätte daneben eine zweite Liste entstehen müssen — und zwei
   Listen für dieselben Kürzel laufen auseinander, sobald eine neue Aktion
   dazukommt. Genau das war schon passiert: termin.bestaetigt und
   angaben.ergaenzt standen in keiner. */

import { feldLabel, roleLabel, terminArtLabel } from "./access";
import type { Deceased, Role, TerminArt } from "./types";

export type Verlaufseintrag = {
  at: string;
  action: string;
  actor_kind: string | null;
  /* Gekürzt auf acht Zeichen — die volle Sitzungs-Kennung gibt die Datenbank
     nicht heraus (app.akteur_kurz, 0013). */
  actor_ref: string | null;
  detail: Record<string, unknown> | null;
};

/* Die Kürzel stehen so im Journal der Datenbank (audit_log.action). */
const aktionen: Record<string, string> = {
  "invite.create": "Zugang ausgegeben",
  "invite.redeem": "Zugang eingelöst",
  "invite.redeem.failed": "Einlösung fehlgeschlagen",
  "invite.revoke": "Zugang zurückgezogen",
  "session.end": "Sitzung beendet",
  "session.revoke": "Sitzung entzogen",
  "case.view": "Vorgang geöffnet",
  "termin.bestaetigt": "Termin bestätigt",
  "angaben.ergaenzt": "Angaben ergänzt",
};

export function aktionLabel(wert: string): string {
  return aktionen[wert] ?? wert;
}

/* Zwei Vokabulare: die Datenbank schreibt user/invite/platform/system, die
   Beispieldaten der Übersicht haus/zugang/plattform/anonym. Beide stehen
   hier, damit keine Ansicht ein rohes Kürzel zeigt. */
const akteure: Record<string, string> = {
  user: "Haus", invite: "Zugang", platform: "Betreuung", system: "System",
  haus: "Haus", zugang: "Zugang", plattform: "Betreuung", anonym: "Unbekannt",
};

export function akteurLabel(wert: string | null): string {
  if (!wert) return "—";
  return akteure[wert] ?? wert;
}

function alsListe(wert: unknown): string[] {
  return Array.isArray(wert) ? wert.filter((v): v is string => typeof v === "string") : [];
}

function aufzaehlung(woerter: string[]): string {
  if (woerter.length <= 1) return woerter[0] ?? "";
  return `${woerter.slice(0, -1).join(", ")} und ${woerter[woerter.length - 1]}`;
}

/* Aus dem jsonb-Detail ein lesbarer Halbsatz. Was hier nicht ausdrücklich
   behandelt wird, erscheint gar nicht — im Detail stehen ausschliesslich
   Namen und Rollen, aber eine Ansicht, die unbekannte Schlüssel einfach
   ausschüttet, wäre die falsche Gewohnheit für ein Journal über einen
   Sterbefall. */
export function detailText(action: string, detail: Record<string, unknown> | null): string | null {
  if (!detail) return null;

  const rolle =
    typeof detail.role === "string" && detail.role in roleLabel
      ? roleLabel[detail.role as Role]
      : null;

  if (action === "angaben.ergaenzt") {
    const namen = alsListe(detail.felder)
      .filter((f) => f in feldLabel)
      .map((f) => feldLabel[f as keyof Deceased]);
    const was = namen.length > 0 ? aufzaehlung(namen) : "Angaben";
    return rolle ? `${rolle} · ${was}` : was;
  }

  if (action === "termin.bestaetigt") {
    const art =
      typeof detail.art === "string" && detail.art in terminArtLabel
        ? terminArtLabel[detail.art as TerminArt]
        : null;
    return [rolle, art].filter(Boolean).join(" · ") || null;
  }

  return rolle ? `Rolle ${rolle}` : null;
}
