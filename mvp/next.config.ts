import type { NextConfig } from "next";

/* Динамическое приложение (НЕ static export) — нужен рантайм для auth и БД.
   Деплой отдельно от лендинга (Vercel EU / self-host), не на GitHub Pages. */
const nextConfig: NextConfig = {
  // Свой корень трейсинга — в репозитории есть второй lockfile (лендинг).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
