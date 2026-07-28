/* Слой доступа к данным. Одна точка входа для экранов.
   Ветвление: задан Supabase → реальная БД; иначе → mock (In-Memory).

   Полевой доступ по ролям считает СЕРВЕР: в live-режиме — функции БД
   (0004_hardening.sql), в mock — access.ts (то же правило).

   Каждый вызов проходит через getRuntimeMode() — так проверка конфигурации
   срабатывает в рантайме, а не на этапе сборки.
   Alle lesenden Aufrufe laufen mit dem anon-Schlüssel; service_role wird hier
   nie benutzt. Und: keine Tokens/Sitzungs-IDs in Logs. */

import type {
  Case, Deceased, InviteSummary, Phase, Role, RoleView, Task, Termin,
} from "./types";
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
  return (data ?? []).map((c) => ({ ...c, verstorbene: {}, beteiligte: [], aufgaben: [], dokumente: [], termine: [] })) as Case[];
}

export async function getCase(id: string): Promise<Case | null> {
  if (getRuntimeMode() === "mock") return mockStore.getCase(id) ?? null;
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  // владелец (Bestatter) видит всё — собираем из таблиц; RLS пускает только к своим
  const [{ data: c }, { data: d }, { data: p }, { data: t }, { data: docs }, { data: term }] = await Promise.all([
    sb.from("cases").select("*").eq("id", id).maybeSingle(),
    sb.from("deceased").select("*").eq("case_id", id).maybeSingle(),
    sb.from("participants").select("id, role, org_name, joined, contact, sort").eq("case_id", id).order("sort"),
    sb.from("tasks").select("id, title, assignee, due, status").eq("case_id", id),
    sb.from("documents").select("id, doc_type, verified, uploaded_by, visible_to").eq("case_id", id),
    /* Wie in app.case_for_role: nach Beginn, Termine ohne Zeit ans Ende. */
    sb.from("termine")
      .select("id, art, von, bis, ort_name, ort_adresse, zustaendig, status, hinweis")
      .eq("case_id", id)
      .order("von", { ascending: true, nullsFirst: false }),
  ]);
  if (!c) return null;
  return {
    id: c.id, ref: c.ref, bestattungsart: c.bestattungsart, phase: c.phase, target_date: c.target_date,
    verstorbene: d ?? {},
    beteiligte: (p ?? []).map((x) => ({ id: x.id, role: x.role, org: x.org_name, joined: x.joined, contact: x.contact, sort: x.sort })),
    aufgaben: t ?? [],
    dokumente: docs ?? [],
    termine: term ?? [],
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

/* Zu allen schreibenden Wegen unten gilt dasselbe:

   1. cases.owner wird NIE mitgeschickt. Die Spalte hat seit 0010 den
      Vorgabewert auth.uid(); die Regel cases_owner (0002) prüft anschliessend
      with check (owner = auth.uid()). Ein Fall auf fremden Namen ist damit
      nicht anlegbar — und zwar unabhängig davon, was das Formular sendet.
   2. Die Berechtigung prüft ausschliesslich die Datenbank (RLS). Hier steht
      keine zweite, selbstgebaute Eigentümerprüfung.
   3. Jede Anweisung ist an das Paar (Fall, Datensatz) gebunden, nicht an die
      Kennung des Datensatzes allein — wie bei toggleTask weiter unten.
   4. Der Text einer Datenbank-Ausnahme wird nie durchgereicht; nach aussen
      geht ERR_DB oder ERR_KEIN_ZUGRIFF. Die Angaben der Gruppe sens
      (herzschrittmacher, infektionshinweis, freigabe_einaescherung) stehen
      deshalb in keiner Meldung, in keinem Protokoll und in keiner Adresse. */

export type NeuerFall = {
  bestattungsart: string;
  target_date: string | null;
  vorname: string;
  nachname: string;
};

/* Legt Fall und verstorbene Person an und gibt die Kennung des Falls zurück. */
export async function createCase(f: NeuerFall): Promise<string> {
  if (getRuntimeMode() === "mock") return mockStore.createCase(f);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("cases")
    .insert({ bestattungsart: f.bestattungsart, target_date: f.target_date })
    .select("id")
    .single();
  if (error || !data) throw dbFehler(error?.code);

  const { error: fehlerPerson } = await sb
    .from("deceased")
    .insert({ case_id: data.id, vorname: f.vorname, nachname: f.nachname });
  if (fehlerPerson) throw dbFehler(fehlerPerson.code);

  return data.id as string;
}

export type FallAenderung = {
  bestattungsart?: string;
  target_date?: string | null;
  phase?: Phase;
};

export async function updateCase(caseId: string, patch: FallAenderung): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.updateCase(caseId, patch);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb.from("cases").update(patch).eq("id", caseId);
  if (error) throw dbFehler(error.code);
}

/* Eine Feldgruppe der verstorbenen Person schreiben. upsert, weil die Zeile
   bei einem vor 0010 angelegten Fall fehlen kann — dann entsteht sie hier.
   Gespeichert wird immer nur die übergebene Gruppe: ein Fehler in einer
   Gruppe darf die anderen nicht mitreissen. */
export async function updateDeceased(caseId: string, patch: Partial<Deceased>): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.updateDeceased(caseId, patch);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb
    .from("deceased")
    .upsert({ case_id: caseId, ...patch }, { onConflict: "case_id" });
  if (error) throw dbFehler(error.code);
}

