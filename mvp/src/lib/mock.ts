/* Mock-хранилище: In-Memory-Beispieldaten. Активно, когда не задан Supabase.
   Позволяет запускать и демонстрировать MVP без сети и без аккаунта.
   Мутации живут в памяти процесса (сбрасываются при рестарте) — для демо ок.
   Alle Daten fiktiv (Beispieldaten).

   Der Einladungs-Teil spiegelt den Vertrag der Datenbank (0004_hardening.sql)
   1:1: Ein Token wird gegen eine Sitzung eingetauscht, die Rolle steht in der
   Einladung — sie ist niemals Argument. Nach außen gibt es nur die
   Sitzungs-ID, nie die case_id. */

import type {
  AdminEreignis, AdminFall, AdminFallKontext, AdminHaus, AdminUebersicht,
  AdminZugang, Case, Deceased, InviteSummary, Phase, Role, RoleView, Task, Termin,
} from "./types";
import { caseForRole, darfBestaetigen, felderSchreibbar } from "./access";

/* фиксированные demo-токены (Demo-Ablauf im README) — müssen gültig bleiben.
   Sie gehören zu genau einem Fall: nur dort dürfen die beiden festen
   Beispiel-Ansichten angeboten werden. */
export const DEMO_CASE_ID = "0147";
export const DEMO_FAMILY_TOKEN = "demo-familie-0147";
export const DEMO_KREMATORIUM_TOKEN = "demo-krematorium-0147";

const TAG = 24 * 60 * 60 * 1000;
const INVITE_TTL_MS = 30 * TAG; // wie invites.expires_at in 0001_init.sql
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function seedCases(): Case[] {
  return [
  {
    id: "0147",
    ref: "M-2026-0147",
    bestattungsart: "Einäscherung",
    phase: "unterlagen",
    target_date: "2026-07-24",
    verstorbene: {
      vorname: "Erika", nachname: "Weber",
      geburtsdatum: "1942-03-11", sterbedatum: "2026-07-10",
      konfession: "evangelisch", anschrift: "Musterweg 4, Leipzig",
      groesse_cm: 168, gewicht_kg: 62, sargmass: "Standard",
      herzschrittmacher: true, infektionshinweis: "", freigabe_einaescherung: false,
    },
    beteiligte: [
      { id: "p1", role: "krematorium", org: "Krematorium Südstadt", joined: true, contact: "confirmed", sort: 0 },
      { id: "p2", role: "transport", org: "Fahrdienst Böhme", joined: true, contact: "contacted", sort: 1 },
      { id: "p3", role: "floristik", org: "Blumen Lange", joined: false, contact: "none", sort: 2 },
      { id: "p4", role: "familie", org: "Familie Weber", joined: true, contact: "confirmed", sort: 3 },
    ],
    aufgaben: [
      { id: "t1", title: "Vollmacht bei Familie anfragen", assignee: "bestatter", due: "heute", status: "offen" },
      { id: "t2", title: "Freigabe zur Einäscherung", assignee: "krematorium", due: "Mi", status: "offen" },
      { id: "t3", title: "Slot beim Krematorium bestätigen", assignee: "krematorium", due: "erledigt", status: "erledigt" },
      { id: "t4", title: "Fahrzeug & Zeit eintragen", assignee: "transport", due: "Do", status: "offen" },
    ],
    dokumente: [
      { id: "d1", doc_type: "Todesbescheinigung", verified: true, uploaded_by: "klinik", visible_to: ["krematorium"] },
      { id: "d2", doc_type: "Einäscherungsantrag", verified: false, uploaded_by: "bestatter", visible_to: ["krematorium"] },
      { id: "d3", doc_type: "Vollmacht der Familie", verified: false, uploaded_by: "familie", visible_to: [] },
    ],
    /* Zeitpunkte als Weltzeit (Z), so wie timestamptz sie liefert. Die
       Anzeige rechnet nach Europe/Berlin um — im Juli also +2 Stunden:
       06:00Z steht auf dem Bildschirm als 08:00 Uhr. */
    termine: [
      {
        id: "tm1", art: "abholung",
        von: "2026-07-11T06:00:00.000Z", bis: "2026-07-11T08:00:00.000Z",
        ort_name: "Klinikum St. Georg", ort_adresse: "Delitzscher Str. 141, 04129 Leipzig",
        zustaendig: "transport", status: "bestaetigt", hinweis: "Zufahrt über die Rückseite, Pforte anmelden.",
      },
      {
        id: "tm2", art: "ueberfuehrung",
        von: "2026-07-22T07:30:00.000Z", bis: null,
        ort_name: "Krematorium Südstadt", ort_adresse: "Friedhofsweg 3, 04277 Leipzig",
        zustaendig: "transport", status: "geplant", hinweis: null,
      },
      {
        id: "tm3", art: "einaescherung",
        von: "2026-07-24T09:00:00.000Z", bis: null,
        ort_name: "Krematorium Südstadt", ort_adresse: "Friedhofsweg 3, 04277 Leipzig",
        zustaendig: "krematorium", status: "geplant", hinweis: null,
      },
      {
        id: "tm4", art: "trauerfeier",
        von: "2026-07-24T12:00:00.000Z", bis: "2026-07-24T13:00:00.000Z",
        ort_name: "Friedhofskapelle Südfriedhof", ort_adresse: "Friedhofsweg 3, 04277 Leipzig",
        zustaendig: "bestatter", status: "geplant", hinweis: null,
      },
      {
        /* Ohne Zeit: der Termin steht fest, die Uhrzeit noch nicht. */
        id: "tm5", art: "abschiednahme",
        von: null, bis: null,
        ort_name: "Abschiedsraum im Haus", ort_adresse: null,
        zustaendig: "bestatter", status: "geplant", hinweis: null,
      },
    ],
    verlauf: [
      { actor: "Krematorium Südstadt", action: "Fall angelegt", at: "Do 09:12" },
      { actor: "System", action: "Hinweis: Herzschrittmacher markiert", at: "Do 11:40" },
      { actor: "Familie Weber", action: "Status-Link geöffnet", at: "Fr 08:15" },
    ],
  },
  {
    id: "0151",
    ref: "M-2026-0151",
    bestattungsart: "Erdbestattung",
    phase: "neu",
    target_date: "2026-07-30",
    verstorbene: {
      vorname: "Theodor", nachname: "Krüger",
      geburtsdatum: "1938-09-02", sterbedatum: "2026-07-16",
      konfession: "katholisch", anschrift: "Lindenstr. 12, Leipzig",
      groesse_cm: 180, gewicht_kg: 78, sargmass: "Übergröße",
      herzschrittmacher: false, infektionshinweis: "", freigabe_einaescherung: false,
    },
    beteiligte: [
      { id: "p5", role: "friedhof", org: "Südfriedhof Leipzig", joined: false, contact: "none", sort: 0 },
      { id: "p6", role: "familie", org: "Familie Krüger", joined: false, contact: "none", sort: 1 },
    ],
    aufgaben: [
      { id: "t5", title: "Erstgespräch mit Familie", assignee: "bestatter", due: "morgen", status: "offen" },
    ],
    dokumente: [],
    termine: [
      {
        id: "tm6", art: "abholung",
        von: "2026-07-16T15:00:00.000Z", bis: null,
        ort_name: "Seniorenheim Lindenhof", ort_adresse: "Lindenstr. 12, 04103 Leipzig",
        zustaendig: "transport", status: "geplant", hinweis: null,
      },
      {
        id: "tm7", art: "beisetzung",
        von: "2026-07-30T11:00:00.000Z", bis: null,
        ort_name: "Südfriedhof Leipzig, Abteilung 12", ort_adresse: "Friedhofsweg 3, 04277 Leipzig",
        zustaendig: "friedhof", status: "geplant", hinweis: null,
      },
    ],
    verlauf: [{ actor: "Sie", action: "Fall angelegt", at: "Mi 16:20" }],
  },
  ];
}

