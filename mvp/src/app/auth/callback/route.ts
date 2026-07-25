import { NextResponse, type NextRequest } from "next/server";
import { isMockMode } from "@/lib/env";

/* Rückweg des Magic Links: Code gegen eine Sitzung tauschen.

   Das Ziel (`next`) darf ausschliesslich ein Pfad auf dieser Seite sein.
   Ohne diese Prüfung liesse sich der Anmeldelink so bauen, dass er nach
   erfolgreicher Anmeldung auf eine fremde Adresse führt (Open Redirect) —
   die klassische Grundlage für nachgebaute Anmeldeseiten. */

export const dynamic = "force-dynamic";

function safeNext(value: string | null): string {
  if (!value) return "/";
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/";
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const ziel = safeNext(req.nextUrl.searchParams.get("next"));

  const antwort = (pfad: string) => {
    const res = NextResponse.redirect(new URL(pfad, req.url), 303);
    res.headers.set("Cache-Control", "no-store");
    return res;
  };

  if (isMockMode() || !code) return antwort("/login");

  try {
    const { supabaseServer } = await import("@/lib/supabase/server");
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) return antwort("/login");
  } catch {
    return antwort("/login");
  }

  return antwort(ziel);
}
