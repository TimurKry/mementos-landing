import type { AudienceData } from "../types";

/* Аудитория «Familien» (Steep) — МЯГКИЙ ТОН. Сценарий access:
   что видит Familie / что скрыто. Единственная bg-peach карта (quote).
   pricing: null — блок цен не показываем. Alle Angaben — Beispieldaten. */

export const familien: AudienceData = {
  slug: "fuer-familien",
  navLabel: "Für Familien",
  tone: "soft",
  meta: {
    title: "MementoOS für Familien — Alles Wichtige an einem Ort, in Ruhe",
    description:
      "Über einen Link Ihres Bestatters sehen Sie den Stand des Falls und ergänzen Angaben in Ihrem Tempo — ohne Konto, ohne Anmeldung.",
  },

  hero: {
    headlineLead: "Alles Wichtige an einem Ort — ",
    headlineEm: "in Ruhe, ohne Konto",
    headlineTail: ".",
    sub: "Über einen Link Ihres Bestatters sehen Sie, welche Schritte erledigt sind und was noch offen ist. Sie ergänzen nur, was Sie möchten — in Ihrem Tempo.",
    primary: { label: "Zur Startseite", href: "/" },
    secondary: { label: "Wer was sieht", href: "/datenmodell/" },
    artifacts: [
      {
        kind: "list",
        title: "Stand des Falls",
        badge: "Beispieldaten",
        width: 300,
        rows: [
          { primary: "Termin", secondary: "bestätigt", status: "Erledigt", done: true },
          { primary: "Ihre Wünsche", secondary: "erfasst", status: "Erledigt", done: true },
          { primary: "Angaben ergänzen", secondary: "wenn Sie möchten", status: "Offen", done: false },
        ],
      },
      {
        kind: "checklist",
        title: "Ihre Schritte",
        width: 290,
        items: [
          { label: "Link erhalten", done: true },
          { label: "Stand gesehen", done: true },
          { label: "Angaben ergänzen", done: false },
          { label: "Informiert bleiben", done: false },
        ],
        foot: "kein Passwort, keine App",
      },
      {
        kind: "ring",
        title: "Stand",
        width: 240,
        value: "2/4",
        label: "Schritte erledigt",
        ratio: 0.5,
      },
    ],
  },

  warum: {
    heading: "Alles Wichtige,",
    headingEm: "in Ruhe",
    sub: "Sie müssen nichts sofort und nichts allein. Ein Link genügt — verständlich, geschützt, in Ihrem Tempo.",
    cards: [
      {
        tag: "Zugang",
        title: "Zugang per Link",
        text: "Über einen Link Ihres Bestatters — ohne Anmeldung, ohne Passwort, ohne App.",
        href: "/datenmodell/",
        link: "Wer was sieht →",
      },
      {
        tag: "Überblick",
        title: "Sie sehen den Stand",
        text: "Welche Schritte erledigt sind und was noch offen ist — ruhig und verständlich.",
        href: "/datenmodell/",
        link: "Was Sie sehen →",
      },
      {
        tag: "Tempo",
        title: "Angaben in Ihrem Tempo",
        text: "Sie ergänzen nur, was Sie möchten — wann Sie möchten. Nichts drängt.",
        href: "/",
        link: "Zur Startseite →",
      },
      {
        tag: "Schutz",
        title: "Ihre Daten bleiben geschützt",
        text: "Sie sehen Ihre Seite; die internen Abläufe der Partner bleiben verborgen.",
        href: "/datenmodell/",
        link: "Datenmodell →",
      },
    ],
  },

  szenario: {
    view: "access",
    heading: "Das sehen Sie —",
    headingEm: "und das bleibt verborgen",
    sub: "Ihre Seite ist ruhig und verständlich. Alles, was Sie nichts angeht, bleibt außen vor.",
    visible: [
      { label: "Stand des Falls", note: "welche Schritte erledigt sind" },
      { label: "Termine", note: "auf einen Blick" },
      { label: "Ihre Wünsche", note: "erfasst und nachvollziehbar" },
      { label: "Kostenvoranschlag & Rechnung", note: "Ihre Seite, nicht die Einkaufsseite der Partner" },
      { label: "Ansprechpartner", note: "wer sich um Ihren Fall kümmert" },
    ],
    hidden: [
      { label: "Interne Konditionen der Partner" },
      { label: "Fahrer & Kennzeichen" },
      { label: "Ofen & Charge" },
      { label: "Margen" },
    ],
    link: { label: "Wer was sieht", href: "/datenmodell/" },
  },

  quote: {
    text: "Sie müssen nichts sofort. Der Fall wartet auf Sie —",
    textEm: "und niemand verliert den Überblick.",
    source: "Gedanke hinter MementoOS",
  },

  ablauf: {
    heading: "In vier ruhigen",
    headingEm: "Schritten",
    sub: "Kein Konto, kein Druck — ein Link führt Sie durch alles, was wichtig ist.",
    steps: [
      { title: "Link erhalten", text: "Ihr Bestatter schickt Ihnen einen Link — mehr braucht es nicht." },
      { title: "Stand sehen", text: "Welche Schritte erledigt sind und was noch offen ist." },
      { title: "Angaben ergänzen", text: "Nur, was Sie möchten — in Ihrem Tempo." },
      { title: "Informiert bleiben", text: "Sie sehen jederzeit, wie es um den Fall steht." },
    ],
  },

  pricing: null,

  faq: [
    {
      q: "Muss ich ein Konto erstellen?",
      a: "Nein. Ein Link genügt — kein Passwort, keine App.",
    },
    {
      q: "Wer sieht meine Angaben?",
      a: "Ihr Bestatter und, soweit nötig, die beteiligten Stellen. Partner sehen keine Kontaktdaten ohne Freigabe.",
    },
    {
      q: "Was, wenn ich etwas nicht ausfüllen möchte?",
      a: "Das ist in Ordnung. Sie ergänzen nur, was Sie möchten.",
    },
    {
      q: "Sehe ich die Kosten?",
      a: "Sie sehen Ihren Kostenvoranschlag und Ihre Rechnung — nicht die Einkaufsseite der Partner.",
    },
  ],

  cta: {
    heading: "Nehmen Sie sich die Zeit, die Sie brauchen.",
    sub: "Ihr Bestatter richtet den Zugang ein. Bei Fragen ist jemand für Sie da — in Ruhe, ohne Eile.",
    mailSubject: "Frage zu MementoOS",
  },
};
