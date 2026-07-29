/* Eine Quelle für alles, was eine Seite über sich nach außen sagt.

   Warum zentral: Titel und Beschreibung standen schon je Seite, aber die
   Vorschaubilder, die kanonische Adresse und die Twitter-Karte hätten sich
   über zwölf Dateien verteilt. Eine vergessene Datei fällt niemandem auf —
   man sieht es erst, wenn jemand den Link in WhatsApp teilt und dort eine
   leere Kachel steht.

   ── Die Falle mit basePath ────────────────────────────────────────────
   Der Lendung liegt unter einem Unterpfad (`/mementos-landing`), weil
   GitHub Pages das Projekt so ausliefert. Relative Bildpfade in
   Metadaten sind damit gefährlich: `new URL("og.png", ".../mementos-landing")`
   ergibt `.../og.png` — der letzte Abschnitt fällt weg, sobald der
   Schrägstrich fehlt. Deshalb steht die Basis hier MIT Schrägstrich, und
   `absolut()` baut jede Adresse ausdrücklich zusammen statt sich auf die
   Auflösung zu verlassen.

   Wechselt das Projekt später auf eine eigene Domain, ist SITE_URL die
   einzige Zeile, die sich ändert. */

import type { Metadata } from "next";

export const SITE_NAME = "MementoOS";

/* Mit abschließendem Schrägstrich — siehe oben. */
export const SITE_URL = "https://timurkry.github.io/mementos-landing/";

/* Das Vorschaubild. 1200×630 ist das Maß, das LinkedIn, WhatsApp, Slack und
   X gemeinsam erwarten; alles andere wird beschnitten. */
export const OG_BILD = "og.png";
export const OG_BREITE = 1200;
export const OG_HOEHE = 630;

export function absolut(pfad: string): string {
  return SITE_URL + pfad.replace(/^\/+/, "");
}

/* Pfade OHNE führenden Schrägstrich, damit sie zur Basis passen. Der
   Startseite entspricht die leere Zeichenkette. */
export type SeitenPfad = "" | (string & {});

export function seite({
  titel,
  beschreibung,
  pfad = "",
}: {
  titel: string;
  beschreibung: string;
  pfad?: SeitenPfad;
}): Metadata {
  const url = absolut(pfad);
  return {
    /* `absolute` und keine Vorlage: die Titel tragen den Markennamen schon
       selbst («MementoOS für Bestatter — …», «MementoOS — Preise»). Eine
       Vorlage `%s — MementoOS` würde ihn ein zweites Mal anhängen. */
    title: { absolute: titel },
    description: beschreibung,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: SITE_NAME,
      title: titel,
      description: beschreibung,
      url,
      images: [
        {
          url: absolut(OG_BILD),
          width: OG_BREITE,
          height: OG_HOEHE,
          /* Beschreibung des Bildes, nicht der Seite: Bildschirmleser und
             manche Netzwerke zeigen sie an, wenn das Bild fehlt. */
          alt: "MementoOS — ein gemeinsamer Vorgang für alle Beteiligten einer Bestattung",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titel,
      description: beschreibung,
      images: [absolut(OG_BILD)],
    },
  };
}

/* ── Strukturierte Daten ──────────────────────────────────────────────
   Bewusst KEIN LocalBusiness. Das verlangt Anschrift und Rechtsträger, und
   beides ist offen (siehe docs/WORKING_CONTEXT.md). Eine erfundene Adresse
   in maschinenlesbaren Daten wäre genau die Art Behauptung, die dieses
   Projekt sich nicht erlaubt — und Google straft sie ab, wenn sie mit dem
   Impressum nicht zusammenpasst. Kommt später, mit dem echten Impressum. */

export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    inLanguage: "de",
    description:
      "MementoOS verbindet Bestatter, Krematorien, Friedhöfe, Transport und " +
      "Partner in einem gemeinsamen digitalen Vorgang. Jeder Beteiligte sieht " +
      "ausschließlich, was ihn betrifft.",
    audience: {
      "@type": "Audience",
      audienceType:
        "Bestattungsunternehmen, Krematorien, Friedhöfe, Fahrdienste, Zulieferer",
    },
    /* Kein `offers`: die Konditionen legen wir in der Pilotphase gemeinsam
       fest, es gibt keinen Preis, der hier stehen könnte. Ein erfundener
       Preis in strukturierten Daten ist eine Preisangabe. */
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