export async function addParticipant(caseId: string, role: Role, org: string): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.addParticipant(caseId, role, org);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  /* Reihenfolge fortschreiben, damit neue Zeilen unten landen und die Liste
     nicht bei jedem Laden springt. */
  const { data: vorhanden } = await sb.from("participants").select("sort").eq("case_id", caseId);
  const sort = (vorhanden ?? []).reduce((max, p) => Math.max(max, p.sort ?? 0), -1) + 1;
  const { error } = await sb
    .from("participants")
    .insert({ case_id: caseId, role, org_name: org, sort });
  if (error) throw dbFehler(error.code);
}

export async function removeParticipant(caseId: string, participantId: string): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.removeParticipant(caseId, participantId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb
    .from("participants").delete()
    .eq("id", participantId).eq("case_id", caseId);
  if (error) throw dbFehler(error.code);
}

export async function setParticipantJoined(
  caseId: string,
  participantId: string,
  joined: boolean,
): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.setParticipantJoined(caseId, participantId, joined);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb
    .from("participants").update({ joined })
    .eq("id", participantId).eq("case_id", caseId);
  if (error) throw dbFehler(error.code);
}

export type NeueAufgabe = Pick<Task, "title" | "assignee" | "due">;

export async function addTask(caseId: string, t: NeueAufgabe): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.addTask(caseId, t);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb
    .from("tasks")
    .insert({ case_id: caseId, title: t.title, assignee: t.assignee, due: t.due });
  if (error) throw dbFehler(error.code);
}

export async function removeTask(caseId: string, taskId: string): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.removeTask(caseId, taskId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb
    .from("tasks").delete()
    .eq("id", taskId).eq("case_id", caseId);
  if (error) throw dbFehler(error.code);
}

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

/* ── Termine ─────────────────────────────────────────────────────
   Für das Haus gewöhnliche Tabellenzugriffe: die Regel termine_owner (0011)
   lässt nur den Eigentümer des Vorgangs durch. Wie bei den Aufgaben ist jede
   Anweisung an das Paar (Fall, Termin) gebunden. */

export type NeuerTermin = Pick<
  Termin, "art" | "von" | "bis" | "ort_name" | "ort_adresse" | "zustaendig" | "hinweis"
>;

export type TerminAenderung = Partial<Omit<Termin, "id">>;

export async function addTermin(caseId: string, t: NeuerTermin): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.addTermin(caseId, t);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb.from("termine").insert({ case_id: caseId, ...t });
  if (error) throw dbFehler(error.code);
}

export async function updateTermin(
  caseId: string,
  terminId: string,
  patch: TerminAenderung,
): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.updateTermin(caseId, terminId, patch);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb
    .from("termine").update(patch)
    .eq("id", terminId).eq("case_id", caseId);
  if (error) throw dbFehler(error.code);
}

export async function removeTermin(caseId: string, terminId: string): Promise<void> {
  if (getRuntimeMode() === "mock") return mockStore.removeTermin(caseId, terminId);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { error } = await sb
    .from("termine").delete()
    .eq("id", terminId).eq("case_id", caseId);
  if (error) throw dbFehler(error.code);
}

/* Bestätigung durch einen Eingeladenen ohne Konto — der einzige schreibende
   Weg des äusseren Umkreises.

   Die Sitzung ist das ganze Argument: welcher Fall dahintersteht, welche
   Rolle, und ob diese Rolle diese Terminart bestätigen darf, entscheidet
   ausschliesslich public.termin_bestaetigen (0011). Von hier geht keine
   case_id mit — sie ist auf dieser Seite gar nicht bekannt.

   false heisst «darf nicht oder Sitzung ist abgelaufen» und ist kein Fehler:
   die Oberfläche muss das von einer Störung unterscheiden können. */
export async function terminBestaetigen(
  sessionId: string,
  terminId: string,
  von: string | null,
  bis: string | null,
  hinweis: string | null,
): Promise<boolean> {
  if (getRuntimeMode() === "mock") {
    return mockStore.terminBestaetigen(sessionId, terminId, von, bis, hinweis);
  }
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("termin_bestaetigen", {
    p_session: sessionId,
    p_termin: terminId,
    p_von: von,
    p_bis: bis,
    p_hinweis: hinweis,
  });
  if (error) throw new Error(ERR_DB);
  return data === true;
}

/* Angaben ergänzen durch einen Eingeladenen (0012). Der zweite schreibende
   Weg des äusseren Umkreises — und der erste, der ein Feld über die
   verstorbene Person berührt.

   Wieder ohne case_id und ohne Rolle: beide hängen an der Sitzung. Welche
   Felder ankommen dürfen, entscheidet app.felder_schreibbar in der Datenbank;
   ein nicht erlaubter Schlüssel wird dort übergangen, nicht beanstandet —
   sonst liesse sich über die Antwort abtasten, welche Felder es gibt.

   false = «darf nicht, Sitzung abgelaufen oder Eingabe unförmig». */
export async function angabenErgaenzen(
  sessionId: string,
  felder: Partial<Deceased>,
): Promise<boolean> {
  if (getRuntimeMode() === "mock") return mockStore.angabenErgaenzen(sessionId, felder);
  const { supabaseServer } = await import("./supabase/server");
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("angaben_ergaenzen", {
    p_session: sessionId,
    p_felder: felder,
  });
  if (error) throw new Error(ERR_DB);
  return data === true;
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
