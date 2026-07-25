/* Доменные типы MVP — зеркало схемы БД (mvp/supabase/migrations). */

export type Role =
  | "bestatter" | "familie" | "krematorium" | "transport" | "friedhof"
  | "floristik" | "klinik" | "standesamt" | "steinmetz" | "redner" | "verbund";

export type Phase = "neu" | "unterlagen" | "bestaetigt" | "durchfuehrung" | "abschluss";
export type TaskStatus = "offen" | "erledigt";
export type ContactStatus = "none" | "contacted" | "confirmed" | "skipped";
export type Tier = "kern" | "org" | "op" | "sens";

export type Deceased = {
  vorname?: string; nachname?: string;                       // kern
  geburtsdatum?: string; sterbedatum?: string; konfession?: string; anschrift?: string; // org
  groesse_cm?: number; gewicht_kg?: number; sargmass?: string; // op
  herzschrittmacher?: boolean; infektionshinweis?: string; freigabe_einaescherung?: boolean; // sens
};

export type Participant = { role: Role; org?: string | null; joined: boolean; contact?: ContactStatus; sort?: number };
export type Task = { id?: string; title: string; assignee?: Role | null; due?: string | null; status: TaskStatus };
export type Doc = { id?: string; doc_type: string; verified: boolean; uploaded_by?: Role; visible_to?: Role[] };
export type Event = { actor: string; action: string; at: string };

export type Case = {
  id: string;
  ref: string;
  bestattungsart: string;
  phase: Phase;
  target_date?: string | null;
  verstorbene: Deceased;
  beteiligte: Participant[];
  aufgaben: Task[];
  dokumente: Doc[];
  verlauf?: Event[];
};

/* Einladung ohne Token — was der Eigentümer über einen Link sehen darf.
   Der Token wird genau einmal beim Anlegen zurückgegeben und danach nie
   wieder ausgeliefert (Spiegel von list_invites in 0004). */
export type InviteSummary = {
  id: string;
  role: Role;
  label: string | null;
  created_at: string;
  expires_at: string;
  revoked: boolean;
  /* Offene Sitzungen dieses Links — bigint aus Postgres, kommt als Zahl an. */
  active_sessions: number;
};

/* Aktive Sitzung eines Eingeladenen. Die case_id verlässt den Server nie —
   nach außen existiert nur die Sitzungs-ID. */
export type InviteSession = {
  id: string;
  invite_id: string;
  expires_at: string;
};

/* Роль-фильтрованный вид (то, что отдаёт get_case_by_session в БД) */
export type RoleView = {
  ref: string;
  bestattungsart: string;
  phase: Phase;
  target_date?: string | null;
  role: Role;
  verstorbene: Partial<Deceased>;
  beteiligte: { role: Role; org: string | null; joined: boolean }[];
  aufgaben: Task[];
  dokumente: { doc_type: string; verified: boolean }[];
};
