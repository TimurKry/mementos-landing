-- MementoOS MVP — Rechte je Feld statt je Feldgruppe (0015)
--
-- Anlass: die Durchsicht des echten Ablaufs durch einen Branchenkenner hat drei
-- Zugriffsfehler in der Matrix aus 0003/0004 gezeigt. Sie lassen sich mit
-- Feldgruppen NICHT richtig beheben — genau das ist der Befund:
--
--   1) Ein Steinmetz braucht Vor-, Nachname und die beiden Lebensdaten. Sie
--      stehen auf dem Stein. Die Gruppe org enthält aber auch die Anschrift
--      des Haushalts. «Steinmetz bekommt org» hätte den Fehler durch einen
--      grösseren ersetzt.
--   2) Ein Fahrdienst muss wissen, ob ein Infektionshinweis vorliegt — die
--      Leute tragen den Menschen. Das steht in der Gruppe sens, dort steht
--      aber auch die Freigabe zur Einäscherung. Die ist nicht seine Sache.
--   3) Ein Friedhof braucht das Sargmass, sonst passt die Grabkammer nicht.
--      Das steht in op, dort steht aber auch die Körpergrösse, die er nach
--      dem Sargmass nicht mehr braucht.
--
-- Eine Feldgruppe ist eine Zusage, dass ihre Felder immer gemeinsam wandern.
-- Für vorname/nachname stimmt das. Für geburtsdatum und anschrift stimmt es
-- nicht, und für infektionshinweis und freigabe_einaescherung auch nicht. Die
-- Gruppe war eine bequeme Abkürzung, und Abkürzungen im Rechtemodell zahlt
-- man später mit Feldern, die jemand sieht, weil sie zufällig nebenan lagen.
--
-- Ab hier gilt:
--   app.sichtbare_felder(rolle)  — DIE WAHRHEIT. Eine Liste von Feldnamen.
--   app.feld_gruppe(feld)        — Feld → Gruppe. Nur noch Beschriftung.
--   app.allowed_tiers(rolle)     — ABGELEITET aus den beiden. Bleibt bestehen,
--                                  weil das Ereignisprotokoll (case.view in
--                                  0004) sie mitschreibt; kein Aufrufer muss
--                                  geändert werden.
--
-- Der wichtigere Gewinn ist die Richtung des Versagens. Bisher war ein neues
-- Feld in einer bestehenden Gruppe sofort für jede Rolle sichtbar, die diese
-- Gruppe hält — ein ALTER TABLE hätte still Rechte vergeben. Jetzt ist ein
-- neues Feld für niemanden sichtbar, bis es in der Matrix steht. Bei einem
-- Datenbestand über Verstorbene ist das die einzig vertretbare Richtung.
--
-- Vierte Änderung, nicht aus der Liste oben, mit eigener Begründung:
--   Das Krematorium bekommt das Sterbedatum. Eine Feuerbestattung darf vor
--   Ablauf der gesetzlichen Wartefrist nicht stattfinden, und die Frist läuft
--   ab dem Sterbedatum. Ein Krematorium, das das Datum nicht sieht, kann den
--   frühesten zulässigen Termin nicht selbst ausrechnen — es müsste jedes Mal
--   beim Bestatter nachfragen. In der Praxis liegt ihm die Sterbeurkunde
--   ohnehin vor. Das Zurückhalten war hier kein Schutz, sondern ein Mangel.
--
-- BEWUSST NICHT GEÄNDERT, zur Entscheidung durch den Eigentümer:
--   · Floristik sieht weiterhin KEIN Feld. Auf dem Schleifenband steht in der
--     Praxis der Name. Solange das nicht bestätigt ist, bleibt es geschlossen.
--   · Trauerredner sieht weiterhin KEIN Feld. Von allen Rollen hat er den
--     grössten fachlichen Bedarf — Name, Lebensdaten, Konfession. Genau
--     deshalb wird das nicht nebenbei mitentschieden.
--   · Klinik behält die Freigabe zur Einäscherung und das Sargmass. 1:1 aus
--     der alten Gruppe sens/op übernommen, nicht geprüft.
--   · Verbund-Zentrale sieht weiterhin Vor- und Nachnamen. Für eine
--     hausübergreifende Übersicht wären Namen eigentlich zu viel.
-- Jede dieser vier Zeilen ist eine Übernahme des alten Stands, keine
-- Bestätigung. Sie stehen hier, damit niemand sie für geprüft hält.
--
-- Das Skript ist idempotent. Die Prüfungen am Ende sind AKTIV und brechen die
-- Migration ab: sie fangen Tippfehler in Feldnamen: ein falsch geschriebenes
-- Feld wäre sonst für alle unsichtbar, und das fällt niemandem auf.
--
-- Abschnitte:
--   1 Feld → Gruppe                4 Verstorbene Person je Rolle
--   2 Sichtbare Felder je Rolle    5 Rechte
--   3 Feldgruppen, abgeleitet      6 Prüfungen (aktiv)

