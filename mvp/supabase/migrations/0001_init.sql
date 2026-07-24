-- MementoOS MVP — Schema (0001)
-- Ein gemeinsamer Fall über alle Beteiligten. Postgres / Supabase.
-- Alle Beispieldaten fiktiv. Feldgenauer Zugriff: siehe 0003.

-- ── Enums ──────────────────────────────────────────────────────
create type role as enum (
  'bestatter','familie','krematorium','transport','friedhof',
  'floristik','klinik','standesamt','steinmetz','redner','verbund'
);

create type case_phase as enum (
  'neu','unterlagen','bestaetigt','durchfuehrung','abschluss'
);

create type task_status as enum ('offen','erledigt');
create type contact_status as enum ('none','contacted','confirmed','skipped');

-- ── profiles: angemeldete Nutzer (Bestatter etc.) ──────────────
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  org_name     text,
  created_at   timestamptz not null default now()
);

-- ── cases: der Fall ────────────────────────────────────────────
create table cases (
  id           uuid primary key default gen_random_uuid(),
  ref          text unique not null default ('M-' || to_char(now(),'YYYY') || '-' || lpad((floor(random()*9999))::int::text,4,'0')),
  owner        uuid not null references profiles(id) on delete cascade,
  bestattungsart text not null,                 -- Einäscherung / Erdbestattung …
  phase        case_phase not null default 'neu',
  target_date  date,
  created_at   timestamptz not null default now()
);
create index on cases(owner);

-- ── deceased: Verstorbene Person (1:1), Felder nach Gruppen ────
-- Gruppen (tier): kern / org / op(körperlich) / sens(medizinisch).
create table deceased (
  case_id      uuid primary key references cases(id) on delete cascade,
  -- kern
  vorname      text,
  nachname     text,
  -- org (persönlich)
  geburtsdatum date,
  sterbedatum  date,
  konfession   text,
  anschrift    text,
  -- op (körperlich)
  groesse_cm   int,
  gewicht_kg   int,
  sargmass     text,
  -- sens (medizinisch)
  herzschrittmacher boolean default false,
  infektionshinweis text,
  freigabe_einaescherung boolean default false
);

-- ── participants: Beteiligte am Fall ───────────────────────────
create table participants (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null references cases(id) on delete cascade,
  role         role not null,
  org_name     text not null,
  joined       boolean not null default false,
  contact      contact_status not null default 'none',
  sort         int not null default 0,
  created_at   timestamptz not null default now()
);
create index on participants(case_id);

-- ── tasks: offen / erledigt ────────────────────────────────────
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null references cases(id) on delete cascade,
  title        text not null,
  assignee     role,
  due          text,
  status       task_status not null default 'offen',
  created_at   timestamptz not null default now()
);
create index on tasks(case_id);

-- ── documents: ACL — wer sieht welches Dokument ────────────────
create table documents (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null references cases(id) on delete cascade,
  doc_type     text not null,
  uploaded_by  role not null,
  storage_path text,                            -- Supabase Storage
  visible_to   role[] not null default '{}',    -- welche Rollen sehen es
  verified     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index on documents(case_id);

-- ── audit_log: lückenloses Protokoll ───────────────────────────
create table audit_log (
  id           bigint generated always as identity primary key,
  case_id      uuid not null references cases(id) on delete cascade,
  actor        text not null,                   -- Rolle oder System
  action       text not null,
  at           timestamptz not null default now()
);
create index on audit_log(case_id);

-- ── invites: Beitritt per Link ohne Konto ──────────────────────
create table invites (
  token        uuid primary key default gen_random_uuid(),
  case_id      uuid not null references cases(id) on delete cascade,
  role         role not null,
  created_by   uuid references profiles(id) on delete set null,
  expires_at   timestamptz not null default (now() + interval '30 days'),
  revoked      boolean not null default false,
  created_at   timestamptz not null default now()
);
create index on invites(case_id);
