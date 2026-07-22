import type { AudienceData } from "../types";

/* Аудитория «Friedhöfe» (Steep). Сценарий loss — Gräber, Termine,
   Nutzungsrechte ohne Abstimmungsschleifen. Прайсинг partner-note.
   Alle Grabstellen, Felder und Statusangaben — Beispieldaten. */

export const friedhoefe: AudienceData = {
  slug: "fuer-friedhoefe",
  navLabel: "Für Friedhöfe",
  meta: {
    title: "MementoOS für Friedhöfe — Gräber, Termine und Nutzungsrechte an einem Ort",
    description:
      "Beisetzungstermine ohne Abstimmungsschleifen, Nutzungsrechte sauber hinterlegt, Grabvorbereitung als klare Aufgabe. Unterlagen liegen dem Fall bei.",
  },

  hero: {
    headlineLead: "Gräber, Termine und Nutzungsrechte — ",
    headlineEm: "an einem Ort",
    headlineTail: ".",
    sub: "Beisetzungstermine ohne Rückrufe, Laufzeiten sauber hinterlegt, Grabvorbereitung offen oder erledigt. Sterbeurkunde und Grabdokument liegen dem Fall bei.",
    primary: { label: "Selbst ausprobieren", href: "/workspace/" },
    secondary: { label: "Demo anfragen", href: "#kontakt" },
    artifacts: [
      {
        kind: "list",
        title: "Grabstellen",
        badge: "Beispieldaten",
        width: 300,
        rows: [
          { primary: "Feld B · Reihe 4", secondary: "Wahlgrab", status: "Zugewiesen", done: true },
          { primary: "Feld C · Reihe 2", secondary: "Urnenreihe", status: "Angefragt", done: false },
          { primary: "Feld A · Reihe 7", secondary: "Wahlgrab", status: "Vorbereitung", done: false },
        ],
      },
      {
        kind: "checklist",
        title: "Grabvorbereitung",
        width: 290,
        items: [
          { label: "Grab zugewiesen", done: true },
          { label: "Nutzungsrecht hinterlegt", done: true },
          { label: "Aushub beauftragt", done: false },
          { label: "Grab vorbereitet", done: false },
        ],
        foot: "2 offen · 2 erledigt",
      },
      {
        kind: "ring",
        title: "Vorbereitung",
        width: 240,
        value: "3/4",
        label: "Schritte erledigt",
        ratio: 0.75,
      },
      { kind: "composer", width: 320, placeholder: "Grabdokument hinzufügen…" },
    ],
  },

  warum: {
    heading: "Gräber und Termine,",
    headingEm: "sauber hinterlegt",
    sub: "Nutzungsrechte, Termine und Vorbereitung an einem Ort — jede Aufgabe offen oder erledigt, nie irgendwo dazwischen.",
    cards: [
      {
        tag: "Termine",
        title: "Termine ohne Abstimmungsschleifen",
        text: "Beisetzungstermine werden einmal bestätigt und sind für alle sichtbar — ohne Rückrufe.",
        href: "/demo/",
        link: "Ablauf ansehen →",
      },
      {
        tag: "Nutzungsrecht",
        title: "Nutzungsrecht im Blick",
        text: "Laufzeiten und Grabdokumente liegen sauber am Grab hinterlegt und sind im Fall sichtbar.",
        href: "/datenmodell/#grab",
        link: "Datenmodell →",
      },
      {
        tag: "Vorbereitung",
        title: "Grabvorbereitung als klare Aufgabe",
        text: "Offen oder erledigt — der Steinmetz sieht nur Lage und Maße für das Grabmal.",
        href: "/demo/",
        link: "So funktioniert es →",
      },
      {
        tag: "Unterlagen",
        title: "Unterlagen kommen mit",
        text: "Sterbeurkunde und Grabdokument liegen dem Fall bei — kein separates Anfordern.",
        href: "/datenmodell/#dokumente",
        link: "Wer was sieht →",
      },
    ],
  },

  szenario: {
    view: "loss",
    heading: "Wir wissen, wo heute",
    headingEm: "Abstimmung verloren geht",
    sub: "Den Weg von der Grabanfrage bis zur Beisetzung haben wir mit der Branche kartiert. Links der heutige Ablauf, rechts derselbe Fall in MementoOS.",
    badge: "Telefon · Papier · Karteikarte",
    heute: [
      { from: "Bestatter", via: "Anruf", to: "Friedhof", loss: "Freie Grabstelle telefonisch angefragt" },
      { from: "Friedhof", via: "Rückruf", to: "Bestatter", loss: "Beisetzungstermin mehrfach abgestimmt" },
      { from: "Bestatter", via: "Papier", to: "Friedhof", loss: "Nutzungsrecht auf Karteikarte" },
      { from: "Steinmetz", via: "Rückfrage", to: "Friedhof", loss: "Lage und Maße unklar" },
    ],
    mit: [
      { title: "Grabstelle angefragt", text: "Der Bestatter fragt eine Grabstelle an — Sie weisen zu." },
      { title: "Grab zugewiesen & Nutzungsrecht hinterlegt", text: "Laufzeit und Grabdokument liegen dem Fall bei." },
      { title: "Beisetzungstermin bestätigt", text: "Ein Termin, für alle sichtbar — ohne Abstimmungsschleife." },
      { title: "Grabvorbereitung erledigt", text: "Aufgabe offen oder erledigt — nie dazwischen." },
      { title: "Beisetzung dokumentiert", text: "Vollständig protokolliert, nichts geht verloren." },
    ],
    foot: "Beispieldaten — ein Termin, ein Ort, keine Rückrufe.",
  },

  ablauf: {
    heading: "Vom Grab bis zur",
    headingEm: "Beisetzung",
    sub: "Ein Fall trägt Grab, Termin, Nutzungsrecht und Unterlagen in sich — der Stand ist für alle Beteiligten sichtbar.",
    steps: [
      { title: "Grabstelle zuweisen", text: "Angefragte Grabstelle prüfen und dem Fall zuweisen." },
      { title: "Nutzungsrecht hinterlegen", text: "Laufzeit und Grabdokument sauber am Grab hinterlegt." },
      { title: "Beisetzungstermin bestätigen", text: "Einmal bestätigt, für alle sichtbar — ohne Rückruf." },
      { title: "Grabvorbereitung", text: "Aushub und Vorbereitung als klare Aufgabe: offen oder erledigt." },
      { title: "Beisetzung dokumentieren", text: "Abschluss vollständig und nachvollziehbar." },
    ],
  },

  pricing: {
    variant: "partner-note",
    roleLabel: "Für Friedhöfe",
    heading: "Keine Lizenzkosten für",
    headingEm: "den Friedhof",
    sub: "Der Friedhof tritt dem Fall des Bestatters bei — kein eigenes Abo, keine Grundgebühr.",
    note: "Für den Friedhof entstehen keine Lizenzkosten. Grabgebühren pflegen Sie selbst; die Einbindung besprechen wir in der Pilotphase gemeinsam.",
    foot: "Vorschau — Konditionen werden mit den Pilotpartnern festgelegt.",
  },

  faq: [
    {
      q: "Sehen wir die Kosten der Familie?",
      a: "Nein. Grabgebühren pflegen Sie selbst; die Einkaufsseite anderer Partner bleibt verborgen.",
    },
    {
      q: "Was sieht der Steinmetz?",
      a: "Nur Lage und Maße für das Grabmal — mehr nicht. Was welche Rolle sieht, zeigt das Datenmodell.",
    },
    {
      q: "Wie werden auslaufende Nutzungsrechte behandelt?",
      a: "Laufzeiten sind am Grab hinterlegt und im Fall sichtbar; die Erinnerungslogik legen wir in der Pilotphase gemeinsam fest.",
    },
    {
      q: "Müssen Angehörige sich registrieren?",
      a: "Nein. Der Zugang läuft über einen Link — ohne eigenes Konto.",
    },
  ],

  cta: {
    heading: "Sehen Sie Gräber und Termine an einem Ort.",
    sub: "Wir zeigen den Ablauf in 20 Minuten — ruhig, konkret, ohne Verkaufsdruck.",
    mailSubject: "MementoOS Demo für Friedhöfe",
  },
};
