# MementoOS — MVP

Funktionierender Prototyp der Kernidee: **ein gemeinsamer Fall über alle
Beteiligten hinweg — mit feldgenauem Zugriff je Rolle**. Der Bestatter führt
den Fall, alle anderen (Familie, Krematorium, Transport, Friedhof …) treten
**ohne Konto per Link** bei und sehen nur, was ihre Rolle betrifft.

> Alle Daten im Prototyp sind **Beispieldaten** (fiktiv).

Dies ist ein **eigenständiges, dynamisches** Next-Projekt (Server-Rendering,
Auth, Datenbank) — getrennt vom statischen Lendung im Wurzelverzeichnis. Es
wird **nicht** auf GitHub Pages veröffentlicht.

---

## Sofort starten (Mock-Modus, ohne Netzwerk & ohne Konto)

Ohne gesetzte Supabase-URL läuft die App gegen ein In-Memory-Speicher mit
Beispieldaten. Ideal zum Ausprobieren und für Demos.

```bash
cd mvp
pnpm install --ignore-workspace   # eigener Lockfile, außerhalb des Landing-Workspace
pnpm dev                          # http://localhost:3000
```

`--ignore-workspace` ist nötig, weil im Repo-Wurzel eine `pnpm-workspace.yaml`
für den Lendung liegt; der MVP hat seine eigenen Abhängigkeiten.

### Demo-Ablauf (die eine Sache, die es zu zeigen gilt)

1. **Dashboard** (`/`) — Vorgänge des Bestatters. Fall *Erika Weber* öffnen.
2. **Fall** (`/fall/0147`) — der Bestatter sieht **alles**: Identität,
   persönliche & körperliche Angaben, Medizinisches (Herzschrittmacher,
   Freigabe), Firmennamen der Partner, Aufgaben, Unterlagen.
3. Rechts unter **„Zugang per Link"** zwei Beispiel-Ansichten öffnen:
   - **Als Familie ansehen** → sieht Identität, Persönliches, Körperliches —
     **aber nicht** Medizinisches und **nicht** die internen Firmennamen.
   - **Als Krematorium ansehen** → sieht Identität, Körperliches, **Medizinisches**
     (das es für die Einäscherung braucht) — **aber nicht** Konfession,
     Anschrift, Geburtsdatum.

Derselbe Fall, dieselbe Datenbank — zwei völlig verschiedene Ansichten. Das ist
der Kern von MementoOS.

Beim Klick auf eine der beiden Ansichten fällt auf: die Adresszeile zeigt
`/zugang`, **nicht** den Token. Warum, steht unten unter *Sicherheitsmodell*.
Mit **„Zugang beenden"** endet die Sitzung sofort; ein erneuter Aufruf von
`/zugang` führt auf den Hinweisbildschirm.

---

## Feldgenauer Zugriff — wie er erzwungen wird

Der Zugriff ist **nicht** nur UI-Logik. Er ist an **eine** Regel gebunden:
welche *Feld­gruppen (Tiers)* eine Rolle sehen darf.

| Tier | Felder | Beispiel-Rollen mit Zugriff |
|------|--------|------------------------------|
| `kern` (Identität) | Vor-/Nachname | alle Beteiligten |
| `org` (Persönlich) | Geburts-/Sterbedatum, Konfession, Anschrift | Familie, Friedhof, Standesamt |
| `op` (Körperlich) | Größe, Gewicht, Sargmaß | Familie, Krematorium, Transport, Klinik |
| `sens` (Medizinisch) | Herzschrittmacher, Infektionshinweis, Freigabe | Krematorium, Klinik |

- **Quelle der Wahrheit ist die Datenbank**: `app.allowed_tiers(role)` und
  `app.case_for_role(case, role)` in
  [`supabase/migrations/0004_hardening.sql`](supabase/migrations/0004_hardening.sql)
  bauen serverseitig ein gefiltertes JSON. Sie liegen im Schema `app`, auf das
  von aussen niemand zugreifen kann — erreichbar sind sie nur über die drei
  Funktionen aus dem Abschnitt *Sicherheitsmodell*. Row-Level-Security
  ([`0002_rls.sql`](supabase/migrations/0002_rls.sql)) sorgt dafür, dass ein
  angemeldeter Nutzer nur eigene Fälle erreicht.
  Die frühere Fassung dieser Funktionen lag in `0003_access.sql` im Schema
  `public` und war von aussen aufrufbar; `0004` entfernt sie ersatzlos.
