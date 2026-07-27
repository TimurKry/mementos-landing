/* Datenschicht der Plattform-Übersicht (Betreuung der Plattform).

   Eigene Datei statt eines Anbaus an data.ts, weil hier ein anderer Umkreis
   liegt: anderer Vertrag (0008_plattform_uebersicht.sql), andere Berechtigung
   (Mitgliedschaft in platform_admins statt Eigentum an einem Fall), andere
   Ablehnung. Was data.ts liest, gehört einem Haus; was hier liest, gehört der
   Plattform. Zwei Umkreise in einer Datei würden sich früher oder später
   gegenseitig Funktionen ausleihen.

   Was hier NICHT vorkommt: irgendein Feld einer verstorbenen Person, ein
   Aufgabentext, ein Dokumentname. Ein Vorgang wird über seine Nummer und
   seine Phase erkannt. Die Übersicht sieht Metadaten und Verbindungen — mehr
   zu sehen hiesse, die 2026 geschlossene Lücke wieder aufzumachen.

   Dieselbe Weiche wie in data.ts: Supabase konfiguriert → Datenbank, sonst
   Mock. Jeder Aufruf läuft über getRuntimeMode(), damit die Prüfung der
   Konfiguration zur Laufzeit greift.

   Die Rechte prüft ausschliesslich die Datenbank: alle admin_*-Funktionen
   sind SECURITY DEFINER und prüfen die Mitgliedschaft selbst (Ablehnung mit
   errcode 42501). Hier steht keine zweite, selbstgebaute Prüfung — sie wäre
   eine zweite Wahrheit, die irgendwann von der ersten abweicht. */

import type {
  AdminEreignis, AdminFall, AdminHaus, AdminSitzung, AdminUebersicht,
  AdminZugang, Phase, Role,
} from "./types";
import { getRuntimeMode } from "./env";
import { mockAdmin } from "./mock";

const ERR_DB = "MementoOS: Die Datenbank hat die Anfrage abgelehnt.";

/* Ablehnung durch die Datenbank (kein Mitglied von platform_admins).
   Wird von den Seiten in einen ruhigen Bildschirm übersetzt, nicht in einen
   Fehlertext der Datenbank. */
export const ERR_KEINE_BETREUUNG =
  "MementoOS: Kein Zugriff auf die Plattform-Übersicht.";

export function istKeineBetreuung(e: unknown): boolean {
  return e instanceof Error && e.message === ERR_KEINE_BETREUUNG;
}

function dbFehler(code: string | undefined): Error {
  return new Error(code === "42501" ? ERR_KEINE_BETREUUNG : ERR_DB);
}

const mock = () => getRuntimeMode() === "mock";

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw dbFehler(error.code);
  return data as T;
}

/* ── Aufbereitung roher Zeilen ───────────────────────────────────
   bigint kommt je nach Einstellung als Zahl oder als Zeichenkette an; ein
   fehlender Wert darf die Seite nicht kippen. */

type Roh = Record<string, unknown>;

const zahl = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const zeit = (v: unknown): string | null => (typeof v === "string" ? v : null);

const wort = (v: unknown): string => (typeof v === "string" ? v : "");

const PHASEN: Phase[] = ["neu", "unterlagen", "bestaetigt", "durchfuehrung", "abschluss"];

const phase = (v: unknown): Phase =>
  (PHASEN as string[]).includes(wort(v)) ? (v as Phase) : "neu";

/* detail ist in der Datenbank jsonb (Rolle, Feldgruppen) — nie ein Inhalt des
   Falls. Für die Anzeige wird daraus eine kurze Zeile. */
function detailText(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v || null;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map((x) => String(x)).join(", ") || null;
  if (typeof v === "object") {
    const teile = Object.entries(v as Roh).map(
      ([k, val]) => `${k}: ${Array.isArray(val) ? val.join(", ") : String(val)}`,
    );
    return teile.join(" · ") || null;
  }
  return null;
}

function zuHaus(r: Roh): AdminHaus {
  return {
    haus_id: wort(r.haus_id),
    org_name: wort(r.org_name) || "Ohne Namen",
    faelle_gesamt: zahl(r.faelle_gesamt),
    faelle_offen: zahl(r.faelle_offen),
    faelle_abgeschlossen: zahl(r.faelle_abgeschlossen),
    zugaenge_aktiv: zahl(r.zugaenge_aktiv),
    sitzungen_aktiv: zahl(r.sitzungen_aktiv),
    letzte_aktivitaet: zeit(r.letzte_aktivitaet),
  };
}

function zuFall(r: Roh): AdminFall {
  return {
    fall_id: wort(r.fall_id),
    ref: wort(r.ref),
    phase: phase(r.phase),
    created_at: zeit(r.created_at) ?? "",
    target_date: zeit(r.target_date),
    beteiligte: zahl(r.beteiligte),
    zugaenge_aktiv: zahl(r.zugaenge_aktiv),
    sitzungen_aktiv: zahl(r.sitzungen_aktiv),
    letzte_aktivitaet: zeit(r.letzte_aktivitaet),
  };
}

