import { NextResponse, type NextRequest } from "next/server";
import { isMockMode } from "@/lib/env";
import { safeNext } from "@/lib/safe-next";

/* Rückweg des Anmeldelinks.

   Supabase kann auf zwei Wegen zurückkommen, und beide müssen hier greifen:

   1. `?code=…`  — PKCE. Der Prüfwert liegt im Browser, der Code wird gegen
      eine Sitzung getauscht (exchangeCodeForSession).
   2. `?token_hash=…&type=…` — der Weg für serverseitig gerenderte Anwendungen.
      Der Link aus der E-Mail zeigt direkt hierher, geprüft wird mit
      verifyOtp. Diese Fassung ist die verlässlichere: sie braucht nichts,
      was vorher im Browser abgelegt wurde, und funktioniert deshalb auch,
      wenn der Link in einem anderen Browser oder auf einem anderen Gerät
      geöffnet wird — bei einer Familie eher der Normalfall als die Ausnahme.

   Fehlt beides, kam der Aufruf nicht von einem gültigen Anmeldelink.

   Das Ziel (`next`) darf ausschliesslich ein Pfad auf dieser Seite sein.
   Ohne diese Prüfung liesse sich der Anmeldelink so bauen, dass er nach
   erfolgreicher Anmeldung auf eine fremde Adresse führt (Open Redirect) —
   die klassische Grundlage für nachgebaute Anmeldeseiten. */

export const dynamic = "force-dynamic";

/* verifyOtp nimmt nur diese Arten entgegen. Der Wert kommt aus der Adresse,
   wird also geprüft und nicht durchgereicht. */
const ARTEN = ["magiclink", "email", "signup", "invite", "recovery", "email_change"] as const;
type Art = (typeof ARTEN)[number];

function istArt(wert: string | null): wert is Art {
  return wert !== null && (ARTEN as readonly string[]).includes(wert);
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const code = p.get("code");
  const tokenHash = p.get("token_hash");
  const art = p.get("type");
  const ziel = safeNext(p.get("next"), req.url);

  const antwort = (pfad: string) => {
    const res = NextResponse.redirect(new URL(pfad, req.url), 303);
    res.headers.set("Cache-Control", "no-store");
    return res;
  };

  /* Ein abgelaufener oder schon benutzter Link ist etwas anderes als ein
     Aufruf ohne Link. Der Grund steht als kurzes Kennwort in der Adresse —
     nie der Token, nie die E-Mail-Adresse. */
  const gescheitert = () => antwort("/login?fehler=anmeldelink");

  if (isMockMode()) return antwort("/login");
  if (!code && !tokenHash) return antwort("/login");

  try {
    const { supabaseServer } = await import("@/lib/supabase/server");
    const sb = await supabaseServer();

    if (tokenHash) {
      if (!istArt(art)) return gescheitert();
      const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: art });
      if (error) return gescheitert();
    } else if (code) {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (error) return gescheitert();
    }
  } catch {
    return gescheitert();
  }

  return antwort(ziel);
}
