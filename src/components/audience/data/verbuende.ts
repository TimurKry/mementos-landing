import type { AudienceData } from "../types";

/* Аудитория «Verbünde» (Steep). Сценарий board — Rollout Standort für
   Standort (geplant / in Einführung / aktiv), zeigt den Häuser-Überblick.
   Прайсинг variant:"full" (defaultPlans) mit Akzent auf Verbund über
   roleLabel/heading. Alle Standorte — Beispieldaten. */

export const verbuende: AudienceData = {
  slug: "fuer-verbuende",
  navLabel: "Für Verbünde",
  meta: {
    title: "MementoOS für Verbünde — Ein Standard über alle Häuser hinweg",
    description:
      "Einheitliche Abläufe in jedem Haus, ein Überblick über alle Standorte, Onboarding im eigenen Tempo. Verantwortung bleibt lokal.",
  },

  hero: {
    headlineLead: "Ein Standard über alle ",
    headlineEm: "Häuser hinweg",
    headlineTail: ".",
    sub: "Jedes Haus arbeitet nach demselben klaren Muster. Die Zentrale sieht den Überblick über alle Standorte — jeder Fall bleibt im Haus.",
    primary: { label: "Selbst ausprobieren", href: "/workspace/" },
    secondary: { label: "Demo anfragen", href: "#kontakt" },
    artifacts: [
      {
        kind: "list",
        title: "Häuser im Überblick",
        badge: "Beispieldaten",
        width: 300,
        rows: [
          { primary: "Haus Nord", secondary: "Leipzig", status: "0 offen", done: true },
          { primary: "Haus Süd", secondary: "Halle", status: "3 offen", done: false },
          { primary: "Haus Mitte", secondary: "Erfurt", status: "1 offen", done: false },
        ],
      },
      {
        kind: "checklist",
        title: "Onboarding Haus West",
        width: 290,
        items: [
          { label: "Zugang eingerichtet", done: true },
          { label: "Abläufe übernommen", done: true },
          { label: "Team geschult", done: false },
          { label: "Aktiv im Verbund", done: false },
        ],
        foot: "Standort für Standort",
      },
      {
        kind: "ring",
        title: "Standorte aktiv",
        width: 240,
        value: "3/5",
        label: "im Verbund",
        ratio: 0.6,
      },
      { kind: "composer", width: 320, placeholder: "Standort hinzufügen…" },
    ],
  },

  warum: {
    heading: "Ein Standard,",
    headingEm: "über alle Häuser",
    sub: "Einheitliche Abläufe und ein gemeinsamer Überblick — ohne dass ein Haus seine Eigenständigkeit verliert.",
    cards: [
      {
        tag: "Abläufe",
        title: "Einheitliche Abläufe",
        text: "Jedes Haus arbeitet nach demselben klaren Muster — vergleichbar und nachvollziehbar.",
        href: "/demo/",
        link: "Ablauf ansehen →",
      },
      {
        tag: "Überblick",
        title: "Überblick über die Häuser",
        text: "Der Stand aller Standorte an einem Ort — die Detailtiefe legen wir gemeinsam fest.",
        href: "/datenmodell/",
        link: "Datenmodell →",
      },
      {
        tag: "Onboarding",
        title: "Onboarding je Standort",
        text: "Standort für Standort, im Tempo, das Sie bestimmen — kein großer Umstieg auf einmal.",
        href: "/demo/",
        link: "So funktioniert es →",
      },
      {
        tag: "Verantwortung",
        title: "Verantwortung bleibt lokal",
        text: "Die Zentrale sieht den Überblick; jeder Fall bleibt im Haus, das ihn führt.",
        href: "/datenmodell/",
        link: "Wer was sieht →",
      },
    ],
  },

  szenario: {
    view: "board",
    heading: "Standort für",
    headingEm: "Standort",
    sub: "Der Verbund wächst im eigenen Tempo: jedes Haus durchläuft dasselbe Onboarding — die Zentrale sieht den Stand.",
    columns: [
      {
        title: "Standort geplant",
        state: "open",
        tasks: [{ label: "Haus Ost", meta: "Termin offen · Beispieldaten" }],
      },
      {
        title: "In Einführung",
        state: "doing",
        tasks: [{ label: "Haus West", meta: "Abläufe werden übernommen" }],
      },
      {
        title: "Im Verbund aktiv",
        state: "done",
        tasks: [
          { label: "Haus Nord", meta: "0 offene Fälle" },
          { label: "Haus Mitte", meta: "1 offener Fall" },
          { label: "Haus Süd", meta: "3 offene Fälle" },
        ],
      },
    ],
    foot: "Beispieldaten — fiktive Standorte.",
  },

  ablauf: {
    heading: "Rollout im",
    headingEm: "eigenen Tempo",
    sub: "Kein großer Umstieg auf einmal — jeder Standort kommt hinzu, wenn er bereit ist.",
    steps: [
      { title: "Standort planen", text: "Der nächste Standort wird vorbereitet — ohne die anderen zu unterbrechen." },
      { title: "Zugang einrichten", text: "Das Haus erhält seinen Zugang und die gemeinsamen Abläufe." },
      { title: "Abläufe übernehmen", text: "Eigene Besonderheiten bleiben erhalten, das Muster ist einheitlich." },
      { title: "Aktiv & im Überblick", text: "Das Haus arbeitet im Verbund; die Zentrale sieht den Stand." },
    ],
  },

  pricing: {
    variant: "full",
    roleLabel: "Für Verbünde",
    heading: "Ein Modell für",
    headingEm: "den Verbund",
    sub: "Das Kernmodell rechnet pro abgeschlossenem Fall ab; für Gruppen rechnet das Abo Verbund je Gruppe ab. Konditionen legen wir in der Pilotphase gemeinsam fest.",
    foot: "Vorschau — endgültige Konditionen werden mit den Pilotpartnern festgelegt.",
  },

  faq: [
    {
      q: "Sieht die Zentrale jeden Fall im Detail?",
      a: "Die Zentrale sieht den Überblick; die Detailtiefe legen wir in der Pilotphase gemeinsam fest. Im Datenmodell entspricht das der Rolle „Verbund-Zentrale“.",
    },
    {
      q: "Können Häuser eigene Besonderheiten behalten?",
      a: "Ja. Das Muster ist einheitlich, eigene Besonderheiten je Standort bleiben erhalten.",
    },
    {
      q: "Wie läuft die Einführung mehrerer Standorte?",
      a: "Standort für Standort, im Tempo, das Sie bestimmen — ohne großen Umstieg auf einmal.",
    },
    {
      q: "Was kostet der Verbund-Zugang?",
      a: "Das Abo Verbund rechnet je Gruppe ab; die Konditionen legen wir in der Pilotphase gemeinsam fest.",
    },
  ],

  cta: {
    heading: "Sehen Sie den Verbund im Überblick.",
    sub: "Wir zeigen MementoOS in 20 Minuten — ruhig, konkret, ohne Verkaufsdruck.",
    mailSubject: "MementoOS Demo für Verbünde",
  },
};
