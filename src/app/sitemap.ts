import type { MetadataRoute } from "next";
import { absolut } from "@/lib/site";

/* Die Sitemap wird beim Export einmal erzeugt und liegt danach als Datei im
   out/-Ordner. Sie ist deshalb bewusst eine Liste von Hand und kein Scan des
   Dateisystems: eine neue Seite soll hier eintragen werden müssen. Eine
   Sitemap, die alles automatisch aufnimmt, nimmt irgendwann auch etwas auf,
   was noch nicht öffentlich sein sollte.

   `/workspace` und `/demo` stehen mit niedrigerem Rang drin — sie sind
   Vorführungen, keine Zielseiten. `/datenmodell` ebenso: fachlich
   interessant, aber nicht das, wonach jemand sucht.

   changeFrequency und priority sind Hinweise, keine Anweisungen; Google
   behandelt sie als schwaches Signal. Sie stehen hier, weil sie nichts
   kosten, nicht weil sie viel bewirken. */

const STAND = new Date("2026-07-29");

type Eintrag = { pfad: string; rang: number; wechsel: "weekly" | "monthly" };

const SEITEN: Eintrag[] = [
  { pfad: "",                   rang: 1.0,  wechsel: "weekly" },

  /* Zielgruppenseiten — das, was in der Suche gefunden werden soll. */
  { pfad: "fuer-bestatter",     rang: 0.9,  wechsel: "monthly" },
  { pfad: "fuer-krematorien",   rang: 0.9,  wechsel: "monthly" },
  { pfad: "fuer-friedhoefe",    rang: 0.9,  wechsel: "monthly" },
  { pfad: "fuer-zulieferer",    rang: 0.8,  wechsel: "monthly" },
  { pfad: "fuer-verbuende",     rang: 0.8,  wechsel: "monthly" },
  { pfad: "fuer-familien",      rang: 0.8,  wechsel: "monthly" },

  { pfad: "so-funktioniert-es", rang: 0.8,  wechsel: "monthly" },
  { pfad: "sicherheit",         rang: 0.7,  wechsel: "monthly" },
  { pfad: "preise",             rang: 0.7,  wechsel: "monthly" },
  { pfad: "ueber-uns",          rang: 0.6,  wechsel: "monthly" },

  /* Vorführungen und Fachliches. */
  { pfad: "demo",               rang: 0.5,  wechsel: "monthly" },
  { pfad: "workspace",          rang: 0.4,  wechsel: "monthly" },
  { pfad: "datenmodell",        rang: 0.4,  wechsel: "monthly" },
];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return SEITEN.map(({ pfad, rang, wechsel }) => ({
    /* trailingSlash ist in next.config an — die Adressen in der Sitemap
       müssen dazu passen, sonst meldet Google für jede Seite eine
       Weiterleitung. */
    url: pfad === "" ? absolut("") : absolut(pfad + "/"),
    lastModified: STAND,
    changeFrequency: wechsel,
    priority: rang,
  }));
}
