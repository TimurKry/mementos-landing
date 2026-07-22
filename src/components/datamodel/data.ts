/* Полная модель данных MementoOS — источник истины для страницы
   /datenmodell. Все имена, поля и права — Beispieldaten/Entwurf.
   Группы полей по уровню чувствительности (tier): kern / org / op / sens. */

export type Tier = "kern" | "org" | "op" | "sens";

export const tierMeta: Record<Tier, { label: string }> = {
  kern: { label: "Kern / Identität" },
  org: { label: "Organisatorisch" },
  op: { label: "Operativ" },
  sens: { label: "Sensibel" },
};

export type RoleId =
  | "bestatter" | "familie" | "krematorium" | "transport" | "friedhof"
  | "floristik" | "klinik" | "standesamt" | "steinmetz" | "redner" | "verbund";

export const roles: Record<RoleId, { label: string; tag: string; note: string }> = {
  bestatter:  { label: "Bestatter",         tag: "Orchestrator", note: "Steuert den ganzen Fall, koordiniert alle Partner." },
  familie:    { label: "Familie",           tag: "Angehörige",   note: "Sieht den Stand, gibt Angaben und Wünsche frei." },
  krematorium:{ label: "Krematorium",       tag: "Durchführung", note: "Prüft Unterlagen, bestätigt Slot, führt Einäscherung durch." },
  transport:  { label: "Transport",         tag: "Logistik",     note: "Übernimmt die Überführung, bestätigt den eigenen Auftrag." },
  friedhof:   { label: "Friedhof",          tag: "Beisetzung",   note: "Verwaltet Grab und Beisetzungstermin." },
  floristik:  { label: "Floristik & Co.",   tag: "Zulieferer",   note: "Empfängt Auftrag, plant Lieferung." },
  klinik:     { label: "Klinik / Arzt",     tag: "Quelle",       note: "Liefert Todesbescheinigung und medizinische Angaben." },
  standesamt: { label: "Standesamt",        tag: "Behörde",      note: "Stellt die Sterbeurkunde aus." },
  steinmetz:  { label: "Steinmetz",         tag: "Grabmal",      note: "Fertigt und setzt das Grabmal." },
  redner:     { label: "Trauerredner",      tag: "Zeremonie",    note: "Gestaltet die Trauerfeier." },
  verbund:    { label: "Verbund-Zentrale",  tag: "Aufsicht",     note: "Sicht über mehrere Häuser (optional)." },
};

/* поле таблицы */
export type Field = { name: string; type: string };
export type Group = { tier: Tier; label: string; fields: Field[] };

/* доступ на чтение: какие группы видит роль (on=false → перечёркнуто) */
export type ReadAccess = { role: RoleId; groups: { tier: Tier; label: string; on: boolean }[]; note?: string };
export type WriteAccess = { role: RoleId; label: string; note: string };

export type Entity = {
  id: string;
  name: string;
  table: string;
  section: string;
  kind: "diagram" | "card";
  desc: string;
  groups: Group[];
  writers: WriteAccess[];
  readers: ReadAccess[];
  foot?: string;
};

