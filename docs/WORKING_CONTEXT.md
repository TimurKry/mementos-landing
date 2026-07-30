# MementoOS — Arbeitsstand (durable project knowledge)

Dieses Dokument hält fest, was künftige Sitzungen wissen müssen, ohne die
gesamte Gesprächsgeschichte zu rekonstruieren. Es enthält **keine**
Zugangsdaten, Schlüssel, Tokens oder Werte von Umgebungsvariablen.

Stand: 2026-07-30. Arbeitszweig `claude/migration-0017-dependencies-uyjelu`.

---

## Produktziel

MementoOS koordiniert die deutsche Bestattungsbranche: Bestatter,
Krematorien, Friedhöfe, Fahrdienste, Zulieferer (Floristik, Steinmetz,
Trauerredner), Kliniken, Standesämter und Familien arbeiten an **einem
gemeinsamen Vorgang** («Fall»). Der Kern ist feldweise, rollenbasierte
Sichtbarkeit: jeder sieht ausschliesslich, was ihn betrifft.

Ton der Oberfläche: ruhig, präzise, respektvoll. Kopie auf Deutsch. Keine
erfundenen Metriken, Referenzen oder Preise; Demodaten sind als
«Beispieldaten» gekennzeichnet.

---

## Zwei Anwendungen in einem Repository

| Pfad | Was | Auslieferung |
|---|---|---|
| Repo-Wurzel (`src/app/`) | öffentlicher Lendung | statischer Export, GitHub Pages, `basePath: /mementos-landing` |
| `mvp/` | die eigentliche Anwendung | Next.js SSR auf Vercel, Root Directory `mvp`, Region `fra1` |

Der MVP hat eine **eigene** `package.json`. Wegen `pnpm-workspace.yaml` in der
Wurzel braucht er `pnpm install --ignore-workspace`; das steht auch in
`mvp/vercel.json` als `installCommand`.

Beim Prüfen eines Builds ohne Datenbank müssen die Variablen **auf leer
gesetzt** werden (`NEXT_PUBLIC_SUPABASE_URL= pnpm build`), nicht per `env -u`:
Next liest `.env.local` selbst wieder ein. Zum Starten kommt zusätzlich
`MEMENTO_ALLOW_MOCK=1` dazu, sonst bricht der Produktionsstart bewusst ab
(siehe `mvp/src/lib/env.ts`).

---

## Drei Designsysteme

Kanon: `docs/design-systems.md` — **vor jeder UI-Arbeit lesen**. Jede Seite
gehört streng zu genau einem System.

1. **Monad** — Lendung `/` und `/demo`. Pergament `#f6f3f1`, Instrument Serif
   400, JetBrains Mono, Pillformen, Haarlinie `#cecac8`, ein einziger Akzent
   Lake Blue `#2b59d1`.
2. **Steep** — Zielgruppenseiten `/fuer-*`. Weisses Feld, grosser Serif mit
   kursiver Einlage, Inter, Karten 24px, Pfirsichakzent `#fbe1d1` höchstens
   einmal je Seite.
3. **Default** — der MVP. Void `#0b0c0e`, Graphit `#131416`, Haarlinie 0.5px
   plus Inset statt Schatten, Inter 400 (ss01/ss03), Knochen-CTA `#f2f2f2`,
   Signalblau `#3b82f6` ausschliesslich für Fokus/Aktiv.

Überschriften sind **nie** fett. Animationen achten auf
`prefers-reduced-motion` (globaler Block in `globals.css`).

---

## Architektur des MVP

Drei Umkreise als Route-Gruppen, absichtlich getrennt:

- `(intern)` — Arbeitsbereich des Bestattungshauses, angemeldet.
- `(extern)` — Eingeladene **ohne Konto**. Zugang über Link → Sitzung im
  `httpOnly`-Cookie. Der Einladungs-Token steht nie in einer Adresse.
- `(admin)` — Betreuung der Plattform. Sieht **ausschliesslich Metadaten**.

Datenschicht: `mvp/src/lib/data.ts` (Fälle), `mvp/src/lib/admin.ts`
(Plattform). Beide verzweigen über `getRuntimeMode()`: Supabase konfiguriert →
Datenbank, sonst Mock (`mvp/src/lib/mock.ts`, In-Memory-Beispieldaten).

---

## Rechtemodell: fünf Matrizen

Sie liegen **doppelt** und dürfen nur zusammen wandern:

