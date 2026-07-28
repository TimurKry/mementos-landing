-- MementoOS MVP — Angaben durch die Familie (0012)
--
-- Bis hierher war der äussere Umkreis fast nur zum Lesen da. Die einzige
-- Ausnahme war termin_bestaetigen (0011). Alles andere trug das
-- Bestattungshaus ein — auch das, was ausschliesslich die Angehörigen wissen:
-- Geburtsdatum, Konfession, letzte Anschrift. In der Praxis heisst das:
-- jemand ruft an, jemand schreibt mit, jemand tippt ab. Drei Gelegenheiten,
-- etwas falsch zu übernehmen, an einem Tag, an dem niemand konzentriert ist.
--
-- ── Die dritte Matrix ─────────────────────────────────────────────────
-- Es gab bisher zwei Matrizen für Felder und zwei für Termine:
--
--   app.allowed_tiers(rolle)        — welche Feldgruppen SIEHT eine Rolle
--   app.termine_fuer_rolle(rolle)   — welche Terminarten sieht sie
--   app.darf_bestaetigen(rolle,art) — welche darf sie bestätigen
--
-- Hier kommt die vierte hinzu, und sie ist die heikelste:
--
--   app.felder_schreibbar(rolle)    — welche Felder darf sie ÄNDERN
--
-- Sehen und ändern sind wieder verschiedene Rechte. Die Familie sieht nach
-- allowed_tiers die Gruppen kern, org und op — schreiben darf sie davon nur
-- einen Teil, und op überhaupt nicht: Sargmass und Gewicht misst das
-- Bestattungshaus, nicht die Tochter der Verstorbenen.
--
-- ── Was hier bewusst NICHT passiert ───────────────────────────────────
-- Die Klinik bekommt kein Schreibrecht auf die Gruppe sens
-- (Herzschrittmacher, Infektionshinweis, Freigabe zur Einäscherung). Fachlich
-- wäre es richtig — die Klinik weiss es am besten. Aber das wäre die
-- empfindlichste Gruppe überhaupt, beschreibbar über einen Link ohne Konto.
-- Diese Entscheidung gehört nicht in eine Migration, die nebenbei etwas
-- anderes tut. Bis dahin bleibt sens ausschliesslich beim Haus.
--
-- sterbedatum fehlt in der Liste der Familie ebenfalls, und zwar absichtlich:
-- es steht in der Todesbescheinigung. Was aus einer Urkunde kommt, wird nicht
-- aus dem Gedächtnis überschrieben.
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0011 voraus.

-- ═══════════════════════════════════════════════════════════════
-- 1  Schreibmatrix
-- ═══════════════════════════════════════════════════════════════
-- Rückgabe ist text[] mit Spaltennamen. Bewusst keine Gruppen (tier): die
-- Familie darf aus org drei von vier Feldern, aber nicht sterbedatum — eine
-- Gruppe wäre zu grob.
create or replace function app.felder_schreibbar(p_role public.role)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select case p_role
    when 'familie'::public.role then
      array['vorname','nachname','geburtsdatum','konfession','anschrift']
    else array[]::text[]   -- alle übrigen Rollen: kein Schreibrecht auf Felder
  end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2  Grenzen der Freitextfelder
-- ═══════════════════════════════════════════════════════════════
-- Spiegel von GRENZEN in src/lib/eingaben.ts. Sie stehen hier ein zweites
-- Mal, weil die Anwendung nicht die letzte Instanz ist: die Funktion unten
-- ist über PostgREST erreichbar, auch ohne unser Formular. Ohne Grenze wäre
-- jedes dieser Felder ein offener Kanal in die Datenbank.
create or replace function app.feld_grenze(p_feld text)
returns int
language sql
immutable
set search_path = ''
as $$
  select case p_feld
    when 'vorname'    then 80
    when 'nachname'   then 80
    when 'konfession' then 60
    when 'anschrift'  then 200
    else 0
  end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3  Ergänzen durch einen Eingeladenen
