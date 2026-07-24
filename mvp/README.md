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

- **Quelle der Wahrheit ist die Datenbank**: `allowed_tiers(role)` und
  `get_case_for_role(case, role)` in
  [`supabase/migrations/0003_access.sql`](supabase/migrations/0003_access.sql)
  bauen serverseitig ein gefiltertes JSON. Row-Level-Security
  ([`0002_rls.sql`](supabase/migrations/0002_rls.sql)) sorgt dafür, dass ein
  Nutzer nur eigene Fälle erreicht.
- Für den **Mock-Modus** (und die UI-Beschriftungen) gibt es ein **1:1-Spiegel**
  in TypeScript: [`src/lib/access.ts`](src/lib/access.ts). Beide Definitionen
  müssen synchron bleiben — der Kommentar im Code weist darauf hin.

So ergibt sich: **Wer nicht berechtigt ist, bekommt das Feld gar nicht erst
geliefert** — nicht ausgeblendet im Browser, sondern nie gesendet.

---

## Mit echter Datenbank (Supabase, Region EU)

### 1. Projekt anlegen

- Auf [supabase.com](https://supabase.com) ein Projekt in der Region
  **EU (Frankfurt, `eu-central-1`)** erstellen — Daten bleiben in der EU.
- Aus *Project Settings → API* übernehmen:
  `Project URL`, `anon public key`, `service_role key`.

### 2. Schema einspielen

Die drei Migrationen der Reihe nach im **SQL-Editor** des Projekts ausführen
(oder via Supabase CLI):

```
supabase/migrations/0001_init.sql     # Tabellen, Enums, Fall-Referenz
supabase/migrations/0002_rls.sql      # Row-Level-Security (nur eigene Fälle)
supabase/migrations/0003_access.sql   # feldgenauer Zugriff je Rolle (Kernstück)
```

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
├─ supabase/migrations/     SQL: Schema · RLS · feldgenauer Zugriff
└─ src/
   ├─ lib/
   │  ├─ types.ts           Domänentypen (Spiegel der DB)
   │  ├─ access.ts          Tier-Regeln je Rolle (Spiegel von 0003_access.sql)
   │  ├─ mock.ts            In-Memory-Beispieldaten + Demo-Tokens
   │  ├─ data.ts            eine Datenzugriffs-Schicht: Mock ⇄ Supabase
   │  └─ supabase/          Server- & Browser-Client (@supabase/ssr)
   └─ app/
      ├─ page.tsx           Dashboard (Vorgänge des Bestatters)
      ├─ fall/[id]/         Fall-Detail — voller Eigentümer-Blick + Aufgaben
      ├─ einladung/[token]/ Beitritt per Link — rollen­gefilterte Ansicht
      └─ actions.ts         Server Action (Aufgabe abhaken)
```

Design folgt der **Default**-Dark-Systematik des Lendung (`/workspace`):
Void `#0b0c0e`, Graphit-Karten, Haarlinien statt Schatten, Inter, Knochen-CTA.
Siehe `../docs/design-systems.md`.

## Build & Verifikation

```bash
pnpm build      # grün im Mock-Modus (keine env-Variablen nötig)
pnpm start      # Produktions-Server
```

## Datenschutz / offene Punkte (bewusst offen gelassen)

- **Aufbewahrung**: Ziel ist Löschung/Komprimierung nach Abschluss; die genaue
  gesetzliche Aufbewahrungsfrist ist noch mit Rechtsberatung zu klären, bevor
  produktiv Daten gespeichert werden.
- **Rechtsträger / AVV / Hosting-Vertrag**: noch offen — keine erfundenen
  Angaben. Vor einem echten Pilotbetrieb zu klären.
- Einladungs-Token laufen nach 30 Tagen ab (`invites.expires_at`).

## Deployment

**Nicht** GitHub Pages (dort läuft nur der statische Lendung). Dieser MVP
braucht einen Node-Runtime — z. B. Vercel (Region Frankfurt) oder Self-Hosting
in der EU. Der Lendung-Deploy bleibt davon unberührt: Der Ordner `mvp/` ist aus
der `tsconfig.json` des Lendung ausgeschlossen und hat eigenen Lockfile.