- Wahrheit: SQL in `mvp/supabase/migrations/`
- Spiegel: `mvp/src/lib/access.ts` (für Mock, Beschriftungen, UI-Entscheidungen)

| Funktion | Frage | Migration |
|---|---|---|
| `app.sichtbare_felder(rolle)` | welche **Felder** sieht eine Rolle | 0015 |
| `app.termine_fuer_rolle(rolle)` | welche Terminarten sieht sie | 0011 |
| `app.darf_bestaetigen(rolle, art)` | welche Termine darf sie bestätigen | 0011 |
| `app.felder_schreibbar(rolle)` | welche Felder darf sie **ändern** | 0012 |
| `app.voraussetzungen_fuer_termin(art)` | was muss vorliegen, bevor eine Terminart bestätigt werden kann | 0017 |

Die fünfte hat einen anderen Rang als die ersten vier: sie regelt nicht, wer
was sieht, sondern wann etwas geschehen darf — und **jede ihrer Zeilen ist
eine ungeprüfte Annahme** (siehe NEEDS VERIFICATION). Die anderen vier sind
zumindest teilweise durch eine Durchsicht gegangen.

Feldgruppen (tier): `kern` (Name), `org` (persönlich), `op` (körperlich),
`sens` (medizinisch). Sie entscheiden seit 0015 **nichts** mehr — sie sind
Überschrift im Bogen und Eintrag im Protokoll. `app.feld_gruppe(feld)` ordnet
zu, `app.allowed_tiers(rolle)` ist daraus abgeleitet und nur noch für den
Protokolleintrag da.

Zwei Regeln, die 0015 beim Anwenden aktiv prüft:

- **Schreiben setzt Sehen voraus.** `felder_schreibbar` ⊆ `sichtbare_felder`
  für jede Rolle. Wer den bisherigen Wert nicht kennt, überschreibt still.
- **Ein neues Feld ist für niemanden sichtbar**, bis es in der Matrix steht.
  Vorher war ein `ALTER TABLE` in einer bestehenden Gruppe eine stille
  Rechtevergabe.

Unterlagen laufen **nicht** über eine Matrix: ihre Sichtbarkeit setzt das Haus
je Datei beim Hochladen (`documents.visible_to`).

---

## Der öffentliche Vertrag

Genau **sechs** Funktionen sind für die Rolle `anon` ausführbar. Diese Zahl
ist eine Invariante — eine siebte bedeutet, dass eine Tür offen steht:

1. `redeem_invite(text)`
2. `get_case_by_session(uuid)`
3. `end_session(uuid)`
4. `termin_bestaetigen(uuid, uuid, timestamptz, timestamptz, text)`
5. `angaben_ergaenzen(uuid, jsonb)`
6. `unterlage_fuer_sitzung(uuid, uuid)`

Prüfabfrage (erwartet 6 Zeilen):

```sql
select p.proname from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public','app')
  and has_function_privilege('anon', p.oid, 'execute')
order by 1;
```

Zweite Invariante: **keine** Funktion in `public`/`app` mit `proacl is null`
(das bedeutet `PUBLIC EXECUTE`). Erwartet: 0.

---

## Sicherheitsentscheidungen, die nicht ohne Rücksprache umgedreht werden

Ausführlich in `docs/features/mvp-sicherheit.md`.

- **Die Rolle ist niemals Argument.** Sie wird serverseitig aus
  `public.invites` gelesen. Zwei kritische Rechteausweitungen entstanden
  genau daraus und wurden in `0004_hardening.sql` geschlossen.
- **`case_id` verlässt den äusseren Umkreis nie.** Nach aussen existiert nur
  die Sitzungs-Kennung.
- **Interne Funktionen liegen im Schema `app`**, auf das `anon` und
  `authenticated` kein `USAGE` haben.
- **`alter default privileges … revoke execute` wirkt nicht retroaktiv** und
  griff auf diesem Projekt gar nicht. Deshalb steht der Rechteblock am
  **Dateiende** jeder Migration, und nichts wird danach angelegt.
- **Alte Funktionen werden `DROP`t, nicht `CREATE OR REPLACE`t** — sonst
  entsteht eine Überladung, und die alte, durchlässige Fassung lebt mit ihrem
  `PUBLIC EXECUTE` weiter.
- **`is_case_owner` darf nicht vollständig entzogen werden**: RLS-Ausdrücke
  laufen als aufrufende Rolle. Symptom bei Verstoss: vollständiger RLS-Ausfall.
- **Alle öffentlichen Funktionen sind `VOLATILE`**, damit PostgREST nur POST
  zulässt — Tokens und Sitzungs-Kennungen landen nicht in Query-Strings.
