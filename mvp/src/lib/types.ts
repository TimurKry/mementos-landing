/* Доменные типы MVP — зеркало схемы БД (mvp/supabase/migrations). */

export type Role =
  | "bestatter" | "familie" | "krematorium" | "transport" | "friedhof"
  | "floristik" | "klinik" | "standesamt" | "steinmetz" | "redner" | "verbund";

export type Phase = "neu" | "unterlagen" | "bestaetigt" | "durchfuehrung" | "abschluss";
export type TaskStatus = "offen" | "erledigt";
export type ContactStatus = "none" | "contacted" | "confirmed" | "skipped";
export type Tier = "kern" | "org" | "op" | "sens";

/* null ist hier kein Versehen, sondern «Angabe gelöscht». Ein weggelassenes
   Feld (undefined) bliebe beim Speichern unverändert stehen — wer eine
   Konfession wieder herausnimmt, muss sie auch leeren können. */
export type Deceased = {
  vorname?: string | null; nachname?: string | null;                       // kern
  geburtsdatum?: string | null; sterbedatum?: string | null; konfession?: string | null; anschrift?: string | null; // org
  groesse_cm?: number | null; gewicht_kg?: number | null; sargmass?: string | null; // op
  herzschrittmacher?: boolean | null; infektionshinweis?: string | null; freigabe_einaescherung?: boolean | null; // sens
};

/* id ist nur im Arbeitsbereich des Hauses bekannt — die rollengefilterte
   Ansicht (RoleView) gibt sie nicht heraus. Ohne sie liesse sich ein
   Beteiligter nicht gezielt entfernen: zwei Zeilen dürfen dieselbe Rolle
   tragen (zwei Fahrdienste, zwei Angehörige). */
export type Participant = { id?: string; role: Role; org?: string | null; joined: boolean; contact?: ContactStatus; sort?: number };

/* ── Termine (0011_termine.sql) ──────────────────────────────────
   Bis dahin hatte ein Vorgang genau ein Datum (Case.target_date) — der
   Wunschtermin der Familie. Wann abzuholen ist und wo die Trauerfeier
   stattfindet, stand nirgends. Ein Termin trägt beides: Zeitfenster und Ort.

   von/bis sind ISO-Zeitpunkte (timestamptz) und dürfen fehlen: ein Termin
   wird oft angelegt, bevor die Zeit feststeht. Zwei statt einem, weil eine
   Abholung in der Praxis ein Fenster ist («zwischen 8 und 10»). */
export type TerminArt =
  | "abholung" | "ueberfuehrung" | "einaescherung"
  | "trauerfeier" | "beisetzung" | "abschiednahme";

export type TerminStatus = "geplant" | "bestaetigt" | "erledigt" | "abgesagt";

export type Termin = {
  id?: string;
  art: TerminArt;
  von?: string | null;
  bis?: string | null;
  ort_name?: string | null;
  ort_adresse?: string | null;
  zustaendig?: Role | null;
  status: TerminStatus;
  hinweis?: string | null;
};

/* Ein Termin, wie ihn ein Eingeladener sieht. darf_bestaetigen kommt vom
   Server mit (app.darf_bestaetigen je Zeile), damit die Oberfläche weiss, ob
   sie ein Formular zeigen darf. Die Entscheidung selbst trifft weiterhin die
   Datenbank in termin_bestaetigen — das Feld ist eine Auskunft, kein Recht. */
export type RollenTermin = Omit<Termin, "zustaendig"> & { darf_bestaetigen: boolean };
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
  termine: Termin[];
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

/* ── Plattform-Übersicht (Betreuung der Plattform) ──────────────────
   Spiegel der Funktionen aus 0008_plattform_uebersicht.sql.

   Ausschliesslich Metadaten und Verbindungen: Zähler, Phasen, Zeitpunkte,
   Rollen. Kein Feld einer verstorbenen Person, kein Aufgabentext, kein
   Dokumentname. Ein Vorgang wird über seine Nummer (ref) und seine Phase
   erkannt — und sonst gar nicht. Wer hier Inhalte sähe, hätte wieder die
   Lücke, die 0004 geschlossen hat. */

export type AdminUebersicht = {
  haeuser: number;
  faelle_gesamt: number;
  faelle_offen: number;
  faelle_abgeschlossen: number;
  phasen: Record<Phase, number>;
  zugaenge_aktiv: number;
  zugaenge_zurueckgezogen: number;
  sitzungen_aktiv: number;
  ereignisse_24h: number;
};

export type AdminHaus = {
  haus_id: string;
  org_name: string;
  faelle_gesamt: number;
  faelle_offen: number;
  faelle_abgeschlossen: number;
  zugaenge_aktiv: number;
  sitzungen_aktiv: number;
  letzte_aktivitaet: string | null;
};

export type AdminFall = {
  fall_id: string;
  ref: string;
  phase: Phase;
  created_at: string;
  target_date: string | null;
  beteiligte: number;
  zugaenge_aktiv: number;
  sitzungen_aktiv: number;
  letzte_aktivitaet: string | null;
};

/* Eine offene Sitzung eines Zugangs (0009). Nur Zeitpunkte und die Kennung —
   ohne die Kennung liesse sich eine einzelne Sitzung nicht beenden. */
export type AdminSitzung = {
  sitzung_id: string;
  created_at: string | null;
  zuletzt_gesehen: string | null;
  expires_at: string | null;
};

/* Die Merkhilfe des Hauses (invites.label) kommt hier bewusst NICHT vor: seit
   0009 gibt admin_zugaenge sie gar nicht mehr heraus. Sie ist Freitext und
   trägt in der Praxis Personennamen — für die Betreuung der Plattform genügt
   die Rolle. Im Arbeitsbereich des Hauses bleibt sie (InviteSummary.label). */
export type AdminZugang = {
  zugang_id: string;
  role: Role;
  created_at: string;
  expires_at: string;
  revoked: boolean;
  sitzungen_aktiv: number;
  zuletzt_gesehen: string | null;
  sitzungen: AdminSitzung[];
};

/* Ein Vorgang samt seinem Haus — was admin_fall(p_fall) in einer Zeile
   liefert (0009). Das Haus steht nur für die Brotkrumen dabei. */
export type AdminFallKontext = {
  fall: AdminFall;
  haus: { haus_id: string; org_name: string };
};

export type AdminEreignis = {
  at: string;
  action: string;
  actor_kind: string;
  actor_ref: string | null;
  detail: string | null;
  fall_ref: string | null;
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
  /* Optional, weil eine vor 0011 angelegte Sitzung den Schlüssel noch nicht
     mitbringt — die Ansicht darf deswegen nicht weiss bleiben. */
  termine?: RollenTermin[];
};
