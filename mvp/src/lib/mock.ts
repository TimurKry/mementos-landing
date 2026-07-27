/* Mock-хранилище: In-Memory-Beispieldaten. Активно, когда не задан Supabase.
   Позволяет запускать и демонстрировать MVP без сети и без аккаунта.
   Мутации живут в памяти процесса (сбрасываются при рестарте) — для демо ок.
   Alle Daten fiktiv (Beispieldaten).

   Der Einladungs-Teil spiegelt den Vertrag der Datenbank (0004_hardening.sql)
   1:1: Ein Token wird gegen eine Sitzung eingetauscht, die Rolle steht in der
   Einladung — sie ist niemals Argument. Nach außen gibt es nur die
   Sitzungs-ID, nie die case_id. */

import type {
  AdminEreignis, AdminFall, AdminHaus, AdminUebersicht, AdminZugang,
  Case, InviteSummary, Phase, Role, RoleView,
} from "./types";
import { caseForRole } from "./access";

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
      { role: "krematorium", org: "Krematorium Südstadt", joined: true, contact: "confirmed", sort: 0 },
      { role: "transport", org: "Fahrdienst Böhme", joined: true, contact: "contacted", sort: 1 },
      { role: "floristik", org: "Blumen Lange", joined: false, contact: "none", sort: 2 },
      { role: "familie", org: "Familie Weber", joined: true, contact: "confirmed", sort: 3 },
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
      { role: "friedhof", org: "Südfriedhof Leipzig", joined: false, contact: "none", sort: 0 },
      { role: "familie", org: "Familie Krüger", joined: false, contact: "none", sort: 1 },
    ],
    aufgaben: [
      { id: "t5", title: "Erstgespräch mit Familie", assignee: "bestatter", due: "morgen", status: "offen" },
    ],
    dokumente: [],
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

type MockAdminSitzung = { id: string; zuletztGesehen: number };

type MockAdminZugang = {
  id: string; fallId: string; role: Role; label: string | null;
  createdAt: number; expiresAt: number; revokedAt: number | null;
  sitzungen: MockAdminSitzung[]; zuletztGesehen: number | null;
};

type MockEreignis = {
  at: number; action: string; actorKind: string;
  actorRef: string | null; detail: string | null;
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
/* Merkhilfen der Häuser — bewusst sachlich. Die Übersicht erfindet keine
   Personennamen; sie hätte dort auch nichts zu suchen. */
const MERKHILFEN: (string | null)[] = [
  null, null, "Angehörige", "Abholung", "Trauerfeier", null, "Rücksprache", null,
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
          label: MERKHILFEN[ganz(MERKHILFEN.length)],
          createdAt: zc,
          expiresAt: zc + 30 * TAG,
          revokedAt,
          sitzungen: geradeAktiv
            ? Array.from({ length: r() < 0.25 ? 2 : 1 }, () => ({
                id: uuid(),
                zuletztGesehen: zuletztGesehen ?? jetzt - STD,
              }))
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
const { cases, invites, sessions, plattform } = state;

function inviteByToken(token: string): MockInvite | undefined {
  for (const inv of invites.values()) if (inv.token === token) return inv;
  return undefined;
}

function usable(inv: MockInvite | undefined, at: number): inv is MockInvite {
  return !!inv && inv.revokedAt === null && inv.expiresAt > at;
}

const iso = (ms: number) => new Date(ms).toISOString();

export const mockStore = {
  listCases: (): Case[] => cases,
  getCase: (id: string): Case | undefined => cases.find((c) => c.id === id),
  toggleTask: (caseId: string, taskId: string): void => {
    const c = cases.find((x) => x.id === caseId);
    const t = c?.aufgaben.find((x) => x.id === taskId);
    if (t) t.status = t.status === "offen" ? "erledigt" : "offen";
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
    createdAt: DEMO_ANGELEGT[c.id] ?? START - 4 * TAG,
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
    liste.push({
      id: sid,
      zuletztGesehen: invites.get(s.inviteId)?.lastUsedAt ?? s.expiresAt - SESSION_TTL_MS,
    });
    offen.set(s.inviteId, liste);
  }
  return [...invites.values()].map((i) => ({
    id: i.id,
    fallId: i.caseId,
    role: i.role,
    label: i.label,
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

  zugaenge: (fallId: string): AdminZugang[] => {
    const jetzt = Date.now();
    return alleZugaenge()
      .filter((z) => z.fallId === fallId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((z) => ({
        zugang_id: z.id,
        role: z.role,
        label: z.label,
        created_at: iso(z.createdAt),
        expires_at: iso(z.expiresAt),
        revoked: z.revokedAt !== null,
        sitzungen_aktiv: sitzungenOffen(z, jetzt),
        zuletzt_gesehen: isoOderNull(z.zuletztGesehen),
        sitzungen: zugangAktiv(z, jetzt)
          ? z.sitzungen.map((s) => ({
              sitzung_id: s.id,
              zuletzt_gesehen: isoOderNull(s.zuletztGesehen),
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
