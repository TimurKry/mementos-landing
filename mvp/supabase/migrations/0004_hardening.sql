-- MementoOS MVP — Härtung (0004)
-- Schliesst zwei Lücken aus 0001–0003:
--   #1  CREATE FUNCTION vergibt in PostgreSQL standardmässig EXECUTE an PUBLIC.
--       get_case_for_role() / deceased_for_role() sind SECURITY DEFINER und
--       waren damit über PostgREST auch anonym aufrufbar.
--   #2  resolve_invite() war an anon vergeben und gab die case_id heraus.
--       Damit liess sich aus einem gültigen Familien-Link ein Aufruf mit der
--       Rolle 'bestatter' bauen (Rechteausweitung ohne Raten).
-- Ursache: die Rolle kam als Argument statt aus der Einladungszeile.
--
-- Ab hier gilt: die Rolle wird immer aus public.invites gelesen, die case_id
-- verlässt den Server nie, und der öffentliche Vertrag besteht aus genau drei
-- Funktionen (redeem_invite, get_case_by_session, end_session).
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0003 voraus.
-- Regel für spätere Prüfungen: Funktionen fremder Herkunft (Erweiterungen,
-- Supabase-eigene Objekte) werden hier weder ge-revoked noch gedroppt,
-- sondern nur aufgelistet und gesondert bewertet.
--
-- Abschnitte:
--   1 Schema app + Default-Rechte      7 Interne Funktionen in app/
--   2 Alte Signaturen entfernen        8 Öffentlicher Vertrag
--   3 Bausteine (Token, Hash)          9 Rechtemodell
--   4 invites: Hash statt Klartext    10 cases.ref
--   5 invite_sessions                 11 Profil beim ersten Anmelden
--   6 audit_log                          Verifikation (auskommentiert)

-- ═══════════════════════════════════════════════════════════════
-- 1  Private Schema + Default-Rechte
-- ═══════════════════════════════════════════════════════════════
-- app/ ist nicht Teil des von PostgREST exponierten Schemas (nur 'public')
-- und erhält bewusst kein USAGE für anon/authenticated. Innerhalb von
-- SECURITY DEFINER werden Rechte gegen den Eigentümer geprüft, deshalb
-- funktioniert public.get_case_by_session → app.case_for_role trotzdem.
create schema if not exists app;

-- REIHENFOLGE IST KRITISCH: ALTER DEFAULT PRIVILEGES wirkt NICHT rückwirkend.
-- Diese beiden Zeilen müssen vor dem ersten CREATE FUNCTION stehen, sonst
-- erben alle unten angelegten Funktionen wieder EXECUTE für PUBLIC.
alter default privileges in schema public revoke execute on functions from public, anon;
alter default privileges in schema app    revoke execute on functions from public, anon;

-- ═══════════════════════════════════════════════════════════════
-- 2  Alte Signaturen entfernen
-- ═══════════════════════════════════════════════════════════════
-- Die ACL einer Funktion verschwindet mit der Funktion — das ist der
-- eigentliche Verschluss von #1 und #2. Kein CREATE OR REPLACE mit neuer
-- Signatur: das erzeugt nur eine Überladung, die alte Fassung bliebe mit
-- PUBLIC EXECUTE bestehen und die Migration sähe trotzdem grün aus.
drop function if exists public.get_case_by_invite(uuid);
drop function if exists public.resolve_invite(uuid);
drop function if exists public.get_case_for_role(uuid, public.role);
drop function if exists public.deceased_for_role(uuid, public.role);
drop function if exists public.allowed_tiers(public.role);

-- is_case_owner NICHT droppen: an ihr hängen die RLS-Policies aus 0002.
-- Nur neu fassen (search_path = '') und die Rechte in Abschnitt 9 neu ziehen.
create or replace function public.is_case_owner(p_case uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cases c
    where c.id = p_case and c.owner = auth.uid()
  );
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3  Bausteine: Token und Hash
-- ═══════════════════════════════════════════════════════════════
-- Alle Funktionen in app/ laufen mit search_path = ''. Damit ist nichts
-- Unqualifiziertes mehr auflösbar — auch Enum-Literale nicht — und Angriffe
-- über pg_temp laufen ins Leere. pg_catalog bleibt implizit erreichbar,
-- Standardfunktionen brauchen deshalb keine Qualifizierung.

