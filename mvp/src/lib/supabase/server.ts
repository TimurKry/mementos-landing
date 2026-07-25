import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { serverSecrets, supabasePublicConfig } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/* Serverseitiger Supabase-Client mit anon-Schlüssel (cookie-basierte Auth).
   Jeder lesende Zugriff läuft hierüber — so greifen RLS und die
   security-definer-Funktionen. Werte kommen aus env.ts, das bei fehlender
   oder halber Konfiguration wirft. */
export async function supabaseServer() {
  const { url, anonKey } = supabasePublicConfig();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: CookieToSet[]) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* вызов из Server Component без возможности записи cookie — игнор */
        }
      },
    },
  });
}

/* service_role-Client: umgeht RLS vollständig.
   Nur für signierte Datei-URLs und Seed — NIEMALS zum Lesen eines Falls.
   Ohne Session, damit der Schlüssel in keinem Cookie landet. */
export function supabaseService() {
  const { url } = supabasePublicConfig();
  const { serviceRoleKey } = serverSecrets();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