/* ── Einladungen & Sitzungen ─────────────────────────────────── */

type MockInvite = {
  id: string;
  token: string;
  caseId: string;
  role: Role;
  label: string | null;      // Merkhilfe für den Bestatter, z. B. «Familie Weber»
  createdAt: number;
  expiresAt: number;
  revokedAt: number | null;
  lastUsedAt: number | null;
  sessionCount: number;
};

type MockSession = { inviteId: string; expiresAt: number };

/* ── Plattform-Übersicht: Beispieldaten ──────────────────────────
   Nur Metadaten. Kein Feld einer verstorbenen Person, kein Aufgabentext,
   kein Dokumentname — die Übersicht kennt sie nicht und soll sie nicht
   kennen. Ein Vorgang erscheint als Nummer und Phase.

   Das erste Haus ist das Haus der Vorführung: seine Vorgänge und Zugänge
   werden beim Lesen aus dem laufenden Mock-Zustand abgeleitet. Zieht die
   Plattform-Betreuung dort einen Zugang zurück, sieht das Bestattungshaus
   dieselbe Änderung — und umgekehrt. Die übrigen Häuser sind erzeugt. */

export const DEMO_HAUS_ID = "0f1c9b74-3a52-4c88-9f21-6a5d0e73b410";
const DEMO_HAUS_NAME = "Bestattungshaus Lindenau";

type MockHaus = { id: string; orgName: string };

type MockAdminFall = {
  id: string; hausId: string; ref: string; phase: Phase;
  createdAt: number; targetDate: string | null; beteiligte: number;
};

type MockAdminSitzung = { id: string; seit: number; zuletztGesehen: number; laeuftAb: number };

/* Ohne Merkhilfe: admin_zugaenge gibt sie seit 0009 nicht mehr heraus, und
   was die Datenbank nicht herausgibt, soll auch der Mock nicht kennen —
   sonst weicht die Vorführung von der Wirklichkeit ab. */
type MockAdminZugang = {
  id: string; fallId: string; role: Role;
  createdAt: number; expiresAt: number; revokedAt: number | null;
  sitzungen: MockAdminSitzung[]; zuletztGesehen: number | null;
};

/* Ein Journal, zwei Ansichten — wie in der Datenbank: die Plattform-Übersicht
   liest daraus ihre Ereignisse, das Haus den Verlauf seines Vorgangs.

   detail steht zweimal da: als fertige Zeile für die Übersicht (dort wird
   jsonb ohnehin zu Text zusammengefasst) und roh für den Verlauf, der daraus
   einen deutschen Halbsatz baut. In der Datenbank ist beides dieselbe
   jsonb-Spalte; hier zwei Felder, damit der Mock keine jsonb-Umwandlung
   nachbauen muss, die es gar nicht gibt. */
type MockEreignis = {
  at: number; action: string; actorKind: string;
  actorRef: string | null; detail: string | null;
  detailRoh?: Record<string, unknown> | null;
  fallId: string | null; fallRef: string | null;
};

type MockPlattform = {
  haeuser: MockHaus[];
  faelle: MockAdminFall[];       // ohne die Vorgänge des Vorführ-Hauses
  zugaenge: MockAdminZugang[];   // ohne die Zugänge des Vorführ-Hauses
  ereignisse: MockEreignis[];    // absteigend nach Zeitpunkt
};