-- sha256() ist seit PostgreSQL 11 eingebaut (pg_catalog). pgcrypto wird
-- bewusst nicht verwendet: es liegt in Supabase im Schema extensions und
-- wäre bei search_path = '' eine zusätzliche Abhängigkeit.
create or replace function app.hash_token(p_token text)
returns bytea
language sql
immutable
set search_path = ''
as $$
  select sha256(convert_to(p_token, 'UTF8'));
$$;

-- Neues Token: zwei UUIDs aus pg_strong_random, hex verkettet
-- → 64 Zeichen, 256 Bit Entropie.
create or replace function app.new_token()
returns text
language sql
volatile
set search_path = ''
as $$
  select replace(gen_random_uuid()::text, '-', '')
      || replace(gen_random_uuid()::text, '-', '');
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4  invites: Hash statt Klartext
-- ═══════════════════════════════════════════════════════════════
alter table public.invites add column if not exists id         uuid not null default gen_random_uuid();
alter table public.invites add column if not exists token_hash bytea;
alter table public.invites add column if not exists label      text;   -- Merkhilfe für den Bestatter, z. B. «Familie Weber»

-- Bestand übernehmen, solange die Klartextspalte noch existiert.
-- Diese Token lagen im Klartext in der Datenbank und gelten damit als
-- offengelegt: sie werden übernommen, aber zugleich zurückgezogen. Der
-- Hash ist nötig, damit die NOT-NULL- und UNIQUE-Bedingung greift; gültig
-- bleiben soll keiner davon. Neue Links erzeugt der Bestatter über
-- create_invite(). Das betrifft ausschliesslich Bestandsdaten — bei einer
-- Neuinstallation ist die Tabelle leer.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'invites' and column_name = 'token'
  ) then
    update public.invites
       set token_hash = app.hash_token(token::text),
           revoked    = true
     where token_hash is null;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'invites'
      and column_name = 'token_hash' and is_nullable = 'YES'
  ) then
    alter table public.invites alter column token_hash set not null;
  end if;
end
$$;

create unique index if not exists invites_token_hash_key on public.invites (token_hash);

-- Primärschlüssel von token auf id umstellen.
do $$
declare
  v_pk text;
begin
  select con.conname into v_pk
  from pg_constraint con
  where con.conrelid = 'public.invites'::regclass and con.contype = 'p';

  if v_pk is not null and exists (
    select 1
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where con.conname = v_pk and con.conrelid = 'public.invites'::regclass
      and att.attname = 'token'
  ) then
    execute format('alter table public.invites drop constraint %I', v_pk);
    v_pk := null;
  end if;

  if v_pk is null then
    alter table public.invites add constraint invites_pkey primary key (id);
  end if;
end
$$;

-- Das Klartext-Token wird entfernt: in der Datenbank bleibt nur der Hash.
alter table public.invites drop column if exists token;

-- Ohne diese Prüfung genügt ein Vertipper in der Oberfläche, um einen Link
-- ohne Konto mit vollem Zugriff auszugeben.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'invites_role_not_bestatter'
      and conrelid = 'public.invites'::regclass
  ) then
    alter table public.invites add constraint invites_role_not_bestatter
      check (role <> 'bestatter'::public.role) not valid;
  end if;
end
$$;

-- Schlägt fehl, falls im Bestand ein solcher Link existiert — das ist gewollt.
alter table public.invites validate constraint invites_role_not_bestatter;

-- ═══════════════════════════════════════════════════════════════
-- 5  invite_sessions: Sitzung statt Dauertoken in der Adresszeile
-- ═══════════════════════════════════════════════════════════════
-- Bringt sofortigen Entzug, kurze Laufzeit, eine stabile Kennung für das
-- Protokoll und die Möglichkeit, das Token aus der URL zu nehmen.
create table if not exists public.invite_sessions (
  id           uuid primary key default gen_random_uuid(),
  invite_id    uuid not null references public.invites(id) on delete cascade,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '12 hours'),
  ended_at     timestamptz
);
create index if not exists invite_sessions_invite_id_idx on public.invite_sessions (invite_id);

alter table public.invite_sessions enable row level security;

-- Nur der Eigentümer des Falls sieht die Sitzungen und darf sie beenden.
-- Angelegt werden sie ausschliesslich von public.redeem_invite().
drop policy if exists invite_sessions_owner_select on public.invite_sessions;
create policy invite_sessions_owner_select on public.invite_sessions
  for select using (
    exists (
      select 1 from public.invites i
      where i.id = invite_id and public.is_case_owner(i.case_id)
    )
  );

