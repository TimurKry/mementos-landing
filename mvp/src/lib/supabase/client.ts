import { createBrowserClient } from "@supabase/ssr";

/* Браузерный Supabase-клиент (для клиентских компонентов: логин, realtime). */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