type MockState = {
  cases: Case[];
  invites: Map<string, MockInvite>;   // id → Einladung
  sessions: Map<string, MockSession>; // Sitzungs-ID → Sitzung
  plattform: MockPlattform;
  /* Wann ein im Betrieb angelegter Vorgang entstanden ist. Gehört in den
     Zustand und nicht in eine Modulkonstante: der Bundler legt dieses Modul
     mehrfach ab, eine Konstante liefe sonst je Kopie auseinander. */
  angelegt: Map<string, number>;
};

/* Am globalThis, nicht am Modul: der Bundler legt dieses Modul mehrfach ab
   (Seiten-Bündel, Server-Action-Bündel, Route-Handler). Als Modulzustand
   schriebe die Server Action in eine andere Kopie als die Seite liest — eine
   abgehakte Aufgabe käme nie an. */
const g = globalThis as unknown as { __mementoMock?: MockState };

function initState(): MockState {
  const state: MockState = {
    cases: seedCases(),
    invites: new Map(),
    sessions: new Map(),
    plattform: seedPlattform(),
    angelegt: new Map(),
  };
  /* Demo-Einladungen: die beiden Ansichten aus dem README (Beispieldaten) */
  addInvite(state, DEMO_CASE_ID, "familie", DEMO_FAMILY_TOKEN, "Familie Weber");
  addInvite(state, DEMO_CASE_ID, "krematorium", DEMO_KREMATORIUM_TOKEN, "Krematorium Südstadt");
  return state;
}

function addInvite(
  state: MockState,
  caseId: string,
  role: Role,
  token: string,
  label: string | null = null,
): MockInvite {
  const now = Date.now();
  const inv: MockInvite = {
    id: crypto.randomUUID(),
    token,
    caseId,
    role,
    label,
    createdAt: now,
    expiresAt: now + INVITE_TTL_MS,
    revokedAt: null,
    lastUsedAt: null,
    sessionCount: 0,
  };
  state.invites.set(inv.id, inv);
  return inv;
}

/* Zufall mit fester Saat: die Beispieldaten sollen nach einem Neustart gleich
   aussehen, sonst springen Zahlen und Bildschirmfotos. */