-- ═══════════════════════════════════════════════════════════════
-- 1  Feld → Gruppe
-- ═══════════════════════════════════════════════════════════════
-- Die Gruppe entscheidet nichts mehr. Sie ist die Überschrift im
-- Erfassungsbogen und der Eintrag im Ereignisprotokoll. Spiegel: tierFields
-- in mvp/src/lib/access.ts.
create or replace function app.feld_gruppe(p_feld text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_feld in ('vorname', 'nachname')
      then 'kern'
    when p_feld in ('geburtsdatum', 'sterbedatum', 'konfession', 'anschrift')
      then 'org'
    when p_feld in ('groesse_cm', 'gewicht_kg', 'sargmass')
      then 'op'
    when p_feld in ('herzschrittmacher', 'infektionshinweis', 'freigabe_einaescherung')
      then 'sens'
  end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2  Sichtbare Felder je Rolle — die Wahrheit
-- ═══════════════════════════════════════════════════════════════
-- Neben jeder Rolle steht, WOFÜR sie das Feld braucht. Ohne diesen Grund
-- gehört ein Feld nicht in die Zeile; er ist der Prüfstein bei der nächsten
-- Durchsicht. Spiegel: sichtbareFelder in mvp/src/lib/access.ts — die beiden
-- dürfen nur gemeinsam wandern.
create or replace function app.sichtbare_felder(p_role public.role)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select case p_role

    -- Führt den Fall. Sieht alles, was erfasst ist.
    when 'bestatter'::public.role then array[
      'vorname', 'nachname',
      'geburtsdatum', 'sterbedatum', 'konfession', 'anschrift',
      'groesse_cm', 'gewicht_kg', 'sargmass',
      'herzschrittmacher', 'infektionshinweis', 'freigabe_einaescherung']

    -- Die Angehörigen. Sie liefern den grössten Teil dieser Angaben selbst;
    -- die medizinischen Hinweise bleiben draussen — sie stammen nicht von
    -- ihnen und sind für ihre Entscheidungen nicht nötig.
    when 'familie'::public.role then array[
      'vorname', 'nachname',
      'geburtsdatum', 'sterbedatum', 'konfession', 'anschrift',
      'groesse_cm', 'gewicht_kg', 'sargmass']

    -- sterbedatum: gesetzliche Wartefrist vor der Einäscherung (neu, s. o.).
    -- sargmass/groesse/gewicht: Ofen und Einfahrt.
    -- herzschrittmacher: darf nicht mit in den Ofen.
    -- infektionshinweis: Arbeitsschutz der Beschäftigten.
    -- freigabe_einaescherung: ohne sie darf nicht eingeäschert werden.
    -- Kein konfession, kein anschrift — für den Vorgang ohne Belang.
    when 'krematorium'::public.role then array[
      'vorname', 'nachname', 'sterbedatum',
      'groesse_cm', 'gewicht_kg', 'sargmass',
      'herzschrittmacher', 'infektionshinweis', 'freigabe_einaescherung']

    -- infektionshinweis: NEU. Die Trägerinnen und Träger fassen den Menschen
    -- an; wer eine Schutzmassnahme braucht, muss das vorher wissen und nicht
    -- am Fahrzeug erfahren.
    -- Kein herzschrittmacher: für das Tragen und Fahren ohne Bedeutung, das
    -- ist Sache des Krematoriums. Kein freigabe_einaescherung: nicht seine
    -- Entscheidung. Beide lagen bisher in derselben Gruppe — das ist der
    -- Grund, weshalb diese Migration überhaupt nötig war.
    when 'transport'::public.role then array[
      'vorname', 'nachname',
      'groesse_cm', 'gewicht_kg', 'sargmass',
      'infektionshinweis']

    -- sargmass: NEU. Die Grabkammer oder die Gruft muss den Sarg aufnehmen;
    -- ohne das Mass wird das erst am Grab bemerkt.
    -- gewicht_kg: NEU. Zahl der Trägerinnen und Träger, Absenkgerät.
    -- Kein groesse_cm: nach dem Sargmass keine zusätzliche Aussage.
    -- konfession: das Grabfeld hängt daran. anschrift: der letzte Wohnsitz
    -- entscheidet über das Nutzungsrecht und die Gebühr.
    when 'friedhof'::public.role then array[
      'vorname', 'nachname',
      'geburtsdatum', 'sterbedatum', 'konfession', 'anschrift',
      'gewicht_kg', 'sargmass']

    -- Beurkundung des Sterbefalls. Personenstandsdaten, sonst nichts.
    when 'standesamt'::public.role then array[
      'vorname', 'nachname',
      'geburtsdatum', 'sterbedatum', 'konfession', 'anschrift']

    -- Herkunft des Falls, Leichenschau. 1:1 aus dem alten Stand übernommen.
    when 'klinik'::public.role then array[
      'vorname', 'nachname',
      'groesse_cm', 'gewicht_kg', 'sargmass',
      'herzschrittmacher', 'infektionshinweis', 'freigabe_einaescherung']

    -- NEU: bisher sah der Steinmetz nichts und konnte deshalb keinen Stein
    -- beschriften. Genau die vier Angaben, die eingemeisselt werden — kein
    -- Feld mehr. Keine Anschrift: sie steht nicht auf dem Stein.
    when 'steinmetz'::public.role then array[
      'vorname', 'nachname', 'geburtsdatum', 'sterbedatum']

    -- Hausübergreifende Übersicht. Übernommen, nicht geprüft (s. o.).
    when 'verbund'::public.role then array[
      'vorname', 'nachname']

    -- floristik, redner: kein Feld. Sie erhalten Zeit und Ort über die
    -- Termine (app.termine_fuer_rolle, 0011) und damit genau das, was sie
    -- für ihre Arbeit brauchen — ohne eine Angabe über den Menschen.
    else array[]::text[]
  end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3  Feldgruppen — jetzt abgeleitet
-- ═══════════════════════════════════════════════════════════════
-- Eine Rolle «hält» eine Gruppe, wenn sie mindestens ein Feld daraus sieht.
-- Damit bleibt der Eintrag im Ereignisprotokoll grob wie bisher lesbar. Er ist
-- absichtlich grob: das Protokoll soll festhalten, dass eine Ansicht
-- stattgefunden hat, nicht die Felder noch einmal aufzählen.
create or replace function app.allowed_tiers(p_role public.role)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce((
    -- Nicht alphabetisch: in der Reihenfolge des Erfassungsbogens. "kern,
    -- org, op, sens" liest sich wie das Formular, "kern, op, org, sens"
    -- liest sich wie ein Sortierfehler.
    select array_agg(g order by array_position(array['kern','org','op','sens'], g))
    from (
      select distinct app.feld_gruppe(f) as g
      from unnest(app.sichtbare_felder(p_role)) as f
    ) s
    where g is not null
  ), array[]::text[]);
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4  Verstorbene Person, gefiltert
-- ═══════════════════════════════════════════════════════════════
-- Vorher wurde je Gruppe ein jsonb_build_object mit fest getippten Feldnamen
-- zusammengesetzt. Jetzt wird die Zeile nach jsonb umgewandelt und gegen die
-- Liste gefiltert. Das ist nicht nur kürzer: eine neue Spalte kann nicht mehr
-- versehentlich mitkommen, weil sie im Bauplan mitwuchs. Sie kommt erst mit,
-- wenn sie in Abschnitt 2 steht.
--
-- case_id fällt dabei von selbst weg — es steht in keiner Zeile der Matrix.
-- Das ist beabsichtigt und nicht bloss bequem: die case_id verlässt den
-- Server nie (0004).
--
-- NULL bei fehlender Zeile bleibt wie bisher: kein Datensatz ist etwas
-- anderes als ein leerer Datensatz, und die Anwendung unterscheidet das.
create or replace function app.deceased_for_role(p_case uuid, p_role public.role)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select jsonb_object_agg(e.key, e.value)
    from jsonb_each(to_jsonb(d)) as e
    where e.key = any(app.sichtbare_felder(p_role))
  ), '{}'::jsonb)
  from public.deceased d
  where d.case_id = p_case;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 5  Rechte — bewusst als letzter Abschnitt der Datei
