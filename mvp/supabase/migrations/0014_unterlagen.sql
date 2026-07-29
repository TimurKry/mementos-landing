-- MementoOS MVP — Unterlagen wirklich ablegen (0014)
--
-- documents gibt es seit 0001, mit storage_path und visible_to. Benutzt wurde
-- beides nie: die Anwendung zeigte eine Liste von Namen, hinter denen keine
-- Datei lag. Ein Krematorium sah «Einäscherungsantrag — ausstehend» und
-- konnte ihn nirgends öffnen.
--
-- ── Der Pfad trägt bewusst KEINE Fall-Kennung ─────────────────────────
-- Der übliche Zuschnitt bei Supabase ist «<case_id>/<datei>», weil sich die
-- Regel dann allein aus dem Pfad ableiten lässt. Hier geht das nicht: ein
-- Eingeladener bekommt zum Herunterladen eine signierte Adresse, und in der
-- steht der Pfad. Die Fall-Kennung stünde damit im Browser der Familie, im
-- Verlauf, in weitergeleiteten Nachrichten — genau das, was der Zugang über
-- eine Sitzungs-Kennung (0004) verhindern sollte.
--
-- Deshalb: «<dokument_id>/<dateiname>». Die Zugehörigkeit steht nicht im
-- Pfad, sondern in der Zeile, und die Regel schlägt dort nach.
--
-- Nebenwirkung, die hier erwünscht ist: hochladen lässt sich nur an einen
-- Pfad, den bereits eine Zeile in documents beansprucht. Erst die Zeile,
-- dann die Datei — eine Datei ohne Eintrag kann gar nicht entstehen.
--
-- ── Wer hochlädt ─────────────────────────────────────────────────────
-- In diesem Schritt nur das Haus. Dass die Familie die Vollmacht selbst
-- hochlädt, wäre der nächste sinnvolle Schritt — aber eine Datei aus dem
-- äusseren Umkreis ist etwas anderes als ein Datumsfeld: Grösse, Typ,
-- Schadsoftware, Speicherplatz. Das gehört nicht nebenbei in diese
-- Migration. Bis dahin laden Beteiligte nicht hoch, sie sehen nur.
--
-- Das Skript ist idempotent und setzt den Stand nach 0001–0013 voraus.

-- ═══════════════════════════════════════════════════════════════
-- 1  Was zu einer Datei gehört
-- ═══════════════════════════════════════════════════════════════
-- Der ursprüngliche Name der Datei steht getrennt vom Pfad: im Pfad hat er
-- nichts zu suchen (Umlaute, Leerzeichen, Länge), beim Herunterladen soll
-- aber wieder «Todesbescheinigung Weber.pdf» ankommen.
alter table public.documents add column if not exists dateiname text;
alter table public.documents add column if not exists mime      text;
alter table public.documents add column if not exists groesse   bigint;
alter table public.documents add column if not exists hochgeladen_am timestamptz;

-- Ein Pfad gehört zu genau einer Zeile. Ohne das könnten zwei Einträge
-- dieselbe Datei beanspruchen und die Regel unten würde mehrdeutig.
create unique index if not exists documents_storage_path_uidx
  on public.documents (storage_path) where storage_path is not null;

