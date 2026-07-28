/* Formprüfung der Eingaben aus dem Arbeitsbereich.

   Hier steht KEINE Rechteprüfung. Wer schreiben darf, entscheidet allein die
   Datenbank (RLS aus 0002_rls.sql: cases_owner, deceased_owner,
   participants_owner, tasks_owner). Geprüft wird ausschliesslich die FORM:
   Kennung, Länge, Zahlenbereich, Datum, zulässiger Wert einer Aufzählung.
   Eine Server Action ist direkt aufrufbar — deshalb landet nichts
   Unförmiges erst gar nicht an der Datenbank.

   Die zweite Regel dieses Moduls: eine Rückmeldung nennt das FELD, niemals
   seinen Inhalt. Für infektionshinweis und die übrigen Angaben der Gruppe
   sens ist das keine Feinheit — ein Wert in einer Fehlermeldung landet im
   Protokoll des Browsers, in Fehlerberichten und in Bildschirmfotos. Deshalb
   trägt Eingabefehler nur den Feldnamen, und den setzen wir selbst. */

export class Eingabefehler extends Error {
  /* `hinweis` ist ausschliesslich ein von uns geschriebener, fester Satz —
     nie ein Wert aus der Eingabe. Wer hier je etwas Eingegebenes einsetzt,
     hebt die Regel dieses Moduls auf. */
  constructor(public readonly feld: string, public readonly hinweis?: string) {
    super("Eingabe unzulässig");
    this.name = "Eingabefehler";
  }
}

export type Geprueft<T> =
  | { ok: true; wert: T }
  | { ok: false; feld: string; hinweis?: string };

/* Führt eine Prüfung aus und wandelt den Abbruch in ein Ergebnis um. Andere
   Ausnahmen werden durchgereicht — sie sind keine Eingabefehler. */
export function pruefe<T>(fn: () => T): Geprueft<T> {
  try {
    return { ok: true, wert: fn() };
  } catch (e) {
    if (e instanceof Eingabefehler) return { ok: false, feld: e.feld, hinweis: e.hinweis };
    throw e;
  }
}

export function fehlertext(feld: string): string {
  return `Bitte prüfen Sie das Feld «${feld}».`;
}

/* Meldung zu einem gescheiterten Prüflauf: entweder unser fester Hinweis
   oder der allgemeine Satz mit dem Feldnamen. In beiden Fällen ohne den
   eingegebenen Wert. */
export function meldung(g: { feld: string; hinweis?: string }): string {
  return g.hinweis ?? fehlertext(g.feld);
}

/* ── Längen ──────────────────────────────────────────────────────
   Alle Textfelder sind begrenzt. Ohne Grenze wäre jedes Freitextfeld ein
   offener Kanal in die Datenbank. */
export const GRENZEN = {
  name: 80,
  konfession: 60,
  anschrift: 200,
  sargmass: 60,
  infektionshinweis: 500,
  bestattungsart: 60,
  org: 120,
  aufgabe: 160,
  frist: 40,
} as const;

/* Kennung eines Datensatzes. Live sind das UUIDs; im Mock stehen kurze
   Beispielkennungen («0147», «t1»). Deshalb nur eine Formhürde gegen
   Unfug — die Zuordnung prüft die Datenbank. */
const KENNUNG_RE = /^[0-9a-zA-Z_-]{1,64}$/;

export function kennung(feld: string, v: unknown): string {
  if (typeof v !== "string" || !KENNUNG_RE.test(v)) throw new Eingabefehler(feld);
  return v;
}

/* ── Text ────────────────────────────────────────────────────────
   Steuerzeichen fliegen raus (ausser Zeilenumbruch in mehrzeiligen Feldern),
   danach wird beschnitten. Zu lang heisst abgelehnt, nicht stillschweigend
   gekürzt: sonst steht am Ende etwas anderes im Fall als eingegeben. */
const STEUERZEICHEN = /[\x00-\x1f\x7f]/g;                 // einzeilig: alle
const STEUERZEICHEN_MEHRZEILIG = /[\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g; // ohne \n und \r

function saeubere(v: unknown, feld: string, mehrzeilig: boolean): string {
  if (typeof v !== "string") throw new Eingabefehler(feld);
  return v.replace(mehrzeilig ? STEUERZEICHEN_MEHRZEILIG : STEUERZEICHEN, "").trim();
}

export function pflichtText(feld: string, v: unknown, max: number): string {
  const t = saeubere(v, feld, false);
  if (t.length === 0 || t.length > max) throw new Eingabefehler(feld);
  return t;
}

export function optText(feld: string, v: unknown, max: number): string | null {
  const t = saeubere(v, feld, false);
  if (t.length > max) throw new Eingabefehler(feld);
  return t.length === 0 ? null : t;
}

export function optMehrzeilig(feld: string, v: unknown, max: number): string | null {
  const t = saeubere(v, feld, true);
  if (t.length > max) throw new Eingabefehler(feld);
  return t.length === 0 ? null : t;
}

/* ── Datum ───────────────────────────────────────────────────────
   Erwartet wird die Form des HTML-Datumsfeldes (JJJJ-MM-TT). Geprüft wird
   nicht nur das Muster, sondern ob der Tag existiert: «2026-02-31» erfüllt
   das Muster und ist trotzdem kein Datum. */
const DATUM_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function optDatum(feld: string, v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") throw new Eingabefehler(feld);
  const m = DATUM_RE.exec(v);
  if (!m) throw new Eingabefehler(feld);
  const [jahr, monat, tag] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (jahr < 1900 || jahr > 2100) throw new Eingabefehler(feld);
  const d = new Date(Date.UTC(jahr, monat - 1, tag));
  if (
    d.getUTCFullYear() !== jahr ||
    d.getUTCMonth() !== monat - 1 ||
    d.getUTCDate() !== tag
  ) {
    throw new Eingabefehler(feld);
  }
  return v;
}

/* ── Zahlen ──────────────────────────────────────────────────────
   Ganzzahlig und in einem Bereich, den ein Mensch haben kann. Negatives und
   Absurdes wird abgelehnt, nicht zurechtgebogen. */
export function optGanzzahl(
  feld: string,
  v: unknown,
  min: number,
  max: number,
): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < min || n > max) throw new Eingabefehler(feld);
  return n;
}

export const BEREICH = {
  groesse_cm: [30, 260],
  gewicht_kg: [1, 400],
} as const;

export function jaNein(feld: string, v: unknown): boolean {
  if (typeof v !== "boolean") throw new Eingabefehler(feld);
  return v;
}

export function ausListe<T extends string>(feld: string, v: unknown, liste: readonly T[]): T {
  if (typeof v !== "string" || !(liste as readonly string[]).includes(v)) {
    throw new Eingabefehler(feld);
  }
  return v as T;
}

/* ── Bestattungsart ──────────────────────────────────────────────
   Vier gebräuchliche Formen als Vorschlag; freie Eingabe bleibt möglich,
   weil die Praxis mehr Formen kennt (anonyme Beisetzung, Überführung ins
   Ausland …). Begrenzt ist sie trotzdem. */
export const BESTATTUNGSARTEN = [
  "Einäscherung",
  "Erdbestattung",
  "Seebestattung",
  "Baumbestattung",
] as const;
