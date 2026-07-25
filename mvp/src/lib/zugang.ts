/* Zugangs-Cookie für Eingeladene (Familie, Krematorium …).

   Der Einladungs-Token steht bewusst NICHT mehr in der Adresszeile: er würde
   über den Referer an fremde Server, in die Verlaufsliste des Browsers, in
   Proxy- und CDN-Protokolle, auf Bildschirmfotos und in weitergeleitete
   Nachrichten geraten. Stattdessen wird er genau einmal gegen eine
   Sitzungs-Kennung getauscht, die nur im Cookie liegt.

   Der Wert ist eine zufällige UUID aus der Datenbank und wird bei jedem
   Aufruf serverseitig geprüft (get_case_by_session). Eine Signatur bringt
   deshalb nichts: ein geratener Wert ist ohne gültige Sitzung wertlos.

   Kein "server-only" — die Middleware (Edge) liest diese Werte ebenfalls. */

export const ZUGANG_COOKIE = "mos_zugang";

/* 12 Stunden — dieselbe Laufzeit wie invite_sessions.expires_at (0004). */
export const ZUGANG_MAX_AGE = 43200;

/* Format der Sitzungs-Kennung (uuid v4, wie gen_random_uuid()). */
const SESSION_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isSessionId(value: string | undefined | null): value is string {
  return typeof value === "string" && SESSION_RE.test(value);
}

/* `secure` nur, wenn die Verbindung es hergibt: auf http://localhost würde
   das Flag die Demo lautlos zerstören. */
export function zugangCookie(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ZUGANG_MAX_AGE,
  };
}
