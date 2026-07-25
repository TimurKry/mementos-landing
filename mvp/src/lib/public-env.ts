/* Öffentliche Konfiguration — die einzigen beiden Werte, die auch im Browser
   landen dürfen (NEXT_PUBLIC_* wird beim Build in das Bundle eingesetzt).

   Dieses Modul ist bewusst OHNE "server-only": der Browser-Client
   (supabase/client.ts) braucht die Werte und darf kein Servermodul ziehen.
   Alles andere — Modus-Prüfung, Geheimnisse — liegt in env.ts.
   Die Zugriffe müssen literal bleiben, sonst ersetzt Next sie nicht. */

export const publicSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const publicSupabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
