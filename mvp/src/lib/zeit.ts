/* Zeitpunkte eines Termins — zwischen Formularfeld und Datenbank.

   Die Datenbank speichert timestamptz, also einen Zeitpunkt auf der Weltuhr.
   Das Formularfeld <input type="datetime-local"> liefert dagegen eine
   Wanduhrzeit ohne Zone: «2026-07-24T08:30». Zwischen beiden muss übersetzt
   werden, und zwar in genau einer Zone.

   Diese Zone ist fest Europe/Berlin und nicht die des Geräts. Grund: an einem
   Termin hängen mehrere Beteiligte. Trägt der Bestatter «8:30» ein, muss der
   Fahrdienst 8:30 lesen — nicht 7:30, weil sein Rechner auf London steht oder
   der Server in einer anderen Zone läuft. Ein Bestattungsfall spielt in
   Deutschland; eine Abholung «um halb neun» ist halb neun deutscher Zeit.

   Die Umrechnung ist absichtlich ohne Bibliothek und ohne Zeitzonentabelle im
   Bündel: Intl kennt die Zone bereits, in Node wie im Browser. Dadurch liefern
   Server und Gerät dasselbe Ergebnis — sonst gäbe es beim Hydrieren einen
   Unterschied zwischen dem, was gerendert wurde, und dem, was der Browser
   ausrechnet.

   Kein "server-only": beide Seiten benutzen diese Funktionen. */

export const ZONE = "Europe/Berlin";

/* Form des Formularfeldes. Sekunden lässt der Browser weg, wir auch. */
const WANDUHR_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function istWanduhr(v: unknown): v is string {
  return typeof v === "string" && WANDUHR_RE.test(v);
}

const teile = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONE,
  hour12: false,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
});

/* Abstand der Zone zur Weltzeit an einem gegebenen Zeitpunkt, in Minuten.
   Im Sommer +120, im Winter +60 — die Umstellung kennt Intl selbst. */
function abstandMinuten(ms: number): number {
  const p: Record<string, string> = {};
  for (const t of teile.formatToParts(new Date(ms))) p[t.type] = t.value;
  /* «24» statt «00» gibt Intl für Mitternacht in manchen Fassungen zurück. */
  const stunde = Number(p.hour) % 24;
  const alsUtc = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    stunde, Number(p.minute), Number(p.second),
  );
  return (alsUtc - ms) / 60000;
}

/* Wanduhrzeit → Zeitpunkt (ISO mit Z). null, wenn die Form nicht stimmt.

   Zwei Durchgänge, weil der Abstand selbst vom Zeitpunkt abhängt: der erste
   schätzt mit dem Abstand an der als UTC gelesenen Zeit, der zweite rechnet
   mit dem Abstand an der geschätzten Stelle nach. In den beiden Stunden der
   Zeitumstellung liegen die Schätzungen sonst um eine Stunde daneben. */
export function ausWanduhr(v: unknown): string | null {
  if (!istWanduhr(v)) return null;
  const naiv = Date.parse(`${v}:00Z`);
  if (Number.isNaN(naiv)) return null;
  const erste = naiv - abstandMinuten(naiv) * 60000;
  const zweite = naiv - abstandMinuten(erste) * 60000;
  return new Date(zweite).toISOString();
}

/* Zeitpunkt → Wanduhrzeit für das Formularfeld. Leer, wenn nichts vorliegt. */
export function zuWanduhr(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  const p: Record<string, string> = {};
  for (const t of teile.formatToParts(new Date(ms))) p[t.type] = t.value;
  const stunde = String(Number(p.hour) % 24).padStart(2, "0");
  return `${p.year}-${p.month}-${p.day}T${stunde}:${p.minute}`;
}

/* ── Anzeige ──────────────────────────────────────────────────────
   Deutsche Schreibweise, feste Zone. Beides fest verdrahtet, damit Server und
   Gerät dieselbe Zeichenkette erzeugen. */

const tagUndZeit = new Intl.DateTimeFormat("de-DE", {
  timeZone: ZONE, weekday: "short",
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
});

const nurZeit = new Intl.DateTimeFormat("de-DE", {
  timeZone: ZONE, hour: "2-digit", minute: "2-digit",
});

const nurTag = new Intl.DateTimeFormat("de-DE", {
  timeZone: ZONE, day: "2-digit", month: "2-digit", year: "numeric",
});

const gleicherTag = (a: number, b: number) =>
  nurTag.format(new Date(a)) === nurTag.format(new Date(b));

/* Ein Zeitfenster als ein Satz: «Fr, 24.07.2026, 08:30 – 10:00» — und wenn
   das Ende auf einen anderen Tag fällt, mit vollem Datum auf beiden Seiten.
   Ohne Zeitangabe steht dort, dass die Zeit noch offen ist: eine leere Zeile
   liest sich wie ein Fehler, «noch offen» wie ein Zustand. */
export function zeitfenster(
  von: string | null | undefined,
  bis: string | null | undefined,
): string {
  const a = von ? Date.parse(von) : NaN;
  const b = bis ? Date.parse(bis) : NaN;
  if (Number.isNaN(a) && Number.isNaN(b)) return "Zeit noch offen";
  if (Number.isNaN(a)) return `bis ${tagUndZeit.format(new Date(b))} Uhr`;
  const anfang = `${tagUndZeit.format(new Date(a))} Uhr`;
  if (Number.isNaN(b)) return anfang;
  return gleicherTag(a, b)
    ? `${tagUndZeit.format(new Date(a))} – ${nurZeit.format(new Date(b))} Uhr`
    : `${anfang} – ${tagUndZeit.format(new Date(b))} Uhr`;
}

/* Adresse für eine Kartenanwendung. Der Fahrdienst steht mit dem Telefon in
   der Hand vor dem Wagen — eine Adresse zum Abtippen hilft ihm nicht.

   geo:-Schema statt eines Anbieters: es öffnet die Karte, die auf dem Gerät
   eingerichtet ist, und ruft dabei keinen fremden Server auf. Fällt es aus,
   bleibt der Text daneben stehen — deshalb wird die Adresse immer auch als
   Text angezeigt und nicht nur als Verweis. */
export function kartenLink(adresse: string): string {
  return `geo:0,0?q=${encodeURIComponent(adresse)}`;
}
