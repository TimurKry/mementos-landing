-- MementoOS MVP — Abhängigkeiten und Freigaben (0017)
--
-- Heute weiss das System nicht, dass eine Einäscherung ohne Freigabe nicht
-- stattfinden darf. Ein Termin lässt sich bestätigen, egal was fehlt: das
-- Krematorium drückt auf «Zeit bestätigen», und die Anwendung sagt ja. Was
-- eine Verpflichtung ist, steht heute höchstens als Aufgabe mit Freitext da —
-- für einen Menschen lesbar, für die Anwendung bedeutungslos.
--
-- Diese Migration baut den MECHANISMUS: eine Voraussetzung je Vorgang, eine
-- Matrix, welche Terminart welche Voraussetzung braucht, und eine Prüfung in
-- public.termin_bestaetigen, bevor bestätigt wird.
--
-- ══════════════════════════════════════════════════════════════════════
-- WAS HIER ANNAHME IST — bitte zuerst lesen
-- ══════════════════════════════════════════════════════════════════════
-- Der Mechanismus ist Architektur. WELCHE Voraussetzung WELCHEN Termin
-- blockiert, ist Branchenwissen, und das liegt nicht vor. Die Antworten eines
-- Branchenkenners sind zugesagt, aber nicht da.
--
-- Deshalb steht in app.voraussetzungen_fuer_termin (Abschnitt 3) ein kleiner
-- Satz, bei dem die Sicherheit hoch ist — drei Zeilen, jede ausdrücklich als
-- ANNAHME gekennzeichnet, nach demselben Verfahren wie die vier ungeprüften
-- Zeilen in 0015. Sie stehen dort, damit niemand sie für geprüft hält.
--
-- Aus derselben Unsicherheit folgen zwei Bauentscheidungen, die keine
-- Bequemlichkeit sind, sondern die einzige vertretbare Haltung, solange die
-- Liste eine Vermutung ist:
--
--   1) NUR EINE ERFASSTE VORAUSSETZUNG BLOCKIERT.
--      Eine fehlende Zeile blockiert nicht. Das Haus entscheidet je Vorgang,
--      welche Voraussetzungen gelten, indem es sie erfasst. Andernfalls hätte
--      diese Migration jeden bestehenden Vorgang von selbst angehalten — auf
--      Grundlage einer Liste, die niemand bestätigt hat. Ein Mechanismus, der
--      auf einer Vermutung steht, darf nicht von sich aus Arbeit stoppen.
--
--      Die Richtung des Versagens ist damit die umgekehrte wie in 0015, und
--      das ist Absicht: dort ging es um Sichtbarkeit personenbezogener Daten,
--      und dort ist «niemand sieht es» der sichere Zustand. Hier geht es um
--      das Anhalten eines Ablaufs, und «nichts wird angehalten» ist der
--      ehrliche Zustand einer Anwendung, die die Regel nicht sicher kennt.
--      Abschnitt 8.1 prüft dafür aktiv, dass die Matrix nicht still leer
--      läuft: ein Tippfehler in einer der drei Zeilen bricht die Migration ab,
--      statt die Blockade lautlos abzuschalten.
--
--   2) DAS HAUS WIRD NICHT BLOCKIERT.
--      Geprüft wird ausschliesslich in public.termin_bestaetigen, also im
--      äusseren Umkreis. Der Eigentümer pflegt seine Termine weiterhin direkt
--      über die Regel termine_owner (0011); es gibt keinen Auslöser auf
--      public.termine, der ihm dazwischenfährt.
--
--      Begründung: das Haus weiss mehr als die Anwendung. Die Bescheinigung
--      liegt im Fax, der Arzt hat am Telefon zugesagt, die Grabstelle ist
--      mündlich vergeben. Wer das Haus gegen eine unbestätigte Liste sperrt,
--      erzieht es dazu, die Voraussetzungen pauschal auf «erfüllt» zu setzen —
--      und dann steht die Blockade auch dort nicht mehr, wo sie richtig wäre.
--      Das Haus SIEHT den Blocker (Abschnitt 5 liefert ihn an die Oberfläche);
--      es entscheidet nur selbst.
--
--      Diese Zeile ist mit der Liste zusammen neu zu bewerten. Wenn ein
--      Bestatter sagt «nein, auch wir dürfen das nicht», wird daraus ein
--      Auslöser auf public.termine — dann aber als eigene Migration.
--
-- Was hier ausdrücklich NICHT gebaut wird: eine Voraussetzung, die ein
-- Eingeladener selbst auf «erfüllt» setzt. Das Krematorium würde damit seine
-- eigene Freigabe erteilen. Wer eine Voraussetzung erfüllt meldet, ist eine
-- eigene Entscheidung mit eigener Rechtefrage und gehört zu den Unterlagen-
-- paketen (0019), nicht hierher.
--
-- ── Rückgabe von termin_bestaetigen ───────────────────────────────────
-- boolean genügt nicht mehr. Bisher hiess false «darf nicht oder Sitzung
-- abgelaufen». Ein Blocker ist etwas Drittes: die Rolle darf, die Sitzung
-- lebt, und trotzdem geschieht nichts. Wer am Ofen steht und «Das war nicht
-- möglich» liest, ruft an. Wer «Die zweite Leichenschau fehlt» liest, weiss,
-- wen er anruft.
--
-- Deshalb jsonb, wie bei angaben_ergaenzen in 0016:
--   {"ok": false}
--   {"ok": false, "blockiert": ["zweite_leichenschau"]}
--   {"ok": true}
--
-- Ausgeliefert werden nur Voraussetzungen, die zur eigenen Terminart gehören
-- (die Matrix aus Abschnitt 3). Das ist keine Auskunft über den Vorgang,
-- sondern über den eigenen Termin — und ohne sie ist die Blockade eine
-- Wand ohne Aufschrift.
--
-- DROP statt CREATE OR REPLACE: der Rückgabetyp ändert sich. Bliebe die alte
-- Fassung stehen, entstünde eine Überladung, und die alte lebte mit ihrem
-- voreingestellten PUBLIC EXECUTE weiter (Lehre aus 0004/0005). Der
-- öffentliche Vertrag bleibt bei sechs Funktionen — Abschnitt 8.3 misst das.
--
-- ── Nebenbefund, der hier mitbehoben wird ─────────────────────────────
-- Der erste Anwendungsversuch dieser Migration brach an Prüfung 8.6 ab und
-- legte dabei etwas offen, das seit 0011 im System stand: anon hatte auf
-- public.termine volle Tabellenrechte und auf feldquelle/korrekturvorschlag
-- Leserechte — Voreinstellung von Supabase, nie entzogen. RLS hat es
-- aufgefangen, die Zusage «der äussere Umkreis kommt an keine Tabelle heran»
-- galt trotzdem nicht mehr. Abschnitt 7 entzieht es, Prüfung 8.6 misst ab
-- jetzt alle Tabellen. Begründung an beiden Stellen.
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0016 voraus.
--
-- Abschnitte:
--   1 Typ                          5 Blocker im rollengefilterten Fall
--   2 Tabelle                      6 termin_bestaetigen, neu gefasst
--   3 Die fünfte Matrix (ANNAHME)  7 Rechte
--   4 Offene Voraussetzungen       8 Prüfungen (aktiv)

