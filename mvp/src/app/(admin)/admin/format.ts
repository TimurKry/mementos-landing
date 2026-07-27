/* Anzeige-Formate der Plattform-Übersicht — reines Modul, keine Daten.

   Feste Zeitzone (UTC): sonst entschiede die Uhr des Browsers über das Datum
   und der erste Renderdurchlauf wiche vom zweiten ab. Auf den Bildschirmen
   steht der Hinweis dazu. */

const fDatum = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC",
});

const fZeitpunkt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", timeZone: "UTC",
});

const fZahl = new Intl.NumberFormat("de-DE");

export function datum(wert?: string | null): string {
  if (!wert) return "—";
  const d = new Date(wert);
  return Number.isNaN(d.getTime()) ? "—" : fDatum.format(d);
}

export function zeitpunkt(wert?: string | null): string {
  if (!wert) return "—";
  const d = new Date(wert);
  return Number.isNaN(d.getTime()) ? "—" : fZeitpunkt.format(d);
}

export function zahl(wert: number): string {
  return fZahl.format(wert);
}

/* Die Kürzel stehen so im Journal der Datenbank (audit_log.action). Sie
   bleiben sichtbar — die Betreuung sucht danach —, bekommen aber eine
   deutsche Beschriftung daneben. */
const aktionen: Record<string, string> = {
  "invite.create": "Zugang ausgegeben",
  "invite.redeem": "Zugang eingelöst",
  "invite.redeem.failed": "Einlösung fehlgeschlagen",
  "invite.revoke": "Zugang zurückgezogen",
  "session.end": "Sitzung beendet",
  "session.revoke": "Sitzung entzogen",
  "case.view": "Vorgang geöffnet",
};

export function aktion(wert: string): string {
  return aktionen[wert] ?? wert;
}

const akteure: Record<string, string> = {
  haus: "Haus",
  zugang: "Zugang",
  plattform: "Betreuung",
  anonym: "Unbekannt",
  system: "System",
};

export function akteur(wert: string): string {
  return akteure[wert] ?? wert;
}
