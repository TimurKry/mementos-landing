-- MementoOS MVP — Quelle je Angabe und Korrekturvorschläge (0016)
--
-- Der Fehler, den diese Migration behebt, ist der schwerste bisher, und er
-- steht seit 0012 im System: public.angaben_ergaenzen schreibt direkt in
-- public.deceased. Wenn das Haus «Erika Weber» eingetragen hat und die Tochter
-- über den Familienbogen «Erica Weber» schickt, ist der Eintrag des Hauses weg.
-- Ohne Rückfrage, ohne Hinweis, ohne dass jemand es merkt.
--
-- In einer Branche, in der eine falsche Angabe auf einem Grabstein steht oder
-- eine Urkunde unbrauchbar macht, ist stilles Überschreiben kein Schönheits-
-- fehler. Und es wird schlimmer, je mehr Beteiligte schreiben dürfen — die
-- nächsten Migrationen öffnen genau das.
--
-- ── Das Prinzip ───────────────────────────────────────────────────────
-- Jede Angabe hat eine Quelle. Wer die Quelle ist, ändert direkt. Wer es
-- nicht ist, macht einen VORSCHLAG, über den das Haus entscheidet.
--
-- Drei Fälle, und nur drei:
--   1) Das Feld ist leer          → direkt schreiben. Wer eine Lücke füllt,
--                                    überschreibt niemanden.
--   2) Die Quelle ist dieselbe    → direkt schreiben. Man korrigiert sich
--      Rolle                        selbst, ohne um Erlaubnis zu bitten.
--   3) Die Quelle ist eine andere → Korrekturvorschlag. Der bisherige Wert
--      Rolle                        bleibt stehen, bis das Haus entscheidet.
--
-- ── Was hier BEWUSST NICHT gespeichert wird ───────────────────────────
-- Der naheliegende Bauplan wäre eine Werteverlaufstabelle: jede Angabe, jeder
-- frühere Inhalt, jeder Zeitpunkt. Das ist ausdrücklich NICHT gebaut.
--
-- Der Zweck ist erfüllt, wenn bekannt ist, WER eine Angabe gesetzt hat — nicht,
-- was frühere Fassungen enthielten. Eine Verlaufstabelle würde jeden
-- personenbezogenen Wert ein zweites Mal ablegen und für immer aufbewahren; das
-- verdoppelt genau den Datenbestand, der hier am schwersten wiegt. Die Namen
-- der geänderten Felder stehen ohnehin im Protokoll (0004), und dort ohne einen
-- einzigen Inhalt.
--
-- public.feldquelle trägt deshalb Rolle und Zeitpunkt je Feld — und keinen Wert.
--
-- Der einzige Ort, an dem eine Angabe zwischengespeichert werden MUSS, ist der
-- Korrekturvorschlag: ohne den vorgeschlagenen Wert kann niemand entscheiden.
-- Deshalb wird er nach der Entscheidung **auf NULL gesetzt**. Bei Annahme steht
-- er in public.deceased, bei Ablehnung wollte ihn das Haus nicht — ihn danach
-- weiter vorzuhalten wäre Aufbewahrung ohne Zweck. Wer, welches Feld, wann und
-- mit welchem Ausgang bleibt stehen; der Inhalt geht.
--
-- ── Die handelnde Rolle im Auslöser ───────────────────────────────────
-- feldquelle wird von einem Auslöser auf public.deceased gepflegt, nicht von
-- Hand an jeder Schreibstelle. Ein Auslöser weiss aber nicht, wer schreibt.
-- Deshalb setzt jede Funktion, die für jemand anderen als das Haus schreibt,
-- vorher app.rolle über set_config(..., true) — gültig nur für diese
-- Transaktion. Fehlt die Angabe, gilt 'bestatter': direkt in die Tabelle
-- schreiben kann über RLS ausschliesslich der Eigentümer.
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0015 voraus.
--
-- Abschnitte:
--   1 feldquelle                    5 angaben_ergaenzen, neu gefasst
--   2 Auslöser auf deceased         6 Entscheidung durch das Haus
--   3 Bestandsdaten nachtragen      7 Rechte
--   4 korrekturvorschlag            8 Prüfungen (aktiv)