-- ═══════════════════════════════════════════════════════════════
-- 1  Typ
-- ═══════════════════════════════════════════════════════════════
-- Eine Aufzählung und kein Freitext: eine Voraussetzung, die in zwei Häusern
-- verschieden geschrieben wird, lässt sich nicht gegen eine Terminart prüfen.
-- Die drei Werte sind der Satz aus dem Kopf dieser Datei — ANNAHMEN.
--
-- Erweitert wird über eine neue Migration mit add value, nicht hier: ein
-- vierter Wert ohne Zeile in der Matrix (Abschnitt 3) blockiert nichts und
-- fällt in Prüfung 8.2 auf.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'voraussetzungsart') then
    create type public.voraussetzungsart as enum (
      'todesbescheinigung',   -- ärztliche Bescheinigung des Todes
      'zweite_leichenschau',  -- zweite Leichenschau vor einer Feuerbestattung
      'grabstelle'            -- vergebene und bestätigte Grabstelle
    );
  end if;
end
$$;

-- ═══════════════════════════════════════════════════════════════
-- 2  Tabelle
-- ═══════════════════════════════════════════════════════════════
-- zustaendig ist bewusst NULLABLE und steht bewusst NICHT in der Matrix:
-- WER eine Voraussetzung beibringt, ist genauso Branchenwissen wie die Frage,
-- welchen Termin sie blockiert — und dort, wo es geraten wäre, wird es nicht
-- geraten. Das Haus trägt es je Vorgang ein; die Spalte ist eine Notiz, keine
-- Regel. Sie erteilt niemandem ein Recht.
--
-- erfuellt_am steht neben erfuellt, weil «seit wann steht das» die Frage ist,
-- die am Telefon gestellt wird. Gepflegt wird beides vom Haus.
create table if not exists public.voraussetzung (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.cases(id) on delete cascade,
  art         public.voraussetzungsart not null,
  zustaendig  public.role,
  erfuellt    boolean not null default false,
  erfuellt_am timestamptz,
  hinweis     text,
  created_at  timestamptz not null default now()
);