-- ═══════════════════════════════════════════════════════════════
-- CREATE FUNCTION vergibt in PostgreSQL EXECUTE an PUBLIC. ALTER DEFAULT
-- PRIVILEGES aus 0004 wirkt auf diesem Projekt nicht, deshalb steht der
-- Entzug in jeder Migration am Ende. Betroffen sind hier nur die beiden neuen
-- Funktionen in app/ — der öffentliche Vertrag bleibt unberührt bei sechs.
revoke execute on all functions in schema app from public, anon, authenticated;
revoke all on schema app from public, anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 6  Prüfungen — AKTIV, nicht auskommentiert
-- ═══════════════════════════════════════════════════════════════
-- Diese vier laufen bei jedem Anwenden mit und brechen ab. Sie prüfen nur
-- innere Widersprüche, brauchen keine Daten und gehen auch lokal ohne
-- Supabase durch.

-- 6.1  Jeder Feldname in der Matrix ist eine echte Spalte.
-- Ein Tippfehler wäre sonst unsichtbar: das Feld verschwindet für alle, die
-- Migration läuft grün durch, und der Fehler fällt erst dem Steinmetz auf.
do $$
declare v_fehlt text;
begin
  select string_agg(distinct x.f, ', ' order by x.f) into v_fehlt
  from (
    select r.rolle, unnest(app.sichtbare_felder(r.rolle)) as f
    from (select unnest(enum_range(null::public.role)) as rolle) r
  ) x
  where not exists (
    select 1 from information_schema.columns c
    where c.table_schema = 'public' and c.table_name = 'deceased'
      and c.column_name = x.f
  );

  if v_fehlt is not null then
    raise exception 'app.sichtbare_felder nennt Spalten, die es in public.deceased nicht gibt: %', v_fehlt;
  end if;