- Für den **Mock-Modus** (und die UI-Beschriftungen) gibt es ein **1:1-Spiegel**
  in TypeScript: [`src/lib/access.ts`](src/lib/access.ts). Beide Definitionen
  müssen synchron bleiben — der Kommentar im Code weist darauf hin.

So ergibt sich: **Wer nicht berechtigt ist, bekommt das Feld gar nicht erst
geliefert** — nicht ausgeblendet im Browser, sondern nie gesendet.

---

## Sicherheitsmodell

### Eine anonyme Eintrittsstelle

Nach aussen gibt es für nicht angemeldete Aufrufer genau **drei** Funktionen
(`0004_hardening.sql`, Abschnitt 8):

| Funktion | Zweck |
|----------|-------|
| `redeem_invite(token)` | Token → Sitzungskennung, sonst `NULL` |
| `get_case_by_session(session)` | rollengefilterter Fall, sonst `NULL` |
| `end_session(session)` | Sitzung selbst beenden |

Alles andere — auch die Filterfunktionen selbst — liegt im Schema `app`, auf
das `anon` kein `USAGE` hat.

- **Die Rolle ist niemals ein Argument.** Sie wird aus der Einladungszeile
  gelesen. Vorher war sie Parameter — damit liess sich aus einem gültigen
  Familien-Link ein Aufruf mit der Rolle `bestatter` bauen.
- **Die `case_id` verlässt den Server nie.** Nach aussen existiert nur die
  Sitzungskennung.
- Für die Rolle `bestatter` lassen sich keine Einladungslinks ausgeben
  (Prüfregel `invites_role_not_bestatter`).

### Der Token steht nicht in der Adresszeile

`/einladung/<token>` ist **kein Bildschirm, sondern ein einmaliger Tausch**
(Route Handler): Token prüfen → `redeem_invite` → Sitzungskennung in ein
Cookie → `303` auf `/zugang`.

```
/einladung/<token>  →  Cookie mos_zugang=<sitzung>  →  /zugang
```

Ein Token im Pfad würde über den `Referer` an fremde Server geraten, in der
Verlaufsliste des Browsers stehen, in Proxy- und CDN-Protokollen landen, auf
Bildschirmfotos erscheinen und beim Weiterleiten der Nachricht mitwandern.
Die Sitzungskennung im Cookie tut das alles nicht.

Das Cookie: `httpOnly`, `sameSite=lax`, `path=/`, 12 Stunden, `secure` sobald
die Verbindung über HTTPS läuft. Eine Signatur braucht es nicht — der Wert ist
eine zufällige UUID, die bei jedem Aufruf serverseitig geprüft wird.

Drei Ausgänge, zwei Klassen:

| Fall | Ziel |
|------|------|
| Token unbekannt, zurückgezogen, abgelaufen oder formal falsch | `/einladung/ungueltig?grund=ungueltig` |
| Netz- oder Datenbankstörung | `/einladung/ungueltig?grund=technik` |
| Erfolg | `/zugang` |

Die Trennung ist Absicht: „Ihr Link ist abgelaufen" und „bitte in ein paar
Minuten erneut" sind für eine Familie zwei sehr verschiedene Auskünfte.

### Token nur als Hash, Sitzungen mit Laufzeit

- In der Datenbank steht **kein Klartext-Token**, nur `sha256` (`token_hash`).
  Der Klartext wird beim Anlegen genau einmal zurückgegeben.
- Einladungen laufen nach 30 Tagen ab, Sitzungen nach **12 Stunden**.
- `revoke_invite` beendet zugleich alle offenen Sitzungen dieser Einladung —
  Entzug wirkt sofort, nicht erst nach Ablauf.

### Protokoll