-- Eine Zeile je Art und Vorgang. Zwei Zeilen «Grabstelle» wären zwei
-- Wahrheiten über dieselbe Sache, und die Prüfung in Abschnitt 4 müsste
-- entscheiden, welche gilt.
create unique index if not exists voraussetzung_je_fall
  on public.voraussetzung (case_id, art);

create index if not exists voraussetzung_case_id_idx
  on public.voraussetzung (case_id);

alter table public.voraussetzung enable row level security;

-- Wie bei den übrigen Kindtabellen (0002, 0011): der Eigentümer des Vorgangs
-- darf alles, sonst niemand direkt. Der äussere Umkreis kommt an diese Tabelle
-- gar nicht — er erfährt über app.case_for_role nur die ART einer offenen
-- Voraussetzung zu seinem eigenen Termin, und sonst nichts: nicht die Notiz,
-- nicht die Zuständigkeit, nicht den Zeitpunkt.
drop policy if exists voraussetzung_owner on public.voraussetzung;
create policy voraussetzung_owner on public.voraussetzung
  for all using (public.is_case_owner(case_id))
  with check (public.is_case_owner(case_id));

grant select, insert, update, delete on public.voraussetzung to authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 3  Die fünfte Matrix — welche Terminart braucht welche Voraussetzung
-- ═══════════════════════════════════════════════════════════════
-- JEDE ZEILE HIER IST EINE ANNAHME. Keine ist von einem Bestatter bestätigt.
-- Neben jeder steht, WORAUF sie beruht — dieser Grund ist der Prüfstein beim
-- Gespräch mit einem Haus. Eine Zeile ohne Grund gehört nicht in diese Matrix.
--
-- Spiegel: voraussetzungenFuerTermin in mvp/src/lib/access.ts. Die beiden
-- dürfen nur gemeinsam wandern. Die harte Grenze ist diese hier.
--
-- Die drei fehlenden Terminarten sind kein Versehen:
--   abholung      — sie geschieht oft, bevor irgendein Papier vorliegt; genau
--                   darum ruft man ein Bestattungshaus.
--   trauerfeier   — eine Feier ist eine Verabredung, keine Amtshandlung.
--   abschiednahme — dito.
-- Auch das sind Annahmen, nur solche, die zu einer leeren Zeile führen.
create or replace function app.voraussetzungen_fuer_termin(p_art public.termin_art)
returns public.voraussetzungsart[]
language sql
immutable
set search_path = ''
as $$
  select case p_art

    -- ANNAHME: eine Überführung ist eine Fahrt mit einem Verstorbenen, und
    -- dafür wird der Tod ärztlich bescheinigt. Der Fahrdienst ist derjenige,
    -- der ohne das Papier unterwegs ist.
    when 'ueberfuehrung'::public.termin_art then
      array['todesbescheinigung']::public.voraussetzungsart[]

    -- ANNAHME: eine Feuerbestattung ist nicht rückholbar, und die zweite
    -- Leichenschau ist die Prüfung, die genau davor steht. Von den drei
    -- Zeilen ist das die, bei der ein Fehler am schwersten wiegt.
    when 'einaescherung'::public.termin_art then
      array['zweite_leichenschau']::public.voraussetzungsart[]

    -- ANNAHME: ohne vergebene Grabstelle gibt es kein Grab, in das beigesetzt
    -- werden kann. Die schwächste der drei Zeilen: in der Praxis ist die
    -- Stelle beim Friedhof vermutlich längst vergeben, wenn ein Termin
    -- überhaupt eingetragen wird.
    when 'beisetzung'::public.termin_art then
      array['grabstelle']::public.voraussetzungsart[]

    else array[]::public.voraussetzungsart[]
  end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4  Offene Voraussetzungen eines Termins
