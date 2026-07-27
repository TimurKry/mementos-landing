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

/* Die Eigentümer-Funktionen (create_invite, list_invites, revoke_invite) sind
   SECURITY DEFINER und prüfen is_case_owner selbst — Ablehnung kommt mit
   errcode 42501. Sie wird hier von einer technischen Störung getrennt, damit
   die Oberfläche zwei verschiedene Auskünfte geben kann. Der Text der
   Datenbank wird bewusst nicht durchgereicht. */
export const ERR_KEIN_ZUGRIFF = "MementoOS: Kein Zugriff auf diesen Fall.";

export function istKeinZugriff(e: unknown): boolean {
  return e instanceof Error && e.message === ERR_KEIN_ZUGRIFF;
}

function dbFehler(code: string | undefined): Error {
  return new Error(code === "42501" ? ERR_KEIN_ZUGRIFF : ERR_DB);
}

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
   zurück, danach liefert die Datenbank ihn nie wieder aus. Er wird deshalb
   hier weder protokolliert noch irgendwo zwischengelegt — er geht als
   Rückgabewert zurück und nirgendwo sonst hin.

   Die Merkhilfe (label) kennt create_invite nicht; sie wird anschliessend an
   die Zeile geschrieben (Policy invites_owner aus 0002_rls.sql). */
export async function createInvite(
  caseId: string,
  role: Role,
  label: string | null = null,
): Promise<{ inviteId: string; token: string }> {
  const merk = (label ?? "").trim() || null;

  if (getRuntimeMode() === "mock") {
    const angelegt = mockStore.createInvite(caseId, role, merk);
    if (!angelegt) throw new Error(ERR_KEIN_ZUGRIFF);
    return angelegt;
  }

  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("create_invite", { p_case: caseId, p_role: role });
  if (error) throw dbFehler(error.code);
  const row = (Array.isArray(data) ? data[0] : data) as { invite_id?: string; token?: string } | null;
  if (!row?.invite_id || !row?.token) throw new Error(ERR_DB);

  /* Bewusst ohne Fehlerbehandlung nach aussen: der Klartext-Token steht
     ausschliesslich in dieser einen Antwort. Ein Abbruch wegen einer
     misslungenen Merkhilfe würde ihn unwiederbringlich verlieren — die
     Einladung selbst ist bereits angelegt und gültig. */
  if (merk) await sb.from("invites").update({ label: merk }).eq("id", row.invite_id);

  return { inviteId: row.invite_id, token: row.token };
}

export async function listInvites(caseId: string): Promise<InviteSummary[]> {
  if (getRuntimeMode() === "mock") return mockStore.listInvites(caseId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("list_invites", { p_case: caseId });
  if (error) throw dbFehler(error.code);
  return (data as InviteSummary[]) ?? [];
}

/* Zieht die Einladung zurück UND beendet alle offenen Sitzungen dieser
   Einladung (revoke_invite in 0004) — der Entzug wirkt sofort. */
export async function revokeInvite(inviteId: string): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.revokeInvite(inviteId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb.rpc("revoke_invite", { p_invite: inviteId });
  if (error) throw dbFehler(error.code);
}
