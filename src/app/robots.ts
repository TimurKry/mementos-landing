import type { MetadataRoute } from "next";
import { absolut } from "@/lib/site";

/* robots.txt für den Lendung. Der Arbeitsbereich (mvp/) hat sein eigenes,
   und dort steht das Gegenteil: dort ist alles verboten, weil hinter den
   Adressen Fallakten liegen.

   Hier ist alles erlaubt — die Seiten sollen gefunden werden. Der Zweck
   dieser Datei ist der Verweis auf die Sitemap: ohne ihn muss ein Crawler
   sie raten oder sie muss in der Search Console eingetragen werden. */

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absolut("sitemap.xml"),
  };
}