-- ═══════════════════════════════════════════════════════════════
-- Was diese Terminart braucht (Matrix), im Vorgang ERFASST ist und noch nicht
-- erfüllt. Alle drei Bedingungen zusammen — die mittlere ist die aus dem Kopf
-- der Datei: eine nicht erfasste Voraussetzung blockiert nicht.
--
-- Die einzige Stelle, an der «blockiert» entschieden wird. Abschnitt 5 und
-- Abschnitt 6 rufen beide hierher, damit die Anzeige und die Prüfung nicht
-- auseinanderlaufen können.
create or replace function app.offene_voraussetzungen(
  p_case uuid,
  p_art  public.termin_art
)
returns public.voraussetzungsart[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    array_agg(v.art order by v.art),
    array[]::public.voraussetzungsart[]
  )
  from public.voraussetzung v
  where v.case_id = p_case
    and not v.erfuellt
    and v.art = any(app.voraussetzungen_fuer_termin(p_art));
$$;

-- ═══════════════════════════════════════════════════════════════
-- 5  Blocker im rollengefilterten Fall mitliefern
-- ═══════════════════════════════════════════════════════════════
-- app.case_for_role bekommt je Termin den Schlüssel «blockiert_durch». Damit
-- weiss die Oberfläche, ob sie den Knopf «Zeit bestätigen» überhaupt anbieten
-- darf und was stattdessen dasteht — die Entscheidung selbst trifft weiterhin
-- public.termin_bestaetigen.
--
-- Ausgeliefert wird nur, was zur jeweiligen Terminart gehört, und die Zeilen
-- sind ohnehin schon nach app.termine_fuer_rolle gefiltert. Ein Eingeladener
-- erfährt damit nichts über Termine, die er nicht sieht.
--
-- Der Rest der Funktion ist unverändert aus 0012 übernommen. Sie steht hier
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
        'darf_bestaetigen', app.darf_bestaetigen(p_role, tm.art),
        'blockiert_durch',  to_jsonb(app.offene_voraussetzungen(p_case, tm.art))
      ) order by tm.von asc nulls last), '[]'::jsonb)
      from public.termine tm
      where tm.case_id = p_case
        and tm.art = any(app.termine_fuer_rolle(p_role))
    )
  )
  from public.cases c where c.id = p_case;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6  termin_bestaetigen, neu gefasst
-- ═══════════════════════════════════════════════════════════════
-- Reihenfolge der Prüfungen ist dieselbe wie in 0011, mit einem vierten
-- Schritt am Ende: Sitzung → gehört der Termin zu diesem Vorgang → darf diese
-- Rolle diese Art bestätigen → ist etwas offen.
--
-- Der Blocker steht bewusst ZULETZT. Wer nicht bestätigen darf, soll nicht
-- über die Antwort erfahren, was einem fremden Termin fehlt.
--
-- Ins Protokoll geht auch der abgewiesene Versuch. Ein Termin, der dreimal
-- nicht bestätigt werden konnte, ist genau das, was das Haus sehen muss —
-- und ohne Eintrag sieht es gar nichts, weil aussen niemand anruft. Wie
-- überall gehen nur Namen hinein: Art, Rolle und die Art der Voraussetzung.
drop function if exists public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text);