-- ═══════════════════════════════════════════════════════════════
-- 1  feldquelle — wer hat diese Angabe gesetzt
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.feldquelle (
  case_id    uuid not null references public.cases(id) on delete cascade,
  feld       text not null,
  rolle      public.role not null,
  gesetzt_am timestamptz not null default now(),
  primary key (case_id, feld)
);

alter table public.feldquelle enable row level security;

drop policy if exists feldquelle_owner on public.feldquelle;
create policy feldquelle_owner on public.feldquelle
  for select using (public.is_case_owner(case_id));

-- Geschrieben wird ausschliesslich über den Auslöser, der als Eigentümer der
-- Funktion läuft. Kein Konto kann diese Zeilen von Hand setzen, ändern oder
-- löschen — sonst liesse sich eine Quelle nachträglich umschreiben und danach
-- fremde Angaben «als eigene» überschreiben.
revoke insert, update, delete on public.feldquelle from public, anon, authenticated;

-- Das Löschen des Falls nimmt die Zeilen mit (on delete cascade). Das ist
-- gewollt: die Zuordnung Rolle → Feld ist personenbezogen genug, um mit dem
-- Vorgang zu verschwinden. Das Protokoll überlebt den Fall, führt aber keine
-- Inhalte.

-- ═══════════════════════════════════════════════════════════════
-- 2  Auslöser auf public.deceased
-- ═══════════════════════════════════════════════════════════════
-- Vergleich über to_jsonb statt Spalte für Spalte: eine neue Spalte wird
-- dadurch von selbst mitgeführt und kann nicht vergessen werden.
create or replace function app.feldquelle_pflegen()
returns trigger
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_rolle public.role;
  v_alt   jsonb;
  v_neu   jsonb := to_jsonb(new);
  v_wechsel text[] := array[]::text[];
  e       record;
begin
  -- Fehlt die Angabe, war es das Haus: direkt in die Tabelle schreiben darf
  -- über RLS niemand sonst.
  v_rolle := coalesce(
    nullif(current_setting('app.rolle', true), '')::public.role,
    'bestatter'::public.role);

  v_alt := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;

  for e in select key, value from jsonb_each(v_neu) where key <> 'case_id' loop
    -- Beim Anlegen der Zeile hat eine leere Angabe keine Quelle; sonst stünde
    -- nach jedem neuen Fall «bestatter» an Feldern, die niemand angefasst hat.
    --
    -- false wird beim INSERT ebenfalls übersprungen, und das ist keine
    -- Bequemlichkeit: herzschrittmacher und freigabe_einaescherung stehen in
    -- 0001 als «boolean default false». Beim Anlegen ist ihr false deshalb der
    -- VOREINGESTELLTE Wert und keine Aussage — niemand hat gesagt, dass kein
    -- Herzschrittmacher vorliegt. Das dem Haus als Angabe zuzuschreiben würde
    -- eine Sicherheitsaussage erfinden, die nie gemacht wurde.
    --
    -- Beim UPDATE ist false sehr wohl eine Aussage: dort hat jemand das
    -- Häkchen bewusst weggenommen. Deshalb greift die Ausnahme nur hier.
    --
    -- Dahinter steckt ein Schemamangel: «boolean default false» kann «nein»
    -- nicht von «nicht gefragt» unterscheiden. Richtig wäre ein Feld ohne
    -- Voreinstellung mit drei Zuständen; das ändert 0001 und die Häkchen im
    -- Bogen und gehört nicht in diese Migration. Notiert in WORKING_CONTEXT.
    if tg_op = 'INSERT'
       and (jsonb_typeof(e.value) = 'null' or e.value = to_jsonb(false)) then
      continue;
    end if;

    if (v_alt -> e.key) is distinct from e.value then
      -- Eine geleerte Angabe verliert ihre Quelle. Danach darf sie wieder
      -- jeder Berechtigte füllen — das ist Fall 1 und richtig so.
      if jsonb_typeof(e.value) = 'null' then
        delete from public.feldquelle q
        where q.case_id = new.case_id and q.feld = e.key;
        continue;
      end if;

      -- Wechselt die Quelle, kommt das ins Protokoll: der Name des Feldes,
      -- die alte und die neue Rolle. Kein Inhalt.
      if exists (
        select 1 from public.feldquelle q
        where q.case_id = new.case_id and q.feld = e.key and q.rolle <> v_rolle
      ) then
        v_wechsel := v_wechsel || e.key;
      end if;

      insert into public.feldquelle (case_id, feld, rolle, gesetzt_am)
      values (new.case_id, e.key, v_rolle, now())
      on conflict (case_id, feld)
        do update set rolle = excluded.rolle, gesetzt_am = excluded.gesetzt_am;
    end if;
  end loop;

  if array_length(v_wechsel, 1) is not null then
    perform app.log(new.case_id, 'rolle', v_rolle::text, 'angaben.quelle_gewechselt',
                    jsonb_build_object('felder', to_jsonb(v_wechsel),
                                       'neue_quelle', v_rolle));
  end if;

  return new;
