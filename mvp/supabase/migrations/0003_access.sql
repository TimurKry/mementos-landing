-- MementoOS MVP — Feldgenauer Zugriff nach Rolle (0003)
-- Ein Fall wird EINMAL gespeichert und für jede Rolle unterschiedlich
-- aufgelöst. Die Sichtbarkeit ist nach Feldgruppen (tier) geregelt:
--   kern (Identität) · org (persönlich) · op (körperlich) · sens (medizinisch)
-- Diese Funktion ist die Server-Wahrheit; die UI spiegelt sie nur.

-- Welche Feldgruppen darf eine Rolle von der Verstorbenen-Person lesen?
create or replace function allowed_tiers(p_role role)
returns text[] language sql immutable as $$
  select case p_role
    when 'bestatter'   then array['kern','org','op','sens']
    when 'familie'     then array['kern','org','op']          -- keine Medizin-Details
    when 'krematorium' then array['kern','op','sens']         -- sicherheitskritisch
    when 'transport'   then array['kern','op']                -- Name + Handhabung
    when 'friedhof'    then array['kern','org']
    when 'standesamt'  then array['kern','org']
    when 'klinik'      then array['kern','op','sens']
    when 'verbund'     then array['kern']
    else array[]::text[]                                       -- floristik/redner/steinmetz: nichts
  end;
$$;

-- Verstorbene Person als JSON, gefiltert nach erlaubten Feldgruppen.
create or replace function deceased_for_role(p_case uuid, p_role role)
returns jsonb language sql stable security definer set search_path = public as $$
  with d as (select * from deceased where case_id = p_case),
       t as (select allowed_tiers(p_role) as tiers)
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

-- Der ganze Fall, aufgelöst für eine Rolle.
-- participants: interne Klarnamen anderer Partner sind für die meisten Rollen
-- verborgen (nur Rolle + Beitrittsstatus); der Bestatter sieht alles.
create or replace function get_case_for_role(p_case uuid, p_role role)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'ref',            c.ref,
    'bestattungsart', c.bestattungsart,
    'phase',          c.phase,
    'target_date',    c.target_date,
    'role',           p_role,
    'verstorbene',    deceased_for_role(p_case, p_role),
    'beteiligte', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'role', pt.role,
        'org',  case when p_role = 'bestatter' then pt.org_name else null end,
        'joined', pt.joined
      ) order by pt.sort), '[]'::jsonb)
      from participants pt where pt.case_id = p_case
    ),
    'aufgaben', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'title', tk.title, 'assignee', tk.assignee, 'due', tk.due, 'status', tk.status
      )), '[]'::jsonb)
      from tasks tk where tk.case_id = p_case
        and (p_role = 'bestatter' or tk.assignee = p_role)   -- Partner sehen ihre Aufgaben
    ),
    'dokumente', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'doc_type', dc.doc_type, 'verified', dc.verified
      )), '[]'::jsonb)
      from documents dc where dc.case_id = p_case
        and (p_role = 'bestatter' or p_role = any(dc.visible_to))
    )
  )
  from cases c where c.id = p_case;
$$;

-- Einladungslink auflösen: gültig? → (case_id, role). Für anonymen Zugriff.
create or replace function resolve_invite(p_token uuid)
returns table(case_id uuid, role role)
language sql stable security definer set search_path = public as $$
  select i.case_id, i.role from invites i
  where i.token = p_token and not i.revoked and i.expires_at > now();
$$;

-- Fall per Einladungslink, bereits rollengefiltert (eine Server-Runde).
create or replace function get_case_by_invite(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select get_case_for_role(r.case_id, r.role)
  from resolve_invite(p_token) r;
$$;

-- Diese Funktionen dürfen auch von anon (Link ohne Konto) aufgerufen werden.
grant execute on function get_case_by_invite(uuid) to anon, authenticated;
grant execute on function resolve_invite(uuid)      to anon, authenticated;
