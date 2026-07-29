# MementoOS — Arbeitsstand (durable project knowledge)

Dieses Dokument hält fest, was künftige Sitzungen wissen müssen, ohne die
gesamte Gesprächsgeschichte zu rekonstruieren. Es enthält **keine**
Zugangsdaten, Schlüssel, Tokens oder Werte von Umgebungsvariablen.

Stand: 2026-07-29. Arbeitszweig `claude/memento-os-design-fx5ev8`.

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

## Rechtemodell: vier Matrizen

Sie liegen **doppelt** und dürfen nur zusammen wandern:

- Wahrheit: SQL in `mvp/supabase/migrations/`
- Spiegel: `mvp/src/lib/access.ts` (für Mock, Beschriftungen, UI-Entscheidungen)

| Funktion | Frage | Migration |
|---|---|---|
| `app.allowed_tiers(rolle)` | welche Feldgruppen **sieht** eine Rolle | 0004 |
| `app.termine_fuer_rolle(rolle)` | welche Terminarten sieht sie | 0011 |
| `app.darf_bestaetigen(rolle, art)` | welche Termine darf sie bestätigen | 0011 |
| `app.felder_schreibbar(rolle)` | welche Felder darf sie **ändern** | 0012 |

Feldgruppen (tier): `kern` (Name), `org` (persönlich), `op` (körperlich),
`sens` (medizinisch).

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

---

## CONFIRMED — fertig und auf der echten Datenbank geprüft

Migrationen `0001`–`0014` sind angewandt (Supabase, PostgreSQL 17,
`eu-west-3`). `0006` ist ein dokumentierter Fehlversuch, `0007` die
Korrektur; die Datei bleibt zur Nachvollziehbarkeit liegen.

- **Anmeldung**: Magic Link **und** Passwort. Der Callback nimmt beide
  Rückwege (`?code=` per PKCE und `?token_hash=&type=`). Passwort wurde
  nötig, weil E-Mail-Vorlagen ohne eigenes SMTP nicht änderbar sind.
- **Fälle**: anlegen, führen, Phasen, Beteiligte, Aufgaben.
- **Verstorbene Person**: vier Feldgruppen, jede für sich speicherbar; der
  Sichtbarkeitstext ist aus `allowedTiers` abgeleitet und kann nicht
  abweichen.
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

- Graphify-Wissensgraph als primärer Navigationsweg (dieser Schritt).

---

## PLANNED

1. **Typ «Verpflichtung»** — das eigentliche nächste Stück. Heute existiert
   eine Verpflichtung nur als Aufgabe mit Freitext und Zuständigkeit. Das
   System weiss nicht, dass eine Einäscherung ohne Freigabe nicht stattfinden
   darf. Vermutete Ketten stehen in der Analyse (siehe unten) und sind
   ungeprüft.
2. **Partnerorganisationen mit Konten** — Voraussetzung für einen Kalender
   über mehrere Fälle («alle meine Einäscherungen diese Woche»). Heute
   existiert ein Partner nur innerhalb eines Vorgangs. Das ist ein neuer,
   dritter Umkreis und **braucht eine Entscheidung des Eigentümers**.
3. **Markenzeichen und Palette** zusammenführen: `assets/brand/` enthält eine
   **Rekonstruktion**, keine Vorlage — das Original kam schwarz auf schwarz.
   Nicht in die Oberfläche eingebaut, bis die Originaldatei vorliegt.
4. **Eigenes SMTP** für Einladungs-E-Mails an Familien. Nicht blockierend.
5. **Hochladen durch die Familie** (Vollmacht) — eigene Entscheidung, siehe
   Sicherheitsabschnitt.

---

## BLOCKED — wartet auf den Eigentümer, nicht auf Technik

- **Entscheidung Partnerorganisationen** (siehe PLANNED 2). Ohne sie kein
  fallübergreifender Kalender.
- **Originaldatei des Markenzeichens**, bevorzugt SVG.
- **Leaked Password Protection** ist im Supabase-Projekt aus. Seit es
  Passwort-Anmeldung gibt, sollte sie an sein. Nur über das Dashboard
  schaltbar, nicht über die Programmierschnittstelle.
- **Signierte Commits**: die Schlüsseldatei im Container ist 0 Byte, es gibt
  keinen privaten Schlüssel. Autor und Committer sind korrekt; GitHub zeigt
  «Unverified». Nachträgliches Signieren ist ohne Schlüssel nicht möglich.

---

## NEEDS VERIFICATION — Annahmen, die kein Bestatter geprüft hat

Das gesamte Rechtemodell beruht auf meinen Annahmen. Fünf Stellen sind
fachlich heikel, drei davon mit möglichem Schaden:

1. **Der Fahrdienst sieht keinen Infektionshinweis.** Wer ein Verstorbenes
   hebt und fährt, ist derjenige, den das körperlich betrifft. Möglicherweise
   die falsche Tür geschlossen.
2. **Der Friedhof sieht kein Sargmass.** Er hebt das Grab aus. Fällt sonst am
   Tag der Beisetzung auf.
3. **Der Steinmetz sieht nichts über die Person** — schlägt aber Name und
   Daten in Stein. Entweder läuft die Inschrift an der Anwendung vorbei, oder
   die Matrix muss sich ändern.
4. **Die Klinik liest, schreibt aber nicht.** Dann ist unklar, wozu sie
   Zugang hat.
5. **Standesamt und Verbund tun nichts.** Vermutlich am Schreibtisch
   erfundene Rollen.

Die Fragenliste für ein Gespräch mit einem echten Bestatter und ein Prompt
zum Gegenprüfen liegen als veröffentlichte Analyse vor. Reihenfolge:
**erst das Gespräch, dann geänderte Matrizen zur Abnahme, dann Migration
`0015`.**

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