`audit_log` ist per Trigger **nur anfügbar** (UPDATE, DELETE und TRUNCATE
schlagen fehl, auch für den Tabelleneigentümer). Geschrieben wird
ausschliesslich über `app.log()`. Festgehalten werden: `invite.redeem`,
`invite.redeem.failed`, `invite.create`, `invite.revoke`, `session.end`,
`session.revoke`, `case.view` (gedrosselt auf einmal je fünf Minuten und
Sitzung). Der Hinweis „Zugriffe auf diesen Fall werden protokolliert" steht
deshalb auf `/zugang` — und nur dort.

### Zwei getrennte Umkreise

- `(intern)` — Arbeitsbereich des Hauses: Dashboard, `/fall/[id]`. Nur hier
  gibt es Navigation und Abmelden. In der Live-Betriebsart verlangt die
  Middleware eine Anmeldung.
- `(extern)` — Zugang per Link: `/zugang`, `/einladung/**`, `/login`. Kein
  Weg von hier in den Arbeitsbereich.

Angemeldet wird ausschliesslich per **Magic Link**; Passwörter gibt es nicht.
`shouldCreateUser: false` — sonst legt sich jede Person mit einer
E-Mail-Adresse selbst ein Konto an. Die Antwort des Formulars ist immer
dieselbe, ob die Adresse existiert oder nicht.

### Kopfzeilen

`src/middleware.ts` setzt für jede Antwort: `Content-Security-Policy`
(nonce + `strict-dynamic`), `Referrer-Policy: no-referrer` **sitenweit**,
`X-Content-Type-Options`, `X-Frame-Options: DENY`,
`Cross-Origin-Opener-Policy`, `Permissions-Policy`, `X-Robots-Tag` und
`Strict-Transport-Security`. Seiten mit Falldaten zusätzlich
`Cache-Control: no-store`. `next.config.ts` wiederholt die statischen Zeilen
als zweite Reihe. `robots.txt` verbietet alles.

---

## Mit echter Datenbank (Supabase, Region EU)

### 1. Projekt anlegen