drop policy if exists invite_sessions_owner_update on public.invite_sessions;
create policy invite_sessions_owner_update on public.invite_sessions
  for update using (
    exists (
      select 1 from public.invites i
      where i.id = invite_id and public.is_case_owner(i.case_id)
    )
  ) with check (
    exists (
      select 1 from public.invites i
      where i.id = invite_id and public.is_case_owner(i.case_id)
    )
  );

grant select, update on public.invite_sessions to authenticated;
revoke insert, delete on public.invite_sessions from public, anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 6  audit_log: in Betrieb und nur anfügbar
-- ═══════════════════════════════════════════════════════════════
-- Fehlversuche gehören zu keinem Fall.
alter table public.audit_log alter column case_id drop not null;

alter table public.audit_log add column if not exists actor_kind text;   -- 'invite' | 'user' | 'system'
alter table public.audit_log add column if not exists actor_ref  text;   -- Sitzungs- oder Nutzerkennung
alter table public.audit_log add column if not exists detail     jsonb;

-- Ein Trigger greift auch beim Tabelleneigentümer, blosse GRANTs nicht.
-- TRUNCATE ist mit abgedeckt, sonst bliebe das Protokoll in einem Schritt löschbar.
create or replace function app.audit_log_append_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_log ist ausschliesslich anfügbar (% nicht zulässig)', tg_op
    using errcode = '42501';
  return null;
end;
$$;

drop trigger if exists audit_log_append_only on public.audit_log;
create trigger audit_log_append_only
  before update or delete or truncate on public.audit_log
  for each statement execute function app.audit_log_append_only();

-- Geschrieben wird nur über app.log(); die Funktion läuft als Eigentümer.
-- Kein FORCE ROW LEVEL SECURITY — sonst wäre zusätzlich eine INSERT-Policy nötig.
revoke insert, update, delete on public.audit_log from public, anon, authenticated;

-- Verwendete Aktionen: invite.redeem · invite.redeem.failed · invite.create ·
-- invite.revoke · session.end · session.revoke · case.view

-- ═══════════════════════════════════════════════════════════════
-- 7  Interne Funktionen in app/
-- ═══════════════════════════════════════════════════════════════

-- Welche Feldgruppen darf eine Rolle von der verstorbenen Person lesen?
-- Matrix unverändert aus 0003 übernommen; das TS-Spiegelbild in
-- mvp/src/lib/access.ts bleibt damit gültig.
create or replace function app.allowed_tiers(p_role public.role)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select case p_role
    when 'bestatter'::public.role   then array['kern','org','op','sens']
    when 'familie'::public.role     then array['kern','org','op']       -- keine Medizin-Details
    when 'krematorium'::public.role then array['kern','op','sens']      -- sicherheitskritisch
    when 'transport'::public.role   then array['kern','op']             -- Name + Handhabung
    when 'friedhof'::public.role    then array['kern','org']
    when 'standesamt'::public.role  then array['kern','org']
    when 'klinik'::public.role      then array['kern','op','sens']
    when 'verbund'::public.role     then array['kern']
    else array[]::text[]                                                -- floristik/redner/steinmetz: nichts
  end;
$$;

-- Verstorbene Person als JSON, gefiltert nach erlaubten Feldgruppen.
create or replace function app.deceased_for_role(p_case uuid, p_role public.role)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with d as (select * from public.deceased where case_id = p_case),
       t as (select app.allowed_tiers(p_role) as tiers)
  select coalesce(
    (case when 'kern' = any(t.tiers) then jsonb_build_object(
        'vorname', d.vorname, 'nachname', d.nachname) else '{}'::jsonb end)
    || (case when 'org' = any(t.tiers) then jsonb_build_object(
        'geburtsdatum', d.geburtsdatum, 'sterbedatum', d.sterbedatum,
        'konfession', d.konfession, 'anschrift', d.anschrift) else '{}'::jsonb end)
    || (case when 'op' = any(t.tiers) then jsonb_build_object(
        'groesse_cm', d.groesse_cm, 'gewicht_kg', d.gewicht_kg,
        'sargmass', d.sargmass) else '{}'::jsonb end)
    || (case when 'sens' = any(t.tiers) then jsonb_build_object(
        'herzschrittmacher', d.herzschrittmacher,
        'infektionshinweis', d.infektionshinweis,
        'freigabe_einaescherung', d.freigabe_einaescherung) else '{}'::jsonb end)
  , '{}'::jsonb)
  from d, t;
$$;