/* ── документы: ACL-строки (отдельный вид) ─────────────────── */
export type DocRow = { doc: string; from: RoleId[]; see: RoleId[] };
export const documents: DocRow[] = [
  { doc: "Todesbescheinigung",          from: ["klinik"],                 see: ["bestatter", "krematorium"] },
  { doc: "Personalausweis / Pass",      from: ["familie", "bestatter"],   see: ["bestatter", "standesamt"] },
  { doc: "Geburtsurkunde",              from: ["familie"],                see: ["bestatter", "standesamt"] },
  { doc: "Heiratsurkunde / Stammbuch",  from: ["familie"],                see: ["bestatter", "standesamt"] },
  { doc: "Sterbeurkunde",               from: ["standesamt"],             see: ["bestatter", "familie", "friedhof", "krematorium"] },
  { doc: "Einäscherungsantrag",         from: ["bestatter"],              see: ["krematorium"] },
  { doc: "2. Leichenschau / Freigabe",  from: ["klinik"],                 see: ["krematorium", "bestatter"] },
  { doc: "Vollmacht der Familie",       from: ["familie"],                see: ["bestatter"] },
  { doc: "Bestattungsvertrag",          from: ["bestatter"],              see: ["familie"] },
  { doc: "Grabdokument / Nutzungsrecht",from: ["friedhof"],               see: ["bestatter", "familie"] },
  { doc: "Transportschein / Leichenpass",from: ["transport", "bestatter"],see: ["bestatter", "transport"] },
  { doc: "Rechnung",                    from: ["bestatter"],              see: ["familie"] },
];

/* helper для read-доступа */
const R = (role: RoleId, on: [Tier, string, boolean][], note?: string): ReadAccess => ({
  role, groups: on.map(([tier, label, o]) => ({ tier, label, on: o })), note,
});

/* ── СУЩНОСТИ ───────────────────────────────────────────────── */

