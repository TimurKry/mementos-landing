# Nächste Sitzung — Übergabe

Dieses Dokument ist der Einstieg, wenn eine neue Sitzung ohne
Gesprächsgeschichte beginnt. Es enthält **keine** Zugangsdaten, Schlüssel oder
Tokens.

Stand: 2026-07-30, Zweig `claude/migration-0017-dependencies-uyjelu`, letzter
Commit betrifft `0017`.

---

## Wo der Stand steht

| Was | Stand |
|---|---|
| Lendung (`src/`) | live auf GitHub Pages |
| Anwendung (`mvp/`) | läuft, SSR auf Vercel |
| Datenbank | Migrationen `0001`–`0016` **angewandt und nachgemessen** |
| `0017` | geschrieben und im Mock-Betrieb geprüft, **noch nicht angewandt** |
| Öffentlicher Vertrag | genau sechs `anon`-Funktionen, null Funktionen ohne ACL, **null Tabellenrechte für `anon`** (dritte Invariante, ab 0017) |

Die letzten drei Migrationen:

- **`0015` — Rechte je Feld.** Sichtbarkeit steht je Feld, nicht je Feldgruppe.
  Drei bestätigte Zugriffsfehler behoben (Fahrdienst sieht den
  Infektionshinweis, Friedhof das Sargmass, Steinmetz Namen und Lebensdaten),
  dazu Sterbedatum fürs Krematorium wegen der Wartefrist.
- **`0016` — Quelle je Angabe.** Wer die Quelle einer Angabe ist, ändert
  direkt; wer es nicht ist, macht einen Vorschlag. Damit endet das stille
  Überschreiben durch den Familienbogen.
- **`0017` — Abhängigkeiten und Freigaben.** Der Mechanismus steht; die
  Liste, welche Voraussetzung welchen Termin blockiert, ist eine ANNAHME aus
  drei Zeilen. Siehe den eigenen Abschnitt weiter unten.

> **`0017` ist noch nicht auf der Datenbank.** Alles darunter — Tabelle, fünfte
> Matrix, Prüfung in `termin_bestaetigen`, beide Bildschirme — ist geschrieben
> und im Mock-Betrieb durch Ausführung geprüft, aber nicht angewandt. Der
> Grund ist nicht Vorsicht vor dem Skript, sondern die Liste: sie fehlt noch,
> und mit ihr ändern sich vermutlich Zeilen der Matrix. Vor dem Anwenden die
> zwei Invarianten messen (sechs `anon`-Funktionen, null Funktionen ohne ACL);
> die Prüfungen in Abschnitt 8 der Datei tun das selbst und brechen ab.

---

## Zuerst den Wissensgraphen benutzen

Das Projekt hat einen Graphen unter `graphify-out/`. Er ist der **erste**
Navigationsweg, nicht die Volltextsuche:

```bash
graphify query "<Frage>"          # liefert einen kleinen Teilgraphen
graphify path "<A>" "<B>"         # Beziehung zwischen zwei Dingen
graphify explain "<Begriff>"      # ein Begriff im Zusammenhang
graphify update .                 # nach Codeänderungen, kostet nichts
```

`graphify-out/GRAPH_REPORT.md` nur für den grossen Überblick lesen.
`graphify-out/wiki/index.md` für breite Navigation, falls vorhanden.

Ein PreToolUse-Haken erzwingt das beim ersten Lesen einer Datei: er meldet
sich genau einmal je Sitzung und lässt danach alles durch.

---

## Vor jeder Arbeit lesen

1. `docs/WORKING_CONTEXT.md` — der eigentliche Arbeitsstand: Rechtemodell,
   Sicherheitsentscheidungen, was bestätigt ist und was Annahme.
2. `docs/design-systems.md` — **Pflicht vor jeder UI-Arbeit.** Drei
   Designsysteme, jede Seite gehört streng zu genau einem.
3. `docs/features/mvp-sicherheit.md` — die Begründung hinter jeder
   Sicherheitsentscheidung, einschliesslich der Fehler, die dabei gemacht und
   korrigiert wurden.

---

## `0017` — gebaut, aber auf die Liste wartend

**Abhängigkeiten und Freigaben.** Der Mechanismus ist da:

- `public.voraussetzung` je Fall — was beigebracht werden muss, von wem, ob
  erfüllt.
- Die **fünfte Matrix** `app.voraussetzungen_fuer_termin` — welche Terminart
  welche Voraussetzung braucht.
