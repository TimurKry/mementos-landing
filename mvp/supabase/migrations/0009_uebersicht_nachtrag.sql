-- MementoOS MVP — Nachtrag zur Plattform-Uebersicht (0009)
--
-- Drei Nachbesserungen an 0008. Die Datei 0008 bleibt unangetastet: sie ist
-- angewendet, was danach kommt, kommt als eigener Schritt — sonst weiss
-- niemand mehr, welcher Stand auf welcher Datenbank liegt.
--
-- 1) admin_zugaenge gibt invites.label nicht mehr heraus.
--    Die Merkhilfe ist Freitext des Hauses («Familie Weber», «Frau M.,
--    Tochter»). Formal ist sie kein Feld der verstorbenen Person und faellt
--    deshalb durch jede Feldpruefung — der Sache nach traegt sie genau die
--    Personenangaben, die die Plattform-Betreuung nicht sehen soll. Zum
--    Steuern der Plattform genuegt die Rolle: sie sagt, WEM Zugang gegeben
--    wurde (Familie, Krematorium, Transport …), und mehr wird hier nicht
--    gebraucht.
--    Weggenommen wird in der Datenbank, nicht im Bildschirm: solange die
--    Funktion die Spalte liefert, ist sie ueber die API abrufbar, gleich was
--    die Oberflaeche daraus macht. Im Arbeitsbereich des Hauses bleibt die
--    Merkhilfe (public.list_invites aus 0004) — dort ist sie am Platz, das
--    Haus schreibt sie fuer den eigenen Fall.
--
-- 2) admin_zugaenge liefert die offenen Sitzungen mit Kennung (Spalte
--    «sitzungen»), nicht nur ihre Anzahl. Ohne Kennung liess sich
--    admin_sitzung_beenden(p_sitzung) aus der Oberflaeche gar nicht aufrufen:
--    der Knopf war da, das Argument fehlte. Die Anzahl (sitzungen_aktiv)
--    bleibt — sie ist zum Ueberfliegen bequemer als das Zaehlen eines Arrays.
--
-- 3) admin_fall(p_fall) — ein Vorgang samt seinem Haus in einem Aufruf.
--    Bisher musste die Anwendung ohne Vorwissen ueber das Haus jede Liste
--    durchgehen (ein Aufruf je Haus), nur um die Brotkrumen zu bauen.
--
-- Beide Funktionen entstehen ueber DROP + CREATE, nicht ueber CREATE OR
-- REPLACE: der Rueckgabetyp einer Funktion laesst sich mit REPLACE nicht
-- aendern, eine Spalte entfaellt also nur mit der Funktion selbst. Das ist
-- hier erwuenscht — mit der Funktion verschwindet ihre ACL, und die Rechte
-- werden am Dateiende neu und vollstaendig gesetzt (Lehre aus 0004).
--
-- Die Grenze aus 0008 gilt unveraendert: keine dieser Funktionen liest
-- deceased, documents.doc_type, tasks.title oder participants.org_name.
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0008 voraus.
--
-- Abschnitte:
--   1 admin_zugaenge ohne Merkhilfe, mit Sitzungen
--   2 admin_fall
--   3 Rechtemodell (bewusst am Dateiende)
--     Verifikation (auskommentiert)

-- ═══════════════════════════════════════════════════════════════
-- 1  admin_zugaenge — ohne Merkhilfe, mit den offenen Sitzungen
-- ═══════════════════════════════════════════════════════════════
-- Weiterhin: niemals Token, niemals Hash — den Klartext gibt es seit 0004
-- ohnehin nirgends mehr.
--
-- «sitzungen» enthaelt ausschliesslich offene Sitzungen (ended_at is null und
-- expires_at > now()), juengste zuerst. Beendete Sitzungen stehen im
-- Protokoll und gehoeren nicht in eine Liste, die zum Eingreifen da ist.
-- Leere Liste = '[]', nicht null: die Oberflaeche soll nicht zwischen «keine
-- Sitzung» und «nichts geliefert» raten muessen.
drop function if exists public.admin_zugaenge(uuid);