- **Das Protokoll ist append-only** (Trigger auf Statement-Ebene, inkl.
  `truncate`) und hängt an **keinem** Fremdschlüssel, damit es einen
  gelöschten Fall überdauert (0007).
- **Ins Protokoll gehen Namen, nie Inhalte.** Bei Feldänderungen die
  Feldnamen, bei Terminen Art und Rolle. Freitext bleibt draussen.
- **Die Klinik hat kein Schreibrecht auf `sens`.** Fachlich wäre es richtig,
  aber es ist die empfindlichste Gruppe und über einen Link ohne Konto
  erreichbar. Bewusst offen gelassen, Begründung im Kopf von 0012.
- **Nur das Haus lädt Unterlagen hoch.** Eine Datei aus dem äusseren Umkreis
  ist eine eigene Entscheidung (Grösse, Typ, Schadsoftware, Speicher).
- **Der Ablagepfad trägt keine `case_id`** (`<dokument_id>/<dateiname>`),
  weil eine signierte Adresse den Pfad im Browser der Familie sichtbar macht.
- **Hochgeladene Dateien gehen nur als Anhang raus**, mit `nosniff` und
  `no-store`; sie werden nie im Umkreis der Anwendung angezeigt.
- **Prüfungen erfolgen durch Ausführung**, nicht durch Lesen. Eine Probe, die
  Unerreichbares behauptet, ist schlechter als keine.
- **Jede Angabe hat eine Quelle, aber es gibt keinen Werteverlauf** (0016).
  Wer die Quelle ist, ändert direkt; wer es nicht ist, macht einen Vorschlag.
  Eine Verlaufstabelle würde jeden personenbezogenen Wert ein zweites Mal und
  dauerhaft ablegen — `public.feldquelle` trägt Rolle und Zeitpunkt, **keinen
  Wert**. Der vorgeschlagene Wert wird nach der Entscheidung auf `NULL`
  gesetzt, bei Annahme wie bei Ablehnung.
- **`feldquelle` und `korrekturvorschlag` sind für kein Konto beschreibbar.**
  Nur der Auslöser und die beiden `SECURITY DEFINER`-Funktionen schreiben.
  Sonst liesse sich eine Quelle umschreiben und danach eine fremde Angabe
  «als eigene» überschreiben.
- **anon hat auf KEINE Tabelle in `public` ein Recht** — die dritte Invariante,
  neben den zwei für Funktionen. Supabase gewährt anon und authenticated per
  `ALTER DEFAULT PRIVILEGES` Rechte auf jede neue Tabelle in `public`; ein
  `grant … to authenticated` sagt deshalb nichts darüber, was anon hat. Ab
  0011 wurde nur noch gewährt und nie entzogen, und dadurch stand
  `public.termine` für anon **schreibend** offen (SELECT/INSERT/UPDATE/DELETE),
  `feldquelle` und `korrekturvorschlag` lesend. Aufgefangen hat es allein RLS.
  0017 entzieht es und misst es ab jetzt bei jeder Migration über alle
  Tabellen. Eine neue Tabelle braucht immer ein ausdrückliches
  `revoke all on … from anon`.
- **Eine Blockade gilt nur nach aussen** (0017). `public.termin_bestaetigen`
  prüft offene Voraussetzungen; auf `public.termine` liegt **kein** Auslöser,
  der dem Haus dazwischenfährt. Das Haus weiss mehr als die Anwendung (die
  Bescheinigung liegt im Fax), und die Liste, auf der die Blockade beruht, ist
  eine Annahme. Wer das Haus gegen eine unbestätigte Liste sperrt, erzieht es
  dazu, pauschal abzuhaken — dann steht die Blockade auch dort nicht mehr, wo
  sie richtig wäre.
- **Nur eine erfasste Voraussetzung blockiert** (0017). Eine fehlende Zeile
  hält nichts auf. Die umgekehrte Richtung des Versagens als in 0015, und
  zwar mit Absicht: dort geht es um Sichtbarkeit personenbezogener Daten, wo
  «niemand sieht es» der sichere Zustand ist. Hier geht es ums Anhalten eines
  Ablaufs. Prüfung 8.1 der Migration fängt dafür den gefährlichen Fall ab, dass
  die Matrix durch einen Tippfehler still leer läuft.
