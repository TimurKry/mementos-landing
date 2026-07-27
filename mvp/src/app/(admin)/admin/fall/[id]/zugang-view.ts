/* Aufbereitung der Zugänge für die Anzeige — reines Modul.

   Wie bei den Einladungen im Arbeitsbereich: Datum und Status entstehen auf
   dem Server, die Client-Komponente zeigt nur noch fertigen Text. Sonst
   entschiede die Zeitzone des Browsers über das Datum und seine Uhr über den
   Status, und beide Renderdurchläufe gingen auseinander.

   Kein Token, kein Hash, kein Inhalt des Vorgangs — Rolle, Merkhilfe des
   Hauses, Zeitpunkte, Zähler. */

import { roleLabel } from "@/lib/access";
import type { AdminZugang } from "@/lib/types";
import { zeitpunkt } from "../../format";

export type ZugangStatus = "aktiv" | "zurückgezogen" | "abgelaufen";

export type SitzungAnsicht = { id: string; zuletzt: string };

export type ZugangAnsicht = {
  id: string;
  rolle: string;
  label: string | null;
  status: ZugangStatus;
  erstellt: string;
  gueltigBis: string;
  zuletzt: string;
  sitzungenAnzahl: number;
  /* Nur gefüllt, wenn die Kennungen vorliegen — siehe AdminZugang.sitzungen. */
  sitzungen: SitzungAnsicht[];
};

function status(z: AdminZugang, jetzt: number): ZugangStatus {
  if (z.revoked) return "zurückgezogen";
  return Date.parse(z.expires_at) <= jetzt ? "abgelaufen" : "aktiv";
}

export function zuAnsicht(zugaenge: AdminZugang[], jetzt = Date.now()): ZugangAnsicht[] {
  return zugaenge.map((z) => ({
    id: z.zugang_id,
    rolle: roleLabel[z.role] ?? z.role,
    label: z.label,
    status: status(z, jetzt),
    erstellt: zeitpunkt(z.created_at),
    gueltigBis: zeitpunkt(z.expires_at),
    zuletzt: zeitpunkt(z.zuletzt_gesehen),
    sitzungenAnzahl: z.sitzungen_aktiv,
    sitzungen: z.sitzungen.map((s) => ({
      id: s.sitzung_id,
      zuletzt: zeitpunkt(s.zuletzt_gesehen),
    })),
  }));
}
