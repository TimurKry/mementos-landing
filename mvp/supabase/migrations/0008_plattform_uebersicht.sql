-- MementoOS MVP — Plattform-Uebersicht fuer die Betreuung (0008)
--
-- Eine Ansicht fuer unser eigenes Team: wie viele Haeuser angebunden sind,
-- wie viele Faelle in welcher Phase laufen, wer wem Zugang gegeben hat,
-- wie viele Sitzungen offen sind, was im Protokoll steht. Dazu zwei
-- Eingriffe: Zugang entziehen, Sitzung beenden.
--
-- ── Die Grenze, die diese Migration zieht ──────────────────────
-- Die Uebersicht zeigt Zahlen und Beziehungen, NIE den Inhalt eines Falls.
-- Keine der hier angelegten Funktionen liest die Tabelle mit den Angaben zur
-- verstorbenen Person — kein Feld, in keiner Form. Ebenso wenig
-- documents.doc_type, tasks.title oder participants.org_name: auch das sind
-- Angaben aus einem einzelnen Fall.
--
-- Gelesen werden ausschliesslich: cases.ref, cases.phase, cases.created_at,
-- cases.target_date, profiles.org_name (Name des Kundenhauses, nicht Inhalt
-- eines Falls), invites.role/label/created_at/expires_at/revoked,
-- invite_sessions.*, audit_log.*, sowie reine Anzahlen (count(*)).
--
-- Der Grund steht in 0004: dort wurde die Rechteausweitung geschlossen, bei
-- der die Rolle als Argument kam. Eine Betreuungsansicht mit Zugriff auf den
-- Fallinhalt brachte dieselbe Klasse Loch zurueck und wuerfe zusaetzlich die
-- Frage auf, warum die Plattform-Betreuung medizinische Angaben aus fremden
-- Haeusern sehen koennen soll. Sie soll es nicht.
--
-- Wer die Grenze prueft: der Block «Verifikation» am Dateiende enthaelt eine
-- Abfrage, die den Quelltext jeder admin_*-Funktion danach durchsucht.
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0007 voraus.
--
-- Abschnitte:
--   1 platform_admins + Pruefung        4 Eingriffe
--   2 Kennzahlen und Listen             5 Rechtemodell (bewusst am Dateiende)
--   3 Protokoll                           Verifikation (auskommentiert)

-- ═══════════════════════════════════════════════════════════════
-- 1  platform_admins und die Pruefung
-- ═══════════════════════════════════════════════════════════════
-- Zeilen werden ausschliesslich von Hand per SQL eingetragen. Es gibt keine
-- Funktion, die sich selbst eintraegt — sonst waere die Betreuungsrolle vom
-- Anwendungscode aus erreichbar und damit angreifbar.
create table if not exists public.platform_admins (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  note     text,
  added_at timestamptz not null default now()
);

comment on table public.platform_admins is
  'Konten der Plattform-Betreuung. Wird nur von Hand gepflegt; keine Lesepolicy, '
  'keine Tabellenrechte fuer anon/authenticated.';

alter table public.platform_admins enable row level security;

-- Bewusst KEINE Policy: wer auf der Liste steht, geht die Anwendung nichts an.
-- RLS ohne Policy verweigert jede Zeile; die Funktionen unten laufen als
-- Eigentuemer und sind davon nicht betroffen.
--
-- Der Entzug der Tabellenrechte ist nicht redundant: Supabase vergibt per
-- Default-Privileg «all on tables» an anon und authenticated, neue Tabellen
-- entstehen also nicht rechtlos. service_role bleibt unberuehrt — der
-- Schluessel liegt ausschliesslich serverseitig (siehe 0004).
revoke all on public.platform_admins from public, anon, authenticated;

