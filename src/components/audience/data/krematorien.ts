import type { AudienceData } from "../types";

/* Аудитория «Krematorien» (Steep). Сценарий loss — приёмка без потерь
   на рампе. Прайсинг partner-note: keine Lizenzkosten, Beitritt zum Fall.
   Все имена, номера дел и статусы — Beispieldaten. */

export const krematorien: AudienceData = {
  slug: "fuer-krematorien",
  navLabel: "Für Krematorien",
  meta: {
    title: "MementoOS für Krematorien — Vollständige Unterlagen vor der Anlieferung",
    description:
      "Freigabe, Todesbescheinigung und Herzschrittmacher-Check liegen digital vor — nicht erst an der Rampe. Slots ohne Telefonketten, Annahme an einem Ort.",
  },

  hero: {
    headlineLead: "Vollständige Unterlagen, ",
    headlineEm: "bevor der Sarg ankommt",
    headlineTail: ".",
    sub: "Freigabe, Todesbescheinigung und der Herzschrittmacher-Check liegen digital vor — nicht erst an der Rampe. Slots fragen Bestatter an, Sie bestätigen.",
    primary: { label: "Selbst ausprobieren", href: "/workspace/" },
    secondary: { label: "Demo anfragen", href: "#kontakt" },
    artifacts: [
      {
        kind: "checklist",
        title: "Unterlagen prüfen",
        width: 290,
        items: [
          { label: "Freigabe vorhanden", done: true },
          { label: "Todesbescheinigung geprüft", done: true },
          { label: "Herzschrittmacher-Check", done: false },
          { label: "Identität bestätigt", done: false },
        ],
        foot: "Vor der Anlieferung · 2 offen",
      },
      {
        kind: "list",
        title: "Slot-Anfragen",
        badge: "Beispieldaten",
        width: 300,
        rows: [
          { primary: "Fall Weber", secondary: "M-2026-0147", status: "Bestätigt", done: true },
          { primary: "Fall Sommer", secondary: "M-2026-0149", status: "Slot angefragt", done: false },
          { primary: "Fall Krüger", secondary: "M-2026-0151", status: "Unterlagen offen", done: false },
        ],
      },
      {
        kind: "ring",
        title: "Annahme bereit",
        width: 240,
        value: "2/4",
        label: "Unterlagen geprüft",
        ratio: 0.5,
      },
      { kind: "composer", width: 320, placeholder: "Interne Notiz (Ofen, Charge)…" },
    ],
  },

  warum: {
    heading: "Geprüft, bevor",
    headingEm: "angeliefert wird",
    sub: "Sicherheitskritisches gehört nicht an die Rampe: Was fehlt, zeigt sich vorher — als Pflichtfeld, nicht als Randnotiz.",
    cards: [
      {
        tag: "Vor der Anlieferung",
        title: "Prüfen statt an der Rampe klären",
        text: "Freigabe, Todesbescheinigung und Herzschrittmacher-Check liegen digital vor — nicht erst, wenn der Sarg da ist.",
        href: "/datenmodell/#krematorium",
        link: "Wer was sieht →",
      },
      {
        tag: "Slots",
        title: "Slots ohne Telefonketten",
        text: "Bestatter fragen freie Zeitfenster an, Sie bestätigen oder verschieben — ohne Rückruf.",
        href: "/demo/",
        link: "Ablauf ansehen →",
      },
      {
        tag: "Annahme",
        title: "Digitale Annahme",
        text: "Anlieferung, Identität und Einäscherungsstatus an einem Ort dokumentiert.",
        href: "/demo/",
        link: "So funktioniert es →",
      },
      {
        tag: "Sicherheit",
        title: "Herzschrittmacher als Pflichtfeld",
        text: "Der Herzschrittmacher-Check ist nie eine Randnotiz — ohne ihn lässt sich die Anfrage nicht abschließen.",
        href: "/datenmodell/#krematorium",
        link: "Datenmodell →",
      },
    ],
  },

  szenario: {
    view: "loss",
    heading: "Wir wissen, wo heute",
    headingEm: "Information an der Rampe fehlt",
    sub: "Den Weg der Anlieferung haben wir mit der Branche kartiert. Links der heutige Ablauf, rechts derselbe Fall in MementoOS.",
    badge: "Telefon · Fax · Rückruf",
    heute: [
      { from: "Bestatter", via: "Fax", to: "Krematorium", loss: "Freigabe fehlt — Rückruf nötig" },
      { from: "Krematorium", via: "Rückfrage", to: "Bestatter", loss: "Herzschrittmacher-Check unklar" },
      { from: "Bestatter", via: "Anruf", to: "Krematorium", loss: "Slot telefonisch abgestimmt" },
      { from: "Transport", via: "Anlieferung", to: "Krematorium", loss: "Sarg da — Unterlagen nicht geprüft" },
    ],
    mit: [
      { title: "Slot bestätigt", text: "Der Bestatter fragt ein freies Fenster an — Sie bestätigen ohne Rückruf." },
      { title: "Unterlagen geprüft", text: "Freigabe und Herzschrittmacher-Check liegen vor der Anlieferung digital vor." },
      { title: "Sarg angeliefert & identifiziert", text: "Anlieferung und Identität an einem Ort dokumentiert." },
      { title: "Einäscherung dokumentiert", text: "Status und interne Felder wie Ofen und Charge bleiben in Ihrem Haus." },
      { title: "Urnenübergabe", text: "Der Abschluss ist vollständig protokolliert." },
    ],
    foot: "Beispieldaten — nichts kommt ungeprüft an der Rampe an.",
  },

  ablauf: {
    heading: "Annahme als",
    headingEm: "klarer Weg",
    sub: "Jeder Schritt ist offen oder erledigt. Solange Pflichtfelder wie die Freigabe fehlen, lässt sich die Anfrage nicht abschließen.",
    steps: [
      { title: "Slot bestätigen", text: "Freies Zeitfenster bestätigen oder verschieben — ohne Telefonkette." },
      { title: "Unterlagen prüfen", text: "Freigabe, Todesbescheinigung und Herzschrittmacher-Check als Pflichtfelder." },
      { title: "Sarg annehmen & identifizieren", text: "Anlieferung und Identität digital festgehalten." },
      { title: "Einäscherung dokumentieren", text: "Interne Felder bleiben in Ihrem Haus — kein Partner, keine Familie." },
      { title: "Urne übergeben", text: "Abschluss vollständig und nachvollziehbar." },
    ],
  },

  pricing: {
    variant: "partner-note",
    roleLabel: "Für Krematorien",
    heading: "Keine Lizenzkosten für",
    headingEm: "Ihr Krematorium",
    sub: "Ihr Haus tritt dem Fall des Bestatters bei — kein eigenes Abo, keine Grundgebühr.",
    note: "Für Ihr Krematorium entstehen keine Lizenzkosten. Die Anbindung an Ihre Annahme besprechen wir in der Pilotphase gemeinsam.",
    foot: "Vorschau — Konditionen werden mit den Pilotpartnern festgelegt.",
  },

  faq: [
    {
      q: "Was, wenn Unterlagen fehlen?",
      a: "Der Fall zeigt Fehlendes vor der Anlieferung. Solange Pflichtfelder wie die Freigabe offen sind, lässt sich die Anfrage nicht abschließen.",
    },
    {
      q: "Müssen wir unsere Software wechseln?",
      a: "Nein. MementoOS ergänzt die Annahme; die Anbindung besprechen wir in der Pilotphase gemeinsam.",
    },
    {
      q: "Wer sieht interne Felder wie Ofen und Charge?",
      a: "Nur Ihr Haus — kein Partner, keine Familie. Was welche Rolle sieht, zeigt das Datenmodell.",
    },
    {
      q: "Wie werden Slots gebucht?",
      a: "Bestatter sehen freie Fenster und fragen an; Sie bestätigen ohne Rückruf.",
    },
  ],

  cta: {
    heading: "Sehen Sie die Annahme in MementoOS.",
    sub: "Wir zeigen den Ablauf in 20 Minuten — ruhig, konkret, ohne Verkaufsdruck.",
    mailSubject: "MementoOS Demo für Krematorien",
  },
};
