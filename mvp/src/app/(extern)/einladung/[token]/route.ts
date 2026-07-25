import { NextResponse, type NextRequest } from "next/server";
import { redeemInvite } from "@/lib/data";
import { DEMO_FAMILY_TOKEN, DEMO_KREMATORIUM_TOKEN } from "@/lib/mock";
import { isMockMode } from "@/lib/env";
import { ZUGANG_COOKIE, zugangCookie } from "@/lib/zugang";

/* Einmaliger Tausch: Token → Sitzung → Cookie → /zugang.

   Bewusst ein Route Handler und keine Seite: Cookies dürfen nur hier oder in
   einer Server Action gesetzt werden — cookies().set() aus einer Server
   Component wirft in Next 15.

   Danach steht der Token in keiner Adresszeile mehr. Er wird auch nirgends
   protokolliert, weder bei Erfolg noch bei Misserfolg. */

export const dynamic = "force-dynamic";

/* Format aus app.new_token() (0004): zwei UUIDs hex-verkettet.
   Ein Token, der die Form nicht hat, erreicht die Datenbank gar nicht. */
const TOKEN_RE = /^[0-9a-f]{64}$/;

function istForm(token: string): boolean {
  if (TOKEN_RE.test(token)) return true;
  /* Nur im Mock-Modus: die beiden festen Demo-Links aus der README. */
  return isMockMode() && (token === DEMO_FAMILY_TOKEN || token === DEMO_KREMATORIUM_TOKEN);
}

function ab(req: NextRequest, grund: "ungueltig" | "technik") {
  const res = NextResponse.redirect(
    new URL(`/einladung/ungueltig?grund=${grund}`, req.url),
    303,
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;

  if (!istForm(token)) return ab(req, "ungueltig");

  let session: string | null;
  try {
    session = await redeemInvite(token);
  } catch {
    /* Netz oder Datenbank — der Link selbst kann weiter gültig sein. */
    return ab(req, "technik");
  }

  if (!session) return ab(req, "ungueltig");

  const res = NextResponse.redirect(new URL("/zugang", req.url), 303);
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set(ZUGANG_COOKIE, session, zugangCookie(req.nextUrl.protocol === "https:"));
  return res;
}