end;
$$;

drop trigger if exists deceased_feldquelle on public.deceased;
create trigger deceased_feldquelle
  after insert or update on public.deceased
  for each row execute function app.feldquelle_pflegen();

-- ═══════════════════════════════════════════════════════════════
-- 3  Bestandsdaten nachtragen
-- ═══════════════════════════════════════════════════════════════
-- Ohne diesen Abschnitt hätte jede Angabe, die vor 0016 eingetragen wurde,
-- KEINE Quelle — und wäre damit nach Fall 1 für jeden Berechtigten direkt
-- überschreibbar. Das ist genau der Fehler, der hier behoben wird.
--
-- Alle Bestandswerte werden dem HAUS zugeschrieben.
--
-- Aus dem Protokoll liesse sich teilweise mehr rekonstruieren: 'angaben.
-- ergaenzt' hält fest, welche Felder eine eingeladene Rolle wann geschrieben
-- hat. Diese Rekonstruktion wird ABSICHTLICH nicht verwendet. Sie kennt nur
-- Schreibvorgänge von aussen, nie die des Hauses — hat das Haus einen Wert der
-- Familie später korrigiert, steht davon nichts im Protokoll, und die
-- Zuschreibung ginge an die Familie. Deren Folge wäre: die Familie darf die
-- Korrektur des Hauses direkt überschreiben. Die Folge der pauschalen
-- Zuschreibung an das Haus ist dagegen, dass die Familie einmal einen
-- Vorschlag machen muss, wo sie sonst direkt geschrieben hätte.
--
-- Von zwei unvermeidbaren Fehlern der kostet nichts als eine Rückfrage.
do $$
declare v_zahl int;
begin
  insert into public.feldquelle (case_id, feld, rolle, gesetzt_am)
  select d.case_id, e.key, 'bestatter'::public.role, now()
  from public.deceased d
  cross join lateral jsonb_each(to_jsonb(d)) as e
  where e.key <> 'case_id'
    and jsonb_typeof(e.value) <> 'null'
    -- false wird übersprungen, aus demselben Grund wie im Auslöser: bei
    -- «boolean default false» ist im Bestand nicht unterscheidbar, ob jemand
    -- das Häkchen weggenommen oder nie hingesehen hat. Gefahrlos, weil keine
    -- eingeladene Rolle diese beiden Felder schreiben darf
    -- (app.felder_schreibbar kennt nur die fünf Felder der Familie).
    and e.value <> to_jsonb(false)
  on conflict (case_id, feld) do nothing;

  get diagnostics v_zahl = row_count;
  raise notice 'feldquelle: % Bestandsangaben dem Haus zugeschrieben', v_zahl;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- 4  korrekturvorschlag
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.korrekturvorschlag (
  id             uuid primary key default gen_random_uuid(),
  case_id        uuid not null references public.cases(id) on delete cascade,
  feld           text not null,
  -- Der vorgeschlagene Wert. Nach der Entscheidung auf NULL gesetzt — siehe
  -- Kopf der Datei. Immer text: die Umwandlung in date passiert erst bei der
  -- Annahme, mit derselben Prüfung wie beim direkten Schreiben.
  wert           text,
  vorschlag_rolle public.role not null,
  erstellt_am    timestamptz not null default now(),
  stand          text not null default 'offen'
                 check (stand in ('offen', 'angenommen', 'abgelehnt')),
  entschieden_am timestamptz
);

create index if not exists korrekturvorschlag_fall on public.korrekturvorschlag(case_id);