- `public.termin_bestaetigen` prüft Blocker, bevor es bestätigt. Rückgabe
  jetzt `jsonb` statt `boolean`, weil «darf nicht» und «etwas fehlt noch»
  zwei verschiedene Auskünfte sind.
- Beide Bildschirme: das Haus sieht an jedem Termin, was ihn aufhält und wer
  es beibringt; Eingeladene sehen es nur an ihren eigenen Terminen.

**Was weiterhin fehlt: die Liste selbst.** Die Antworten des Branchenkenners
sind nicht eingetroffen. In der Matrix stehen deshalb DREI ZEILEN, jede
ausdrücklich als Annahme gekennzeichnet, wie in `0015` verfahren:

| Terminart | braucht | Sicherheit |
|---|---|---|
| Überführung | Todesbescheinigung | hoch |
| Einäscherung | zweite Leichenschau | hoch, und der teuerste Irrtum |
| Beisetzung | Grabstelle | die schwächste der drei |

Abholung, Trauerfeier und Abschiednahme stehen mit leerer Liste da — auch das
ist eine Annahme, nur eine ohne Wirkung.

Aus der Unsicherheit folgen zwei Bauentscheidungen, die mit der Liste zusammen
neu zu bewerten sind (Begründung ausführlich im Kopf der Migration):

1. **Nur eine erfasste Voraussetzung blockiert.** Eine fehlende Zeile hält
   nichts auf. Ein Mechanismus auf einer Vermutung darf nicht von selbst
   Arbeit anhalten; das Haus schaltet ihn je Vorgang ein.
2. **Das Haus wird nicht blockiert.** Geprüft wird nur im äusseren Umkreis.
   Das Haus sieht den Blocker und entscheidet selbst — es weiss mehr als die
   Anwendung. Sagt ein Bestatter «nein, auch wir dürfen das nicht», wird
   daraus ein Auslöser auf `public.termine`, dann aber als eigene Migration.

**Wenn die Liste kommt:** die Matrix in `0017` NICHT bearbeiten — sie ist dann
angewandt. Eine neue Migration, wie bei jeder Rechteänderung. Zu ändern sind
dann immer beide Seiten zusammen: `app.voraussetzungen_fuer_termin` und
`voraussetzungenFuerTermin` in `mvp/src/lib/access.ts`.

---

## Danach, in dieser Reihenfolge

1. `0018` — Übergaben und Identitätskette (`uebergabe`, `sarg_id`/`urnen_id`,
   `einaescherungsnummer`).
2. `0019` — Unterlagenpakete nach draussen. Ämter registrieren sich nicht:
   PDF plus strukturierter Satz, ablaufende Adresse ohne Konto.
3. Eigenes SMTP, damit ein Einladungslink eine Familie von selbst erreicht.
4. Partnerorganisationen mit Konten — **braucht eine Entscheidung des
   Eigentümers**, siehe unten.
5. Zuletzt und ausdrücklich auf Wunsch des Eigentümers ans Ende gestellt:
   Rechtstexte (Impressum, Datenschutzerklärung), Auswertung,
   Kontaktformular.

---

## Arbeitsregeln, die nicht verhandelbar sind

- **Vor jedem Commit `pnpm build` grün**, im MVP mit leer gesetzten
  Supabase-Variablen: `NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= MEMENTO_ALLOW_MOCK=1 pnpm build`.
- **Der Rechteblock steht am Ende jeder Migration.** `alter default
  privileges … revoke execute` wirkt auf diesem Projekt nicht.
- **Alte Funktionen werden `DROP`t, nicht `CREATE OR REPLACE`t**, wenn sich
  die Signatur oder der Rückgabetyp ändert — sonst bleibt die alte Fassung
  mit `PUBLIC EXECUTE` bestehen.
- **Nach jeder Migration die zwei Invarianten messen**: genau sechs
  `anon`-Funktionen, null Funktionen mit `proacl is null`.
- **Geprüft wird durch Ausführung, nicht durch Lesen.** Eine Probe, die
  Unerreichbares behauptet, ist schlechter als keine.
- **Ins Protokoll gehen Namen, nie Inhalte.**
- Kopie auf Deutsch, Ton ruhig und präzise. Keine erfundenen Metriken,
  Referenzen oder Preise. Demodaten heissen «Beispieldaten».
- Auf dem Arbeitszweig entwickeln, nicht nach `main` mergen ohne
  ausdrückliche Bitte.