end $$;

-- 6.2  Jede Datenspalte von public.deceased hat eine Gruppe.
-- Sonst taucht sie im Erfassungsbogen ohne Überschrift auf und fehlt im
-- Protokolleintrag. case_id ist der Schlüssel und ausgenommen.
do $$
declare v_ohne text;
begin
  select string_agg(c.column_name, ', ' order by c.column_name) into v_ohne
  from information_schema.columns c
  where c.table_schema = 'public' and c.table_name = 'deceased'
    and c.column_name <> 'case_id'
    and app.feld_gruppe(c.column_name) is null;

  if v_ohne is not null then
    raise exception 'Spalten von public.deceased ohne Feldgruppe: %', v_ohne;
  end if;
end $$;

-- 6.3  Schreiben setzt Sehen voraus.
-- Wer ein Feld ändern darf, muss es auch lesen dürfen — sonst schreibt jemand
-- in eine Angabe, deren bisherigen Wert er nicht kennt, und überschreibt still
-- die Arbeit eines anderen. app.felder_schreibbar stammt aus 0012.
do $$
declare v_fehler text;
begin
  select string_agg(format('%s: %s', x.rolle, x.f), '; ' order by x.rolle::text, x.f)
    into v_fehler
  from (
    select r.rolle, unnest(app.felder_schreibbar(r.rolle)) as f
    from (select unnest(enum_range(null::public.role)) as rolle) r
  ) x
  where not (x.f = any(app.sichtbare_felder(x.rolle)));

  if v_fehler is not null then
    raise exception 'Rollen dürfen Felder schreiben, die sie nicht sehen: %', v_fehler;
  end if;