-- Ein offener Vorschlag je Rolle und Feld. Schickt dieselbe Rolle einen
-- zweiten, ersetzt er den ersten: sonst sammelt sich eine Schlange von
-- Fassungen, und das Haus entscheidet über die veraltete.
-- Zwei verschiedene Rollen dürfen dasselbe Feld vorschlagen — das ist keine
-- Doppelung, sondern ein Widerspruch, den das Haus sehen soll.
create unique index if not exists korrekturvorschlag_offen
  on public.korrekturvorschlag (case_id, feld, vorschlag_rolle)
  where stand = 'offen';

alter table public.korrekturvorschlag enable row level security;

drop policy if exists korrekturvorschlag_owner on public.korrekturvorschlag;
create policy korrekturvorschlag_owner on public.korrekturvorschlag
  for select using (public.is_case_owner(case_id));

-- Angelegt wird über angaben_ergaenzen, entschieden über
-- korrektur_entscheiden. Beide laufen als Eigentümer. Direktes Ändern von
-- aussen ist zu, direktes Ändern durch das Haus auch: sonst liesse sich
-- «angenommen» setzen, ohne dass der Wert je in deceased ankommt.
revoke insert, update, delete on public.korrekturvorschlag from public, anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 5  angaben_ergaenzen, neu gefasst
-- ═══════════════════════════════════════════════════════════════
-- Rückgabe war boolean und ist jetzt jsonb: «angekommen» genügt nicht mehr,
-- weil ein Teil der Angaben übernommen und ein anderer vorgeschlagen sein
-- kann. Die Oberfläche muss beides unterscheiden können, sonst glaubt die
-- Familie, ihre Korrektur stehe schon.
--
-- Rückgabe:
--   {"ok": false}
--   {"ok": true, "uebernommen": ["konfession"], "vorgeschlagen": ["vorname"]}
--
-- Beide Listen enthalten nur Feldnamen, die der Aufrufer selbst geschickt hat
-- — es wird nichts verraten, was er nicht schon wusste.
--
-- DROP statt CREATE OR REPLACE: der Rückgabetyp ändert sich, und die alte ACL
-- soll mit der alten Fassung verschwinden.
drop function if exists public.angaben_ergaenzen(uuid, jsonb);

