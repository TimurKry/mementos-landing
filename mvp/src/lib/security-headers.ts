/* Sicherheits-Kopfzeilen — eine Stelle, ein Regelwerk.

   Reine Funktion, kein Zugriff auf Anfrage-Objekte: die Middleware ruft sie
   für jede Antwort auf, next.config.ts wiederholt die statischen Zeilen als
   zweite Reihe (falls die Middleware einmal nicht greift).

   Kein "server-only" — läuft in der Edge-Middleware. */

import { publicSupabaseUrl } from "./public-env";

export type HeaderOptions = {
  /* Zufallswert je Anfrage; Next hängt ihn an seine eigenen Skript-Tags. */
  nonce: string;
  /* live = Supabase konfiguriert (connect-src braucht dann die Projekt-URL). */
  isLive: boolean;
  /* Für die Cache-Regel: Fallseiten dürfen nirgends zwischengespeichert werden. */
  pathname?: string;
};

/* Seiten mit Falldaten oder Anmeldevorgängen — nie zwischenspeichern. */
function isVertraulich(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/zugang" ||
    pathname.startsWith("/fall/") ||
    pathname.startsWith("/einladung/") ||
    pathname.startsWith("/auth/")
  );
}

export function contentSecurityPolicy({ nonce, isLive }: HeaderOptions): string {
  const dev = process.env.NODE_ENV !== "production";

  const scriptSrc = `'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`;

  const connect = ["'self'", isLive && publicSupabaseUrl ? publicSupabaseUrl : ""]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    /* Stil-Attribute und Tailwinds eingebettete Regeln; deutlich harmloser
       als Skripte und ohne Alternative im App-Router. */
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    `connect-src ${connect}`,
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
  ].join("; ");
}

/* Statische Zeilen — identisch in Middleware und next.config.ts. */
export const staticSecurityHeaders: Record<string, string> = {
  /* Sitenweit, nicht nur auf /einladung: der Arbeitsbereich hat keine
     SEO-Aufgaben, und eine teilweise Regel geht beim nächsten Umbau verloren. */
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Robots-Tag": "noindex, nofollow",
  /* Ohne `preload`: der Eintrag in die Browser-Liste ist praktisch
     unumkehrbar, und die Domain steht noch nicht fest. Auf http://localhost
     wendet der Browser die Zeile ohnehin nicht an — das ist erwartet. */
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
};

export function applySecurityHeaders<T extends { headers: Headers }>(
  res: T,
  opts: HeaderOptions,
): T {
  for (const [name, value] of Object.entries(staticSecurityHeaders)) {
    res.headers.set(name, value);
  }
  res.headers.set("Content-Security-Policy", contentSecurityPolicy(opts));

  if (opts.pathname === undefined || isVertraulich(opts.pathname)) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
  }
  return res;
}