end $$;

-- 6.4  Die vollständige Gruppentabelle, wie sie nach dieser Migration sein
-- MUSS. Vier Zeilen sind neu (krematorium, transport, friedhof, steinmetz),
-- sieben sind unverändert. Die unveränderten stehen mit dabei, weil eine
-- Umstellung des Rechtemodells nur dann geglückt ist, wenn sie an den
-- Stellen, die niemand ändern wollte, nachweislich nichts getan hat.
do $$
declare
  v_soll text[][] := array[
    ['bestatter',   'kern,org,op,sens'],
    ['familie',     'kern,org,op'      ],
    ['krematorium', 'kern,org,op,sens' ],  -- neu: org (sterbedatum)
    ['transport',   'kern,op,sens'     ],  -- neu: sens (infektionshinweis)
    ['friedhof',    'kern,org,op'      ],  -- neu: op (sargmass, gewicht_kg)
    ['standesamt',  'kern,org'         ],
    ['klinik',      'kern,op,sens'     ],
    ['steinmetz',   'kern,org'         ],  -- neu: war leer
    ['redner',      ''                 ],
    ['floristik',   ''                 ],
    ['verbund',     'kern'             ]
  ];
  v_rolle public.role;
  v_ist   text;
  i int;
begin
  for i in 1 .. array_length(v_soll, 1) loop
    v_rolle := v_soll[i][1]::public.role;
    v_ist   := array_to_string(app.allowed_tiers(v_rolle), ',');

    if v_ist is distinct from v_soll[i][2] then
      raise exception 'Feldgruppen von % sind «%», erwartet «%»',
        v_rolle, v_ist, v_soll[i][2];
    end if;
  end loop;

  -- Und die drei Korrekturen noch einmal auf Feldebene, weil die Gruppe
  -- gerade nicht mehr die Aussage ist: eine Rolle kann die richtige Gruppe
  -- halten und trotzdem das falsche Feld daraus sehen.
  if not ('infektionshinweis' = any(app.sichtbare_felder('transport'))) then
    raise exception 'Fahrdienst sieht den Infektionshinweis nicht';
  end if;
  if 'freigabe_einaescherung' = any(app.sichtbare_felder('transport')) then
    raise exception 'Fahrdienst sieht die Freigabe zur Einäscherung — das war der Fehler';
  end if;
  if not ('sargmass' = any(app.sichtbare_felder('friedhof'))) then
    raise exception 'Friedhof sieht das Sargmass nicht';
  end if;
  if 'anschrift' = any(app.sichtbare_felder('steinmetz')) then
    raise exception 'Steinmetz sieht die Anschrift — das war der Fehler';
  end if;
  if not ('sterbedatum' = any(app.sichtbare_felder('krematorium'))) then
    raise exception 'Krematorium sieht das Sterbedatum nicht';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- Verifikation von Hand — einzeln ausführen
-- ═══════════════════════════════════════════════════════════════
--
-- 1) Die ganze Matrix als Tabelle zum Gegenlesen:
-- select r as rolle, app.allowed_tiers(r) as gruppen, app.sichtbare_felder(r) as felder
-- from unnest(enum_range(null::public.role)) r order by 1;
--
-- 2) Umgekehrt — wer sieht ein bestimmtes Feld? Das ist die Frage, die im
--    Gespräch mit einem Haus wirklich gestellt wird.
-- select f, array_agg(r order by r) as rollen
-- from unnest(enum_range(null::public.role)) r,
--      unnest(app.sichtbare_felder(r)) f
-- group by f order by 1;
--
-- 3) Was darf anon ausführen? Erwartet: genau sechs, unverändert.
-- select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and has_function_privilege('anon', p.oid, 'execute')
-- order by 1;
--
-- 4) Keine Funktion ohne eigene ACL — erwartet: 0.
-- select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null;