create function public.termin_bestaetigen(
  p_session uuid,
  p_termin  uuid,
  p_von     timestamptz,
  p_bis     timestamptz,
  p_hinweis text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case  uuid;
  v_role  public.role;
  v_art   public.termin_art;
  v_offen public.voraussetzungsart[];
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
    return jsonb_build_object('ok', false);
  end if;

  -- Gehört der Termin zu DIESEM Vorgang? Sonst liesse sich mit einer
  -- gültigen Sitzung ein fremder Termin ändern.
  select tm.art into v_art
  from public.termine tm
  where tm.id = p_termin and tm.case_id = v_case;

  if not found then
    return jsonb_build_object('ok', false);
  end if;

  if not app.darf_bestaetigen(v_role, v_art) then
    return jsonb_build_object('ok', false);
  end if;

  -- Der neue vierte Schritt.
  v_offen := app.offene_voraussetzungen(v_case, v_art);

  if array_length(v_offen, 1) > 0 then
    perform app.log(v_case, 'invite', p_session::text, 'termin.blockiert',
                    jsonb_build_object('art', v_art, 'role', v_role,
                                       'offen', to_jsonb(v_offen)));
    return jsonb_build_object('ok', false, 'blockiert', to_jsonb(v_offen));
  end if;

  update public.termine
     set von     = p_von,
         bis     = p_bis,
         hinweis = p_hinweis,
         status  = 'bestaetigt'::public.termin_status
   where id = p_termin;

  perform app.log(v_case, 'invite', p_session::text, 'termin.bestaetigt',
                  jsonb_build_object('art', v_art, 'role', v_role));

  return jsonb_build_object('ok', true);
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 7  Rechte — bewusst als letzter Abschnitt der Datei
-- ═══════════════════════════════════════════════════════════════
-- CREATE FUNCTION vergibt in PostgreSQL EXECUTE an PUBLIC. ALTER DEFAULT
-- PRIVILEGES aus 0004 wirkt auf diesem Projekt nicht, deshalb steht der Entzug
-- in jeder Migration am Ende. Nach diesem Block wird nichts mehr angelegt.
revoke execute on all functions in schema app from public, anon, authenticated;
revoke all on schema app from public, anon, authenticated;

revoke execute on function public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)
  from public, anon, authenticated;

-- ── Der Riegel, den die Voreinstellung offen lässt ────────────────────
-- Supabase legt für JEDE neue Tabelle in public per ALTER DEFAULT PRIVILEGES
-- Rechte für anon und authenticated an. Ein «grant … to authenticated» sagt
-- deshalb nichts darüber, was anon hat — das lag schon vorher da, und ohne
-- ausdrückliches REVOKE bleibt es liegen.
--
-- Gefunden beim ersten Anwenden dieser Migration: Prüfung 8.6 hat den Lauf
-- abgebrochen. Der Befund geht über 0017 hinaus und betrifft alles, was seit
-- 0011 angelegt wurde:
--
--   public.termine            (0011) — anon hatte SELECT, INSERT, UPDATE, DELETE
--   public.feldquelle         (0016) — anon hatte SELECT
--   public.korrekturvorschlag (0016) — anon hatte SELECT
--
-- Die älteren Tabellen sind sauber: 0004/0005 haben sie einzeln entzogen.
-- Ab 0011 wurde nur noch gewährt und nie entzogen.
--
-- Ausgenutzt werden konnte es nicht: auf allen dreien ist RLS an, und jede
-- Regel läuft über public.is_case_owner, das ohne Anmeldung nie wahr wird.
-- Aber die Zusage des Projekts lautet, dass der äussere Umkreis an keine
-- Tabelle herankommt, und sie galt seit 0011 nicht mehr. Eine einzige zu weit
-- gefasste Regel hätte daraus den Vollzugriff auf alle Termine gemacht — bei
-- public.termine sogar schreibend, über das offene Netz.
--
-- Weshalb es niemandem auffiel: Prüfung 8.4 in 0016 sah nur INSERT, UPDATE
-- und DELETE nach, nicht SELECT. Sie lief grün, während zwei Tabellen offen
-- standen. Eine Prüfung, die den halben Fall abdeckt, ist gefährlicher als
-- keine — sie erzeugt die Ruhe, die zur ganzen gehört hätte.
--
-- Die Voreinstellung selbst wird hier NICHT angefasst. Sie gehört Supabase,
-- wird beim Anlegen von Erweiterungen neu gesetzt, und 0004 hat bereits
-- gezeigt, dass ALTER DEFAULT PRIVILEGES auf diesem Projekt nicht greift.
-- Verlassen wird sich stattdessen auf das ausdrückliche REVOKE je Tabelle —
-- und auf Prüfung 8.6, die ab jetzt bei jeder Migration ALLE Tabellen misst.
revoke all on public.voraussetzung      from anon;
revoke all on public.termine            from anon;
revoke all on public.feldquelle         from anon;
revoke all on public.korrekturvorschlag from anon;