-- Der ganze Fall, aufgelöst für eine Rolle. Interne Klarnamen anderer Partner
-- bleiben für alle Rollen ausser bestatter verborgen.
-- Neu gegenüber 0003: documents.id wird mitgeliefert (Vorbereitung für den
-- Dokumentenabruf; unbedenklich, da keine für anon erreichbare Funktion eine
-- Dokument-ID entgegennimmt).
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
    )
  )
  from public.cases c where c.id = p_case;
$$;

-- Einziger Schreibweg in das Protokoll. Läuft als Eigentümer, weil INSERT
-- auf audit_log für alle übrigen Rollen entzogen ist.
-- Drosselung: 'case.view' höchstens einmal je fünf Minuten und Sitzung, sonst
-- füllt jedes Neuzeichnen der Oberfläche das Protokoll.
-- Datenminimierung (DSGVO): IP-Adresse und User-Agent werden nicht protokolliert.
create or replace function app.log(
  p_case       uuid,
  p_actor_kind text,
  p_actor_ref  text,
  p_action     text,
  p_detail     jsonb default null
)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  insert into public.audit_log (case_id, actor, action, actor_kind, actor_ref, detail)
  select p_case,
         p_actor_kind || ':' || coalesce(p_actor_ref, '-'),
         p_action,
         p_actor_kind,
         p_actor_ref,
         p_detail
  where p_action <> 'case.view'
     or not exists (
       select 1 from public.audit_log a
       where a.action = 'case.view'
         and a.actor_ref is not distinct from p_actor_ref
         and a.at > now() - interval '5 minutes'
     );
$$;

-- ═══════════════════════════════════════════════════════════════
-- 8  Öffentlicher Vertrag: genau drei Funktionen für anon
-- ═══════════════════════════════════════════════════════════════
-- Die Rolle stammt aus der Einladungszeile, nicht aus einem Argument.
-- Die case_id wird nie nach aussen gegeben.
-- Alle drei sind VOLATILE. Nützliche Nebenwirkung: PostgREST lässt GET nur für
-- stable/immutable zu, damit sind sie ausschliesslich per POST erreichbar und
-- Token bzw. Sitzungskennung landen nicht in Query-Strings und Zugriffslogs.

