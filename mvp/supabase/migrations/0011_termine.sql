-- MementoOS MVP — Termine eines Vorgangs (0011)
--
-- Bis hierher hatte ein Vorgang genau ein Datum: cases.target_date. Deshalb
-- sah ein Fahrdienst zwar den Namen der verstorbenen Person, aber nicht,
-- WANN und WO abzuholen ist — diese Felder gab es schlicht nicht. Ein
-- Krematorium konnte keinen Plan aufstellen, eine Floristik nicht wissen,
-- wohin die Blumen sollen.
--
-- Ein Termin ist deshalb eine eigene Sache: Zeitfenster, Ort, zuständige
-- Rolle, Zustand.
--
-- ── Zwei Matrizen, nicht eine ─────────────────────────────────────────
-- Sehen und ändern sind verschiedene Rechte, und sie fallen hier bewusst
-- auseinander:
--
--   app.termine_fuer_rolle(rolle)     — welche Terminarten sieht eine Rolle
--   app.darf_bestaetigen(rolle, art)  — welche darf sie bestätigen
--
-- Eine Floristik sieht die Trauerfeier, bestätigen kann sie sie nicht. Ein
-- Krematorium sieht die Überführung, bestätigt aber nur die Einäscherung.
--
-- ── Bemerkenswert: Floristik, Redner und Steinmetz ────────────────────
-- Nach der Feldmatrix (app.allowed_tiers, 0004) sehen diese drei Rollen von
-- der verstorbenen Person NICHTS — kein Name, kein Datum, nichts. Das bleibt
-- so. Zeit und Ort der Trauerfeier brauchen sie trotzdem, sonst wissen sie
-- nicht, wohin die Blumen sollen und wann zu sprechen ist. Der Termin gibt
-- ihnen genau das und kein Feld mehr über den Menschen.
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0010 voraus.

-- ═══════════════════════════════════════════════════════════════
-- 1  Typen
-- ═══════════════════════════════════════════════════════════════
do $$
begin
  if not exists (select 1 from pg_type where typname = 'termin_art') then
    create type public.termin_art as enum (
      'abholung',       -- Abholung der verstorbenen Person
      'ueberfuehrung',  -- Fahrt zum Krematorium oder zur Kühlung
      'einaescherung',
      'trauerfeier',
      'beisetzung',
      'abschiednahme'   -- Abschied der Angehörigen am Sarg
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'termin_status') then
    create type public.termin_status as enum
      ('geplant','bestaetigt','erledigt','abgesagt');
  end if;
end
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2  Tabelle
-- ═══════════════════════════════════════════════════════════════
-- von/bis dürfen leer sein: ein Termin ist oft angelegt, bevor die Zeit
-- feststeht. Zwei Zeitpunkte statt einem, weil eine Abholung in der Praxis
-- ein Fenster ist («zwischen 8 und 10»), kein Zeitpunkt.
create table if not exists public.termine (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.cases(id) on delete cascade,
  art         public.termin_art not null,
  von         timestamptz,
  bis         timestamptz,
  ort_name    text,
  ort_adresse text,
  zustaendig  public.role,
  status      public.termin_status not null default 'geplant',
  hinweis     text,
  created_at  timestamptz not null default now()
);

create index if not exists termine_case_id_idx on public.termine (case_id);
create index if not exists termine_von_idx     on public.termine (von);

alter table public.termine enable row level security;

-- Wie bei den übrigen Kindtabellen aus 0002: der Eigentümer des Vorgangs
-- darf alles, sonst niemand direkt.
drop policy if exists termine_owner on public.termine;
create policy termine_owner on public.termine
  for all using (public.is_case_owner(case_id))
  with check (public.is_case_owner(case_id));