-- Der öffentliche Vertrag: unverändert sechs Funktionen für anon.
-- termin_bestaetigen ist dieselbe Tür wie vorher, sie antwortet nur
-- ausführlicher.
grant execute on function public.redeem_invite(text)        to anon, authenticated;
grant execute on function public.get_case_by_session(uuid)  to anon, authenticated;
grant execute on function public.end_session(uuid)          to anon, authenticated;
grant execute on function public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)
  to anon, authenticated;
grant execute on function public.angaben_ergaenzen(uuid, jsonb)
  to anon, authenticated;
grant execute on function public.unterlage_fuer_sitzung(uuid, uuid)
  to anon, authenticated;

-- Für das Haus.
grant execute on function public.korrektur_entscheiden(uuid, boolean) to authenticated;
grant execute on function public.korrekturen(uuid)                    to authenticated;
grant execute on function public.fall_verlauf(uuid, int)              to authenticated;

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
-- 8  Prüfungen — AKTIV, nicht auskommentiert
-- ═══════════════════════════════════════════════════════════════

-- 8.1  Die Matrix steht vollständig da, wie sie nach dieser Migration sein
-- MUSS — drei Zeilen mit Inhalt, drei ohne.
--
-- Das ist die wichtigste Prüfung dieser Datei. Eine falsch geschriebene
-- Terminart macht aus einer Blockade eine leere Liste: die Migration liefe
-- grün durch, die Oberfläche zeigte keinen Blocker, und niemandem fiele auf,
-- dass die Prüfung abgeschaltet ist. Bei einem Mechanismus, der nur dann
-- etwas tut, wenn er anhält, ist Schweigen der gefährlichste Zustand.
do $$
declare
  v_soll text[][] := array[
    ['abholung',      ''                    ],
    ['ueberfuehrung', 'todesbescheinigung'  ],
    ['einaescherung', 'zweite_leichenschau' ],
    ['trauerfeier',   ''                    ],
    ['beisetzung',    'grabstelle'          ],
    ['abschiednahme', ''                    ]
  ];
  v_art public.termin_art;
  v_ist text;
  i int;
begin
  -- Jede Terminart der Aufzählung kommt genau einmal vor. Sonst prüft die
  -- Schleife an einer neuen Art vorbei, ohne es zu sagen.
  if array_length(v_soll, 1) <> (select count(*) from unnest(enum_range(null::public.termin_art))) then
    raise exception 'Die Sollwerte decken nicht alle Terminarten ab';
  end if;

  for i in 1 .. array_length(v_soll, 1) loop
    v_art := v_soll[i][1]::public.termin_art;
    v_ist := array_to_string(app.voraussetzungen_fuer_termin(v_art), ',');

    if v_ist is distinct from v_soll[i][2] then
      raise exception 'Voraussetzungen von % sind «%», erwartet «%»',
        v_art, v_ist, v_soll[i][2];
    end if;
  end loop;
end $$;

-- 8.2  Jeder Wert der Aufzählung blockiert mindestens eine Terminart.
-- Eine Voraussetzung, die in keiner Zeile der Matrix steht, lässt sich
-- erfassen, im Bogen anzeigen und abhaken — und hält nie etwas auf. Das ist
-- schlimmer als keine Voraussetzung: es sieht nach einer Sicherung aus.
do $$
declare v_ohne text;
begin
  select string_agg(a::text, ', ' order by a::text) into v_ohne
  from unnest(enum_range(null::public.voraussetzungsart)) a
  where not exists (
    select 1 from unnest(enum_range(null::public.termin_art)) t
    where a = any(app.voraussetzungen_fuer_termin(t))
  );

  if v_ohne is not null then
    raise exception 'Voraussetzungsarten, die keinen Termin blockieren: %', v_ohne;
  end if;
end $$;

-- 8.3  Der öffentliche Vertrag steht weiter bei genau sechs Funktionen.
-- 0017 droppt und legt eine der sechs neu an — genau dabei entsteht sonst
-- eine Überladung mit dem voreingestellten PUBLIC EXECUTE.
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

-- 8.4  Keine Funktion ohne eigene ACL.
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