- Auf [supabase.com](https://supabase.com) ein Projekt in der Region
  **EU (Frankfurt, `eu-central-1`)** erstellen — Daten bleiben in der EU.
- Aus *Project Settings → API* übernehmen:
  `Project URL`, `anon public key`, `service_role key`.

### 2. Schema einspielen

Die Migrationen der Reihe nach im **SQL-Editor** des Projekts ausführen
(oder via Supabase CLI):

```
supabase/migrations/0001_init.sql       # Tabellen, Enums, Fall-Referenz
supabase/migrations/0002_rls.sql        # Row-Level-Security (nur eigene Fälle)
supabase/migrations/0003_access.sql     # feldgenauer Zugriff je Rolle (Kernstück)
supabase/migrations/0004_hardening.sql  # Rechtemodell, Token-Hash, Sitzungen, Protokoll
```

`0004` ist nicht optional: ohne sie sind die Filterfunktionen aus `0003` auch
anonym aufrufbar und die Rolle bleibt ein Argument.

Mit CLI:

```bash
supabase link --project-ref <ref>
supabase db push
```

### 3. Umgebungsvariablen

`.env.example` nach `.env.local` kopieren und ausfüllen:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://<projekt>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # nur serverseitig, nie ins Frontend
```

Sobald `NEXT_PUBLIC_SUPABASE_URL` gesetzt ist, schaltet die App automatisch vom
Mock- in den DB-Modus (`isMock` in [`src/lib/data.ts`](src/lib/data.ts)).

```bash
pnpm dev
```

---

## Aufbau

```
mvp/
├─ supabase/migrations/     SQL: Schema · RLS · feldgenauer Zugriff · Härtung
└─ src/
   ├─ middleware.ts         Kopfzeilen, Konfigurationsprüfung, Zugangsschranken
   ├─ lib/
   │  ├─ types.ts           Domänentypen (Spiegel der DB)
   │  ├─ access.ts          Tier-Regeln je Rolle (Spiegel von 0004_hardening.sql)
   │  ├─ mock.ts            In-Memory-Beispieldaten + Demo-Tokens
   │  ├─ data.ts            eine Datenzugriffs-Schicht: Mock ⇄ Supabase
   │  ├─ env.ts             die einzige Stelle, die Umgebungsvariablen liest
   │  ├─ zugang.ts          Zugangs-Cookie (Name, Laufzeit, Form)
   │  ├─ security-headers.ts  CSP und die statischen Kopfzeilen
   │  └─ supabase/          Server- & Browser-Client (@supabase/ssr)
   └─ app/
      ├─ (intern)/          Arbeitsbereich des Hauses — nur angemeldet
      │  ├─ page.tsx        Dashboard (Vorgänge des Bestatters)
      │  └─ fall/[id]/      Fall-Detail — voller Eigentümer-Blick + Aufgaben
      ├─ (extern)/          Zugang per Link — ohne Konto
      │  ├─ login/          Anmeldung per Magic Link
      │  ├─ einladung/
      │  │  ├─ [token]/route.ts   einmaliger Tausch: Token → Cookie → /zugang
      │  │  └─ ungueltig/         ruhiger Hinweisbildschirm
      │  └─ zugang/         rollengefilterte Ansicht (Sitzung aus dem Cookie)
      ├─ auth/              callback (Magic Link) · abmelden (nur POST)
      ├─ robots.ts          alles gesperrt
      └─ actions.ts         Server Action (Aufgabe abhaken)
```

Design folgt der **Default**-Dark-Systematik des Lendung (`/workspace`):
Void `#0b0c0e`, Graphit-Karten, Haarlinien statt Schatten, Inter, Knochen-CTA.
Siehe `../docs/design-systems.md`.

## Build & Verifikation

```bash
pnpm build                          # grün im Mock-Modus (keine env-Variablen nötig)
MEMENTO_ALLOW_MOCK=1 pnpm start     # Produktions-Server, Demo ohne Datenbank
```

Ohne `MEMENTO_ALLOW_MOCK=1` bricht ein Produktionsstart ohne
Datenbank-Konfiguration ab — ein Deploy mit vergessenen Variablen soll nicht
still den Demo-Modus zeigen.

Kopfzeilen prüfen:

```bash
curl -sI localhost:3000/login    # referrer-policy, x-frame-options, CSP …
curl -sI localhost:3000/zugang   # zusätzlich cache-control: no-store
```

## Offene Punkte (bewusst offen gelassen)

- **IP-Adressen werden nicht protokolliert** — auch nicht bei fehlgeschlagenen
  Einlöseversuchen. Das ist Datenminimierung, kostet aber die Möglichkeit,
  systematisches Durchprobieren zu erkennen und zu bremsen. Die Frage ist
  offen und vor einem Pilotbetrieb zu entscheiden.
- **HSTS ohne `preload`**: der Eintrag in die Browser-Liste ist praktisch
  unumkehrbar. Erst wenn die Domain feststeht, ist er zu erwägen.
- **Aufbewahrung**: Ziel ist Löschung/Komprimierung nach Abschluss; die genaue
  gesetzliche Aufbewahrungsfrist ist noch mit Rechtsberatung zu klären, bevor
  produktiv Daten gespeichert werden.
- **Rechtsträger / AVV / Hosting-Vertrag**: noch offen — keine erfundenen
  Angaben. Vor einem echten Pilotbetrieb zu klären.
- **Ein Storage-Bucket für Unterlagen existiert noch nicht. Wenn er angelegt
  wird, muss er privat sein (`public = false`) und eigene Zugriffsregeln
  bekommen.** Die Oberfläche zeigt bisher nur Namen und Status von Unterlagen,
  keine Dateien.
- Einladungs-Token laufen nach 30 Tagen ab (`invites.expires_at`), Sitzungen
  nach 12 Stunden (`invite_sessions.expires_at`).
- Die Fehlerseite `/_not-found` wird beim Build vorgerendert und bekommt
  deshalb keinen frischen CSP-nonce. Sie enthält keine Falldaten; ein eigener
  `not-found`-Bildschirm im dynamischen Rendering steht aus.

## Deployment

**Nicht** GitHub Pages (dort läuft nur der statische Lendung). Dieser MVP
braucht einen Node-Runtime — z. B. Vercel (Region Frankfurt) oder Self-Hosting
in der EU. Der Lendung-Deploy bleibt davon unberührt: Der Ordner `mvp/` ist aus
der `tsconfig.json` des Lendung ausgeschlossen und hat eigenen Lockfile.
