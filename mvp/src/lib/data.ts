/* Слой доступа к данным. Одна точка входа для экранов.
   Ветвление: задан Supabase → реальная БД; иначе → mock (In-Memory).

   Полевой доступ по ролям считает СЕРВЕР: в live-режиме — функции БД
   (0004_hardening.sql), в mock — access.ts (то же правило).

   Каждый вызов проходит через getRuntimeMode() — так проверка конфигурации
   срабатывает в рантайме, а не на этапе сборки.
   Alle lesenden Aufrufe laufen mit dem anon-Schlüssel; service_role wird hier
   nie benutzt. Und: keine Tokens/Sitzungs-IDs in Logs. */

import type { Case, InviteSummary, Role, RoleView } from "./types";
import { getRuntimeMode, isMockMode } from "./env";
import { mockStore } from "./mock";

/* Nur für Beschriftungen im UI (Badge, Demo-Links). Der harte Riegel steckt
   in getRuntimeMode() weiter unten. */
export const isMock = isMockMode();

const ERR_DB = "MementoOS: Die Datenbank hat die Anfrage abgelehnt.";

/* ── чтение ─────────────────────────────────────────────────── */

export async function listCases(): Promise<Case[]> {
  if (getRuntimeMode() === "mock") return mockStore.listCases();
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  // владелец видит свои фаллы; детальные поля тянем на странице фалла
  const { data } = await sb.from("cases").select("id, ref, bestattungsart, phase, target_date").order("created_at", { ascending: false });
  return (data ?? []).map((c) => ({ ...c, verstorbene: {}, beteiligte: [], aufgaben: [], dokumente: [] })) as Case[];
}

export async function getCase(id: string): Promise<Case | null> {
  if (getRuntimeMode() === "mock") return mockStore.getCase(id) ?? null;
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  // владелец (Bestatter) видит всё — собираем из таблиц; RLS пускает только к своим
  const [{ data: c }, { data: d }, { data: p }, { data: t }, { data: docs }] = await Promise.all([
    sb.from("cases").select("*").eq("id", id).maybeSingle(),
    sb.from("deceased").select("*").eq("case_id", id).maybeSingle(),
    sb.from("participants").select("role, org_name, joined, contact, sort").eq("case_id", id).order("sort"),
    sb.from("tasks").select("id, title, assignee, due, status").eq("case_id", id),
    sb.from("documents").select("id, doc_type, verified, uploaded_by, visible_to").eq("case_id", id),
  ]);
  if (!c) return null;
  return {
    id: c.id, ref: c.ref, bestattungsart: c.bestattungsart, phase: c.phase, target_date: c.target_date,
    verstorbene: d ?? {},
    beteiligte: (p ?? []).map((x) => ({ role: x.role, org: x.org_name, joined: x.joined, contact: x.contact, sort: x.sort })),
    aufgaben: t ?? [],
    dokumente: docs ?? [],
  } as Case;
}

/* ── Zugang ohne Konto: Token → Sitzung → Ansicht ────────────── */

/* Token einlösen. Rückgabe: Sitzungs-ID oder null (Link ungültig, abgelaufen
   oder zurückgezogen). Ein Fehler wird geworfen — nur dann liegt eine
   technische Störung vor. Die Rolle bestimmt der Server aus der Einladung,
   die case_id verlässt ihn nie. */
export async function redeemInvite(token: string): Promise<string | null> {
  if (getRuntimeMode() === "mock") return mockStore.redeemInvite(token);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("redeem_invite", { p_token: token });
  if (error) throw new Error(ERR_DB);
  return (data as string | null) ?? null;
}

/* Rollen­gefilterter Fall zu einer Sitzung. null = Sitzung abgelaufen/beendet. */
export async function getCaseBySession(sessionId: string): Promise<RoleView | null> {
  if (getRuntimeMode() === "mock") return mockStore.getCaseBySession(sessionId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("get_case_by_session", { p_session: sessionId });
  if (error) throw new Error(ERR_DB);
  return (data as RoleView) ?? null;
}

export async function endInviteSession(sessionId: string): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.endSession(sessionId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb.rpc("end_session", { p_session: sessionId });
  if (error) throw new Error(ERR_DB);
}

/* ── запись ─────────────────────────────────────────────────── */

export async function toggleTask(caseId: string, taskId: string): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.toggleTask(caseId, taskId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  /* Immer an das Paar (Fall, Aufgabe) gebunden: die Aufgaben-Kennung allein
     würde genügen, um eine fremde Aufgabe zu treffen, falls die
     RLS-Regel je fehlt oder gelockert wird. Der Fall-Bezug kommt vom
     Aufrufer, deshalb darf er nicht unbenutzt bleiben. Die eigentliche
     Berechtigung prüft weiterhin die Regel tasks_owner (0002_rls.sql). */
  const { data: cur } = await sb
    .from("tasks").select("status")
    .eq("id", taskId).eq("case_id", caseId).maybeSingle();
  if (!cur) return;
  const next = cur.status === "offen" ? "erledigt" : "offen";
  await sb
    .from("tasks").update({ status: next })
    .eq("id", taskId).eq("case_id", caseId);
}

/* ── Einladungen verwalten (nur Eigentümer) ──────────────────── */

/* Der Token existiert genau einen Moment lang: create_invite gibt ihn einmal
   zurück, danach liefert die Datenbank ihn nie wieder aus. */
export async function createInvite(caseId: string, role: Role): Promise<{ inviteId: string; token: string }> {
  if (getRuntimeMode() === "mock") return mockStore.createInvite(caseId, role);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("create_invite", { p_case: caseId, p_role: role });
  if (error) throw new Error(ERR_DB);
  const row = (Array.isArray(data) ? data[0] : data) as { invite_id?: string; token?: string } | null;
  if (!row?.invite_id || !row?.token) throw new Error(ERR_DB);
  return { inviteId: row.invite_id, token: row.token };
}

export async function listInvites(caseId: string): Promise<InviteSummary[]> {
  if (getRuntimeMode() === "mock") return mockStore.listInvites(caseId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("list_invites", { p_case: caseId });
  if (error) throw new Error(ERR_DB);
  return (data as InviteSummary[]) ?? [];
}

export async function revokeInvite(inviteId: string): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.revokeInvite(inviteId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb.rpc("revoke_invite", { p_invite: inviteId });
  if (error) throw new Error(ERR_DB);
}