grant select, insert, update, delete on public.termine to authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 3  Sichtbarkeit: welche Terminarten sieht eine Rolle
-- ═══════════════════════════════════════════════════════════════
create or replace function app.termine_fuer_rolle(p_role public.role)
returns public.termin_art[]
language sql
immutable
set search_path = ''
as $$
  select case p_role
    when 'bestatter'::public.role then
      array['abholung','ueberfuehrung','einaescherung',
            'trauerfeier','beisetzung','abschiednahme']::public.termin_art[]
    when 'transport'::public.role then
      array['abholung','ueberfuehrung']::public.termin_art[]
    when 'krematorium'::public.role then
      array['ueberfuehrung','einaescherung']::public.termin_art[]
    when 'friedhof'::public.role then
      array['beisetzung']::public.termin_art[]
    when 'familie'::public.role then
      array['abholung','abschiednahme','trauerfeier','beisetzung']::public.termin_art[]
    when 'klinik'::public.role then
      array['abholung']::public.termin_art[]
    -- Sehen Ort und Zeit, aber nichts über die verstorbene Person:
    when 'floristik'::public.role then
      array['trauerfeier','beisetzung']::public.termin_art[]
    when 'redner'::public.role then
      array['trauerfeier']::public.termin_art[]
    when 'steinmetz'::public.role then
      array['beisetzung']::public.termin_art[]
    else array[]::public.termin_art[]   -- standesamt, verbund
  end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4  Änderungsrecht: wer darf welchen Termin bestätigen
-- ═══════════════════════════════════════════════════════════════
-- Bewusst getrennt von der Sichtbarkeit. Der Eigentümer (bestatter) pflegt
-- Termine direkt über die Regel termine_owner; diese Funktion gilt nur für
-- Eingeladene ohne Konto.
create or replace function app.darf_bestaetigen(
  p_role public.role, p_art public.termin_art
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_role = 'transport'::public.role
      then p_art in ('abholung'::public.termin_art, 'ueberfuehrung'::public.termin_art)
    when p_role = 'krematorium'::public.role
      then p_art = 'einaescherung'::public.termin_art
    when p_role = 'friedhof'::public.role
      then p_art = 'beisetzung'::public.termin_art
    else false
  end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 5  Termine im rollengefilterten Fall mitliefern
-- ═══════════════════════════════════════════════════════════════
-- app.case_for_role bekommt den Schlüssel «termine». Gefiltert wird nach
-- Terminart; darf_bestaetigen kommt je Zeile mit, damit die Oberfläche weiss,
-- ob sie eine Schaltfläche zeigen darf — die Entscheidung selbst trifft
-- weiterhin die Datenbank in termin_bestaetigen.
create or replace function app.case_for_role(p_case uuid, p_role public.role)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'ref',            c.ref,
    'bestattungsart', c.bestattungsart,
    'phase',          c.phase,
    'target_date',    c.target_date,
    'role',           p_role,
    'verstorbene',    app.deceased_for_role(p_case, p_role),
    'beteiligte', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'role', pt.role,
        'org',  case when p_role = 'bestatter'::public.role then pt.org_name else null end,
        'joined', pt.joined
      ) order by pt.sort), '[]'::jsonb)
      from public.participants pt where pt.case_id = p_case
    ),
    'aufgaben', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'title', tk.title, 'assignee', tk.assignee, 'due', tk.due, 'status', tk.status
      )), '[]'::jsonb)
      from public.tasks tk where tk.case_id = p_case
        and (p_role = 'bestatter'::public.role or tk.assignee = p_role)
    ),
    'dokumente', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', dc.id, 'doc_type', dc.doc_type, 'verified', dc.verified
      )), '[]'::jsonb)
      from public.documents dc where dc.case_id = p_case
        and (p_role = 'bestatter'::public.role or p_role = any(dc.visible_to))
    ),
    'termine', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id',               tm.id,
        'art',              tm.art,
        'von',              tm.von,
        'bis',              tm.bis,
        'ort_name',         tm.ort_name,
        'ort_adresse',      tm.ort_adresse,
        'status',           tm.status,
        'hinweis',          tm.hinweis,
        'darf_bestaetigen', app.darf_bestaetigen(p_role, tm.art)
      ) order by tm.von asc nulls last), '[]'::jsonb)
      from public.termine tm
      where tm.case_id = p_case
        and tm.art = any(app.termine_fuer_rolle(p_role))
    )
  )
  from public.cases c where c.id = p_case;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6  Bestätigen durch Eingeladene
