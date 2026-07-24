-- MementoOS MVP — Row-Level Security (0002)
-- Angemeldete Nutzer (Bestatter) sehen/ändern nur ihre eigenen Fälle.
-- Anonymer Zugriff per Einladungslink läuft NICHT über RLS, sondern über
-- eine serverseitige, rollengefilterte Funktion (siehe 0003) mit Token-Prüfung.

alter table profiles     enable row level security;
alter table cases        enable row level security;
alter table deceased     enable row level security;
alter table participants enable row level security;
alter table tasks        enable row level security;
alter table documents    enable row level security;
alter table audit_log    enable row level security;
alter table invites      enable row level security;

-- Hilfsfunktion: gehört der Fall dem angemeldeten Nutzer?
create or replace function is_case_owner(p_case uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from cases c where c.id = p_case and c.owner = auth.uid()
  );
$$;

-- profiles: jeder sieht/pflegt nur sein eigenes Profil
create policy profiles_self on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- cases: nur Eigentümer
create policy cases_owner on cases
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- Kindtabellen: Zugriff, wenn der übergeordnete Fall dem Nutzer gehört
create policy deceased_owner on deceased
  for all using (is_case_owner(case_id)) with check (is_case_owner(case_id));

create policy participants_owner on participants
  for all using (is_case_owner(case_id)) with check (is_case_owner(case_id));

create policy tasks_owner on tasks
  for all using (is_case_owner(case_id)) with check (is_case_owner(case_id));

create policy documents_owner on documents
  for all using (is_case_owner(case_id)) with check (is_case_owner(case_id));

create policy audit_owner on audit_log
  for select using (is_case_owner(case_id));

create policy invites_owner on invites
  for all using (is_case_owner(case_id)) with check (is_case_owner(case_id));