create function public.angaben_ergaenzen(
  p_session uuid,
  p_felder  jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case      uuid;
  v_role      public.role;
  v_erlaubt   text[];
  v_feld      text;
  v_wert      text;
  v_alt       jsonb;
  v_quelle    public.role;
  v_direkt    text[] := array[]::text[];
  v_vorschlag text[] := array[]::text[];
begin
  if p_felder is null or jsonb_typeof(p_felder) <> 'object' then
    return jsonb_build_object('ok', false);
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
    return jsonb_build_object('ok', false);
  end if;

  v_erlaubt := app.felder_schreibbar(v_role);
  if array_length(v_erlaubt, 1) is null then
    return jsonb_build_object('ok', false);
  end if;

  -- Die Zeile kann fehlen, wenn der Vorgang vor 0010 entstanden ist. Vorziehen,
  -- weil die Prüfung unten den bisherigen Inhalt braucht.
  insert into public.deceased (case_id)
  values (v_case)
  on conflict (case_id) do nothing;

  select to_jsonb(d) into v_alt from public.deceased d where d.case_id = v_case;

  -- Formprüfung wie in 0012, unverändert: ein unförmiger Wert lässt den
  -- GANZEN Aufruf scheitern, statt dass die Hälfte ankommt.
  foreach v_feld in array v_erlaubt loop
    if p_felder ? v_feld then
      if jsonb_typeof(p_felder -> v_feld) not in ('string', 'null') then
        return jsonb_build_object('ok', false);
      end if;

      v_wert := nullif(btrim(p_felder ->> v_feld), '');

      if v_wert is not null then
        if v_wert ~ '[\x00-\x1f\x7f]' then
          return jsonb_build_object('ok', false);
        end if;

        if v_feld = 'geburtsdatum' then
          if v_wert !~ '^\d{4}-\d{2}-\d{2}$' then
            return jsonb_build_object('ok', false);
          end if;
          begin
            perform v_wert::date;
          exception when others then
            return jsonb_build_object('ok', false);
          end;
        elsif length(v_wert) > app.feld_grenze(v_feld) then
          return jsonb_build_object('ok', false);
        end if;
      end if;

      -- Ab hier ist der Wert in Ordnung. Jetzt die Frage dieser Migration:
      -- direkt oder als Vorschlag?
      select q.rolle into v_quelle
      from public.feldquelle q
      where q.case_id = v_case and q.feld = v_feld;

      if jsonb_typeof(v_alt -> v_feld) = 'null'    -- Fall 1: leer
         or v_quelle is null                       --         oder ohne Quelle
         or v_quelle = v_role then                 -- Fall 2: eigene Angabe
        v_direkt := v_direkt || v_feld;
      else                                         -- Fall 3: fremde Angabe
        v_vorschlag := v_vorschlag || v_feld;
      end if;
    end if;
  end loop;

  if array_length(v_direkt, 1) is null and array_length(v_vorschlag, 1) is null then
    return jsonb_build_object('ok', false);   -- nichts Erlaubtes dabei
  end if;

  -- Der Auslöser braucht die handelnde Rolle. true = nur diese Transaktion.
  perform set_config('app.rolle', v_role::text, true);

  if array_length(v_direkt, 1) is not null then
    update public.deceased set
      vorname = case when 'vorname' = any(v_direkt)
                     then nullif(btrim(p_felder ->> 'vorname'), '') else vorname end,
      nachname = case when 'nachname' = any(v_direkt)
                      then nullif(btrim(p_felder ->> 'nachname'), '') else nachname end,
      geburtsdatum = case when 'geburtsdatum' = any(v_direkt)
                          then nullif(btrim(p_felder ->> 'geburtsdatum'), '')::date
                          else geburtsdatum end,
      konfession = case when 'konfession' = any(v_direkt)
                        then nullif(btrim(p_felder ->> 'konfession'), '') else konfession end,
      anschrift = case when 'anschrift' = any(v_direkt)
                       then nullif(btrim(p_felder ->> 'anschrift'), '') else anschrift end
    where case_id = v_case;

    perform app.log(v_case, 'invite', p_session::text, 'angaben.ergaenzt',
                    jsonb_build_object('felder', to_jsonb(v_direkt), 'role', v_role));
  end if;

  if array_length(v_vorschlag, 1) is not null then
    foreach v_feld in array v_vorschlag loop
      insert into public.korrekturvorschlag (case_id, feld, wert, vorschlag_rolle)
      values (v_case, v_feld, nullif(btrim(p_felder ->> v_feld), ''), v_role)
      on conflict (case_id, feld, vorschlag_rolle) where stand = 'offen'
        do update set wert = excluded.wert, erstellt_am = now();
    end loop;

    perform app.log(v_case, 'invite', p_session::text, 'korrektur.vorgeschlagen',
                    jsonb_build_object('felder', to_jsonb(v_vorschlag), 'role', v_role));
  end if;

  perform set_config('app.rolle', '', true);

  return jsonb_build_object(
    'ok', true,
    'uebernommen',   to_jsonb(v_direkt),
    'vorgeschlagen', to_jsonb(v_vorschlag));
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6  Entscheidung durch das Haus
-- ═══════════════════════════════════════════════════════════════
-- Nur der Eigentümer des Falls. Die Prüfung steht IN der Funktion und nicht
-- nur in RLS: die Funktion ist SECURITY DEFINER und umgeht RLS deshalb.
--
-- Bei Annahme wird der Wert noch einmal geprüft. Er lag seit dem Vorschlag in
-- der Tabelle; zwischenzeitlich kann sich eine Grenze geändert haben, und die
-- Prüfung ist billiger als das Vertrauen.
--
-- Nach der Entscheidung wird wert auf NULL gesetzt — in beiden Fällen.
create or replace function public.korrektur_entscheiden(
  p_id       uuid,
  p_annehmen boolean
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case  uuid;
  v_feld  text;
  v_wert  text;
  v_rolle public.role;
begin
  select k.case_id, k.feld, k.wert, k.vorschlag_rolle
    into v_case, v_feld, v_wert, v_rolle
  from public.korrekturvorschlag k
  where k.id = p_id and k.stand = 'offen';

  if not found then
    return false;
  end if;

  if not public.is_case_owner(v_case) then
    return false;
  end if;

  if p_annehmen then
    if v_wert is null then
      return false;   -- nichts zu übernehmen
    end if;
    if v_wert ~ '[\x00-\x1f\x7f]' then
      return false;
    end if;
    if v_feld = 'geburtsdatum' then
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

    -- Die Quelle wird die vorschlagende Rolle, nicht das Haus: der Wert kommt
    -- von ihr, das Haus hat ihn nur freigegeben. Damit darf sie ihn danach
    -- selbst weiter korrigieren, ohne erneut zu fragen.
    perform set_config('app.rolle', v_rolle::text, true);

    update public.deceased set
      vorname      = case when v_feld = 'vorname'      then v_wert else vorname end,
      nachname     = case when v_feld = 'nachname'     then v_wert else nachname end,
      geburtsdatum = case when v_feld = 'geburtsdatum' then v_wert::date else geburtsdatum end,
      konfession   = case when v_feld = 'konfession'   then v_wert else konfession end,
      anschrift    = case when v_feld = 'anschrift'    then v_wert else anschrift end
    where case_id = v_case;

    perform set_config('app.rolle', '', true);
  end if;

  update public.korrekturvorschlag set
    stand          = case when p_annehmen then 'angenommen' else 'abgelehnt' end,
    entschieden_am = now(),
    wert           = null          -- Zweck erfüllt, siehe Kopf der Datei
  where id = p_id;

  perform app.log(v_case, 'konto', auth.uid()::text,
                  case when p_annehmen then 'korrektur.angenommen'
                       else 'korrektur.abgelehnt' end,
                  jsonb_build_object('feld', v_feld, 'role', v_rolle));

  return true;
end;
$$;

-- Die offenen Vorschläge eines Falls für die Fallkarte. Als Funktion und nicht
-- als reine Tabellenabfrage, weil die Oberfläche neben dem Vorschlag den
-- BISHERIGEN Wert braucht — sonst entscheidet das Haus im Blindflug.
create or replace function public.korrekturen(p_case uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare v_daten jsonb;
begin
  if not public.is_case_owner(p_case) then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id',       k.id,
           'feld',     k.feld,
           'neu',      k.wert,
           'bisher',   to_jsonb(d) -> k.feld,
           'quelle',   q.rolle,
           'rolle',    k.vorschlag_rolle,
           'erstellt', k.erstellt_am
         ) order by k.erstellt_am), '[]'::jsonb)
    into v_daten
  from public.korrekturvorschlag k
  left join public.deceased d on d.case_id = k.case_id
  left join public.feldquelle q on q.case_id = k.case_id and q.feld = k.feld
  where k.case_id = p_case and k.stand = 'offen';

  return v_daten;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 7  Rechte — bewusst als letzter Abschnitt der Datei