-- ═══════════════════════════════════════════════════════════════
-- Gibt false zurück statt zu werfen — wie redeem_invite. Die Oberfläche muss
-- «darf nicht» von «ist kaputt» unterscheiden können.
--
-- Ins Protokoll geht nur Art und Rolle. Adresse und Hinweis sind Freitext
-- und bleiben draussen: dort kann alles stehen.
create or replace function public.termin_bestaetigen(
  p_session uuid,
  p_termin  uuid,
  p_von     timestamptz,
  p_bis     timestamptz,
  p_hinweis text
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case uuid;
  v_role public.role;
  v_art  public.termin_art;
begin
  -- Sitzung lebendig, Einladung gültig?
  select i.case_id, i.role
    into v_case, v_role
  from public.invite_sessions s
  join public.invites i on i.id = s.invite_id
  where s.id = p_session
    and s.ended_at is null
    and s.expires_at > now()
    and not i.revoked
    and i.expires_at > now();

  if not found then
    return false;
  end if;

  -- Gehört der Termin zu DIESEM Vorgang? Sonst liesse sich mit einer
  -- gültigen Sitzung ein fremder Termin ändern.
  select tm.art into v_art
  from public.termine tm
  where tm.id = p_termin and tm.case_id = v_case;

  if not found then
    return false;
  end if;

  if not app.darf_bestaetigen(v_role, v_art) then
    return false;
  end if;

  update public.termine
     set von     = p_von,
         bis     = p_bis,
         hinweis = p_hinweis,
         status  = 'bestaetigt'::public.termin_status
   where id = p_termin;

  perform app.log(v_case, 'invite', p_session::text, 'termin.bestaetigt',
                  jsonb_build_object('art', v_art, 'role', v_role));

  return true;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 7  Rechte — bewusst als letzter Abschnitt der Datei
-- ═══════════════════════════════════════════════════════════════
-- Lehre aus 0005: ALTER DEFAULT PRIVILEGES greift auf diesem Projekt nicht.
-- Was nach diesem Block angelegt wird, behielte das voreingestellte
-- PUBLIC EXECUTE. Deshalb steht hier nichts mehr hinter.
revoke execute on all functions in schema app from public, anon, authenticated;
revoke all on schema app from public, anon, authenticated;

revoke execute on function public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)
  from public, anon, authenticated;

-- Der öffentliche Vertrag: jetzt vier Funktionen für anon.
grant execute on function public.redeem_invite(text)        to anon, authenticated;
grant execute on function public.get_case_by_session(uuid)  to anon, authenticated;
grant execute on function public.end_session(uuid)          to anon, authenticated;
grant execute on function public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)
  to anon, authenticated;

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
-- 1) Was darf anon ausführen? Erwartet: redeem_invite, get_case_by_session,
--    end_session, termin_bestaetigen — und sonst nichts.
-- select n.nspname, p.proname
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and has_function_privilege('anon', p.oid, 'execute')
-- order by 1, 2;
--
-- 2) Keine Funktion ohne eigene ACL — erwartet: 0.
-- select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null;
--
-- 3) anon kommt nicht an die Tabelle — erwartet: permission denied.
-- set role anon; insert into public.termine (case_id, art) values (gen_random_uuid(), 'abholung');
--
-- 4) Sichtbarkeit je Rolle — erwartet: transport sieht abholung/ueberfuehrung,
--    floristik trauerfeier/beisetzung, standesamt nichts.
-- select r, app.termine_fuer_rolle(r)
-- from unnest(enum_range(null::public.role)) r;
--
-- 5) Änderungsrecht — erwartet: nur transport/krematorium/friedhof, je eigene Art.
-- select r, a, app.darf_bestaetigen(r, a)
-- from unnest(enum_range(null::public.role)) r,
--      unnest(enum_range(null::public.termin_art)) a
-- where app.darf_bestaetigen(r, a);
--
-- 6) Im Protokoll steht kein Freitext — erwartet: nur art und role.
-- select action, detail from public.audit_log where action = 'termin.bestaetigt';