create function public.admin_zugaenge(p_fall uuid)
returns table(
  zugang_id       uuid,
  role            public.role,
  created_at      timestamptz,
  expires_at      timestamptz,
  revoked         boolean,
  sitzungen_aktiv bigint,
  zuletzt_gesehen timestamptz,
  sitzungen       jsonb
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
           i.created_at,
           i.expires_at,
           i.revoked,
           (select count(*) from public.invite_sessions s
             where s.invite_id = i.id and s.ended_at is null and s.expires_at > now()),
           (select max(s.last_seen_at) from public.invite_sessions s
             where s.invite_id = i.id),
           (select coalesce(
                     jsonb_agg(
                       jsonb_build_object(
                         'id',           s.id,
                         'created_at',   s.created_at,
                         'last_seen_at', s.last_seen_at,
                         'expires_at',   s.expires_at
                       )
                       order by s.last_seen_at desc
                     ),
                     '[]'::jsonb)
              from public.invite_sessions s
             where s.invite_id = i.id
               and s.ended_at is null
               and s.expires_at > now())
    from public.invites i
    where i.case_id = p_fall
    order by i.created_at desc;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2  admin_fall — ein Vorgang mit seinem Haus
-- ═══════════════════════════════════════════════════════════════
-- Gleiche Zusammensetzung wie eine Zeile aus admin_faelle, dazu haus_id und
-- org_name fuer die Brotkrumen. Hoechstens eine Zeile; ein unbekannter
-- Vorgang ergibt keine — die Anwendung zeigt daraufhin ihre eigene
-- «nicht gefunden»-Seite und nicht etwa einen Fehler der Datenbank.
--
-- Von der verstorbenen Person steht auch hier nichts: Nummer, Phase,
-- Termine, Anzahlen. «beteiligte» ist eine blosse Anzahl — welche Firmen
-- beteiligt sind, bleibt beim Haus.
--
-- org_name ist der Name des Kundenhauses (public.profiles), nicht der Name
-- eines Beteiligten aus dem Fall; die Abgrenzung ist dieselbe wie in
-- admin_haeuser.
drop function if exists public.admin_fall(uuid);

create function public.admin_fall(p_fall uuid)
returns table(
  fall_id           uuid,
  ref               text,
  phase             public.case_phase,
  created_at        timestamptz,
  target_date       date,
  beteiligte        bigint,
  zugaenge_aktiv    bigint,
  sitzungen_aktiv   bigint,
  letzte_aktivitaet timestamptz,
  haus_id           uuid,
  org_name          text
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
           (select max(l.at) from public.audit_log l where l.case_id = c.id),
           p.id,
           p.org_name
    from public.cases c
    -- left join: ein Vorgang darf in der Uebersicht nicht verschwinden, nur
    -- weil zu seinem Eigentuemer kein Profil auffindbar ist.
    left join public.profiles p on p.id = c.owner
    where c.id = p_fall;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3  Rechtemodell
-- ═══════════════════════════════════════════════════════════════
-- Wie in 0008 bewusst am Dateiende, NACH allen CREATE FUNCTION: auf dem
-- echten Projekt hat ALTER DEFAULT PRIVILEGES nicht gegriffen, neue
-- Funktionen standen mit dem voreingestellten EXECUTE fuer PUBLIC da (0005).
-- Fuer die beiden hier neu angelegten Funktionen gilt das genauso — ihre
-- alte ACL ist mit dem DROP verschwunden.

revoke all on schema app from public, anon, authenticated;
revoke execute on all functions in schema app from public, anon, authenticated;

-- Namentlich, damit auch beim zweiten Durchlauf nichts stehen bleibt.
revoke execute on function public.admin_zugaenge(uuid) from public, anon, authenticated;
revoke execute on function public.admin_fall(uuid)     from public, anon, authenticated;

-- Nur authenticated. anon bekommt keine der beiden: der oeffentliche Vertrag
-- bleibt bei den drei Funktionen aus 0004. Der Aufruf allein genuegt nicht —
-- beide pruefen zusaetzlich app.is_platform_admin() und weisen sonst mit
-- 42501 ab.
grant execute on function public.admin_zugaenge(uuid) to authenticated;
grant execute on function public.admin_fall(uuid)     to authenticated;

-- Abschliessender Durchgang, letzte Anweisung der Datei — wie in 0008.
-- app.is_platform_admin() wird hier zwar nicht neu angelegt, aber die
-- Wiederholung kostet nichts und haelt die Regel an einer Stelle: nach jedem
-- Anlegen von Funktionen ein Durchgang. Absicht, nicht Versehen.
revoke execute on all functions in schema app from public, anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- Verifikation — nur Diagnose, keine automatische Korrektur.
-- Einzeln ausfuehren. Ergaenzt den Block aus 0008.
-- ═══════════════════════════════════════════════════════════════
--
-- 1) Die Merkhilfe ist aus der Uebersicht verschwunden — im Ergebnistyp …
--    Erwartet: keine Spalte «label» bei admin_zugaenge.
-- select p.proname, pg_get_function_result(p.oid) as ergebnis
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.proname in ('admin_zugaenge','admin_fall')
-- order by 1;
--
-- 2) … und im Quelltext. Erwartet: nennt_label = false in jeder Zeile.
-- select p.proname,
--        pg_get_functiondef(p.oid) ~* '\mlabel\M' as nennt_label
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.proname like 'admin\_%'
-- order by 1;
--
-- 3) anon darf die beiden neuen Funktionen nicht ausfuehren.
--    Erwartet: darf_ausfuehren = false in jeder Zeile.
-- select p.proname,
--        has_function_privilege('anon', p.oid, 'execute') as darf_ausfuehren
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.proname like 'admin\_%'
-- order by 1;
--
-- 4) Funktionen ohne eigene ACL — proacl is null bedeutet PUBLIC EXECUTE.
--    Erwartet: 0 Zeilen aus unserem Bestand.
-- select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null
-- order by 1, 2;
--
-- 5) Die Grenze aus 0008, erneut geprueft (deceased / doc_type / title).
--    Erwartet: liest_inhalt = false in jeder Zeile.
-- select p.proname,
--        (pg_get_functiondef(p.oid) ilike '%deceased%'
--         or pg_get_functiondef(p.oid) ~* '(doc_type|\mtitle\M)') as liest_inhalt
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and p.proname like 'admin\_%'
-- order by 1;
--
-- 6) Sitzungen kommen als Array mit Kennung an.
--    Erwartet: jsonb_typeof = 'array' (Beispielaufruf als Betreuungskonto).
-- select jsonb_typeof(sitzungen), sitzungen_aktiv
-- from public.admin_zugaenge('<fall-uuid>');
