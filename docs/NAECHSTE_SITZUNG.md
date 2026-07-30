# Nächste Sitzung — Übergabe

Dieses Dokument ist der Einstieg, wenn eine neue Sitzung ohne
Gesprächsgeschichte beginnt. Es enthält **keine** Zugangsdaten, Schlüssel oder
Tokens.

Stand: 2026-07-30, Zweig `claude/memento-os-design-fx5ev8`, letzter Commit
betrifft `0016`.

---

## Wo der Stand steht

| Was | Stand |
|---|---|
| Lendung (`src/`) | live auf GitHub Pages |
| Anwendung (`mvp/`) | läuft, SSR auf Vercel |
| Datenbank | Migrationen `0001`–`0016` **angewandt und nachgemessen** |
| Öffentlicher Vertrag | genau sechs `anon`-Funktionen, null Funktionen ohne ACL |

Die letzten beiden Migrationen:

- **`0015` — Rechte je Feld.** Sichtbarkeit steht je Feld, nicht je Feldgruppe.
  Drei bestätigte Zugriffsfehler behoben (Fahrdienst sieht den
  Infektionshinweis, Friedhof das Sargmass, Steinmetz Namen und Lebensdaten),
  dazu Sterbedatum fürs Krematorium wegen der Wartefrist.
- **`0016` — Quelle je Angabe.** Wer die Quelle einer Angabe ist, ändert
  direkt; wer es nicht ist, macht einen Vorschlag. Damit endet das stille
  Überschreiben durch den Familienbogen.

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

## Der nächste Schritt: `0017`

**Abhängigkeiten und Freigaben.** Heute weiss das System nicht, dass eine
Einäscherung ohne Freigabe nicht stattfinden darf. Ein Termin lässt sich
bestätigen, egal was fehlt.

Zu bauen:

- `public.voraussetzung` je Fall — was beigebracht werden muss, von wem, ob
  erfüllt.
- Die **fünfte Matrix**: welche Terminart welche Voraussetzung braucht.
- `public.termin_bestaetigen` prüft Blocker, bevor es bestätigt.
- Bildschirme «was steht und wegen wem» — für das Haus vollständig, für
  Eingeladene nur zu ihren eigenen Terminen.

**Was fehlt, um es richtig zu bauen:** die Liste selbst. Der Mechanismus ist
Architektur; welche Voraussetzung welchen Termin blockiert, ist Branchenwissen
und wird nicht geraten. Der Eigentümer hat die Antworten eines Branchenkenners
zugesagt.

Ohne diese Antworten: nur den Mechanismus bauen, mit einem kleinen Satz, bei
dem die Sicherheit hoch ist (Überführung setzt die Todesbescheinigung voraus,
Einäscherung die zweite Leichenschau, Beisetzung eine Grabstelle) — und jede
Zeile ausdrücklich als Annahme markieren, wie in `0015` geschehen.

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
