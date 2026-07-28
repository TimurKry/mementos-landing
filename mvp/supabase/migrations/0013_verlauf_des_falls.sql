-- MementoOS MVP — Verlauf eines Vorgangs (0013)
--
-- Seit 0011 bestätigt ein Fahrdienst Zeiten, seit 0012 ändert die Familie
-- Angaben. Beides landet im Protokoll — und beides war für das
-- Bestattungshaus bis hierher unsichtbar. Daten ändern sich lautlos: das ist
-- genau die Eigenschaft, die man in einer Akte nicht haben will.
--
-- Der Grund war kein Versehen in der Regel, sondern eine fehlende Erlaubnis:
-- die Policy audit_owner (0004) gibt es, das dazugehörige
-- «grant select on audit_log» nie. Eine Policy ohne Grant lässt niemanden
-- durch — RLS verengt Rechte, sie verleiht keine.
--
-- ── Warum trotzdem kein einfaches GRANT ───────────────────────────────
-- audit_log.actor_ref trägt bei actor_kind = 'invite' die SITZUNGS-KENNUNG.
-- Eine Sitzung ist ein Schlüssel auf Vorzeigen: wer sie hat, darf
-- get_case_by_session, termin_bestaetigen und angaben_ergaenzen aufrufen.
--
-- Für das Haus wäre Lesen davon harmlos — es sieht seinen Fall ohnehin ganz.
-- Schreiben ist es nicht: mit einer fremden Sitzungs-Kennung könnte der
-- Eigentümer einen Termin bestätigen, und im Protokoll stünde danach, der
-- Fahrdienst habe zugesagt. Ein Journal, in dem sich Einträge unterschieben
-- lassen, ist kein Journal mehr.
--
-- Deshalb geht die Kennung gekürzt heraus: acht Zeichen genügen, um zwei
-- Beteiligte auseinanderzuhalten, und reichen für nichts sonst.
--
-- Dasselbe gilt für admin_ereignisse aus 0008 — die Funktion gab die volle
-- Kennung heraus. Das wird hier mitkorrigiert. Die Plattform-Betreuung ist
-- die vertrauteste Rolle im System, aber «vertraut» ist kein Grund, einen
-- Schlüssel weiterzureichen, den niemand braucht.
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0012 voraus.

-- ═══════════════════════════════════════════════════════════════
-- 1  Kennung kürzen
-- ═══════════════════════════════════════════════════════════════
-- Acht Zeichen einer UUID: genug, um «Fahrdienst A» von «Fahrdienst B» zu
-- unterscheiden, zu wenig, um irgendetwas damit aufzurufen.
create or replace function app.akteur_kurz(p_ref text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_ref is null or p_ref = '-' then null
    else left(p_ref, 8)
  end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2  Verlauf für den Eigentümer
-- ═══════════════════════════════════════════════════════════════
-- SECURITY DEFINER statt eines Tabellenrechts: so bleibt audit_log für
-- authenticated vollständig gesperrt, und die Kürzung lässt sich nicht
-- umgehen, indem jemand die Tabelle direkt liest.
create or replace function public.fall_verlauf(
  p_case  uuid,
  p_limit int default 50
)
returns table(
  at         timestamptz,
  action     text,
  actor_kind text,
  actor_ref  text,
  detail     jsonb
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
  if not public.is_case_owner(p_case) then
    raise exception 'Kein Zugriff auf diesen Fall' using errcode = '42501';
  end if;

  v_limit := least(greatest(coalesce(p_limit, 50), 1), 200);

  return query
    select l.at,
           l.action,
           l.actor_kind,
           app.akteur_kurz(l.actor_ref),
           l.detail
    from public.audit_log l
    where l.case_id = p_case
    order by l.at desc, l.id desc
    limit v_limit;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3  Nachtrag zu 0008: auch die Plattform-Übersicht kürzt
-- ═══════════════════════════════════════════════════════════════
-- Unverändert bis auf app.akteur_kurz(l.actor_ref) statt l.actor_ref.
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
           app.akteur_kurz(l.actor_ref),
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
-- 4  Rechte — bewusst als letzter Abschnitt der Datei
-- ═══════════════════════════════════════════════════════════════
-- Lehre aus 0005: ALTER DEFAULT PRIVILEGES greift auf diesem Projekt nicht.
revoke execute on all functions in schema app from public, anon, authenticated;
revoke all on schema app from public, anon, authenticated;

revoke execute on function public.fall_verlauf(uuid, int)
  from public, anon, authenticated;

-- Der öffentliche Vertrag bleibt bei fünf Funktionen: der Verlauf gehört dem
-- Haus, nicht dem äusseren Umkreis.
grant execute on function public.redeem_invite(text)        to anon, authenticated;
grant execute on function public.get_case_by_session(uuid)  to anon, authenticated;
grant execute on function public.end_session(uuid)          to anon, authenticated;
grant execute on function public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)
  to anon, authenticated;
grant execute on function public.angaben_ergaenzen(uuid, jsonb)
  to anon, authenticated;

grant execute on function public.fall_verlauf(uuid, int)           to authenticated;

-- Wird von den RLS-Regeln gebraucht; ohne diese Zeile fällt die gesamte RLS aus.
grant execute on function public.is_case_owner(uuid)               to authenticated;
grant execute on function public.create_invite(uuid, public.role)  to authenticated;
grant execute on function public.list_invites(uuid)                to authenticated;
grant execute on function public.revoke_invite(uuid)               to authenticated;
grant execute on function public.revoke_session(uuid)              to authenticated;

grant execute on function public.admin_overview()                        to authenticated;
grant execute on function public.admin_haeuser()                         to authenticated;
grant execute on function public.admin_faelle(uuid)                      to authenticated;
grant execute on function public.admin_fall(uuid)                        to authenticated;
grant execute on function public.admin_zugaenge(uuid)                    to authenticated;
grant execute on function public.admin_ereignisse(uuid, int)             to authenticated;
grant execute on function public.admin_zugang_zurueckziehen(uuid)        to authenticated;
grant execute on function public.admin_sitzung_beenden(uuid)             to authenticated;

-- ═══════════════════════════════════════════════════════════════
-- Verifikation — einzeln ausführen.
-- ═══════════════════════════════════════════════════════════════
--
-- 1) audit_log bleibt direkt unlesbar — erwartet: f, f.
-- select has_table_privilege('authenticated','public.audit_log','select'),
--        has_table_privilege('anon','public.audit_log','select');
--
-- 2) Keine volle Sitzungs-Kennung im Verlauf — erwartet: 0.
-- select count(*) from public.fall_verlauf('<fall-uuid>') where length(actor_ref) > 8;
--
-- 3) Fremder Fall — erwartet: «Kein Zugriff auf diesen Fall», errcode 42501.
-- select * from public.fall_verlauf('<fremde-uuid>');
--
-- 4) Keine Funktion ohne eigene ACL — erwartet: 0.
-- select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null;