-- ═══════════════════════════════════════════════════════════════
-- 2  Herunterladen durch einen Eingeladenen
-- ═══════════════════════════════════════════════════════════════
-- Gibt den Pfad zurück, wenn die Rolle dieser Sitzung die Unterlage sehen
-- darf — sonst null. Der Server macht daraus eine signierte Adresse; der
-- Pfad selbst geht nicht an den Browser.
--
-- Wieder ohne case_id und ohne Rolle als Argument: beide hängen an der
-- Einladung. Die Prüfung ist dieselbe wie in app.case_for_role — visible_to
-- entscheidet, nicht der Aufrufer.
create or replace function public.unterlage_fuer_sitzung(
  p_session  uuid,
  p_dokument uuid
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_case uuid;
  v_role public.role;
  v_pfad text;
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

  -- Gehört die Unterlage zu DIESEM Vorgang, und darf die Rolle sie sehen?
  select d.storage_path into v_pfad
  from public.documents d
  where d.id = p_dokument
    and d.case_id = v_case
    and v_role = any(d.visible_to)
    and d.storage_path is not null;

  if not found then
    return null;
  end if;

  -- Der Dateiname bleibt draussen: er ist Freitext und steht im Protokoll
  -- so wenig wie eine Anschrift.
  perform app.log(v_case, 'invite', p_session::text, 'unterlage.geoeffnet',
                  jsonb_build_object('role', v_role, 'dokument', p_dokument));

  return v_pfad;
end;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3  Ablage — nur auf Supabase vorhanden
-- ═══════════════════════════════════════════════════════════════
-- Das Schema «storage» gibt es in einer nackten PostgreSQL-Installation
-- nicht. Damit sich die Datei auch dort anwenden lässt (die Migrationen
-- werden lokal gegen echtes PostgreSQL geprüft), wird dieser Abschnitt
-- übersprungen, wenn kein storage.objects vorliegt — mit Hinweis, nicht
-- stillschweigend.
do $$
begin
  if to_regclass('storage.objects') is null then
    raise notice 'storage.objects fehlt — Ablage-Abschnitt uebersprungen (kein Supabase)';
    return;
  end if;

  -- Nicht öffentlich. Eine Unterlage zu einem Sterbefall ist nichts, was
  -- über eine erratbare Adresse erreichbar sein darf.
  insert into storage.buckets (id, name, public)
  values ('unterlagen', 'unterlagen', false)
  on conflict (id) do update set public = false;

  -- Eine Regel für alles: lesen, schreiben, löschen. Erlaubt ist genau das,
  -- wozu eine Zeile in documents den Pfad beansprucht und der Aufrufer den
  -- Vorgang besitzt.
  execute $regel$
    drop policy if exists unterlagen_eigentuemer on storage.objects;
  $regel$;

  execute $regel$
    create policy unterlagen_eigentuemer on storage.objects
    for all
    using (
      bucket_id = 'unterlagen'
      and exists (
        select 1 from public.documents d
        where d.storage_path = storage.objects.name
          and public.is_case_owner(d.case_id)
      )
    )
    with check (
      bucket_id = 'unterlagen'
      and exists (
        select 1 from public.documents d
        where d.storage_path = storage.objects.name
          and public.is_case_owner(d.case_id)
      )
    );
  $regel$;

  -- Versuch, anon die Tabellenrechte zu nehmen. WIRKUNGSLOS auf Supabase und
  -- hier nur der Vollständigkeit halber: storage.objects gehört
  -- supabase_storage_admin, die Migration läuft als postgres. REVOKE durch
  -- einen Nicht-Eigentümer bricht nicht ab, es tut schlicht nichts.
  --
  -- Der Riegel ist deshalb NICHT dieser Aufruf, sondern die Regel oben. Am
  -- laufenden Projekt geprüft: anon wird bei SELECT wie bei INSERT auf
  -- storage.objects abgewiesen — die Regel schlägt in public.documents nach,
  -- und daran hat anon seit 0004 kein Tabellenrecht. Zweite Linie: sie ruft
  -- public.is_case_owner, das anon ebenfalls nicht ausführen darf. Dritte:
  -- ohne Anmeldung ist auth.uid() leer und die Prüfung wäre false.
  execute 'revoke all on storage.objects from anon';
end
$$;

-- ═══════════════════════════════════════════════════════════════
-- 4  Rechte — bewusst als letzter Abschnitt der Datei
-- ═══════════════════════════════════════════════════════════════
revoke execute on all functions in schema app from public, anon, authenticated;
revoke all on schema app from public, anon, authenticated;

revoke execute on function public.unterlage_fuer_sitzung(uuid, uuid)
  from public, anon, authenticated;

-- Der öffentliche Vertrag: jetzt sechs Funktionen für anon.
grant execute on function public.redeem_invite(text)        to anon, authenticated;
grant execute on function public.get_case_by_session(uuid)  to anon, authenticated;
grant execute on function public.end_session(uuid)          to anon, authenticated;
grant execute on function public.termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)
  to anon, authenticated;
grant execute on function public.angaben_ergaenzen(uuid, jsonb)
  to anon, authenticated;
grant execute on function public.unterlage_fuer_sitzung(uuid, uuid)
  to anon, authenticated;

grant execute on function public.fall_verlauf(uuid, int)           to authenticated;

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
-- Verifikation — einzeln ausführen. Die Punkte 3–5 gehen NUR auf
-- Supabase; lokal fehlt das Schema storage.
-- ═══════════════════════════════════════════════════════════════
--
-- 1) Was darf anon ausführen? Erwartet: genau sechs.
-- select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and has_function_privilege('anon', p.oid, 'execute')
-- order by 1;
--
-- 2) Keine Funktion ohne eigene ACL — erwartet: 0.
-- select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname in ('public','app') and p.proacl is null;
--
-- 3) Der Eimer ist nicht öffentlich — erwartet: f.
-- select public from storage.buckets where id = 'unterlagen';
--
-- 4) Die Regel steht — erwartet: eine Zeile.
-- select polname from pg_policy where polrelid = 'storage.objects'::regclass
--   and polname = 'unterlagen_eigentuemer';
--
-- 5) anon kommt an keine Ablage-Zeile. Die Tabellenrechte BLEIBEN bestehen
--    (siehe Kommentar oben), geprüft wird deshalb das Verhalten, nicht die
--    ACL. Erwartet: beide Male «abgewiesen».
-- create or replace function pg_temp.probe() returns table(was text, ergebnis text)
-- language plpgsql as $probe$
-- declare n int;
-- begin
--   begin
--     set local role anon; select count(*) into n from storage.objects; reset role;
--     was := 'anon SELECT'; ergebnis := n::text || ' Zeilen'; return next;
--   exception when others then
--     reset role; was := 'anon SELECT'; ergebnis := 'abgewiesen: ' || sqlerrm; return next;
--   end;
--   begin
--     set local role anon;
--     insert into storage.objects (bucket_id, name) values ('unterlagen','fremd/x.pdf');
--     reset role; was := 'anon INSERT'; ergebnis := 'DURCHGELASSEN — Loch!'; return next;
--   exception when others then
--     reset role; was := 'anon INSERT'; ergebnis := 'abgewiesen: ' || sqlerrm; return next;
--   end;
-- end $probe$;
-- select * from pg_temp.probe();