- **Kein Eingeladener setzt eine Voraussetzung auf «erfüllt»** (0017). Der
  äussere Umkreis hat auf `public.voraussetzung` kein einziges Recht, auch
  kein lesendes; nach aussen geht über `app.case_for_role` allein die ART
  einer offenen Voraussetzung zum eigenen Termin — nie die Notiz des Hauses.
  Sonst erteilte das Krematorium seine eigene Freigabe.
- **Bestandsangaben wurden pauschal dem Haus zugeschrieben** (0016). Aus dem
  Protokoll wäre eine Teilrekonstruktion möglich, sie wird aber bewusst nicht
  benutzt: sie kennt nur Schreibvorgänge von aussen, und ihr Fehler ginge in
  die gefährliche Richtung (die Familie dürfte die Korrektur des Hauses
  überschreiben). Der Fehler der pauschalen Zuschreibung kostet eine
  Rückfrage.

---

## CONFIRMED — fertig und auf der echten Datenbank geprüft

Migrationen `0001`–`0016` sind angewandt (Supabase, PostgreSQL 17,
`eu-west-3`). `0006` ist ein dokumentierter Fehlversuch, `0007` die
Korrektur; die Datei bleibt zur Nachvollziehbarkeit liegen.

Nach `0015`/`0016` auf der echten Datenbank nachgemessen: `anon` darf genau
sechs Funktionen ausführen, keine Funktion ohne eigene ACL, die Feldmatrix
stimmt in beide Richtungen mit dem lokalen Lauf überein, und die
Bestandsangaben haben eine Quelle.

- **Anmeldung**: Magic Link **und** Passwort. Der Callback nimmt beide
  Rückwege (`?code=` per PKCE und `?token_hash=&type=`). Passwort wurde
  nötig, weil E-Mail-Vorlagen ohne eigenes SMTP nicht änderbar sind.
- **Fälle**: anlegen, führen, Phasen, Beteiligte, Aufgaben.
- **Verstorbene Person**: vier Feldgruppen, jede für sich speicherbar; der
  Sichtbarkeitstext ist aus `sichtbareFelder` abgeleitet und kann nicht
  abweichen. Seit 0015 ein Satz je Empfängerkreis statt je Gruppe.
- **Zugänge ohne Konto**: Token → Sitzung, Entzug wirkt sofort.
- **Termine** (0011): Zeitfenster, Ort, Zuständigkeit; Bestätigung durch die
  zuständige Rolle. Zeitpunkte laufen über `mvp/src/lib/zeit.ts` und werden
  fest in `Europe/Berlin` umgerechnet — über `Intl`, damit Server und Gerät
  dasselbe Ergebnis liefern.
- **Angaben der Familie** (0012): fünf Felder, geprüft in 15 Szenarien.
- **Verlauf des Falls** (0013), gekürzte Akteurskennungen.
- **Unterlagen mit Dateien** (0014): privater Eimer `unterlagen`, Signatur der
  ersten Bytes gegen eine weisse Liste (PDF, JPEG, PNG), 10 MB, signierte
  Adressen mit 60 Sekunden Gültigkeit.
- **Plattform-Übersicht** `/admin` (0008, 0009): ausschliesslich Metadaten,
  Verschachtelung Haus → Fall → Zugang → Sitzung.
- Der Betreiberzugang ist eingetragen (Tabelle `public.platform_admins`, wird
  nur von Hand gepflegt; RLS an, absichtlich **keine** Policy).

Gemessene Ergebnisse der letzten Runde:

- `anon` darf genau die sechs Funktionen ausführen, keine siebte.
- Funktionen ohne eigene ACL: 0.
- Krematorium sieht Überführung und Einäscherung, bestätigen darf es nur die
  Einäscherung.
- Floristik sieht Zeit, Ort und Karte der Trauerfeier — und **kein** Feld
  über die verstorbene Person.
- Familie mit gültiger Sitzung **desselben** Vorgangs erhält auf die exakte
  Adresse einer Unterlage des Krematoriums **404**.
- Alle vier Matrizen auf der Produktionsdatenbank identisch zu `access.ts`.

---

## IN PROGRESS

**`0017` — Abhängigkeiten und Freigaben: geschrieben, nicht angewandt.**

Der Mechanismus steht vollständig: `public.voraussetzung`, die fünfte Matrix,
die Blockerprüfung in `public.termin_bestaetigen` (Rückgabe jetzt `jsonb`
statt `boolean`) und beide Bildschirme. Geprüft wurde durch Ausführung im
Mock-Betrieb, einschliesslich des Wettrennens: Bogen offen, Freigabe
zwischendurch zurückgenommen, Absenden wird mit Nennung des Fehlenden
abgewiesen und steht als `termin.blockiert` im Verlauf.