-- Einzige Stelle, an der die Liste gelesen wird. Kein EXECUTE nach aussen:
-- die Funktion liegt in app/, und anon/authenticated haben dort kein USAGE.
create or replace function app.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins a where a.user_id = auth.uid()
  );
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2  Kennzahlen und Listen
-- ═══════════════════════════════════════════════════════════════
-- Alle Funktionen dieser Migration sind SECURITY DEFINER und pruefen als
-- erstes selbst, ob die aufrufende Person zur Betreuung gehoert — SECURITY
-- DEFINER umgeht RLS, auf Policies ist hier kein Verlass (wie in 0004).
--
-- Alle sind VOLATILE: die beiden Eingriffe schreiben ohnehin, und fuer die
-- Ansichten gilt derselbe nuetzliche Nebeneffekt wie beim oeffentlichen
-- Vertrag — PostgREST laesst GET nur fuer stable/immutable zu, damit sind
-- sie ausschliesslich per POST erreichbar.
--
-- «#variable_conflict use_column» steht in den Funktionen mit RETURNS TABLE:
-- deren Ausgabespalten heissen wie Tabellenspalten (role, label, phase, at …).
-- Alle Spaltenbezuege sind zusaetzlich qualifiziert; die Anweisung ist die
-- zweite Linie, damit ein spaeterer unqualifizierter Bezug nicht als
-- «column reference is ambiguous» erst zur Laufzeit auffaellt.
--
-- Begriffe, einheitlich in dieser Datei:
--   offen           = phase <> 'abschluss'
--   abgeschlossen   = phase  = 'abschluss'
--   Zugang aktiv    = nicht zurueckgezogen und noch nicht abgelaufen
--   Sitzung aktiv   = ended_at is null und expires_at > now()

-- Ein Haus = ein Profil (angemeldetes Konto). Hinweis: ein Konto der
-- Plattform-Betreuung, das selbst angemeldet ist, hat ebenfalls ein Profil und
-- wird hier mitgezaehlt; die Uebersicht filtert es nicht heraus.
create or replace function public.admin_overview()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not app.is_platform_admin() then
    raise exception 'Kein Zugriff auf die Plattform-Uebersicht' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'haeuser',              (select count(*) from public.profiles),
    'faelle_gesamt',        (select count(*) from public.cases),
    'faelle_offen',         (select count(*) from public.cases c
                              where c.phase <> 'abschluss'::public.case_phase),
    'faelle_abgeschlossen', (select count(*) from public.cases c
                              where c.phase = 'abschluss'::public.case_phase),
    'phasen', jsonb_build_object(
      'neu',           (select count(*) from public.cases c where c.phase = 'neu'::public.case_phase),
      'unterlagen',    (select count(*) from public.cases c where c.phase = 'unterlagen'::public.case_phase),
      'bestaetigt',    (select count(*) from public.cases c where c.phase = 'bestaetigt'::public.case_phase),
      'durchfuehrung', (select count(*) from public.cases c where c.phase = 'durchfuehrung'::public.case_phase),
      'abschluss',     (select count(*) from public.cases c where c.phase = 'abschluss'::public.case_phase)
    ),
    'zugaenge_aktiv',           (select count(*) from public.invites i
                                  where not i.revoked and i.expires_at > now()),
    'zugaenge_zurueckgezogen',  (select count(*) from public.invites i where i.revoked),
    'sitzungen_aktiv',          (select count(*) from public.invite_sessions s
                                  where s.ended_at is null and s.expires_at > now()),
    'ereignisse_24h',           (select count(*) from public.audit_log l
                                  where l.at > now() - interval '24 hours')
  ) into v_result;

  return v_result;
end;
$$;