-- ═══════════════════════════════════════════════════════════════
-- Wie termin_bestaetigen: gibt false zurück statt zu werfen, damit die
-- Oberfläche «darf nicht» von «ist kaputt» unterscheiden kann.
--
-- Weder case_id noch Rolle sind Argumente. Beide hängen an der Einladung,
-- die an der Sitzung hängt. Wer die Funktion direkt aufruft, kann damit
-- nichts anderes treffen als seinen eigenen Vorgang.
--
-- Geschrieben wird ausschliesslich, was in p_felder STEHT und zugleich in
-- der Matrix erlaubt ist. Ein Schlüssel, den die Rolle nicht schreiben darf,
-- wird nicht abgelehnt, sondern übergangen — sonst liesse sich über die
-- Fehlermeldung abtasten, welche Felder es überhaupt gibt.
--
-- Ins Protokoll gehen die NAMEN der geänderten Felder, nie ihre Inhalte.
create or replace function public.angaben_ergaenzen(
  p_session uuid,
  p_felder  jsonb
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case    uuid;
  v_role    public.role;
  v_erlaubt text[];
  v_feld    text;
  v_wert    text;
  v_gesetzt text[] := array[]::text[];
begin
  if p_felder is null or jsonb_typeof(p_felder) <> 'object' then
    return false;
  end if;

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

  v_erlaubt := app.felder_schreibbar(v_role);
  if array_length(v_erlaubt, 1) is null then
    return false;
  end if;

  -- Welche erlaubten Felder liegen tatsächlich bei? Zugleich Formprüfung:
  -- ein unförmiger Wert lässt den ganzen Aufruf scheitern, statt dass die
  -- Hälfte ankommt.
  foreach v_feld in array v_erlaubt loop
    if p_felder ? v_feld then
      -- Nur Zeichenkette oder null. Ohne diese Zeile käme bei einem
      -- übergebenen Objekt der Umweg über ->> zum Zug und schriebe dessen
      -- JSON-Darstellung («{"a": 1}») in ein Namensfeld. Kein Loch, aber
      -- Unsinn in den Daten — und Unsinn in Daten wird später geglaubt.
      if jsonb_typeof(p_felder -> v_feld) not in ('string', 'null') then
        return false;
      end if;

      v_wert := nullif(btrim(p_felder ->> v_feld), '');

      if v_wert is not null then
        -- Steuerzeichen haben in keinem dieser Felder etwas zu suchen.
        if v_wert ~ '[\x00-\x1f\x7f]' then
          return false;
        end if;

        if v_feld = 'geburtsdatum' then
          -- Muster UND Gültigkeit: «2026-02-31» erfüllt das Muster und ist
          -- trotzdem kein Datum. to_date() wäre hier nachsichtig, deshalb
          -- der Umweg über eine geprüfte Umwandlung.
          if v_wert !~ '^\d{4}-\d{2}-\d{2}$' then
            return false;
          end if;
          begin
            perform v_wert::date;
          exception when others then
            return false;
          end;
        elsif length(v_wert) > app.feld_grenze(v_feld) then
          return false;
        end if;
      end if;

      v_gesetzt := v_gesetzt || v_feld;
    end if;
  end loop;

  if array_length(v_gesetzt, 1) is null then
    return false;   -- nichts Erlaubtes dabei
  end if;

  -- Die Zeile kann fehlen, wenn der Vorgang vor 0010 entstanden ist.
  insert into public.deceased (case_id)
  values (v_case)
  on conflict (case_id) do nothing;

  -- Nur die tatsächlich übergebenen Felder. Ein weggelassenes Feld bleibt
  -- unberührt; ein übergebenes leeres Feld löscht die Angabe.
  update public.deceased set
    vorname = case when 'vorname' = any(v_gesetzt)
                   then nullif(btrim(p_felder ->> 'vorname'), '') else vorname end,
    nachname = case when 'nachname' = any(v_gesetzt)
                    then nullif(btrim(p_felder ->> 'nachname'), '') else nachname end,
    geburtsdatum = case when 'geburtsdatum' = any(v_gesetzt)
                        then nullif(btrim(p_felder ->> 'geburtsdatum'), '')::date
                        else geburtsdatum end,
    konfession = case when 'konfession' = any(v_gesetzt)
                      then nullif(btrim(p_felder ->> 'konfession'), '') else konfession end,
    anschrift = case when 'anschrift' = any(v_gesetzt)
                     then nullif(btrim(p_felder ->> 'anschrift'), '') else anschrift end
  where case_id = v_case;

  -- Namen, keine Inhalte.
  perform app.log(v_case, 'invite', p_session::text, 'angaben.ergaenzt',
                  jsonb_build_object('felder', to_jsonb(v_gesetzt), 'role', v_role));

  return true;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4  Schreibbare Felder im rollengefilterten Fall mitliefern
-- ═══════════════════════════════════════════════════════════════
-- app.case_for_role bekommt den Schlüssel «schreibbar»: die Liste der Felder,
-- die diese Rolle ändern darf. Damit weiss die Oberfläche, wo sie ein
-- Eingabefeld statt einer Zeile Text zeigen darf — die Entscheidung selbst
-- trifft weiterhin angaben_ergaenzen.
--
-- Der Rest der Funktion ist unverändert aus 0011 übernommen. Sie steht hier
-- vollständig, weil create or replace keine Teiländerung kennt.
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
    'schreibbar',     to_jsonb(app.felder_schreibbar(p_role)),
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
-- 5  Rechte — bewusst als letzter Abschnitt der Datei
-- ═══════════════════════════════════════════════════════════════
-- Lehre aus 0005: ALTER DEFAULT PRIVILEGES greift auf diesem Projekt nicht.
-- Was nach diesem Block angelegt wird, behielte das voreingestellte
-- PUBLIC EXECUTE. Deshalb steht hier nichts mehr hinter.
revoke execute on all functions in schema app from public, anon, authenticated;
revoke all on schema app from public, anon, authenticated;

revoke execute on function public.angaben_ergaenzen(uuid, jsonb)
  from public, anon, authenticated;

-- Der öffentliche Vertrag: jetzt fünf Funktionen für anon.
grant execute on function public.redeem_invite(text)        to anon, authenticated;
grant execute on function public.get_case_by_session(uuid)  to anon, authenticated;
grant execute on function public.end_session(uuid)          to anon, authenticated;
grant execute on function public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)
  to anon, authenticated;
grant execute on function public.angaben_ergaenzen(uuid, jsonb)
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
--    end_session, termin_bestaetigen, angaben_ergaenzen — und sonst nichts.
-- select n.nspname, p.proname
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and has_function_privilege('anon', p.oid, 'execute')
-- order by 1, 2;
--
-- 2) Keine Funktion ohne eigene ACL — erwartet: 0.
-- select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null;
--
-- 3) Schreibmatrix — erwartet: nur familie, und dort fünf Felder ohne
--    sterbedatum und ohne jedes Feld der Gruppen op und sens.
-- select r, app.felder_schreibbar(r)
-- from unnest(enum_range(null::public.role)) r
-- where array_length(app.felder_schreibbar(r), 1) is not null;
--
-- 4) Im Protokoll stehen nur Feldnamen — erwartet: {"role":"familie",
--    "felder":[...]} ohne einen einzigen eingegebenen Wert.
-- select action, detail from public.audit_log where action = 'angaben.ergaenzt';
