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
export type Doc = { doc_type: string; verified: boolean; uploaded_by?: Role; visible_to?: Role[] };
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

/* Роль-фильтрованный вид (то, что отдаёт get_case_for_role в БД) */
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