-- Ein Haus je Zeile. letzte_aktivitaet ist der juengste Protokolleintrag
-- ueber alle Faelle dieses Hauses.
create or replace function public.admin_haeuser()
returns table(
  haus_id             uuid,
  org_name            text,
  faelle_gesamt       bigint,
  faelle_offen        bigint,
  faelle_abgeschlossen bigint,
  zugaenge_aktiv      bigint,
  sitzungen_aktiv     bigint,
  letzte_aktivitaet   timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not app.is_platform_admin() then
    raise exception 'Kein Zugriff auf die Plattform-Uebersicht' using errcode = '42501';
  end if;

  return query
    select p.id,
           p.org_name,
           (select count(*) from public.cases c where c.owner = p.id),
           (select count(*) from public.cases c
             where c.owner = p.id and c.phase <> 'abschluss'::public.case_phase),
           (select count(*) from public.cases c
             where c.owner = p.id and c.phase = 'abschluss'::public.case_phase),
           (select count(*)
              from public.invites i
              join public.cases c on c.id = i.case_id
             where c.owner = p.id and not i.revoked and i.expires_at > now()),
           (select count(*)
              from public.invite_sessions s
              join public.invites i on i.id = s.invite_id
              join public.cases c on c.id = i.case_id
             where c.owner = p.id and s.ended_at is null and s.expires_at > now()),
           (select max(l.at)
              from public.audit_log l
              join public.cases c on c.id = l.case_id
             where c.owner = p.id)
    from public.profiles p
    order by p.org_name nulls last, p.id;
end;
$$;

-- Faelle eines Hauses. Von der verstorbenen Person steht hier nichts — nur
-- die Fall-Nummer, die Phase, die Termine und Anzahlen. «beteiligte» ist eine
-- blosse Anzahl; welche Firmen beteiligt sind, bleibt beim Haus.
create or replace function public.admin_faelle(p_haus uuid)
returns table(
  fall_id           uuid,
  ref               text,
  phase             public.case_phase,
  created_at        timestamptz,
  target_date       date,
  beteiligte        bigint,
  zugaenge_aktiv    bigint,
  sitzungen_aktiv   bigint,
  letzte_aktivitaet timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not app.is_platform_admin() then
    raise exception 'Kein Zugriff auf die Plattform-Uebersicht' using errcode = '42501';
  end if;

  return query
    select c.id,
           c.ref,
           c.phase,
           c.created_at,
           c.target_date,
           (select count(*) from public.participants pt where pt.case_id = c.id),
           (select count(*) from public.invites i
             where i.case_id = c.id and not i.revoked and i.expires_at > now()),
           (select count(*)
              from public.invite_sessions s
              join public.invites i on i.id = s.invite_id
             where i.case_id = c.id and s.ended_at is null and s.expires_at > now()),
           (select max(l.at) from public.audit_log l where l.case_id = c.id)
    from public.cases c
    where c.owner = p_haus
    order by c.created_at desc;
end;
$$;

-- Zugaenge eines Falls: wer wem einen Link gegeben hat. Niemals Token,
-- niemals Hash — der Klartext existiert seit 0004 ohnehin nirgends mehr.
create or replace function public.admin_zugaenge(p_fall uuid)
returns table(
  zugang_id       uuid,
  role            public.role,
  label           text,
  created_at      timestamptz,
  expires_at      timestamptz,
  revoked         boolean,
  sitzungen_aktiv bigint,
  zuletzt_gesehen timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not app.is_platform_admin() then
    raise exception 'Kein Zugriff auf die Plattform-Uebersicht' using errcode = '42501';
  end if;

  return query
    select i.id,
           i.role,
           i.label,
           i.created_at,
           i.expires_at,
           i.revoked,
           (select count(*) from public.invite_sessions s
             where s.invite_id = i.id and s.ended_at is null and s.expires_at > now()),
           (select max(s.last_seen_at) from public.invite_sessions s
             where s.invite_id = i.id)
    from public.invites i
    where i.case_id = p_fall
    order by i.created_at desc;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3  Protokoll
-- ═══════════════════════════════════════════════════════════════
-- p_fall = null: die ganze Plattform. Sonst ein einzelner Fall.
-- fall_ref kann leer sein: seit 0007 haengt das Protokoll an keinem
-- Fremdschluessel mehr und ueberdauert den geloeschten Fall. Fehlversuche
-- (invite.redeem.failed) gehoeren ohnehin zu keinem Fall.
-- p_limit wird nach oben auf 200 begrenzt, damit eine einzelne Abfrage das
-- Protokoll nicht in einem Zug herauszieht.
create or replace function public.admin_ereignisse(
  p_fall  uuid default null,
  p_limit int  default 50
)
returns table(
  at         timestamptz,
  action     text,
  actor_kind text,
  actor_ref  text,
  detail     jsonb,
  fall_ref   text
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_limit int;
begin
  if not app.is_platform_admin() then
    raise exception 'Kein Zugriff auf die Plattform-Uebersicht' using errcode = '42501';
  end if;

  v_limit := least(greatest(coalesce(p_limit, 50), 1), 200);

  return query
    select l.at,
           l.action,
           l.actor_kind,
           l.actor_ref,
           l.detail,
           c.ref
    from public.audit_log l
    left join public.cases c on c.id = l.case_id
    where p_fall is null or l.case_id = p_fall
    order by l.at desc, l.id desc
    limit v_limit;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4  Eingriffe
-- ═══════════════════════════════════════════════════════════════
-- Beide schreiben ins Protokoll, mit actor_kind = 'platform'. Damit ist im
-- Journal unterscheidbar, ob ein Haus selbst entzogen hat ('user') oder die
-- Plattform-Betreuung ('platform').

-- Entzug wirkt sofort: laufende Sitzungen enden mit — wie in
-- public.revoke_invite. Ein Entzug, der erst mit dem Ablauf greift, waere
-- kein Entzug.
create or replace function public.admin_zugang_zurueckziehen(p_zugang uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case uuid;
begin
  if not app.is_platform_admin() then
    raise exception 'Kein Zugriff auf die Plattform-Uebersicht' using errcode = '42501';
  end if;

  select i.case_id into v_case from public.invites i where i.id = p_zugang;

  if v_case is null then
    raise exception 'Zugang nicht gefunden' using errcode = 'P0002';
  end if;

  update public.invites set revoked = true where id = p_zugang;
  update public.invite_sessions
     set ended_at = now()
   where invite_id = p_zugang and ended_at is null;

  perform app.log(v_case, 'platform', coalesce(auth.uid()::text, '-'),
                  'admin.invite.revoke',
                  jsonb_build_object('invite_id', p_zugang));
end;
$$;

-- Einzelne Sitzung beenden, ohne den Zugang zu entziehen.
create or replace function public.admin_sitzung_beenden(p_sitzung uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case uuid;
  v_found boolean;
begin
  if not app.is_platform_admin() then
    raise exception 'Kein Zugriff auf die Plattform-Uebersicht' using errcode = '42501';
  end if;

  select i.case_id into v_case
  from public.invite_sessions s
  join public.invites i on i.id = s.invite_id
  where s.id = p_sitzung;

  v_found := found;

  if not v_found then
    raise exception 'Sitzung nicht gefunden' using errcode = 'P0002';
  end if;

  update public.invite_sessions
     set ended_at = now()
   where id = p_sitzung and ended_at is null;

  perform app.log(v_case, 'platform', coalesce(auth.uid()::text, '-'),
                  'admin.session.revoke',
                  jsonb_build_object('session_id', p_sitzung));
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 5  Rechtemodell
-- ═══════════════════════════════════════════════════════════════
-- Dieser Block steht bewusst am Dateiende, NACH allen CREATE FUNCTION.
-- Grund steht in 0005: ALTER DEFAULT PRIVILEGES hat auf dem echten Projekt
-- nicht gegriffen, neue Funktionen standen dort mit dem voreingestellten
-- EXECUTE fuer PUBLIC da. Nur ein Durchgang nach dem Anlegen erfasst sie.

revoke all on schema app from public, anon, authenticated;
revoke execute on all functions in schema app from public, anon, authenticated;

-- Namentlich, damit auch beim zweiten Durchlauf nichts stehen bleibt.
revoke execute on function public.admin_overview()                    from public, anon, authenticated;
revoke execute on function public.admin_haeuser()                     from public, anon, authenticated;
revoke execute on function public.admin_faelle(uuid)                  from public, anon, authenticated;
revoke execute on function public.admin_zugaenge(uuid)                from public, anon, authenticated;
revoke execute on function public.admin_ereignisse(uuid, int)         from public, anon, authenticated;
revoke execute on function public.admin_zugang_zurueckziehen(uuid)    from public, anon, authenticated;
revoke execute on function public.admin_sitzung_beenden(uuid)         from public, anon, authenticated;

-- Nur authenticated. anon bekommt keine einzige davon: der oeffentliche
-- Vertrag bleibt bei den drei Funktionen aus 0004.
-- Der Aufruf allein genuegt nicht — jede Funktion prueft zusaetzlich
-- app.is_platform_admin() und weist sonst mit 42501 ab.
grant execute on function public.admin_overview()                     to authenticated;
grant execute on function public.admin_haeuser()                      to authenticated;
grant execute on function public.admin_faelle(uuid)                   to authenticated;
grant execute on function public.admin_zugaenge(uuid)                 to authenticated;
grant execute on function public.admin_ereignisse(uuid, int)          to authenticated;
grant execute on function public.admin_zugang_zurueckziehen(uuid)     to authenticated;
grant execute on function public.admin_sitzung_beenden(uuid)          to authenticated;

-- Abschliessender Durchgang, letzte Anweisung der Datei: app.is_platform_admin()
-- entsteht weiter oben und wuerde sonst — je nach Projekt — mit PUBLIC EXECUTE
-- dastehen. Die Wiederholung ist Absicht, nicht Versehen.
revoke execute on all functions in schema app from public, anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- Verifikation — nur Diagnose, keine automatische Korrektur.
-- Einzeln ausfuehren.
-- ═══════════════════════════════════════════════════════════════
--
-- 1) anon darf keine einzige admin_*-Funktion ausfuehren.
--    Erwartet: darf_ausfuehren = false in jeder Zeile.
-- select p.proname,
--        pg_get_function_identity_arguments(p.oid) as args,
--        has_function_privilege('anon', p.oid, 'execute') as darf_ausfuehren
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.proname like 'admin\_%'
-- order by 1;
--
-- 2) Funktionen ohne eigene ACL — proacl is null bedeutet PUBLIC EXECUTE.
--    Erwartet: keine Zeile aus unserem Bestand (wie in 0004, Abfrage 1).
-- select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid), p.prosecdef
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null
-- order by 1, 2;
--
-- 3) Die Grenze aus dem Dateikopf, im Quelltext geprueft: keine
--    admin_*-Funktion nennt die Tabelle mit den Angaben zur verstorbenen
--    Person. Erwartet: liest_inhalt = false in jeder Zeile.
-- select p.proname,
--        pg_get_functiondef(p.oid) ilike '%deceased%' as liest_inhalt
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.proname like 'admin\_%'
-- order by 1;
--
-- 3b) Dieselbe Probe fuer die uebrigen Fallinhalte (Dokumentart,
--     Aufgabentitel). participants.org_name ist hier nicht enthalten, weil
--     profiles.org_name — der Name des Kundenhauses — erlaubt und in
--     admin_haeuser tatsaechlich enthalten ist; die Abgrenzung erfolgt ueber
--     die Tabelle, siehe Abfrage 4. Erwartet: liest_inhalt = false.
-- select p.proname,
--        pg_get_functiondef(p.oid) ~* '(doc_type|\mtitle\M)' as liest_inhalt
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.proname like 'admin\_%'
-- order by 1;
--
-- 4) Welche Tabellen nennt der Quelltext der admin_*-Funktionen ueberhaupt?
--    Erwartet: audit_log, cases, invite_sessions, invites, participants,
--    profiles — und sonst nichts. platform_admins erscheint hier nicht: die
--    Pruefung steckt in app.is_platform_admin().
--    (pg_depend taugt dafuer nicht: bei plpgsql wird der Rumpf erst zur
--    Laufzeit aufgeloest und steht deshalb in keiner Abhaengigkeit.)
-- select p.proname, m.tab
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- cross join lateral (
--   select distinct (regexp_matches(pg_get_functiondef(p.oid), 'public\.([a-z_]+)', 'g'))[1] as tab
-- ) m
-- join pg_class cl on cl.relname = m.tab and cl.relkind = 'r'
--      and cl.relnamespace = 'public'::regnamespace
-- where n.nspname = 'public' and p.proname like 'admin\_%'
-- order by 1, 2;
--
-- 5) Niemand aus der Anwendung sieht die Liste der Betreuungskonten.
--    Erwartet: 0 Zeilen.
-- select grantee, privilege_type from information_schema.role_table_grants
-- where table_schema = 'public' and table_name = 'platform_admins'
--   and grantee in ('anon','authenticated','PUBLIC');
--
-- 6) RLS auf platform_admins ist an und es gibt keine Policy.
--    Erwartet: relrowsecurity = true, anzahl_policies = 0.
-- select c.relrowsecurity,
--        (select count(*) from pg_policy pol where pol.polrelid = c.oid) as anzahl_policies
-- from pg_class c join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'public' and c.relname = 'platform_admins';
--
-- 7) Eintragen der Betreuung — von Hand, mit bekannter Kennung:
-- insert into public.platform_admins (user_id, note)
-- values ('<auth.users.id>', 'Plattform-Betreuung');