Die Invarianten prüft die Datei beim Anwenden selbst (Abschnitt 8) und bricht
ab. Der erste Anwendungsversuch tat das auch: Prüfung 8.6 hat die offenen
Tabellenrechte von anon gefunden (siehe oben). Nichts wurde dabei angewandt —
die Datei läuft in einer Transaktion, und eine gescheiterte Prüfung nimmt
alles zurück. Der Riegel ist jetzt in derselben Migration mit drin.

---

## PLANNED

Die Reihenfolge ist eine Abhängigkeitskette, keine Wunschliste. Sie kommt aus
der Durchsicht des echten Ablaufs durch einen Branchenkenner.

1. **0018 — Übergaben und Identitätskette.** `uebergabe`, `sarg_id`/`urnen_id`,
   `einaescherungsnummer`. Wer wann wem übergeben hat, ohne Bruch.
2. **0019 — Unterlagenpakete nach draussen.** Ämter registrieren sich nicht:
   PDF plus strukturierter Satz, ablaufende Adresse ohne Konto. Dorthin gehört
   auch die Frage, ob ein Eingeladener eine Voraussetzung selbst als erfüllt
   melden darf — 0017 hat sie bewusst offen gelassen, weil das Krematorium
   sonst seine eigene Freigabe erteilt.
3. **Eigenes SMTP** für Einladungs-E-Mails an Familien. Nicht blockierend,
   aber ohne es erreicht kein Zugang eine Familie von selbst.
4. **Partnerorganisationen mit Konten** — Voraussetzung für einen Kalender
   über mehrere Fälle («alle meine Einäscherungen diese Woche»). Heute
   existiert ein Partner nur innerhalb eines Vorgangs. Das ist ein neuer,
   dritter Umkreis und **braucht eine Entscheidung des Eigentümers**.
5. **Hochladen durch die Familie** (Vollmacht) — eigene Entscheidung, siehe
   Sicherheitsabschnitt.

Zuletzt, ausdrücklich auf Wunsch des Eigentümers ans Ende gestellt:
Rechtstexte (Impressum, Datenschutzerklärung), Auswertung, Kontaktformular.

---

## BLOCKED — wartet auf den Eigentümer, nicht auf Technik

- **Entscheidung Partnerorganisationen** (siehe PLANNED 5). Ohne sie kein
  fallübergreifender Kalender.
- **Die Abhängigkeitsliste für `0017`.** Der Mechanismus ist gebaut; WELCHE
  Voraussetzung welchen Termin blockiert, ist Branchenwissen und fehlt
  weiterhin. Der Eigentümer hat die Antworten eines Branchenkenners zugesagt
  («10 Abhängigkeiten», «wo Fälle stehenbleiben»). Bis dahin stehen drei
  ausdrücklich als Annahme markierte Zeilen in der Matrix, und `0017` bleibt
  unangewandt. Mit der Liste kommt eine **neue** Migration — die angewandte
  wird nicht bearbeitet.
- **Floristik und Trauerredner sehen kein Feld.** Auf dem Schleifenband steht
  in der Praxis der Name; ein Trauerredner braucht Name, Lebensdaten und
  Konfession. 0015 hat das absichtlich nicht mitentschieden.
- **Leaked Password Protection** ist im Supabase-Projekt aus. Seit es
  Passwort-Anmeldung gibt, sollte sie an sein. Nur über das Dashboard
  schaltbar, nicht über die Programmierschnittstelle.
- **Signierte Commits**: die Schlüsseldatei im Container ist 0 Byte, es gibt
  keinen privaten Schlüssel. Autor und Committer sind korrekt; GitHub zeigt
  «Unverified». Nachträgliches Signieren ist ohne Schlüssel nicht möglich.

---

## NEEDS VERIFICATION — Annahmen, die kein Bestatter geprüft hat

Das gesamte Rechtemodell beruht auf meinen Annahmen. Fünf Stellen waren
fachlich heikel. **Drei sind durch die Durchsicht bestätigt und in 0015
behoben:**

1. ~~Der Fahrdienst sieht keinen Infektionshinweis.~~ Bestätigt als Fehler.
   0015: er sieht ihn, und weiterhin nicht die Freigabe zur Einäscherung.
2. ~~Der Friedhof sieht kein Sargmass.~~ Bestätigt als Fehler. 0015: Sargmass
   und Gewicht, weiterhin keine Körpergrösse.
