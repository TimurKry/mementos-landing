import { NextResponse, type NextRequest } from "next/server";
import { assertRuntimeConfig, getRuntimeMode, supabasePublicConfig } from "@/lib/env";
import { applySecurityHeaders, contentSecurityPolicy } from "@/lib/security-headers";
import { ZUGANG_COOKIE, isSessionId } from "@/lib/zugang";
import type { CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/* Middleware — der äußere Riegel. Vier Aufgaben, in dieser Reihenfolge:

   1. Sicherheits-Kopfzeilen für jede Antwort (inkl. nonce für die CSP).
   2. Konfiguration prüfen: eine halb eingerichtete Produktion ist der
      gefährlichste Zustand, deshalb bricht sie hier laut ab.
   3. Arbeitsbereich (/, /fall/**) nur für angemeldete Bestatter — im
      Mock-Modus entfällt das, sonst wäre die Demo ohne Datenbank tot.
   4. /zugang nur mit gültigem Sitzungs-Cookie.

   Kein Datenbankzugriff auf die Sitzung an dieser Stelle: die Middleware
   prüft nur die Form des Cookies, die Gültigkeit prüft die Seite selbst
   über get_case_by_session. */

function nonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

/* Nur ein Pfad auf derselben Seite ist als Rücksprungziel zulässig. */
function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const n = nonce();

  /* Konfiguration zuerst — ohne sie ist jede weitere Aussage wertlos. */
  let mode: "mock" | "live";
  try {
    assertRuntimeConfig();
    mode = getRuntimeMode();
  } catch {
    const res = new NextResponse(
      "MementoOS: Die Anwendung ist nicht vollständig konfiguriert.",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
    return applySecurityHeaders(res, { nonce: n, isLive: false, pathname });
  }

  const isLive = mode === "live";
  const opts = { nonce: n, isLive, pathname };

  /* Next hängt den nonce an seine eigenen Skript-Tags, wenn er ihn in den
     weitergereichten Anfrage-Kopfzeilen findet. */
  const headers = new Headers(req.headers);
  headers.set("x-nonce", n);
  headers.set("content-security-policy", contentSecurityPolicy(opts));

  const weiter = () =>
    applySecurityHeaders(NextResponse.next({ request: { headers } }), opts);

  const umleiten = (ziel: string) =>
    applySecurityHeaders(NextResponse.redirect(new URL(ziel, req.url), 303), opts);

  /* ── äußerer Umkreis: Zugang per Link ───────────────────────── */
  if (pathname === "/zugang") {
    if (!isSessionId(req.cookies.get(ZUGANG_COOKIE)?.value)) {
      return umleiten("/einladung/ungueltig");
    }
    return weiter();
  }

  /* /login, /auth/**, /einladung/** brauchen keine Anmeldung. */
  const offen =
    pathname === "/login" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/einladung/");
  if (offen) return weiter();

  /* ── innerer Umkreis: Arbeitsbereich ────────────────────────── */
  if (!isLive) return weiter(); // Mock-Demo läuft ohne Konto

  const geschuetzt = pathname === "/" || pathname.startsWith("/fall/");
  if (!geschuetzt) return weiter();

  const res = applySecurityHeaders(NextResponse.next({ request: { headers } }), opts);

  const { createServerClient } = await import("@supabase/ssr");
  const { url, anonKey } = supabasePublicConfig();

  /* Cookie-Verdrahtung nach Vorgabe von @supabase/ssr: gelesen wird aus der
     Anfrage, geschrieben in DIESE Antwort — sie muss zurückgegeben werden,
     sonst geht die aufgefrischte Sitzung verloren. */
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: CookieToSet[]) => {
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  /* Auch eine Störung führt zur Anmeldeseite: ohne bestätigte Anmeldung
     darf der Arbeitsbereich nicht ausgeliefert werden. */
  let angemeldet = false;
  try {
    const { data } = await supabase.auth.getUser();
    angemeldet = !!data.user;
  } catch {
    angemeldet = false;
  }
  if (!angemeldet) {
    return umleiten(`/login?next=${encodeURIComponent(safeNext(pathname))}`);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|robots.txt).*)"],
};