-- Token einlösen → Sitzungskennung. Bei Misserfolg NULL, keine Exception:
-- sonst kann die Oberfläche «Link abgelaufen» nicht von einer technischen
-- Störung unterscheiden und die Familie liest eine falsche Auskunft.
create or replace function public.redeem_invite(p_token text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_invite  uuid;
  v_case    uuid;
  v_role    public.role;
  v_session uuid;
begin
  select i.id, i.case_id, i.role
    into v_invite, v_case, v_role
  from public.invites i
  where i.token_hash = app.hash_token(p_token)
    and not i.revoked
    and i.expires_at > now();

  if not found then
    perform app.log(null, 'invite', '-', 'invite.redeem.failed', null);
    return null;
  end if;

  insert into public.invite_sessions (invite_id)
  values (v_invite)
  returning id into v_session;

  perform app.log(v_case, 'invite', v_session::text, 'invite.redeem',
                  jsonb_build_object('role', v_role));

  return v_session;
end;
$$;

-- Fall zur Sitzung, bereits rollengefiltert. Ungültige Sitzung → NULL.
create or replace function public.get_case_by_session(p_session uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case uuid;
  v_role public.role;
  v_data jsonb;
begin
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
    return null;
  end if;

  v_data := app.case_for_role(v_case, v_role);

  update public.invite_sessions set last_seen_at = now() where id = p_session;

  perform app.log(v_case, 'invite', p_session::text, 'case.view',
                  jsonb_build_object('role', v_role,
                                     'tiers', to_jsonb(app.allowed_tiers(v_role))));

  return v_data;
end;
$$;

-- Sitzung selbst beenden (Abmelden auf dem Gerät der Familie).
create or replace function public.end_session(p_session uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case uuid;
begin
  select i.case_id into v_case
  from public.invite_sessions s
  join public.invites i on i.id = s.invite_id
  where s.id = p_session;

  update public.invite_sessions
     set ended_at = now()
   where id = p_session and ended_at is null;

  if found then
    perform app.log(v_case, 'invite', p_session::text, 'session.end', null);
  end if;
end;
$$;

-- ── Funktionen für angemeldete Bestatter ───────────────────────
-- SECURITY DEFINER umgeht RLS, deshalb prüfen diese Funktionen die
-- Eigentümerschaft selbst; auf die Policies ist hier kein Verlass.

-- Der Klartext wird genau einmal zurückgegeben und ist danach nicht mehr
-- herstellbar. Die Merkhilfe (label) pflegt der Eigentümer anschliessend
-- direkt an der Zeile — dafür greift die Policy invites_owner aus 0002.
create or replace function public.create_invite(p_case uuid, p_role public.role)
returns table(invite_id uuid, token text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_token text;
  v_id    uuid;
begin
  if not public.is_case_owner(p_case) then
    raise exception 'Kein Zugriff auf diesen Fall' using errcode = '42501';
  end if;

  if p_role = 'bestatter'::public.role then
    raise exception 'Für die Rolle bestatter werden keine Einladungslinks ausgegeben'
      using errcode = '22023';
  end if;

  v_token := app.new_token();

  insert into public.invites (case_id, role, created_by, token_hash)
  values (p_case, p_role, auth.uid(), app.hash_token(v_token))
  returning id into v_id;

  perform app.log(p_case, 'user', coalesce(auth.uid()::text, '-'), 'invite.create',
                  jsonb_build_object('role', p_role, 'invite_id', v_id));

  return query select v_id, v_token;
end;
$$;

-- Übersicht für den Eigentümer — niemals Token, niemals Hash.
create or replace function public.list_invites(p_case uuid)
returns table(
  id              uuid,
  role            public.role,
  label           text,
  created_at      timestamptz,
  expires_at      timestamptz,
  revoked         boolean,
  active_sessions bigint
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not public.is_case_owner(p_case) then
    raise exception 'Kein Zugriff auf diesen Fall' using errcode = '42501';
  end if;

  return query
    select i.id, i.role, i.label, i.created_at, i.expires_at, i.revoked,
           (select count(*)
              from public.invite_sessions s
             where s.invite_id = i.id
               and s.ended_at is null
               and s.expires_at > now())
    from public.invites i
    where i.case_id = p_case
    order by i.created_at desc;
end;
$$;

-- Einladung entziehen; laufende Sitzungen enden sofort mit.
create or replace function public.revoke_invite(p_invite uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case uuid;
begin
  select i.case_id into v_case from public.invites i where i.id = p_invite;

  if v_case is null or not public.is_case_owner(v_case) then
    raise exception 'Kein Zugriff auf diese Einladung' using errcode = '42501';
  end if;

  update public.invites set revoked = true where id = p_invite;
  update public.invite_sessions
     set ended_at = now()
   where invite_id = p_invite and ended_at is null;

  perform app.log(v_case, 'user', coalesce(auth.uid()::text, '-'), 'invite.revoke',
                  jsonb_build_object('invite_id', p_invite));
end;
$$;

-- Einzelne Sitzung beenden, ohne die Einladung zu entziehen.
create or replace function public.revoke_session(p_session uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case uuid;
begin
  select i.case_id into v_case
  from public.invite_sessions s
  join public.invites i on i.id = s.invite_id
  where s.id = p_session;

  if v_case is null or not public.is_case_owner(v_case) then
    raise exception 'Kein Zugriff auf diese Sitzung' using errcode = '42501';
  end if;

  update public.invite_sessions
     set ended_at = now()
   where id = p_session and ended_at is null;

  perform app.log(v_case, 'user', coalesce(auth.uid()::text, '-'), 'session.revoke',
                  jsonb_build_object('session_id', p_session));
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 9  Rechtemodell
-- ═══════════════════════════════════════════════════════════════
revoke all on schema app from public;
revoke execute on all functions in schema app from public;

revoke execute on function public.is_case_owner(uuid)                  from public, anon, authenticated;
revoke execute on function public.redeem_invite(text)                  from public, anon, authenticated;
revoke execute on function public.get_case_by_session(uuid)            from public, anon, authenticated;
revoke execute on function public.end_session(uuid)                    from public, anon, authenticated;
revoke execute on function public.create_invite(uuid, public.role)     from public, anon, authenticated;
revoke execute on function public.list_invites(uuid)                   from public, anon, authenticated;
revoke execute on function public.revoke_invite(uuid)                  from public, anon, authenticated;
revoke execute on function public.revoke_session(uuid)                 from public, anon, authenticated;

grant execute on function public.redeem_invite(text)                   to anon, authenticated;
grant execute on function public.get_case_by_session(uuid)             to anon, authenticated;
grant execute on function public.end_session(uuid)                     to anon, authenticated;

grant execute on function public.is_case_owner(uuid)                   to authenticated;  -- wird von den RLS-Policies gebraucht!
grant execute on function public.create_invite(uuid, public.role)      to authenticated;
grant execute on function public.list_invites(uuid)                    to authenticated;
grant execute on function public.revoke_invite(uuid)                   to authenticated;
grant execute on function public.revoke_session(uuid)                  to authenticated;

revoke all on all tables in schema public from anon;
grant usage on schema public to anon;                  -- für PostgREST erforderlich, NICHT entfernen

-- Hinweis: wird is_case_owner vollständig entzogen, fällt die gesamte RLS aus —
-- Policy-Ausdrücke laufen mit den Rechten der aufrufenden Rolle.
-- Symptom: «permission denied for function is_case_owner».

-- ═══════════════════════════════════════════════════════════════
-- 10  cases.ref ohne Kollisionen
-- ═══════════════════════════════════════════════════════════════
-- floor(random()*9999) ist nicht kryptografisch und kollidiert bei
-- «unique not null» nach dem Geburtstagsparadoxon schon ab rund 118 Fällen.
alter table public.cases alter column ref drop default;

-- SECURITY DEFINER, weil die Kollisionsprüfung alle Fälle sehen muss —
-- unter RLS sähe der Trigger nur die eigenen.
create or replace function app.set_case_ref()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ref text;
  v_try int := 0;
begin
  if new.ref is not null and new.ref <> '' then
    return new;
  end if;

  loop
    v_try := v_try + 1;
    v_ref := 'M-' || to_char(now(), 'YYYY') || '-'
             || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

    if not exists (select 1 from public.cases c where c.ref = v_ref) then
      new.ref := v_ref;
      return new;
    end if;

    if v_try >= 10 then
      raise exception 'Fall-Nummer konnte nicht eindeutig vergeben werden';
    end if;
  end loop;
end;
$$;

drop trigger if exists cases_set_ref on public.cases;
create trigger cases_set_ref
  before insert on public.cases
  for each row execute function app.set_case_ref();

-- ═══════════════════════════════════════════════════════════════
-- 11  Profil beim ersten Anmelden anlegen
-- ═══════════════════════════════════════════════════════════════
-- Ohne diesen Schritt kann ein neuer Bestatter nach dem Magic-Link keinen
-- einzigen Fall anlegen: cases.owner verweist auf profiles.
create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- Verifikation — nur Diagnose, keine automatische Korrektur.
-- Einzeln ausführen. Findet Abfrage 1 fremde Funktionen (Erweiterungen,
-- Supabase-eigene Objekte): auflisten, nicht anfassen.
-- ═══════════════════════════════════════════════════════════════
--
-- 1) Funktionen ohne eigene ACL — proacl is null bedeutet PUBLIC EXECUTE.
--    Erwartet: keine Zeile aus unserem Bestand.
-- select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid), p.prosecdef
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null
-- order by 1, 2;
--
-- 2) Was darf anon ausführen?
--    Erwartet: genau redeem_invite, get_case_by_session, end_session.
-- select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app')
--   and has_function_privilege('anon', p.oid, 'execute')
-- order by 1, 2;
--
-- 3) Alte Signaturen sind fort — alle vier Ausdrücke müssen true ergeben.
-- select to_regprocedure('public.get_case_for_role(uuid,public.role)') is null
--      , to_regprocedure('public.deceased_for_role(uuid,public.role)') is null
--      , to_regprocedure('public.resolve_invite(uuid)')                is null
--      , to_regprocedure('public.get_case_by_invite(uuid)')            is null;
--
-- 4) anon kommt nicht an das Schema app — erwartet: false.
-- select has_schema_privilege('anon', 'app', 'usage');
--
-- 5) Kein Klartext-Token mehr in der Datenbank — erwartet: 0 Zeilen.
-- select column_name from information_schema.columns
-- where table_schema = 'public' and table_name = 'invites' and column_name = 'token';
--
-- 6) Prüfregel gegen die Rolle bestatter — erwartet: eine Zeile, convalidated = true.
-- select conname, convalidated, pg_get_constraintdef(oid)
-- from pg_constraint
-- where conrelid = 'public.invites'::regclass and conname = 'invites_role_not_bestatter';
--
-- 7) Protokoll ist nur anfügbar — beide Anweisungen müssen mit
--    «audit_log ist ausschliesslich anfügbar» scheitern.
-- update public.audit_log set action = 'x';
-- delete from public.audit_log;
--
-- 8) Tabellenrechte für anon — erwartet: 0 Zeilen.
-- select table_name, privilege_type from information_schema.role_table_grants
-- where grantee = 'anon' and table_schema = 'public';
