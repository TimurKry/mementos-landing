import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseAnonKey, publicSupabaseUrl } from "@/lib/public-env";

/* Браузерный Supabase-клиент (для клиентских компонентов: логин, realtime).
   Kein Import aus env.ts — das ist ein reines Servermodul.
   Im Mock-Modus gibt es keine Verbindung: null statt Absturz. */
export function supabaseBrowser() {
  if (!publicSupabaseUrl || !publicSupabaseAnonKey) return null;
  return createBrowserClient(publicSupabaseUrl, publicSupabaseAnonKey);
}
