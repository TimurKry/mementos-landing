/* Слой доступа к данным. Одна точка входа для экранов.
   Ветвление: задан Supabase → реальная БД; иначе → mock (In-Memory).
   Полевой доступ по ролям в реальном режиме считает БД (get_case_for_role),
   в mock — access.ts (то же правило). */

import type { Case, RoleView, Role } from "./types";
import { mockStore } from "./mock";
import { caseForRole } from "./access";

export const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL;

/* ── чтение ─────────────────────────────────────────────────── */

export async function listCases(): Promise<Case[]> {
  if (isMock) return mockStore.listCases();
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  // владелец видит свои фаллы; детальные поля тянем на странице фалла
  const { data } = await sb.from("cases").select("id, ref, bestattungsart, phase, target_date").order("created_at", { ascending: false });
  return (data ?? []).map((c) => ({ ...c, verstorbene: {}, beteiligte: [], aufgaben: [], dokumente: [] })) as Case[];
}

export async function getCase(id: string): Promise<Case | null> {
  if (isMock) return mockStore.getCase(id) ?? null;
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  // владелец (Bestatter) видит всё — собираем из таблиц
  const [{ data: c }, { data: d }, { data: p }, { data: t }, { data: docs }] = await Promise.all([
    sb.from("cases").select("*").eq("id", id).single(),
    sb.from("deceased").select("*").eq("case_id", id).maybeSingle(),
    sb.from("participants").select("role, org_name, joined, contact, sort").eq("case_id", id).order("sort"),
    sb.from("tasks").select("id, title, assignee, due, status").eq("case_id", id),
    sb.from("documents").select("doc_type, verified, uploaded_by, visible_to").eq("case_id", id),
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

/* Роль-фильтрованный вид по токену приглашения (вход без аккаунта) */
export async function getCaseByInvite(token: string): Promise<RoleView | null> {
  if (isMock) {
    const inv = mockStore.resolveInvite(token);
    if (!inv) return null;
    const c = mockStore.getCase(inv.caseId);
    return c ? caseForRole(c, inv.role) : null;
  }
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data } = await sb.rpc("get_case_by_invite", { p_token: token });
  return (data as RoleView) ?? null;
}

/* ── запись ─────────────────────────────────────────────────── */

export async function toggleTask(caseId: string, taskId: string): Promise<void> {
  if (isMock) return mockStore.toggleTask(caseId, taskId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data: cur } = await sb.from("tasks").select("status").eq("id", taskId).single();
  const next = cur?.status === "offen" ? "erledigt" : "offen";
  await sb.from("tasks").update({ status: next }).eq("id", taskId);
}

export async function createInvite(caseId: string, role: Role): Promise<string> {
  if (isMock) return mockStore.createInvite(caseId, role);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data } = await sb.from("invites").insert({ case_id: caseId, role }).select("token").single();
  return (data?.token as string) ?? "";
}
