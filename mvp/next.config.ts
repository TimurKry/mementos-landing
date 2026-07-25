import type { NextConfig } from "next";
import { staticSecurityHeaders } from "./src/lib/security-headers";

/* Динамическое приложение (НЕ static export) — нужен рантайм для auth и БД.
   Деплой отдельно от лендинга (Vercel EU / self-host), не на GitHub Pages. */
const nextConfig: NextConfig = {
  // Свой корень трейсинга — в репозитории есть второй lockfile (лендинг).
  outputFileTracingRoot: __dirname,

  // Версия Next im Antwort-Kopf ist eine Auskunft, die niemand braucht.
  poweredByHeader: false,

  /* Zweite Reihe: dieselben statischen Zeilen wie in der Middleware.
     Greift die Middleware einmal nicht (Matcher, Fehler, künftige Umbauten),
     stehen sie trotzdem. Die CSP bleibt der Middleware vorbehalten — sie
     braucht je Anfrage einen frischen nonce. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: Object.entries(staticSecurityHeaders).map(([key, value]) => ({ key, value })),
      },
    ];
  },
};

export default nextConfig;
