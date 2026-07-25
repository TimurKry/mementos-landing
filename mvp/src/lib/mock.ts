/* Mock-хранилище: In-Memory-Beispieldaten. Активно, когда не задан Supabase.
   Позволяет запускать и демонстрировать MVP без сети и без аккаунта.
   Мутации живут в памяти процесса (сбрасываются при рестарте) — для демо ок.
   Alle Daten fiktiv (Beispieldaten).

   Der Einladungs-Teil spiegelt den Vertrag der Datenbank (0004_hardening.sql)
   1:1: Ein Token wird gegen eine Sitzung eingetauscht, die Rolle steht in der
   Einladung — sie ist niemals Argument. Nach außen gibt es nur die
   Sitzungs-ID, nie die case_id. */

import type { Case, InviteSummary, Role, RoleView } from "./types";
import { caseForRole } from "./access";

/* фиксированные demo-токены (Demo-Ablauf im README) — müssen gültig bleiben */
export const DEMO_FAMILY_TOKEN = "demo-familie-0147";
export const DEMO_KREMATORIUM_TOKEN = "demo-krematorium-0147";

const TAG = 24 * 60 * 60 * 1000;
const INVITE_TTL_MS = 30 * TAG; // wie invites.expires_at in 0001_init.sql
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const cases: Case[] = [
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

const invites = new Map<string, MockInvite>();      // id → Einladung
const sessions = new Map<string, MockSession>();    // Sitzungs-ID → Sitzung

function addInvite(caseId: string, role: Role, token: string, label: string | null = null): MockInvite {
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
  invites.set(inv.id, inv);
  return inv;
}

/* Demo-Einladungen: die beiden Ansichten aus dem README */
addInvite("0147", "familie", DEMO_FAMILY_TOKEN);
addInvite("0147", "krematorium", DEMO_KREMATORIUM_TOKEN);

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

  /* Der Token wird genau einmal zurückgegeben — danach nur noch die Zusammenfassung. */
  createInvite: (caseId: string, role: Role): { inviteId: string; token: string } => {
    const inv = addInvite(caseId, role, crypto.randomUUID());
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