export const entities: Entity[] = [
  /* 1 · Verstorbene Person — флагман (arrow-diagram) */
  {
    id: "person", name: "Verstorbene Person", table: "tbl_person",
    section: "Stammdaten", kind: "diagram",
    desc: "Die zentrale Stammtabelle. Felder sind nach Sensibilität gruppiert — jede Rolle liest nur die Gruppen, die ihre Aufgabe verlangt.",
    groups: [
      { tier: "kern", label: "Identität", fields: [
        { name: "vorname", type: "text" }, { name: "nachname", type: "text" },
      ]},
      { tier: "org", label: "Persönliche Daten", fields: [
        { name: "geburtsdatum · -ort", type: "date · text" },
        { name: "sterbedatum · -zeit · -ort", type: "datetime" },
        { name: "konfession · familienstand", type: "enum" },
        { name: "anschrift · staatsangeh.", type: "text" },
        { name: "beruf", type: "text" },
      ]},
      { tier: "op", label: "Körperliche Angaben", fields: [
        { name: "größe · gewicht", type: "num" },
        { name: "sarg- / urnenmaß", type: "num" },
        { name: "schmuck / besonderheiten", type: "text" },
      ]},
      { tier: "sens", label: "Medizinisch · sensibel", fields: [
        { name: "todesart · todesursache", type: "enum · text" },
        { name: "herzschrittmacher · implantate", type: "bool" },
        { name: "infektionshinweise", type: "text" },
        { name: "freigabe_einäscherung", type: "bool" },
      ]},
    ],
    writers: [
      { role: "bestatter", label: "legt an", note: "Legt Fall an · pflegt Identität & Persönliches" },
      { role: "klinik", label: "Arzt-Befund", note: "Trägt medizinische Angaben & Maße ein" },
      { role: "familie", label: "ergänzt", note: "Ergänzt Konfession & Angaben" },
    ],
    readers: [
      R("familie",     [["kern","Identität",true],["org","Persönlich",true],["op","Körperlich",true],["sens","Medizinisch",false]]),
      R("krematorium", [["kern","Identität",true],["op","Körperlich",true],["sens","Medizinisch",true],["org","Persönlich",false]]),
      R("transport",   [["kern","Name",true],["op","Körperlich",true],["org","Persönlich",false],["sens","Medizinisch",false]], "+ Handhabungs-Hinweis"),
      R("friedhof",    [["kern","Identität",true],["org","Persönlich",true],["sens","Medizinisch",false]]),
      R("standesamt",  [["kern","Identität",true],["org","Persönlich",true]]),
    ],
    foot: "Jede Änderung versioniert & protokolliert · Zugriff wird pro Feldgruppe aufgelöst.",
  },

  /* 2 · Auftraggeber */
  {
    id: "auftraggeber", name: "Auftraggeber / Angehörige", table: "tbl_auftraggeber",
    section: "Stammdaten", kind: "card",
    desc: "Wer den Auftrag erteilt — Kontakt, Verhältnis und Zahlungsseite. Partner sehen keine direkten Kontaktdaten, außer der Bestatter gibt eine Kontaktstelle frei.",
    groups: [
      { tier: "kern", label: "Person", fields: [
        { name: "name", type: "text" }, { name: "verhältnis_zum_verstorbenen", type: "enum" },
      ]},
      { tier: "org", label: "Kontakt", fields: [
        { name: "telefon · email", type: "text" }, { name: "anschrift", type: "text" },
      ]},
      { tier: "sens", label: "Zahlung & Vollmacht", fields: [
        { name: "zahlungsdaten", type: "text" }, { name: "vollmacht_ref", type: "ref" },
      ]},
    ],
    writers: [
      { role: "familie", label: "self", note: "Pflegt eigene Kontaktdaten" },
      { role: "bestatter", label: "erfasst", note: "Erfasst & prüft Auftraggeber" },
    ],
    readers: [
      R("familie",    [["kern","Person",true],["org","Kontakt",true],["sens","Zahlung",true]]),
      R("transport",  [["kern","Person",true],["org","Kontakt",false],["sens","Zahlung",false]], "nur bei Direkt-Übergabe"),
      R("standesamt", [["kern","Person",true],["org","Kontakt",false]]),
    ],
    foot: "Kein Partner sieht die Kontaktdaten der Familie ohne ausdrückliche Freigabe.",
  },

  /* 3 · Bestattung & Wünsche */
  {
    id: "bestattung", name: "Bestattung & Wünsche", table: "tbl_bestattung",
    section: "Ablauf", kind: "card",
    desc: "Art der Bestattung und alle Wünsche der Familie. Jeder Partner sieht nur den Teil, den er umsetzt.",
    groups: [
      { tier: "kern", label: "Art", fields: [ { name: "bestattungsart", type: "enum" } ]},
      { tier: "org", label: "Ausstattung", fields: [
        { name: "sarg- / urnenwahl", type: "enum" }, { name: "grabart · grabwunsch", type: "enum" },
      ]},
      { tier: "op", label: "Zeremonie", fields: [
        { name: "trauerfeier · ort · zeit", type: "datetime" },
        { name: "musik · redner", type: "text" },
        { name: "blumenschmuck", type: "text" },
        { name: "traueranzeige", type: "text" },
      ]},
      { tier: "sens", label: "Rahmen", fields: [ { name: "budget_rahmen", type: "num" } ]},
    ],
    writers: [
      { role: "familie", label: "Wünsche", note: "Trifft Wünsche & Entscheidungen" },
      { role: "bestatter", label: "berät", note: "Berät und pflegt die Auswahl" },
    ],
    readers: [
      R("familie",     [["kern","Art",true],["org","Ausstattung",true],["op","Zeremonie",true],["sens","Rahmen",true]]),
      R("krematorium", [["kern","Art",true],["org","Sarg/Urne",true],["op","Zeremonie",false],["sens","Rahmen",false]]),
      R("friedhof",    [["kern","Art",true],["org","Grab",true],["op","Beisetzung",true],["sens","Rahmen",false]]),
      R("floristik",   [["op","Blumenschmuck",true],["kern","Art",false],["sens","Rahmen",false]]),
      R("redner",      [["op","Zeremonie",true],["kern","Art",true],["sens","Rahmen",false]]),
    ],
  },

  /* 4 · Termine */
  {
    id: "termine", name: "Termine", table: "tbl_termine",
    section: "Ablauf", kind: "card",
    desc: "Alle Termine des Falls. Der Bestatter koordiniert, jeder Partner bestätigt seinen eigenen Slot — jeder sieht die für ihn relevanten Zeiten.",
    groups: [
      { tier: "kern", label: "Phase", fields: [ { name: "fall_phase", type: "enum" } ]},
      { tier: "org", label: "Termine", fields: [
        { name: "überführung", type: "datetime" },
        { name: "einäscherung", type: "datetime" },
        { name: "trauerfeier", type: "datetime" },
        { name: "beisetzung", type: "datetime" },
        { name: "urnenübergabe", type: "datetime" },
      ]},
    ],
    writers: [
      { role: "bestatter", label: "koordiniert", note: "Legt Termine an & stimmt ab" },
      { role: "krematorium", label: "Slot", note: "Bestätigt Einäscherungs-Slot" },
      { role: "friedhof", label: "Slot", note: "Bestätigt Beisetzungstermin" },
    ],
    readers: [
      R("familie",     [["kern","Phase",true],["org","alle Termine",true]]),
      R("krematorium", [["org","Überführung · Einäscherung",true],["kern","Phase",false]]),
      R("transport",   [["org","Überführung",true],["kern","Phase",false]]),
      R("friedhof",    [["org","Beisetzung",true],["kern","Phase",false]]),
      R("floristik",   [["org","Trauerfeier · Beisetzung",true]]),
      R("redner",      [["org","Trauerfeier",true]]),
    ],
  },

  /* 5 · Transport-Auftrag — флагман (arrow-diagram) */
  {
    id: "transport", name: "Transport-Auftrag", table: "tbl_transport",
    section: "Partner", kind: "diagram",
    desc: "Beispiel für feldgenauen Zugriff: Die Familie sieht Fahrzeugtyp und Ankunftszeit — interne Felder wie Fahrer, Kennzeichen und Konditionen bleiben verborgen.",
    groups: [
      { tier: "kern", label: "Auftrag", fields: [
        { name: "abholort · zielort", type: "text" }, { name: "termin", type: "datetime" },
      ]},
      { tier: "op", label: "Durchführung", fields: [
        { name: "fahrzeugtyp", type: "enum" }, { name: "ankunftszeit", type: "time" }, { name: "status", type: "enum" },
      ]},
      { tier: "sens", label: "Intern · verborgen", fields: [
        { name: "fahrer_name", type: "text" }, { name: "kennzeichen", type: "text" }, { name: "konditionen", type: "num" },
      ]},
    ],
    writers: [
      { role: "bestatter", label: "beauftragt", note: "Beauftragt Transport · setzt Ort & Termin" },
      { role: "transport", label: "füllt aus", note: "Trägt Fahrzeug, Zeit, Fahrer ein · setzt Status" },
    ],
    readers: [
      R("familie",     [["op","Fahrzeugtyp + Ankunft",true],["kern","Auftrag-Orte",false],["sens","Intern",false]]),
      R("krematorium", [["op","Ankunftszeit",true],["sens","Intern",false]]),
      R("friedhof",    [["op","Ankunftszeit",true],["sens","Intern",false]]),
    ],
    foot: "Interne Felder nie an Familie oder andere Partner · nur Transport & Bestatter.",
  },

  /* 6 · Krematoriums-Auftrag */
  {
    id: "krematorium", name: "Krematoriums-Auftrag", table: "tbl_krematorium",
    section: "Partner", kind: "card",
    desc: "Slot, Annahme und Durchführung der Einäscherung. Sicherheitskritische Prüfungen (Herzschrittmacher) liegen hier.",
    groups: [
      { tier: "kern", label: "Auftrag", fields: [
        { name: "fall_ref", type: "ref" }, { name: "bestattungsart", type: "enum" },
      ]},
      { tier: "org", label: "Planung", fields: [
        { name: "slot_termin", type: "datetime" }, { name: "anlieferzeit", type: "time" },
      ]},
      { tier: "op", label: "Durchführung", fields: [
        { name: "annahme_status", type: "enum" }, { name: "einäscherung_status", type: "enum" }, { name: "urnenübergabe", type: "datetime" },
      ]},
      { tier: "sens", label: "Intern & Prüfung", fields: [
        { name: "herzschrittmacher_check", type: "bool" }, { name: "ofen · charge", type: "text" },
      ]},
    ],
    writers: [
      { role: "krematorium", label: "führt aus", note: "Setzt Status & Prüfungen" },
      { role: "bestatter", label: "beauftragt", note: "Bucht Slot" },
    ],
    readers: [
      R("familie",     [["org","Slot-Termin",true],["op","Status (einfach)",true],["sens","Intern",false]]),
      R("transport",   [["org","Anlieferzeit",true],["sens","Intern",false]]),
      R("friedhof",    [["op","Urnenübergabe",true],["sens","Intern",false]]),
    ],
    foot: "Ofen/Charge sind rein intern — nur das Krematorium selbst.",
  },

  /* 7 · Friedhof / Grab */
  {
    id: "grab", name: "Friedhof · Grab", table: "tbl_grab",
    section: "Partner", kind: "card",
    desc: "Grabstelle, Nutzungsrecht und Beisetzung. Der Steinmetz erhält nur Lage und Maße für das Grabmal.",
    groups: [
      { tier: "kern", label: "Grab", fields: [
        { name: "grabnummer", type: "id" }, { name: "grabart", type: "enum" },
      ]},
      { tier: "org", label: "Verwaltung", fields: [
        { name: "lage · feld", type: "text" }, { name: "nutzungsrecht_bis", type: "date" }, { name: "beisetzungstermin", type: "datetime" },
      ]},
      { tier: "op", label: "Durchführung", fields: [
        { name: "grabvorbereitung_status", type: "enum" }, { name: "beisetzung_status", type: "enum" },
      ]},
      { tier: "sens", label: "Gebühren", fields: [ { name: "grabgebühren", type: "num" } ]},
    ],
    writers: [
      { role: "friedhof", label: "verwaltet", note: "Weist Grab zu, setzt Status" },
      { role: "bestatter", label: "beauftragt", note: "Beantragt Grabstelle" },
      { role: "steinmetz", label: "Grabmal", note: "Meldet Grabmal-Status" },
    ],
    readers: [
      R("familie",   [["kern","Grab",true],["org","Lage · Termin · Nutzungsrecht",true],["sens","Gebühren",false]]),
      R("steinmetz", [["kern","Grabnummer",true],["org","Lage · Maße",true],["sens","Gebühren",false]]),
      R("floristik", [["org","Beisetzung Ort/Zeit",true]]),
    ],
    foot: "Grabgebühren nur Bestatter & Friedhof.",
  },

  /* 8 · Floristik-Auftrag */
  {
    id: "floristik", name: "Floristik-Auftrag", table: "tbl_floristik",
    section: "Partner", kind: "card",
    desc: "Blumen und Kränze. Der Zulieferer sieht nur Anlass, Lieferort und -zeit — keine Personendaten.",
    groups: [
      { tier: "kern", label: "Anlass", fields: [ { name: "anlass_ref", type: "ref" } ]},
      { tier: "org", label: "Lieferung", fields: [
        { name: "lieferort", type: "text" }, { name: "lieferzeit", type: "datetime" },
      ]},
      { tier: "op", label: "Auftrag", fields: [
        { name: "gebinde · kranz-typ", type: "enum" }, { name: "text_schleife", type: "text" }, { name: "status", type: "enum" },
      ]},
      { tier: "sens", label: "Rahmen", fields: [ { name: "konditionen", type: "num" } ]},
    ],
    writers: [
      { role: "bestatter", label: "beauftragt", note: "Beauftragt & übermittelt Wünsche" },
      { role: "floristik", label: "führt aus", note: "Setzt Status & Lieferung" },
    ],
    readers: [
      R("familie",   [["op","Gebinde · Text",true],["org","Lieferzeit",true],["sens","Konditionen",false]]),
      R("floristik", [["kern","Anlass",true],["org","Lieferung",true],["op","Auftrag",true],["sens","Konditionen",true]]),
    ],
    foot: "Keine Personendaten an die Floristik.",
  },

  /* 9 · Kommerzielles */
  {
    id: "kommerz", name: "Kommerzielles", table: "tbl_kommerz",
    section: "Kaufmännisch", kind: "card",
    desc: "Angebot, Rechnung und Konditionen. Kein Partner sieht die Konditionen eines anderen; die Familie sieht nur ihre eigene Seite, nie die Einkaufsseite.",
    groups: [
      { tier: "kern", label: "Bezug", fields: [ { name: "fall_ref", type: "ref" } ]},
      { tier: "org", label: "Familienseite", fields: [
        { name: "kostenvoranschlag", type: "num" }, { name: "einzelpositionen", type: "list" },
      ]},
      { tier: "op", label: "Abrechnung", fields: [
        { name: "rechnung", type: "doc" }, { name: "zahlungsstatus", type: "enum" },
      ]},
      { tier: "sens", label: "B2B · getrennt", fields: [
        { name: "partner_konditionen", type: "num" }, { name: "marge", type: "num" },
      ]},
    ],
    writers: [
      { role: "bestatter", label: "Angebot", note: "Erstellt Angebot & Rechnung" },
      { role: "krematorium", label: "Kondition", note: "Pflegt eigene Kondition" },
      { role: "transport", label: "Kondition", note: "Pflegt eigene Kondition" },
    ],
    readers: [
      R("familie",     [["org","Kostenvoranschlag",true],["op","Rechnung · Zahlung",true],["sens","B2B",false]]),
      R("krematorium", [["sens","nur eigene Kondition",true],["org","Familienseite",false]]),
      R("transport",   [["sens","nur eigene Kondition",true],["org","Familienseite",false]]),
    ],
    foot: "Marge sieht nur der Bestatter · Partner-Konditionen sind je Partner isoliert.",
  },

  /* 10 · Prozess & Protokoll */
  {
    id: "prozess", name: "Prozess · Aufgaben · Protokoll", table: "tbl_prozess",
    section: "Kaufmännisch", kind: "card",
    desc: "Steuerung des Falls: Phase, Aufgaben, Freigaben und ein lückenloses Protokoll jeder Änderung.",
    groups: [
      { tier: "kern", label: "Phase", fields: [ { name: "fall_phase", type: "enum" } ]},
      { tier: "org", label: "Aufgaben", fields: [
        { name: "aufgabe · owner · due · status", type: "obj" }, { name: "freigaben", type: "list" },
      ]},
      { tier: "op", label: "Signale", fields: [ { name: "benachrichtigungen", type: "list" } ]},
      { tier: "sens", label: "Protokoll", fields: [ { name: "audit_log · wer·wann·was", type: "log" } ]},
    ],
    writers: [
      { role: "bestatter", label: "steuert", note: "Legt Aufgaben & Freigaben an" },
      { role: "krematorium", label: "eigene", note: "Erzeugt eigene Ereignisse" },
      { role: "transport", label: "eigene", note: "Erzeugt eigene Ereignisse" },
    ],
    readers: [
      R("familie",     [["kern","Phase",true],["op","Verlauf (einfach)",true],["sens","Protokoll",false]]),
      R("krematorium", [["org","eigene Aufgaben",true],["sens","volles Protokoll",false]]),
      R("friedhof",    [["org","eigene Aufgaben",true],["sens","volles Protokoll",false]]),
    ],
    foot: "Das vollständige Audit-Protokoll sieht nur der Bestatter — jede Rolle ihre eigenen Einträge.",
  },
];

export const sections = ["Stammdaten", "Ablauf", "Partner", "Kaufmännisch"] as const;