-- ═══════════════════════════════════════════════════════════════
revoke execute on all functions in schema app from public, anon, authenticated;
revoke all on schema app from public, anon, authenticated;

revoke execute on function public.angaben_ergaenzen(uuid, jsonb)
  from public, anon, authenticated;
revoke execute on function public.korrektur_entscheiden(uuid, boolean)
  from public, anon, authenticated;
revoke execute on function public.korrekturen(uuid)
  from public, anon, authenticated;

-- Der öffentliche Vertrag bleibt bei SECHS. angaben_ergaenzen ist dieselbe
-- Funktion mit neuem Rückgabetyp, keine siebte Tür.
grant execute on function public.redeem_invite(text)        to anon, authenticated;
grant execute on function public.get_case_by_session(uuid)  to anon, authenticated;
grant execute on function public.end_session(uuid)          to anon, authenticated;
grant execute on function public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)
  to anon, authenticated;
grant execute on function public.angaben_ergaenzen(uuid, jsonb)
  to anon, authenticated;
grant execute on function public.unterlage_fuer_sitzung(uuid, uuid)
  to anon, authenticated;

-- Nur das Haus entscheidet über Korrekturen.
grant execute on function public.korrektur_entscheiden(uuid, boolean) to authenticated;
grant execute on function public.korrekturen(uuid)                    to authenticated;

grant select on public.feldquelle          to authenticated;
grant select on public.korrekturvorschlag  to authenticated;

grant execute on function public.fall_verlauf(uuid, int)           to authenticated;
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
-- 8  Prüfungen — AKTIV
-- ═══════════════════════════════════════════════════════════════

