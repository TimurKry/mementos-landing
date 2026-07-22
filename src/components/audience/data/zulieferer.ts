import type { AudienceData } from "../types";

/* Аудитория «Zulieferer» (Steep). Сценарий board — ein Auftrag,
   drei Zustände (offen / in Arbeit / erledigt). Прайсинг partner-note:
   keine Lizenzkosten, Zugang per Link. Alle Aufträge — Beispieldaten. */

export const zulieferer: AudienceData = {
  slug: "fuer-zulieferer",
  navLabel: "Für Zulieferer",
  meta: {
    title: "MementoOS für Zulieferer — Aufträge annehmen per Link, ohne Registrierung",
    description:
      "Aufträge im Browser annehmen — ohne Konto, ohne Installation. Nur Anlass, Lieferort und Zeit; Ihre Konditionen bleiben Ihre.",
  },

  hero: {
    headlineLead: "Aufträge annehmen — ",
    headlineEm: "per Link, ohne Registrierung",
    headlineTail: ".",
    sub: "Im Browser annehmen — ohne Konto, ohne Installation. Sie sehen nur Anlass, Lieferort und Zeit; Preise und interne Felder sieht kein anderer Partner.",
    primary: { label: "Selbst ausprobieren", href: "/workspace/" },
    secondary: { label: "Demo anfragen", href: "#kontakt" },
    artifacts: [
      {
        kind: "list",
        title: "Ihre Aufträge",
        badge: "Beispieldaten",
        width: 300,
        rows: [
          { primary: "Trauerfloristik", secondary: "Anlass · Lieferort", status: "Angenommen", done: true },
          { primary: "Überführung", secondary: "Zeitfenster Fr.", status: "Bestätigt", done: true },
          { primary: "Sarg Eiche", secondary: "Lieferung Haus Nord", status: "Offen", done: false },
        ],
      },
      {
        kind: "checklist",
        title: "Auftrag Trauerfloristik",
        width: 290,
        items: [
          { label: "Anfrage geöffnet", done: true },
          { label: "Auftrag angenommen", done: true },
          { label: "Liefertermin bestätigt", done: false },
          { label: "Geliefert & quittiert", done: false },
        ],
        foot: "per Link · ohne Konto",
      },
      {
        kind: "ring",
        title: "Aufträge",
        width: 240,
        value: "2/3",
        label: "bestätigt",
        ratio: 0.66,
      },
      { kind: "composer", width: 320, placeholder: "Lieferzeit bestätigen…" },
    ],
  },

  warum: {
    heading: "Aufträge annehmen,",
    headingEm: "ohne Konto",
    sub: "Ein Link genügt: Sie sehen, was Sie brauchen, bestätigen im Browser — und Ihre Konditionen bleiben bei Ihnen.",
    cards: [
      {
        tag: "Zugang",
        title: "Auftrag per Link",
        text: "Im Browser, ohne Konto, ohne Installation — der Link führt direkt zu Ihrem Auftrag.",
        href: "/datenmodell/#floristik",
        link: "Wer was sieht →",
      },
      {
        tag: "Daten",
        title: "Nur, was Sie brauchen",
        text: "Anlass, Lieferort und Zeit — keine Personendaten, keine fremden Konditionen.",
        href: "/datenmodell/#transport",
        link: "Datenmodell →",
      },
      {
        tag: "Bestätigen",
        title: "Bestätigen statt zurückrufen",
        text: "Sie nehmen an oder verschieben direkt im Auftrag — ohne Telefonschleife.",
        href: "/demo/",
        link: "Ablauf ansehen →",
      },
      {
        tag: "Konditionen",
        title: "Ihre Konditionen bleiben Ihre",
        text: "Preise und interne Felder sieht kein anderer Partner — je Partner getrennt.",
        href: "/datenmodell/#floristik",
        link: "So funktioniert es →",
      },
    ],
  },

  szenario: {
    view: "board",
    heading: "Ein Auftrag,",
    headingEm: "drei Zustände",
    sub: "Kein Vielleicht dazwischen: Jeder Auftrag ist offen, in Arbeit oder erledigt — für alle Beteiligten sichtbar.",
    columns: [
      {
        title: "Offen",
        state: "open",
        tasks: [
          { label: "Anfrage Trauerfloristik geöffnet", meta: "Fall M-2026-0149 · Beispieldaten" },
          { label: "Sarg Eiche angefragt", meta: "Lieferung Haus Nord" },
        ],
      },
      {
        title: "In Arbeit",
        state: "doing",
        tasks: [
          { label: "Überführung angenommen", meta: "Zeitfenster Fr. 09–11" },
          { label: "Floristik in Vorbereitung", meta: "Lieferort hinterlegt" },
        ],
      },
      {
        title: "Erledigt",
        state: "done",
        tasks: [
          { label: "Liefertermin bestätigt", meta: "Fr. 10:30" },
          { label: "Geliefert & quittiert", meta: "ohne Rückruf" },
        ],
      },
    ],
    foot: "Beispieldaten — Zugang über den persönlichen Link zum Auftrag.",
  },

  ablauf: {
    heading: "Vom Link bis zur",
    headingEm: "Lieferung",
    sub: "Ein Auftrag trägt alles in sich, was Sie brauchen — und nichts, was Sie nichts angeht.",
    steps: [
      { title: "Link öffnen", text: "Im Browser, ohne Konto und ohne Installation." },
      { title: "Auftrag annehmen", text: "Anlass, Lieferort und Zeit auf einen Blick — annehmen oder verschieben." },
      { title: "Liefertermin bestätigen", text: "Bestätigen statt zurückrufen — der Stand ist sofort sichtbar." },
      { title: "Liefern & quittieren", text: "Abschluss vollständig dokumentiert, ohne Telefonschleife." },
    ],
  },

  pricing: {
    variant: "partner-note",
    roleLabel: "Für Zulieferer",
    heading: "Keine Lizenzkosten für",
    headingEm: "Zulieferer",
    sub: "Sie treten dem Auftrag über einen persönlichen Link bei — kein eigenes Abo, keine Grundgebühr.",
    note: "Für Zulieferer entstehen keine Lizenzkosten. Der Zugang läuft über einen persönlichen Link — ohne Konto, ohne Installation; Konditionen bleiben je Partner getrennt.",
    foot: "Vorschau — gilt für Transport, Floristik und Särge gleichermaßen.",
  },

  faq: [
    {
      q: "Brauchen wir ein Konto?",
      a: "Nein. Der Zugang läuft über einen persönlichen Link zum Auftrag — ohne Registrierung, ohne Installation.",
    },
    {
      q: "Welche Daten sehen wir?",
      a: "Nur die Ihres Auftrags — Anlass, Lieferort und Zeit. Keine Personendaten. Was welche Rolle sieht, zeigt das Datenmodell.",
    },
    {
      q: "Sehen andere Partner unsere Preise?",
      a: "Nein. Konditionen bleiben je Partner getrennt — Ihre Preise sieht kein anderer.",
    },
    {
      q: "Gilt das für Transport, Floristik und Särge gleichermaßen?",
      a: "Ja. Der Ablauf ist für alle Zulieferer derselbe.",
    },
  ],

  cta: {
    heading: "Sehen Sie den Auftrag per Link.",
    sub: "Wir zeigen den Ablauf in 20 Minuten — ruhig, konkret, ohne Verkaufsdruck.",
    mailSubject: "MementoOS Demo für Zulieferer",
  },
};
