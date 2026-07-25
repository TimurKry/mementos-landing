import "server-only";

/* Umgebung — die einzige Stelle, an der serverseitige Variablen gelesen werden.
   Öffentliche Werte (NEXT_PUBLIC_*) kommen aus public-env.ts, damit der
   Browser-Client kein Servermodul importieren muss.

   Zwei Betriebsarten:
   - "mock" — In-Memory-Beispieldaten, keine Datenbank, für Entwicklung/Demo.
   - "live" — Supabase (URL + anon key gesetzt).

   Regeln (bewusst streng, halb konfiguriert ist der gefährlichste Zustand):
   1. Nur URL oder nur Key gesetzt  → Fehler, immer.
   2. Nichts gesetzt und NODE_ENV=production → Fehler, außer MEMENTO_ALLOW_MOCK=1.
      Sonst startet eine Produktion still im Demo-Modus.
   3. Ausnahme für den Build (NEXT_PHASE=phase-production-build): dort wird
      nicht geworfen, `pnpm build` bleibt ohne env-Variablen grün. Die Prüfung
      greift zur Laufzeit — träge aus der Datenschicht (und aus der Middleware).

   Kein throw auf Modulebene — nur in Funktionen. */

import { publicSupabaseAnonKey, publicSupabaseUrl } from "./public-env";

export type RuntimeMode = "mock" | "live";

const ERR_HALF =
  "MementoOS: Unvollständige Supabase-Konfiguration — NEXT_PUBLIC_SUPABASE_URL und " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY müssen beide gesetzt sein oder beide leer bleiben.";

const ERR_PROD_MOCK =
  "MementoOS: Produktionsstart ohne Datenbank-Konfiguration abgebrochen.";

/* Next setzt diese Phase während `next build` — dort darf nichts werfen. */
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/* Betriebsart inkl. aller Prüfungen. Wirft bei Fehlkonfiguration.
   Von der Datenschicht bei jedem Zugriff aufgerufen — und von der Middleware. */
export function getRuntimeMode(): RuntimeMode {
  const url = publicSupabaseUrl;
  const key = publicSupabaseAnonKey;

  if (url && key) return "live";
  if (url || key) throw new Error(ERR_HALF);

  if (
    process.env.NODE_ENV === "production" &&
    process.env.MEMENTO_ALLOW_MOCK !== "1" &&
    !isBuildPhase()
  ) {
    throw new Error(ERR_PROD_MOCK);
  }
  return "mock";
}

/* Für Aufrufer, die nur prüfen wollen (Middleware): wirft oder tut nichts. */
export function assertRuntimeConfig(): void {
  getRuntimeMode();
}

/* Nur für Beschriftungen im UI (Badge „Mock-Modus"). Wirft nie — der harte
   Riegel liegt in getRuntimeMode(), das jeder Datenzugriff durchläuft. */
export function isMockMode(): boolean {
  return !(publicSupabaseUrl && publicSupabaseAnonKey);
}

/* Verbindungsdaten für den anon-Client (RLS/definer greifen). */
export function supabasePublicConfig(): { url: string; anonKey: string } {
  if (getRuntimeMode() !== "live") {
    throw new Error("MementoOS: Supabase ist nicht konfiguriert (Mock-Modus).");
  }
  return { url: publicSupabaseUrl, anonKey: publicSupabaseAnonKey };
}

/* Serverseitige Geheimnisse. Ausschließlich hier lesbar.
   Der service_role-Schlüssel umgeht RLS — nur für signierte Datei-URLs und
   Seed, niemals zum Lesen eines Falls. */
export function serverSecrets(): { serviceRoleKey: string } {
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!serviceRoleKey) {
    throw new Error("MementoOS: SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt.");
  }
  return { serviceRoleKey };
}
