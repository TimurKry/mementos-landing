import { NextResponse, type NextRequest } from "next/server";
import { isMockMode } from "@/lib/env";

/* Abmelden — ausschliesslich POST.
   Als GET liesse sich die Abmeldung von jeder fremden Seite aus auslösen
   (ein <img src="…/auth/abmelden"> genügt). Ein GET auf diesen Pfad
   beantwortet Next selbst mit 405. */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isMockMode()) {
    try {
      const { supabaseServer } = await import("@/lib/supabase/server");
      const sb = await supabaseServer();
      await sb.auth.signOut();
    } catch {
      /* Auch ohne erfolgreiche Abmeldung führt der Weg zur Anmeldeseite. */
    }
  }

  const res = NextResponse.redirect(new URL("/login", req.url), 303);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
