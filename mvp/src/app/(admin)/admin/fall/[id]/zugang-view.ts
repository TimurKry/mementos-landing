/* Aufbereitung der Zugänge für die Anzeige — reines Modul.

   Wie bei den Einladungen im Arbeitsbereich: Datum und Status entstehen auf
   dem Server, die Client-Komponente zeigt nur noch fertigen Text. Sonst
   entschiede die Zeitzone des Browsers über das Datum und seine Uhr über den
   Status, und beide Renderdurchläufe gingen auseinander.

   Kein Token, kein Hash, kein Inhalt des Vorgangs — Rolle, Zeitpunkte,
   Zähler. Auch keine Merkhilfe: admin_zugaenge gibt sie seit 0009 nicht mehr
   heraus (Freitext des Hauses, in der Praxis mit Personennamen). Wem der
   Zugang gehört, sagt die Rolle. */

import { roleLabel } from "@/lib/access";
import type { AdminZugang } from "@/lib/types";
import { zeitpunkt } from "../../format";

export type ZugangStatus = "aktiv" | "zurückgezogen" | "abgelaufen";

export type SitzungAnsicht = { id: string; seit: string; zuletzt: string };

export type ZugangAnsicht = {
  id: string;
  rolle: string;
  status: ZugangStatus;
  erstellt: string;
  gueltigBis: string;
  zuletzt: string;
  sitzungenAnzahl: number;
  /* Offene Sitzungen mit Kennung — Grundlage für «Sitzung beenden». */
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
    status: status(z, jetzt),
    erstellt: zeitpunkt(z.created_at),
    gueltigBis: zeitpunkt(z.expires_at),
    zuletzt: zeitpunkt(z.zuletzt_gesehen),
    sitzungenAnzahl: z.sitzungen_aktiv,
    sitzungen: z.sitzungen.map((s) => ({
      id: s.sitzung_id,
      seit: zeitpunkt(s.created_at),
      zuletzt: zeitpunkt(s.zuletzt_gesehen),
    })),
  }));
}