3. ~~Der Steinmetz sieht nichts über die Person.~~ Bestätigt als Fehler. 0015:
   beide Namen und beide Lebensdaten, weiterhin keine Anschrift.

Offen bleiben:

4. **Die Klinik liest, schreibt aber nicht.** Dann ist unklar, wozu sie
   Zugang hat. Sie hält ausserdem weiterhin die Freigabe zur Einäscherung und
   das Sargmass — beides 1:1 übernommen, nicht geprüft.
5. **Standesamt und Verbund tun nichts.** Vermutlich am Schreibtisch
   erfundene Rollen. Der Verbund sieht dabei Namen, was für eine Sammelsicht
   über mehrere Häuser zu viel wäre.

Neu dazugekommen durch dieselbe Durchsicht (siehe BLOCKED): Floristik und
Trauerredner sehen kein Feld, obwohl beide fachlich etwas brauchen.

**Die gesamte fünfte Matrix (0017) ist Annahme.** Sie steht hier getrennt,
weil sie nicht regelt, wer etwas sieht, sondern wann etwas geschehen darf —
ein Irrtum hält Arbeit an oder lässt sie durch:

6. **Überführung setzt die Todesbescheinigung voraus.** Sicherheit hoch.
7. **Einäscherung setzt die zweite Leichenschau voraus.** Sicherheit hoch, und
   von allen Zeilen die, bei der ein Irrtum am schwersten wiegt: eine
   Feuerbestattung ist nicht rückholbar.
8. **Beisetzung setzt eine Grabstelle voraus.** Die schwächste der drei — in
   der Praxis ist die Stelle vermutlich längst vergeben, wenn überhaupt ein
   Termin eingetragen wird.
9. **Abholung, Trauerfeier und Abschiednahme setzen nichts voraus.** Ebenfalls
   eine Annahme, nur eine ohne Wirkung.

Dazu zwei Bauentscheidungen, die aus derselben Unsicherheit folgen und mit der
Liste zusammen neu zu bewerten sind: **nur eine erfasste Voraussetzung
blockiert**, und **das Haus wird nie blockiert** — geprüft wird allein im
äusseren Umkreis. Ausführlich im Kopf von `0017_voraussetzungen.sql`.

**Schemaschuld, bei 0016 aufgefallen:** `herzschrittmacher` und
`freigabe_einaescherung` stehen in 0001 als `boolean default false`. Damit
lässt sich «nein» nicht von «nicht gefragt» unterscheiden — und «kein
Herzschrittmacher» ist eine Sicherheitsaussage, die man nicht per
Voreinstellung treffen sollte. 0016 umgeht das (beim `INSERT` zählt `false`
nicht als Angabe), behebt es aber nicht. Richtig wäre ein Feld ohne
Voreinstellung mit drei Zuständen; das ändert 0001 und die Häkchen im Bogen.

Die Fragenliste für das Gespräch und der Prompt zum Gegenprüfen liegen als
veröffentlichte Analyse vor. Die Antworten des Branchenkenners sind teilweise
da; der Rest ist zugesagt.

---

## Ungelöste Fragen

- Rechtsträger, Auftragsverarbeitungsvertrag, Hosting-Vertrag,
  Aufbewahrungsfristen — alle offen. Keine Aussage in der Dokumentation ist
  ein Versprechen von Konformität.
- Ob `standesamt` und `verbund` als Rollen bleiben.
- Ob die Familie überhaupt selbst eintragen soll oder ob das Haus es hören
  und tippen will.

---

## Arbeitsweise

- Vor jedem Commit: `pnpm build` grün, im MVP mit leeren Supabase-Variablen.
- Bildschirmfotos über Playwright gegen einen lokal laufenden Stand
  (Chromium unter `/opt/pw-browsers/`, `PLAYWRIGHT_BROWSERS_PATH` ist
  gesetzt; **kein** `playwright install`).
- Migrationen sind ab `0004` idempotent und einzeln anwendbar. **`0001`–`0003`
  niemals erneut auf einer bestehenden Datenbank ausführen** — sie sind nicht
  idempotent, brechen ab, und `0003` schafft es vorher, Filterfunktionen per
  `create or replace` zurückzusetzen.
- Rechteänderungen sind immer eine **neue** Migration, keine Bearbeitung einer
  angewandten.
- Zweig `claude/memento-os-design-fx5ev8`; nach `main` wird nur auf
  ausdrückliche Bitte des Eigentümers geschoben (Vercel baut von `main`).