-- 8.1  Der öffentliche Vertrag steht weiter bei genau sechs Funktionen.
-- Diese Prüfung gehört hierher und nicht in einen Kommentar: 0016 droppt und
-- legt eine der sechs neu an, und genau dabei entsteht sonst eine Überladung
-- mit dem voreingestellten PUBLIC EXECUTE.
do $$
declare v_zahl int; v_namen text;
begin
  select count(*), string_agg(p.proname, ', ' order by p.proname)
    into v_zahl, v_namen
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'app')
    and has_function_privilege('anon', p.oid, 'execute');

  if v_zahl <> 6 then
    raise exception 'anon darf % Funktionen ausfuehren, erwartet 6: %', v_zahl, v_namen;
  end if;
end $$;

-- 8.2  Keine Funktion ohne eigene ACL.
do $$
declare v_zahl int;
begin
  select count(*) into v_zahl
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'app') and p.proacl is null;

  if v_zahl <> 0 then
    raise exception '% Funktionen ohne eigene ACL — voreingestelltes PUBLIC EXECUTE', v_zahl;
  end if;
end $$;

-- 8.3  Keine gesetzte Angabe ohne Quelle.
-- Das ist die eigentliche Zusage dieser Migration: was einen Inhalt hat, hat
-- einen Urheber. Ohne diese Prüfung wäre ein Bestandsfall nach 0016 weiterhin
-- still überschreibbar, und niemandem fiele es auf.
--
-- false zählt hier nicht als Inhalt — dieselbe Begründung wie im Auslöser und
-- im Nachtrag. Die drei Stellen müssen dieselbe Regel benutzen, sonst schlägt
-- die Prüfung bei genau dem Zustand an, den die anderen zwei absichtlich
-- herstellen.
do $$
declare v_zahl int;
begin
  select count(*) into v_zahl
  from public.deceased d
  cross join lateral jsonb_each(to_jsonb(d)) as e
  where e.key <> 'case_id'
    and jsonb_typeof(e.value) <> 'null'
    and e.value <> to_jsonb(false)
    and not exists (
      select 1 from public.feldquelle q
      where q.case_id = d.case_id and q.feld = e.key
    );

  if v_zahl <> 0 then
    raise exception '% gesetzte Angaben ohne Eintrag in feldquelle', v_zahl;
  end if;
end $$;

-- 8.4  Kein Konto kann feldquelle oder korrekturvorschlag von Hand ändern.
-- Geprüft wird die ACL, nicht das Verhalten: diese beiden Tabellen gehören
-- dem Eigentümer der Migration, deshalb greift REVOKE hier wirklich — anders
-- als bei storage.objects in 0014.
do $$
declare v_recht text; v_tabelle text; v_rolle text;
begin
  foreach v_tabelle in array array['feldquelle', 'korrekturvorschlag'] loop
    foreach v_rolle in array array['anon', 'authenticated'] loop
      foreach v_recht in array array['INSERT', 'UPDATE', 'DELETE'] loop
        if has_table_privilege(v_rolle, 'public.' || v_tabelle, v_recht) then
          raise exception '% darf % auf public.% — Quelle waere umschreibbar',
            v_rolle, v_recht, v_tabelle;
        end if;
      end loop;
    end loop;
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- Verifikation von Hand — einzeln ausführen
-- ═══════════════════════════════════════════════════════════════
--
-- 1) Quellen eines Falls:
-- select feld, rolle, gesetzt_am from public.feldquelle
-- where case_id = '…' order by feld;
--
-- 2) Offene Vorschläge mit bisherigem Wert (so sieht es das Haus):
-- select public.korrekturen('…');
--
-- 3) Nach einer Entscheidung darf kein Inhalt mehr in der Tabelle stehen —
--    erwartet: 0.
-- select count(*) from public.korrekturvorschlag
-- where stand <> 'offen' and wert is not null;
--
-- 4) Im Protokoll stehen weiterhin nur Feldnamen — erwartet: keine Inhalte.
-- select action, detail from public.audit_log
-- where action in ('angaben.ergaenzt', 'korrektur.vorgeschlagen',
--                  'korrektur.angenommen', 'korrektur.abgelehnt',
--                  'angaben.quelle_gewechselt')
-- order by at desc limit 20;