function saat(start: number): () => number {
  let s = start >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STD = 60 * 60 * 1000;
const PHASEN: Phase[] = ["neu", "unterlagen", "bestaetigt", "durchfuehrung", "abschluss"];
const ZUGANG_ROLLEN: Role[] = [
  "familie", "krematorium", "transport", "friedhof",
  "standesamt", "klinik", "floristik", "redner",
];
function seedPlattform(): MockPlattform {
  const r = saat(20260727);
  const jetzt = Date.now();
  const ganz = (n: number) => Math.floor(r() * n);
  const hex = (n: number) =>
    Array.from({ length: n }, () => "0123456789abcdef"[ganz(16)]).join("");
  const uuid = () => `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;
  const kurz = (id: string) => id.slice(0, 8);
  /* Minuten dazu, sonst stünde im Journal jede Zeile auf derselben Minute. */
  const minuten = () => ganz(60) * 60_000;

  const haeuser: MockHaus[] = [
    { id: DEMO_HAUS_ID, orgName: DEMO_HAUS_NAME },
    { id: uuid(), orgName: "Bestattungen am Park" },
    { id: uuid(), orgName: "Trauerhaus Elbtal" },
    { id: uuid(), orgName: "Bestattungshaus Nordkreis" },
  ];
  const anzahlFaelle = [0, 14, 9, 21]; // das Vorführ-Haus bringt seine Vorgänge selbst mit

  const faelle: MockAdminFall[] = [];
  const zugaenge: MockAdminZugang[] = [];
  const ereignisse: MockEreignis[] = [];

  haeuser.forEach((haus, hi) => {
    for (let i = 0; i < anzahlFaelle[hi]; i++) {
      const createdAt = jetzt - (1 + ganz(52)) * TAG - ganz(20) * STD - minuten();
      const alterTage = (jetzt - createdAt) / TAG;
      const stufe = Math.floor((alterTage / 48) * 5 + (r() - 0.5) * 1.6);
      const phase = PHASEN[Math.max(0, Math.min(4, stufe))];
      const fall: MockAdminFall = {
        id: uuid(),
        hausId: haus.id,
        ref: `M-2026-${100000 + ganz(900000)}`,
        phase,
        createdAt,
        targetDate:
          r() < 0.85
            ? new Date(createdAt + (7 + ganz(14)) * TAG).toISOString().slice(0, 10)
            : null,
        beteiligte: 2 + ganz(5),
      };
      faelle.push(fall);

      const nz = phase === "neu" ? ganz(2) : 1 + ganz(4);
      for (let z = 0; z < nz; z++) {
        const zc = Math.min(jetzt - STD, createdAt + ganz(5) * TAG + ganz(20) * STD + minuten());
        const rolle = ZUGANG_ROLLEN[ganz(ZUGANG_ROLLEN.length)];
        const revokedAt =
          r() < 0.14 ? Math.min(jetzt - STD, zc + (1 + ganz(9)) * TAG + minuten()) : null;
        const abgelaufen = zc + 30 * TAG <= jetzt;
        const lebt = revokedAt === null && !abgelaufen;

        /* Wenige Zugänge sind gerade in Benutzung — sonst wäre die Zahl der
           offenen Sitzungen unglaubwürdig hoch. */
        const geradeAktiv = lebt && r() < 0.13;
        const zuletztGesehen = geradeAktiv
          ? jetzt - ganz(6) * STD - ganz(50) * 60_000
          : r() < 0.7
            ? Math.min(revokedAt ?? jetzt - STD, zc + ganz(10) * TAG + ganz(20) * STD + minuten())
            : null;

        const zugang: MockAdminZugang = {
          id: uuid(),
          fallId: fall.id,
          role: rolle,
          createdAt: zc,
          expiresAt: zc + 30 * TAG,
          revokedAt,
          sitzungen: geradeAktiv
            ? Array.from({ length: r() < 0.25 ? 2 : 1 }, () => {
                const gesehen = zuletztGesehen ?? jetzt - STD;
                return {
                  id: uuid(),
                  seit: gesehen - ganz(3) * STD - minuten(),
                  zuletztGesehen: gesehen,
                  laeuftAb: gesehen + 12 * STD,
                };
              })
            : [],
          zuletztGesehen,
        };
        zugaenge.push(zugang);

        const akteur = `${rolle} · ${kurz(zugang.id)}`;
        ereignisse.push({
          at: zc, action: "invite.create", actorKind: "haus", actorRef: haus.orgName,
          detail: `Rolle ${rolle}`, fallId: fall.id, fallRef: fall.ref,
        });
        if (zuletztGesehen) {
          ereignisse.push({
            at: zuletztGesehen, action: "invite.redeem", actorKind: "zugang",
            actorRef: akteur, detail: null, fallId: fall.id, fallRef: fall.ref,
          });
          if (r() < 0.5) {
            ereignisse.push({
              at: Math.min(jetzt - 60_000, zuletztGesehen + ganz(90) * 60_000),
              action: "case.view", actorKind: "zugang", actorRef: akteur,
              detail: `Rolle ${rolle}`, fallId: fall.id, fallRef: fall.ref,
            });
          }
        }
        if (revokedAt !== null) {
          ereignisse.push({
            at: revokedAt, action: "invite.revoke", actorKind: "haus",
            actorRef: haus.orgName, detail: `Rolle ${rolle}`,
            fallId: fall.id, fallRef: fall.ref,
          });
        }
        if (r() < 0.06) {
          ereignisse.push({
            at: Math.min(jetzt - 60_000, zc + ganz(12) * TAG),
            action: "invite.redeem.failed", actorKind: "anonym", actorRef: null,
            detail: null, fallId: null, fallRef: null,
          });
        }
      }
    }
  });

  /* Ein paar Ereignisse für das Vorführ-Haus — seine Zugänge entstehen erst
     im laufenden Betrieb, der Verlauf soll trotzdem nicht leer sein. */
  const demoRef = `M-2026-${DEMO_CASE_ID}`;
  ereignisse.push(
    {
      at: jetzt - 3 * STD, action: "case.view", actorKind: "zugang",
      actorRef: "familie · demo", detail: "Rolle familie",
      fallId: DEMO_CASE_ID, fallRef: demoRef,
    },
    {
      at: jetzt - 26 * STD, action: "invite.create", actorKind: "haus",
      actorRef: DEMO_HAUS_NAME, detail: "Rolle krematorium",
      fallId: DEMO_CASE_ID, fallRef: demoRef,
    },
  );

  ereignisse.sort((a, b) => b.at - a.at);
  return { haeuser, faelle, zugaenge, ereignisse };
}

const state: MockState = (g.__mementoMock ??= initState());
const { cases, invites, sessions, plattform, angelegt } = state;

function inviteByToken(token: string): MockInvite | undefined {
  for (const inv of invites.values()) if (inv.token === token) return inv;
  return undefined;
}

function usable(inv: MockInvite | undefined, at: number): inv is MockInvite {
  return !!inv && inv.revokedAt === null && inv.expiresAt > at;
}

const iso = (ms: number) => new Date(ms).toISOString();

/* Kennung eines im Betrieb angelegten Vorgangs. Live vergibt die Datenbank
   eine UUID; hier genügt eine kurze, in der Adresszeile lesbare Kennung.
   Die Fall-Nummer folgt der Form aus app.set_case_ref() (0004): M-JJJJ-NNNNNN. */
function neueFallKennung(): string {
  return crypto.randomUUID().slice(0, 8);
}

function neueFallNummer(): string {
  const jahr = new Date().getFullYear();
  const genommen = new Set(cases.map((c) => c.ref));
  for (let i = 0; i < 50; i++) {
    const nummer = `M-${jahr}-${String(100000 + Math.floor(Math.random() * 900000))}`;
    if (!genommen.has(nummer)) return nummer;
  }
  return `M-${jahr}-${Date.now().toString().slice(-6)}`;
}

const fallVon = (caseId: string): Case | undefined => cases.find((c) => c.id === caseId);

/* Kurzform der Sitzungs-Kennung, wie app.akteur_kurz in 0013: acht Zeichen.
   Die volle Kennung ist ein Schlüssel auf Vorzeigen und verlässt den Server
   auch im Mock nicht.

   Gekürzt wird nur, was wie eine Kennung aussieht. In der Datenbank steht in
   actor_ref ausnahmslos eine UUID; die erzeugten Beispieldaten der Übersicht
   tragen dort dagegen Namen von Häusern, und «Bestattungshaus Lindenau» auf
   «Bestattu» zu stutzen wäre kein Schutz, sondern ein Anzeigefehler. */
const KENNUNG_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

const akteurKurz = (ref: string | null): string | null => {
  if (!ref || ref === "-") return null;
  return KENNUNG_RE.test(ref) ? ref.slice(0, 8) : ref;
};

/* Ein Eintrag ins Journal aus dem laufenden Betrieb. Ohne diese Aufrufe
   bliebe der Verlauf im Mock bei den erzeugten Beispieldaten stehen — und
   die Vorführung zeigte, dass eine Änderung der Familie spurlos bleibt. */
function protokolliere(
  caseId: string,
  actorKind: string,
  actorRef: string | null,
  action: string,
  detail: Record<string, unknown> | null = null,
): void {
  const zeile = detail
    ? Object.entries(detail)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
        .join(" · ")
    : null;
  ereignisEintragen({
    at: Date.now(),
    action,
    actorKind,
    actorRef,
    detail: zeile,
    detailRoh: detail,
    fallId: caseId,
    fallRef: fallVon(caseId)?.ref ?? null,
  });
}

export const mockStore = {
  listCases: (): Case[] => cases,
  getCase: (id: string): Case | undefined => cases.find((c) => c.id === id),
  toggleTask: (caseId: string, taskId: string): void => {
    const c = cases.find((x) => x.id === caseId);
    const t = c?.aufgaben.find((x) => x.id === taskId);
    if (t) t.status = t.status === "offen" ? "erledigt" : "offen";
  },

  /* ── Schreiben ────────────────────────────────────────────────
     Ohne diese Wege könnte das Haus im Mock nur zusehen — und die Vorführung
     zeigte ein Produkt, das man nicht benutzen kann.

     Es gibt hier keine Anmeldung und damit kein is_case_owner. Geprüft wird
     wie schon bei createInvite nur der Fallbezug: eine Server Action ist
     direkt aufrufbar, und ein unbekannter Fall soll wirkungslos bleiben. */

  createCase: (f: {
    bestattungsart: string;
    target_date: string | null;
    vorname: string;
    nachname: string;
  }): string => {
    const id = neueFallKennung();
    cases.unshift({
      id,
      ref: neueFallNummer(),
      bestattungsart: f.bestattungsart,
      phase: "neu",
      target_date: f.target_date,
      verstorbene: { vorname: f.vorname, nachname: f.nachname },
      beteiligte: [],
      aufgaben: [],
      dokumente: [],
      termine: [],
      verlauf: [],
    });
    angelegt.set(id, Date.now());
    return id;
  },

  updateCase: (
    caseId: string,
    patch: { bestattungsart?: string; target_date?: string | null; phase?: Phase },
  ): void => {
    const c = fallVon(caseId);
    if (!c) return;
    if (patch.bestattungsart !== undefined) c.bestattungsart = patch.bestattungsart;
    if (patch.target_date !== undefined) c.target_date = patch.target_date;
    if (patch.phase !== undefined) c.phase = patch.phase;
  },

  /* Nur die übergebene Feldgruppe wird geschrieben — die übrigen bleiben
     unberührt, auch wenn eine andere Gruppe gerade unvollständig ist. */
  updateDeceased: (caseId: string, patch: Partial<Deceased>): void => {
    const c = fallVon(caseId);
    if (!c) return;
    c.verstorbene = { ...c.verstorbene, ...patch };
  },

  addParticipant: (caseId: string, role: Role, org: string): void => {
    const c = fallVon(caseId);
    if (!c) return;
    const sort = c.beteiligte.reduce((max, p) => Math.max(max, p.sort ?? 0), -1) + 1;
    c.beteiligte.push({ id: crypto.randomUUID(), role, org, joined: false, contact: "none", sort });
  },

  removeParticipant: (caseId: string, participantId: string): void => {
    const c = fallVon(caseId);
    if (!c) return;
    c.beteiligte = c.beteiligte.filter((p) => p.id !== participantId);
  },

  setParticipantJoined: (caseId: string, participantId: string, joined: boolean): void => {
    const p = fallVon(caseId)?.beteiligte.find((x) => x.id === participantId);
    if (p) p.joined = joined;
  },

  addTask: (caseId: string, t: Pick<Task, "title" | "assignee" | "due">): void => {
    const c = fallVon(caseId);
    if (!c) return;
    c.aufgaben.push({
      id: crypto.randomUUID(),
      title: t.title,
      assignee: t.assignee ?? null,
      due: t.due ?? null,
      status: "offen",
    });
  },

  removeTask: (caseId: string, taskId: string): void => {
    const c = fallVon(caseId);
    if (!c) return;
    c.aufgaben = c.aufgaben.filter((t) => t.id !== taskId);
  },

  /* ── Termine ──────────────────────────────────────────────── */

  addTermin: (caseId: string, t: Omit<Termin, "id" | "status">): void => {
    const c = fallVon(caseId);
    if (!c) return;
    c.termine.push({
      id: crypto.randomUUID(),
      art: t.art,
      von: t.von ?? null,
      bis: t.bis ?? null,
      ort_name: t.ort_name ?? null,
      ort_adresse: t.ort_adresse ?? null,
      zustaendig: t.zustaendig ?? null,
      status: "geplant",
      hinweis: t.hinweis ?? null,
    });
  },

  updateTermin: (caseId: string, terminId: string, patch: Partial<Termin>): void => {
    const t = fallVon(caseId)?.termine.find((x) => x.id === terminId);
    if (!t) return;
    Object.assign(t, patch);
  },

  removeTermin: (caseId: string, terminId: string): void => {
    const c = fallVon(caseId);
    if (!c) return;
    c.termine = c.termine.filter((t) => t.id !== terminId);
  },

  /* Spiegel von public.termin_bestaetigen (0011) — in derselben Reihenfolge,
     damit der Mock nicht durchlässt, was die Datenbank abweist:
     Sitzung lebendig → Termin gehört zu DIESEM Fall → Rolle darf diese Art. */
  terminBestaetigen: (
    sessionId: string,
    terminId: string,
    von: string | null,
    bis: string | null,
    hinweis: string | null,
  ): boolean => {
    const now = Date.now();
    const s = sessions.get(sessionId);
    if (!s || s.expiresAt <= now) return false;
    const inv = invites.get(s.inviteId);
    if (!usable(inv, now)) return false;

    const c = cases.find((x) => x.id === inv.caseId);
    const t = c?.termine.find((x) => x.id === terminId);
    if (!t) return false;

    if (!darfBestaetigen(inv.role, t.art)) return false;

    t.von = von;
    t.bis = bis;
    t.hinweis = hinweis;
    t.status = "bestaetigt";
    protokolliere(c!.id, "invite", akteurKurz(sessionId), "termin.bestaetigt", {
      role: inv.role, art: t.art,
    });
    return true;
  },

  /* Token → Sitzung. Ungültig/abgelaufen/zurückgezogen ⇒ null (kein Fehler:
     „Link abgelaufen" muss von „technische Störung" unterscheidbar bleiben). */
  redeemInvite: (token: string): string | null => {
    const now = Date.now();
    const inv = inviteByToken(token);
    if (!usable(inv, now)) return null;
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { inviteId: inv.id, expiresAt: now + SESSION_TTL_MS });
    inv.lastUsedAt = now;
    inv.sessionCount += 1;
    protokolliere(inv.caseId, "invite", akteurKurz(sessionId), "invite.redeem", {
      role: inv.role,
    });
    return sessionId;
  },

  /* Sitzung → rollen­gefilterter Fall. Die Rolle stammt aus der Einladung. */
  getCaseBySession: (sessionId: string): RoleView | null => {
    const now = Date.now();
    const s = sessions.get(sessionId);
    if (!s || s.expiresAt <= now) return null;
    const inv = invites.get(s.inviteId);
    if (!usable(inv, now)) return null;
    const c = cases.find((x) => x.id === inv.caseId);
    return c ? caseForRole(c, inv.role) : null;
  },

  endSession: (sessionId: string): void => {
    sessions.delete(sessionId);
  },

  /* Spiegel von public.angaben_ergaenzen (0012), in derselben Reihenfolge:
     Sitzung lebendig → Rolle hat überhaupt ein Schreibrecht → nur erlaubte
     Schlüssel werden übernommen, nicht erlaubte übergangen. */
  angabenErgaenzen: (sessionId: string, felder: Partial<Deceased>): boolean => {
    const now = Date.now();
    const s = sessions.get(sessionId);
    if (!s || s.expiresAt <= now) return false;
    const inv = invites.get(s.inviteId);
    if (!usable(inv, now)) return false;

    const erlaubt = felderSchreibbar(inv.role);
    if (erlaubt.length === 0) return false;

    const c = cases.find((x) => x.id === inv.caseId);
    if (!c) return false;

    const patch: Partial<Deceased> = {};
    let etwas = false;
    for (const f of erlaubt) {
      if (f in felder) {
        (patch as Record<string, unknown>)[f] = felder[f] ?? null;
        etwas = true;
      }
    }
    if (!etwas) return false;

    c.verstorbene = { ...c.verstorbene, ...patch };
    protokolliere(c.id, "invite", akteurKurz(sessionId), "angaben.ergaenzt", {
      role: inv.role, felder: Object.keys(patch),
    });
    return true;
  },

  /* Verlauf eines Vorgangs — Spiegel von public.fall_verlauf (0013). */
  listVerlauf: (caseId: string, limit: number) =>
    plattform.ereignisse
      .filter((e) => e.fallId === caseId)
      .slice(0, limit)
      .map((e) => ({
        at: iso(e.at),
        action: e.action,
        actor_kind: e.actorKind,
        actor_ref: akteurKurz(e.actorRef),
        detail: e.detailRoh ?? null,
      })),

  /* Der Token wird genau einmal zurückgegeben — danach nur noch die Zusammenfassung.
     Form wie app.new_token() in 0004: zwei UUIDs hex-verkettet, 64 Zeichen —
     damit greift die Formatprüfung des Einlöse-Handlers auch im Mock.

     null = unbekannter Fall. Im Mock gibt es keine Anmeldung und damit auch
     kein is_case_owner; die Server Action ist aber direkt aufrufbar, deshalb
     wird wenigstens der Fallbezug geprüft. Die Rolle «bestatter» lehnt der
     Mock ebenso ab wie invites_role_not_bestatter in der Datenbank. */
  createInvite: (
    caseId: string,
    role: Role,
    label: string | null = null,
  ): { inviteId: string; token: string } | null => {
    if (role === "bestatter") return null;
    if (!cases.some((c) => c.id === caseId)) return null;
    const token =
      crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const inv = addInvite(state, caseId, role, token, label);
    /* Die Merkhilfe (label) geht bewusst NICHT mit: sie ist Freitext und
       trägt in der Praxis Personennamen. Ins Journal gehört die Rolle. */
    protokolliere(caseId, "user", "haus", "invite.create", { role });
    return { inviteId: inv.id, token: inv.token };
  },

  /* Spiegelt list_invites aus 0004: kein Token, kein Hash — und
     active_sessions zählt die offenen Sitzungen, nicht alle jemals
     erzeugten. */
  listInvites: (caseId: string): InviteSummary[] => {
    const now = Date.now();
    const offen = new Map<string, number>();
    for (const s of sessions.values()) {
      if (s.expiresAt > now) offen.set(s.inviteId, (offen.get(s.inviteId) ?? 0) + 1);
    }
    return [...invites.values()]
      .filter((i) => i.caseId === caseId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((i) => ({
        id: i.id,
        role: i.role,
        label: i.label,
        created_at: iso(i.createdAt),
        expires_at: iso(i.expiresAt),
        revoked: i.revokedAt !== null,
        active_sessions: offen.get(i.id) ?? 0,
      }));
  },

  /* Zurückziehen beendet auch alle offenen Sitzungen dieser Einladung. */
  revokeInvite: (inviteId: string): void => {
    const inv = invites.get(inviteId);
    if (!inv || inv.revokedAt !== null) return;
    inv.revokedAt = Date.now();
    for (const [sid, s] of sessions) if (s.inviteId === inviteId) sessions.delete(sid);
  },
};

/* ── Plattform-Übersicht: Lesen und Regeln ───────────────────────
   Spiegel der Funktionen aus 0008_plattform_uebersicht.sql. Alles hier ist
   Metadatum: Nummer, Phase, Rolle, Zeitpunkt, Zähler. */

/* Fester Bezugspunkt: die Vorgänge der Vorführung sollen nicht mit jedem
   Aufruf altern. */
const START = Date.now();
const DEMO_ANGELEGT: Record<string, number> = {
  "0147": START - 6 * TAG - 3 * STD,
  "0151": START - 2 * TAG - 9 * STD,
};

function demoFaelle(): MockAdminFall[] {
  return cases.map((c) => ({
    id: c.id,
    hausId: DEMO_HAUS_ID,
    ref: c.ref,
    phase: c.phase,
    createdAt: angelegt.get(c.id) ?? DEMO_ANGELEGT[c.id] ?? START - 4 * TAG,
    targetDate: c.target_date ?? null,
    beteiligte: c.beteiligte.length,
  }));
}

/* Die Zugänge des Vorführ-Hauses stammen aus dem laufenden Mock-Zustand —
   was das Haus ausgibt oder zurückzieht, steht sofort auch hier. */
function demoZugaenge(): MockAdminZugang[] {
  const jetzt = Date.now();
  const offen = new Map<string, MockAdminSitzung[]>();
  for (const [sid, s] of sessions) {
    if (s.expiresAt <= jetzt) continue;
    const liste = offen.get(s.inviteId) ?? [];
    const seit = s.expiresAt - SESSION_TTL_MS;
    liste.push({
      id: sid,
      seit,
      zuletztGesehen: invites.get(s.inviteId)?.lastUsedAt ?? seit,
      laeuftAb: s.expiresAt,
    });
    offen.set(s.inviteId, liste);
  }
  /* i.label bleibt hier bewusst liegen: die Merkhilfe gehört dem Haus und
     verlässt seinen Arbeitsbereich nicht. */
  return [...invites.values()].map((i) => ({
    id: i.id,
    fallId: i.caseId,
    role: i.role,
    createdAt: i.createdAt,
    expiresAt: i.expiresAt,
    revokedAt: i.revokedAt,
    sitzungen: offen.get(i.id) ?? [],
    zuletztGesehen: i.lastUsedAt,
  }));
}

const alleFaelle = (): MockAdminFall[] => [...demoFaelle(), ...plattform.faelle];
const alleZugaenge = (): MockAdminZugang[] => [...demoZugaenge(), ...plattform.zugaenge];

const zugangAktiv = (z: MockAdminZugang, jetzt: number) =>
  z.revokedAt === null && z.expiresAt > jetzt;

const sitzungenOffen = (z: MockAdminZugang, jetzt: number) =>
  zugangAktiv(z, jetzt) ? z.sitzungen.length : 0;

/* Letzte Aktivität je Vorgang: das jüngste Ereignis oder, falls keines
   vorliegt, der jüngste Zeitpunkt seiner Zugänge. */
function aktivitaetJeFall(zug: MockAdminZugang[]): Map<string, number> {
  const m = new Map<string, number>();
  const setze = (id: string | null, at: number | null) => {
    if (id && at && (m.get(id) ?? 0) < at) m.set(id, at);
  };
  for (const e of plattform.ereignisse) setze(e.fallId, e.at);
  for (const z of zug) {
    setze(z.fallId, z.createdAt);
    setze(z.fallId, z.zuletztGesehen);
    setze(z.fallId, z.revokedAt);
  }
  return m;
}

const isoOderNull = (ms: number | null | undefined) => (ms ? iso(ms) : null);

function ereignisEintragen(e: MockEreignis): void {
  plattform.ereignisse.unshift(e);
}

export const mockAdmin = {
  uebersicht: (): AdminUebersicht => {
    const jetzt = Date.now();
    const faelle = alleFaelle();
    const zug = alleZugaenge();
    const phasen: Record<Phase, number> = {
      neu: 0, unterlagen: 0, bestaetigt: 0, durchfuehrung: 0, abschluss: 0,
    };
    for (const f of faelle) phasen[f.phase] += 1;
    return {
      haeuser: plattform.haeuser.length,
      faelle_gesamt: faelle.length,
      faelle_offen: faelle.filter((f) => f.phase !== "abschluss").length,
      faelle_abgeschlossen: phasen.abschluss,
      phasen,
      zugaenge_aktiv: zug.filter((z) => zugangAktiv(z, jetzt)).length,
      zugaenge_zurueckgezogen: zug.filter((z) => z.revokedAt !== null).length,
      sitzungen_aktiv: zug.reduce((n, z) => n + sitzungenOffen(z, jetzt), 0),
      ereignisse_24h: plattform.ereignisse.filter((e) => e.at > jetzt - TAG).length,
    };
  },

  haeuser: (): AdminHaus[] => {
    const jetzt = Date.now();
    const faelle = alleFaelle();
    const zug = alleZugaenge();
    const aktivitaet = aktivitaetJeFall(zug);
    return plattform.haeuser.map((h) => {
      const eigene = faelle.filter((f) => f.hausId === h.id);
      const ids = new Set(eigene.map((f) => f.id));
      const zh = zug.filter((z) => ids.has(z.fallId));
      const letzte = eigene.reduce(
        (max, f) => Math.max(max, aktivitaet.get(f.id) ?? 0),
        0,
      );
      return {
        haus_id: h.id,
        org_name: h.orgName,
        faelle_gesamt: eigene.length,
        faelle_offen: eigene.filter((f) => f.phase !== "abschluss").length,
        faelle_abgeschlossen: eigene.filter((f) => f.phase === "abschluss").length,
        zugaenge_aktiv: zh.filter((z) => zugangAktiv(z, jetzt)).length,
        sitzungen_aktiv: zh.reduce((n, z) => n + sitzungenOffen(z, jetzt), 0),
        letzte_aktivitaet: letzte ? iso(letzte) : null,
      };
    });
  },

  faelle: (hausId: string): AdminFall[] => {
    const jetzt = Date.now();
    const zug = alleZugaenge();
    const aktivitaet = aktivitaetJeFall(zug);
    return alleFaelle()
      .filter((f) => f.hausId === hausId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((f) => {
        const zf = zug.filter((z) => z.fallId === f.id);
        return {
          fall_id: f.id,
          ref: f.ref,
          phase: f.phase,
          created_at: iso(f.createdAt),
          target_date: f.targetDate,
          beteiligte: f.beteiligte,
          zugaenge_aktiv: zf.filter((z) => zugangAktiv(z, jetzt)).length,
          sitzungen_aktiv: zf.reduce((n, z) => n + sitzungenOffen(z, jetzt), 0),
          letzte_aktivitaet: isoOderNull(aktivitaet.get(f.id) ?? null),
        };
      });
  },

  /* Spiegel von admin_fall (0009): ein Vorgang samt Haus in einem Zug.
     Bewusst über dieselbe Aufbereitung wie die Liste, damit beide Wege nie
     verschiedene Zahlen zeigen. */
  fall: (fallId: string): AdminFallKontext | null => {
    const roh = alleFaelle().find((f) => f.id === fallId);
    if (!roh) return null;
    const haus = plattform.haeuser.find((h) => h.id === roh.hausId);
    const fall = mockAdmin.faelle(roh.hausId).find((f) => f.fall_id === fallId);
    if (!fall || !haus) return null;
    return { fall, haus: { haus_id: haus.id, org_name: haus.orgName } };
  },

  zugaenge: (fallId: string): AdminZugang[] => {
    const jetzt = Date.now();
    return alleZugaenge()
      .filter((z) => z.fallId === fallId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((z) => ({
        zugang_id: z.id,
        role: z.role,
        created_at: iso(z.createdAt),
        expires_at: iso(z.expiresAt),
        revoked: z.revokedAt !== null,
        sitzungen_aktiv: sitzungenOffen(z, jetzt),
        zuletzt_gesehen: isoOderNull(z.zuletztGesehen),
        /* Wie admin_zugaenge in 0009: nur die offenen Sitzungen, mit Kennung. */
        sitzungen: zugangAktiv(z, jetzt)
          ? z.sitzungen.map((s) => ({
              sitzung_id: s.id,
              created_at: isoOderNull(s.seit),
              zuletzt_gesehen: isoOderNull(s.zuletztGesehen),
              expires_at: isoOderNull(s.laeuftAb),
            }))
          : [],
      }));
  },

  ereignisse: (fallId: string | null, limit: number): AdminEreignis[] =>
    plattform.ereignisse
      .filter((e) => (fallId ? e.fallId === fallId : true))
      .slice(0, limit)
      .map((e) => ({
        at: iso(e.at),
        action: e.action,
        actor_kind: e.actorKind,
        actor_ref: e.actorRef,
        detail: e.detail,
        fall_ref: e.fallRef,
      })),

  /* Zurückziehen wirkt sofort und beendet die offenen Sitzungen — wie
     revoke_invite in der Datenbank. Beim Vorführ-Haus greift dieselbe
     Funktion, die auch das Bestattungshaus benutzt. */
  zugangZurueckziehen: (zugangId: string): void => {
    const fall = alleFaelle();
    const eigen = plattform.zugaenge.find((z) => z.id === zugangId);
    const demo = invites.get(zugangId);
    if (!eigen && !demo) return;

    const fallId = eigen ? eigen.fallId : demo!.caseId;
    const rolle = eigen ? eigen.role : demo!.role;
    if (eigen) {
      if (eigen.revokedAt !== null) return;
      eigen.revokedAt = Date.now();
      eigen.sitzungen = [];
    } else {
      if (demo!.revokedAt !== null) return;
      mockStore.revokeInvite(zugangId);
    }
    ereignisEintragen({
      at: Date.now(), action: "invite.revoke", actorKind: "plattform",
      actorRef: "Plattform-Betreuung", detail: `Rolle ${rolle}`,
      fallId, fallRef: fall.find((f) => f.id === fallId)?.ref ?? null,
    });
  },

  sitzungBeenden: (sitzungId: string): void => {
    const fall = alleFaelle();
    const eigen = plattform.zugaenge.find((z) =>
      z.sitzungen.some((s) => s.id === sitzungId),
    );
    const demo = sessions.get(sitzungId);
    if (!eigen && !demo) return;

    const fallId = eigen ? eigen.fallId : invites.get(demo!.inviteId)?.caseId ?? null;
    if (eigen) {
      eigen.sitzungen = eigen.sitzungen.filter((s) => s.id !== sitzungId);
    } else {
      sessions.delete(sitzungId);
    }
    ereignisEintragen({
      at: Date.now(), action: "session.revoke", actorKind: "plattform",
      actorRef: "Plattform-Betreuung", detail: null,
      fallId, fallRef: fallId ? fall.find((f) => f.id === fallId)?.ref ?? null : null,
    });
  },
};
