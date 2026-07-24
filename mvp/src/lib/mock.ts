/* Mock-хранилище: In-Memory-Beispieldaten. Активно, когда не задан Supabase.
   Позволяет запускать и демонстрировать MVP без сети и без аккаунта.
   Мутации живут в памяти процесса (сбрасываются при рестарте) — для демо ок.
   Alle Daten fiktiv (Beispieldaten). */

import type { Case, Role } from "./types";

/* фиксированный demo-токен приглашения для семьи (чтобы попробовать /einladung) */
export const DEMO_FAMILY_TOKEN = "demo-familie-0147";
export const DEMO_KREMATORIUM_TOKEN = "demo-krematorium-0147";

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
      { doc_type: "Todesbescheinigung", verified: true, uploaded_by: "klinik", visible_to: ["krematorium"] },
      { doc_type: "Einäscherungsantrag", verified: false, uploaded_by: "bestatter", visible_to: ["krematorium"] },
      { doc_type: "Vollmacht der Familie", verified: false, uploaded_by: "familie", visible_to: [] },
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

const invites: Record<string, { caseId: string; role: Role }> = {
  [DEMO_FAMILY_TOKEN]: { caseId: "0147", role: "familie" },
  [DEMO_KREMATORIUM_TOKEN]: { caseId: "0147", role: "krematorium" },
};

export const mockStore = {
  listCases: (): Case[] => cases,
  getCase: (id: string): Case | undefined => cases.find((c) => c.id === id),
  toggleTask: (caseId: string, taskId: string): void => {
    const c = cases.find((x) => x.id === caseId);
    const t = c?.aufgaben.find((x) => x.id === taskId);
    if (t) t.status = t.status === "offen" ? "erledigt" : "offen";
  },
  resolveInvite: (token: string) => invites[token],
  createInvite: (caseId: string, role: Role): string => {
    const token = `inv-${caseId}-${role}-${Math.random().toString(36).slice(2, 8)}`;
    invites[token] = { caseId, role };
    return token;
  },
};
