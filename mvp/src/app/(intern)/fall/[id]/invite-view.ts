/* Aufbereitung der Einladungs-Übersicht für die Anzeige.

   Bewusst ein eigenes, reines Modul: die Umrechnung läuft auf dem Server
   (Seite), das Ergebnis geht als fertiger Text an die Client-Komponente.
   Datum und Status hier zu berechnen und dort nur noch anzuzeigen hält beide
   Renderdurchläufe identisch — sonst entschiede die Zeitzone des Browsers
   über das Datum und die Uhr über den Status.

   Kein Token, kein Hash — list_invites gibt beides nicht heraus, und die
   Anzeige braucht es nicht. */

import type { InviteSummary } from "@/lib/types";
import { roleLabel } from "@/lib/access";

export type EinladungStatus = "aktiv" | "zurückgezogen" | "abgelaufen";

export type EinladungAnsicht = {
  id: string;
  rolle: string;
  label: string | null;
  status: EinladungStatus;
  erstellt: string;
  /* Offene Sitzungen dieser Einladung — wie viele Geräte gerade Zugang haben. */
  sitzungen: number;
};

/* Feste Zeitzone: das Datum darf nicht davon abhängen, wo der Browser steht. */
const datumsformat = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
});

function status(i: InviteSummary, jetzt: number): EinladungStatus {
  if (i.revoked) return "zurückgezogen";
  return Date.parse(i.expires_at) <= jetzt ? "abgelaufen" : "aktiv";
}

export function zuAnsicht(invites: InviteSummary[], jetzt = Date.now()): EinladungAnsicht[] {
  return invites.map((i) => ({
    id: i.id,
    rolle: roleLabel[i.role] ?? i.role,
    label: i.label,
    status: status(i, jetzt),
    erstellt: datumsformat.format(new Date(i.created_at)),
    sitzungen: Number(i.active_sessions ?? 0),
  }));
}
