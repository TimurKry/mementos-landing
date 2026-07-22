import type { AudienceData } from "../types";

/* Аудитория «Bestatter» — перенос эталона /fuer-bestatter в data-модель.
   Все имена, номера дел и статусы — Beispieldaten. */

export const bestatter: AudienceData = {
  slug: "fuer-bestatter",
  navLabel: "Für Bestatter",
  meta: {
    title: "MementoOS für Bestatter — Der Arbeitsbereich für Ihr Bestattungshaus",
    description:
      "Fälle, Aufgaben und Partner in einem ruhigen Arbeitsbereich. Offene Punkte schließen sich, bevor sie zu Anrufen werden.",
  },

  hero: {
    headlineLead: "Der Arbeitsbereich für Ihr ",
    headlineEm: "Bestattungshaus",
    headlineTail: ".",
    sub: "Fälle, Aufgaben und Partner in einem ruhigen Arbeitsbereich. Offene Punkte schließen sich, bevor sie zu Anrufen werden.",
    primary: { label: "Selbst ausprobieren", href: "/workspace/" },
    secondary: { label: "Demo anfragen", href: "#kontakt" },
    artifacts: [
      {
        kind: "list",
        title: "Aktuelle Fälle",
        badge: "Beispieldaten",
        width: 300,
        rows: [
          { primary: "Fall Weber", secondary: "M-2026-0147", status: "Bestätigt", done: true },
          { primary: "Fall Krüger", secondary: "M-2026-0151", status: "Unterlagen offen", done: false },
          { primary: "Fall Sommer", secondary: "M-2026-0149", status: "Termin geplant", done: false },
        ],
      },
      {
        kind: "checklist",
        title: "Aufgaben heute",
        width: 290,
        items: [
          { label: "Todesbescheinigung hochladen", done: true },
          { label: "Krematorium buchen", done: true },
          { label: "Floristik anfragen", done: false },
          { label: "Familie: Angaben ergänzen", done: false },
        ],
        foot: "2 offen · 2 erledigt",
      },
      {
        kind: "ring",
        title: "Vorgangsfortschritt",
        width: 240,
        value: "3/4",
        label: "Unterlagen vollständig",
        ratio: 0.75,
      },
      { kind: "composer", width: 340, placeholder: "Notiz zum Fall hinzufügen…" },
    ],
  },

  warum: {
    heading: "Ein Arbeitstag ohne",
    headingEm: "offene Schleifen",
    sub: "Gute Werkzeuge machen Arbeit sichtbar: Jede Aufgabe ist offen oder erledigt — nie irgendwo dazwischen.",
    cards: [
      {
        tag: "Fälle",
        title: "Jeder Fall, ein Faden",
        text: "Vom ersten Anruf bis zur Archivierung: ein Vorgang, eine Historie, ein Ort für alles.",
        href: "/demo/",
        link: "Demo ansehen →",
      },
      {
        tag: "Aufgaben",
        title: "Offen oder erledigt",
        text: "Aufgaben haben einen Besitzer, einen Stichtag und ein klares Ende. Was offen ist, sehen Sie sofort.",
        href: "/demo/",
        link: "So funktioniert es →",
      },
      {
        tag: "Partner",
        title: "Anfragen statt Anrufe",
        text: "Krematorium, Transport und Floristik bestätigen ihren Teil selbst — Sie sehen nur das Ergebnis.",
        href: "/#produkt",
        link: "Das Produkt →",
      },
    ],
  },

  szenario: {
    view: "loss",
    heading: "Wir wissen, wo heute",
    headingEm: "Information verloren geht",
    sub: "Den Ablauf haben wir mit der Branche kartiert — Anruf für Anruf. Links der heutige Weg, rechts derselbe Fall in MementoOS.",
    badge: "Telefon · Fax · Zettel",
    heute: [
      { from: "Familie", via: "Anruf", to: "Bestatter", loss: "Notizen auf Zetteln — nichts ist geteilt" },
      { from: "Bestatter", via: "Fax", to: "Krematorium", loss: "Warten auf Rückruf, Stand unklar" },
      { from: "Krematorium", via: "Rückfrage", to: "Bestatter", loss: "Angaben werden doppelt erfasst" },
      { from: "Bestatter", via: "Anrufe", to: "Partner", loss: "Jeder Partner einzeln — niemand sieht das Ganze" },
    ],
    mit: [
      { title: "Der Fall entsteht", text: "Mit der Buchung — alle Angaben landen sofort im Fall." },
      { title: "Alle arbeiten am selben Fall", text: "Familie, Krematorium und Partner treten per Link bei." },
      { title: "Aufgaben: offen oder erledigt", text: "Jeder sieht, was aussteht — Rückfragen entfallen." },
      { title: "Abschluss & Archiv", text: "Vollständig dokumentiert, nichts geht verloren." },
    ],
    foot: "Schneller und leichter — weil Information nie den Kanal wechselt.",
  },

  ablauf: {
    heading: "Jeder Fall ist eine",
    headingEm: "eigene Akte",
    sub: "Ein Fall trägt alles in sich — Beteiligte, Aufgaben, Unterlagen und die vollständige Historie. Abgeschlossen heißt vollständig, nachvollziehbar, archiviert.",
    steps: [
      {
        title: "Beteiligte",
        text: "Alle Organisationen treten per Link bei — ohne eigene Lizenz, ohne Doppelerfassung.",
      },
      {
        title: "Aufgaben",
        text: "Jede Aufgabe ist offen oder erledigt — der Stand ist für alle sichtbar.",
      },
      {
        title: "Unterlagen",
        text: "Vollständig und geprüft, bevor der nächste Schritt beginnt.",
      },
      {
        title: "Historie & Abschluss",
        text: "Lückenlos protokolliert — abgeschlossen heißt vollständig, nachvollziehbar, archiviert.",
      },
    ],
  },

  quote: {
    text: "Ein guter Vorgang hinterlässt keine offenen Schleifen. Jede Aufgabe hat einen Besitzer, einen Stichtag —",
    textEm: "und ein Ende.",
    source: "Arbeitsprinzip von MementoOS",
  },

  pricing: {
    variant: "full",
    heading: "Bezahlt wird ein",
    headingEm: "abgeschlossener Fall",
    sub: "Keine Grundgebühr, keine Schulungskosten. Das Kernmodell rechnet pro erfolgreich abgeschlossenem Fall ab — für Häuser mit konstantem Volumen gibt es Abos.",
    foot: "Vorschau — endgültige Konditionen werden mit den Pilotpartnern festgelegt.",
  },

  faq: [
    {
      q: "Müssen Partner sich registrieren?",
      a: "Nein. Krematorium, Transport oder Floristik treten über einen Link bei und bestätigen ihren Teil direkt im Browser — ohne eigenes Konto und ohne Installation.",
    },
    {
      q: "Wie werden Angehörige eingebunden?",
      a: "Familien erhalten einen einfachen Link. Darüber sehen sie den Stand und ergänzen fehlende Angaben — ohne Registrierung, bewusst ruhig gestaltet.",
    },
    {
      q: "Was passiert mit einem abgeschlossenen Fall?",
      a: "Er wird vollständig archiviert: alle Beteiligten, Aufgaben, Unterlagen und die lückenlose Historie bleiben nachvollziehbar an einem Ort.",
    },
    {
      q: "In welcher Phase ist MementoOS?",
      a: "MementoOS ist in Entwicklung und entsteht in Leipzig im direkten Austausch mit der Branche. Konditionen und Ablauf legen wir in der Pilotphase gemeinsam fest.",
    },
  ],

  cta: {
    heading: "Sehen Sie Ihr Haus im Arbeitsbereich.",
    sub: "Wir zeigen MementoOS in 20 Minuten — ruhig, konkret, ohne Verkaufsdruck.",
    mailSubject: "MementoOS Demo für Bestatter",
  },
};
