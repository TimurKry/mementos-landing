/* Öffentliche Konfiguration — die einzigen beiden Werte, die auch im Browser
   landen dürfen (NEXT_PUBLIC_* wird beim Build in das Bundle eingesetzt).

   Dieses Modul ist bewusst OHNE "server-only": der Browser-Client
   (supabase/client.ts) braucht die Werte und darf kein Servermodul ziehen.
   Alles andere — Modus-Prüfung, Geheimnisse — liegt in env.ts.
   Die Zugriffe müssen literal bleiben, sonst ersetzt Next sie nicht. */

/* Die URL ist der blosse Ursprung, ohne Pfad: supabase-js hängt /rest/v1,
   /auth/v1 usw. selbst an. Ein mitgegebenes /rest/v1 ergäbe /rest/v1/rest/v1. */
export const publicSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

/* Zwei Namen für denselben öffentlichen Schlüssel: neuere Supabase-Projekte
   geben ihn als «publishable key» (sb_publishable_…) aus, ältere als «anon
   key». Beide sind zur Veröffentlichung im Browser bestimmt und wirken nur
   im Rahmen von RLS. Der neue Name hat Vorrang.
   Beide Zugriffe müssen literal dastehen, sonst ersetzt Next sie nicht. */
const publishable = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const publicSupabaseAnonKey = publishable || anon;