function zuZugang(r: Roh): AdminZugang {
  /* admin_zugaenge liefert bisher nur die Anzahl offener Sitzungen. Liefert
     der Vertrag eines Tages auch deren Kennungen mit, werden sie hier
     übernommen — bis dahin bleibt die Liste leer und der Knopf «Sitzung
     beenden» erscheint nur im Mock-Betrieb. */
  const roh = Array.isArray(r.sitzungen) ? (r.sitzungen as Roh[]) : [];
  const sitzungen: AdminSitzung[] = roh
    .map((s) => ({
      sitzung_id: wort(s.sitzung_id ?? s.id),
      zuletzt_gesehen: zeit(s.zuletzt_gesehen),
    }))
    .filter((s) => s.sitzung_id !== "");

  return {
    zugang_id: wort(r.zugang_id),
    role: wort(r.role) as Role,
    label: typeof r.label === "string" && r.label ? r.label : null,
    created_at: zeit(r.created_at) ?? "",
    expires_at: zeit(r.expires_at) ?? "",
    revoked: r.revoked === true,
    sitzungen_aktiv: zahl(r.sitzungen_aktiv),
    zuletzt_gesehen: zeit(r.zuletzt_gesehen),
    sitzungen,
  };
}

function zuEreignis(r: Roh): AdminEreignis {
  return {
    at: zeit(r.at) ?? "",
    action: wort(r.action),
    actor_kind: wort(r.actor_kind),
    actor_ref: typeof r.actor_ref === "string" && r.actor_ref ? r.actor_ref : null,
    detail: detailText(r.detail),
    fall_ref: typeof r.fall_ref === "string" && r.fall_ref ? r.fall_ref : null,
  };
}

/* ── Lesen ───────────────────────────────────────────────────── */

export async function adminUebersicht(): Promise<AdminUebersicht> {
  if (mock()) return mockAdmin.uebersicht();
  const roh = (await rpc<Roh>("admin_overview")) ?? {};
  const rohPhasen = (roh.phasen ?? {}) as Roh;
  const phasen = { neu: 0, unterlagen: 0, bestaetigt: 0, durchfuehrung: 0, abschluss: 0 };
  for (const p of PHASEN) phasen[p] = zahl(rohPhasen[p]);
  return {
    haeuser: zahl(roh.haeuser),
    faelle_gesamt: zahl(roh.faelle_gesamt),
    faelle_offen: zahl(roh.faelle_offen),
    faelle_abgeschlossen: zahl(roh.faelle_abgeschlossen),
    phasen,
    zugaenge_aktiv: zahl(roh.zugaenge_aktiv),
    zugaenge_zurueckgezogen: zahl(roh.zugaenge_zurueckgezogen),
    sitzungen_aktiv: zahl(roh.sitzungen_aktiv),
    ereignisse_24h: zahl(roh.ereignisse_24h),
  };
}

export async function adminHaeuser(): Promise<AdminHaus[]> {
  if (mock()) return mockAdmin.haeuser();
  const rows = (await rpc<Roh[]>("admin_haeuser")) ?? [];
  return rows.map(zuHaus);
}

export async function adminFaelle(hausId: string): Promise<AdminFall[]> {
  if (mock()) return mockAdmin.faelle(hausId);
  const rows = (await rpc<Roh[]>("admin_faelle", { p_haus: hausId })) ?? [];
  return rows.map(zuFall);
}

export async function adminZugaenge(fallId: string): Promise<AdminZugang[]> {
  if (mock()) return mockAdmin.zugaenge(fallId);
  const rows = (await rpc<Roh[]>("admin_zugaenge", { p_fall: fallId })) ?? [];
  return rows.map(zuZugang);
}

export async function adminEreignisse(
  fallId: string | null = null,
  limit = 50,
): Promise<AdminEreignis[]> {
  if (mock()) return mockAdmin.ereignisse(fallId, limit);
  const rows =
    (await rpc<Roh[]>("admin_ereignisse", { p_fall: fallId, p_limit: limit })) ?? [];
  return rows.map(zuEreignis);
}

/* Ein einzelner Vorgang mit seinem Haus.

   Der Vertrag kennt admin_faelle(p_haus), aber keine Funktion für einen
   einzelnen Vorgang. Deshalb: der Weg über die Liste des Hauses. Die
   Kennung des Hauses kommt als Hinweis von der aufrufenden Seite; fehlt sie
   (direkt eingegebene Adresse), werden die Häuser der Reihe nach durchsucht.
   Das kostet im Live-Betrieb je Haus einen Aufruf — vertretbar, solange die
   Zahl der Häuser klein ist. Sauberer wäre ein admin_fall(p_fall) im
   SQL-Vertrag; bis dahin bleibt es bei diesem Weg. */
export async function adminFallKontext(
  fallId: string,
  hausHinweis?: string | null,
): Promise<{ fall: AdminFall; haus: AdminHaus } | null> {
  const haeuser = await adminHaeuser();
  const zuerst = haeuser.filter((h) => h.haus_id === hausHinweis);
  const rest = haeuser.filter((h) => h.haus_id !== hausHinweis);

  for (const haus of [...zuerst, ...rest]) {
    const fall = (await adminFaelle(haus.haus_id)).find((f) => f.fall_id === fallId);
    if (fall) return { fall, haus };
  }
  return null;
}

/* ── Regeln ──────────────────────────────────────────────────── */

/* Zieht einen Zugang zurück; die offenen Sitzungen dieses Zugangs enden
   dabei sofort (wie revoke_invite in 0004). */
export async function adminZugangZurueckziehen(zugangId: string): Promise<void> {
  if (mock()) return mockAdmin.zugangZurueckziehen(zugangId);
  await rpc<null>("admin_zugang_zurueckziehen", { p_zugang: zugangId });
}

/* Beendet eine einzelne Sitzung, ohne den Zugang selbst zu entwerten. */
export async function adminSitzungBeenden(sitzungId: string): Promise<void> {
  if (mock()) return mockAdmin.sitzungBeenden(sitzungId);
  await rpc<null>("admin_sitzung_beenden", { p_sitzung: sitzungId });
}