-- 8.5  termin_bestaetigen gibt es genau einmal, und zwar mit jsonb.
-- Bliebe die alte boolean-Fassung als Überladung stehen, würde PostgREST je
-- nach Aufruf die eine oder die andere wählen — und die alte prüft keinen
-- Blocker. Das wäre die Migration, die aussieht, als hätte sie gewirkt.
do $$
declare v_zahl int; v_typ text;
begin
  select count(*), string_agg(pg_get_function_result(p.oid), ', ')
    into v_zahl, v_typ
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'termin_bestaetigen';

  if v_zahl <> 1 then
    raise exception 'public.termin_bestaetigen existiert % mal (%) — Ueberladung', v_zahl, v_typ;
  end if;
  if v_typ <> 'jsonb' then
    raise exception 'public.termin_bestaetigen gibt % zurueck, erwartet jsonb', v_typ;
  end if;
end $$;

-- 8.6  Der äussere Umkreis kommt an KEINE Tabelle in public heran.
--
-- Bewusst über alle Tabellen und alle vier Rechte, nicht nur über die neue:
-- genau die Verengung auf «die Tabellen dieser Migration» hat in 0016
-- übersehen, dass zwei Tabellen für anon lesbar blieben. Eine Prüfung, die
-- nur das misst, was die eigene Migration anfasst, findet nie etwas, das
-- vorher schief ging.
--
-- Damit steht neben den zwei Invarianten für Funktionen — genau sechs für
-- anon, keine ohne eigene ACL — jetzt eine dritte für Tabellen: null.
do $$
declare v_offen text;
begin
  select string_agg(format('%s(%s)', t.relname, t.recht), ', ' order by t.relname, t.recht)
    into v_offen
  from (
    select c.relname, r.recht
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace,
         unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) as r(recht)
    where n.nspname = 'public'
      and c.relkind = 'r'
      and has_table_privilege('anon', c.oid, r.recht)
  ) t;

  if v_offen is not null then
    raise exception 'anon hat Tabellenrechte in public: %', v_offen;
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════
-- Verifikation von Hand — einzeln ausführen
-- ═══════════════════════════════════════════════════════════════
--
-- 1) Die fünfte Matrix zum Gegenlesen — die Tabelle, die einem Bestatter
--    vorgelegt wird. Erwartet: drei Zeilen mit Inhalt.
-- select t as terminart, app.voraussetzungen_fuer_termin(t) as braucht
-- from unnest(enum_range(null::public.termin_art)) t order by 1;
--
-- 2) Umgekehrt — welche Termine hält eine Voraussetzung auf?
-- select a as voraussetzung, array_agg(t order by t) as haelt_auf
-- from unnest(enum_range(null::public.voraussetzungsart)) a,
--      unnest(enum_range(null::public.termin_art)) t
-- where a = any(app.voraussetzungen_fuer_termin(t))
-- group by a order by 1;
--
-- 3) Was ist in einem Vorgang offen, je Terminart?
-- select tm.art, app.offene_voraussetzungen(tm.case_id, tm.art)
-- from public.termine tm where tm.case_id = '…' order by tm.art;
--
-- 4) Eine nicht erfasste Voraussetzung blockiert NICHT — erwartet: {}.
--    (Vorgang ohne eine einzige Zeile in public.voraussetzung.)
-- select app.offene_voraussetzungen('…', 'einaescherung');
--
-- 5) Die abgewiesenen Versuche im Protokoll — Namen, keine Inhalte.
-- select at, action, detail from public.audit_log
-- where action = 'termin.blockiert' order by at desc limit 20;
--
-- 6) Was darf anon ausführen? Erwartet: genau sechs, unverändert.
-- select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and has_function_privilege('anon', p.oid, 'execute')
-- order by 1;
--
-- 7) Keine Funktion ohne eigene ACL — erwartet: 0.
-- select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null;
--
-- 8) Die dritte Invariante: anon hat auf keine Tabelle in public ein Recht.
--    Erwartet: leer. Vor 0017 stand hier
--    «feldquelle(SELECT), korrekturvorschlag(SELECT), termine(DELETE),
--     termine(INSERT), termine(SELECT), termine(UPDATE)».
-- select c.relname, r.recht
-- from pg_class c join pg_namespace n on n.oid = c.relnamespace,
--      unnest(array['SELECT','INSERT','UPDATE','DELETE']) as r(recht)
-- where n.nspname='public' and c.relkind='r'
--   and has_table_privilege('anon', c.oid, r.recht)
-- order by 1, 2;
