# Graph Report - .  (2026-07-29)

## Corpus Check
- 167 files · ~92,385 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 934 nodes · 1989 edges · 59 communities (45 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Plattform-Uebersicht /admin
- MVP-Konfiguration und Layouts
- Fallkarte: Aufgaben und Beteiligte
- Aeusserer Umkreis: Zugang Eingeladener
- Lendung: Datenmodell-Seite
- Datenschicht des MVP
- MVP-Paketabhaengigkeiten
- Mock-Speicher
- Lendung-Paketabhaengigkeiten
- TypeScript-Konfiguration (Wurzel)
- Lendung: Startseite und Bausteine
- Server Actions der Fallkarte
- TypeScript-Konfiguration (MVP)
- Migration 0004: Rechteverschaerfung
- Schreibwege des aeusseren Umkreises
- Lendung: Hub-Diagramm
- Lendung: Preise
- Lendung: Sicherheit und Ablauf
- Lendung: Arbeitsbereich-Konzept
- Lendung: Vorfuehrung
- Zielgruppen Bestatter und Familien
- Zielgruppen: Produkt-Artefakte
- Erfassungsbogen verstorbene Person
- Domaenentypen des MVP
- Fallkarte: Einladungen erzeugen
- Zielgruppen: Seitenbausteine
- Unterlagen: Abruf und Auslieferung
- Einladungen im Arbeitsbereich
- Migration 0002: RLS-Regeln
- Migration 0008: Plattform-Uebersicht
- Migration 0001: Grundschema
- Zielgruppen: Szenario-Ansicht
- Lendung: Funktionskarten
- Lendung: Wurzel-Layout
- Lendung: Hero und Heute/Morgen
- Vorgang anlegen
- Migration 0011: Termine
- Vercel-Konfiguration
- Mock: Beispieldaten-Saat
- Zielgruppe Krematorien
- Zielgruppe Verbuende
- Zielgruppe Zulieferer
- Ungueltiger Einladungslink
- Rechtematrizen im Anwendungscode
- Migration 0014: Unterlagen
- MVP-Wurzel-Layout
- Mock: Protokoll
- PostCSS (MVP)
- Migration 0006: Fehlversuch
- Migration 0007: Audit ohne Fremdschluessel
- Migration 0010: Fall anlegen
- Next-Konfiguration (Wurzel)
- PostCSS (Wurzel)

## God Nodes (most connected - your core abstractions)
1. `getRuntimeMode()` - 37 edges
2. `meldung()` - 23 edges
3. `pruefe()` - 22 edges
4. `dbFehler()` - 19 edges
5. `kennung()` - 19 edges
6. `compilerOptions` - 16 edges
7. `compilerOptions` - 16 edges
8. `schreibe()` - 13 edges
9. `useSpeicherstand()` - 13 edges
10. `Role` - 13 edges

## Surprising Connections (you probably didn't know these)
- `zugangZurueckziehenAction()` --indirect_call--> `adminZugangZurueckziehen()`  [INFERRED]
  mvp/src/app/(admin)/admin/fall/[id]/actions.ts → mvp/src/lib/admin.ts
- `sitzungBeendenAction()` --indirect_call--> `adminSitzungBeenden()`  [INFERRED]
  mvp/src/app/(admin)/admin/fall/[id]/actions.ts → mvp/src/lib/admin.ts
- `PlattformSeite()` --indirect_call--> `adminHaeuser()`  [INFERRED]
  mvp/src/app/(admin)/admin/page.tsx → mvp/src/lib/admin.ts
- `PlattformSeite()` --indirect_call--> `adminUebersicht()`  [INFERRED]
  mvp/src/app/(admin)/admin/page.tsx → mvp/src/lib/admin.ts
- `PasswortForm()` --indirect_call--> `mitPasswortAnmelden()`  [INFERRED]
  mvp/src/app/(extern)/login/PasswortForm.tsx → mvp/src/app/(extern)/login/actions.ts

## Import Cycles
- None detected.

## Communities (59 total, 14 thin omitted)

### Community 0 - "Plattform-Uebersicht /admin"
Cohesion: 0.08
Nodes (58): EreignisseSeite(), AdminErgebnis, ausfuehren(), sitzungBeendenAction(), zugangZurueckziehenAction(), FallSeite(), badgeKlasse, Zugaenge() (+50 more)

### Community 1 - "MVP-Konfiguration und Layouts"
Cohesion: 0.06
Nodes (44): nextConfig, metadata, POST(), Art, ARTEN, GET(), istArt(), ab() (+36 more)

### Community 2 - "Fallkarte: Aufgaben und Beteiligte"
Cohesion: 0.08
Nodes (40): TerminEingabe, Aufgaben(), ROLLEN, Beteiligte(), ROLLEN, EntfernenKnopf(), Speicherstand(), STILL (+32 more)

### Community 3 - "Aeusserer Umkreis: Zugang Eingeladener"
Cohesion: 0.07
Nodes (37): AngabenBogen(), DATUMSFELDER, PLATZHALTER, ZugangPage(), ZugangBeenden(), TerminKarte(), ZugangTermine(), Verlauf() (+29 more)

### Community 4 - "Lendung: Datenmodell-Seite"
Cohesion: 0.09
Nodes (30): metadata, roleOrder, DocRow, documents, entities, Entity, Field, Group (+22 more)

### Community 5 - "Datenschicht des MVP"
Cohesion: 0.16
Nodes (34): FallPage(), addParticipant(), addTask(), addTermin(), addUnterlage(), angabenErgaenzen(), createCase(), createInvite() (+26 more)

### Community 6 - "MVP-Paketabhaengigkeiten"
Cohesion: 0.06
Nodes (34): dependencies, next, react, react-dom, server-only, @supabase/ssr, @supabase/supabase-js, devDependencies (+26 more)

### Community 7 - "Mock-Speicher"
Cohesion: 0.07
Nodes (25): alleFaelle(), alleZugaenge(), DEMO_ANGELEGT, demoFaelle(), demoZugaenge(), g, iso(), isoOderNull() (+17 more)

### Community 8 - "Lendung-Paketabhaengigkeiten"
Cohesion: 0.06
Nodes (31): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+23 more)

### Community 9 - "TypeScript-Konfiguration (Wurzel)"
Cohesion: 0.07
Nodes (27): mvp, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+19 more)

### Community 10 - "Lendung: Startseite und Bausteine"
Cohesion: 0.09
Nodes (15): AccessTeaser(), Faq(), items, IconBrief(), IconKurve(), IconPhone(), Marquee(), roles (+7 more)

### Community 11 - "Server Actions der Fallkarte"
Cohesion: 0.25
Nodes (26): aufgabeEntfernenAction(), aufgabeHinzufuegenAction(), aufgabeUmschaltenAction(), beteiligtenBeitrittAction(), beteiligtenEntfernenAction(), beteiligtenHinzufuegenAction(), schreibe(), terminEntfernenAction() (+18 more)

### Community 12 - "TypeScript-Konfiguration (MVP)"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 13 - "Migration 0004: Rechteverschaerfung"
Cohesion: 0.12
Nodes (16): app.audit_log_append_only(), app.case_for_role(), app.handle_new_user(), app.log(), audit_log_append_only, on_auth_user_created, public.audit_log, public.cases (+8 more)

### Community 14 - "Schreibwege des aeusseren Umkreises"
Cohesion: 0.17
Nodes (20): angabenErgaenzenAction(), BestaetigenErgebnis, LAENGE, terminBestaetigenAction(), zugangBeendenAction(), patchDerGruppe(), terminFelder(), AnlegenEingabe (+12 more)

### Community 15 - "Lendung: Hub-Diagramm"
Cohesion: 0.16
Nodes (15): curves, endpoints, Node, nodes, IconBestatter(), IconDokument(), IconFamilie(), IconFriedhof() (+7 more)

### Community 16 - "Lendung: Preise"
Cohesion: 0.16
Nodes (10): cta, metadata, pricing, AudienceCta(), AudienceFooter(), AudienceNav(), defaultPlans, Pricing() (+2 more)

### Community 17 - "Lendung: Sicherheit und Ablauf"
Cohesion: 0.15
Nodes (11): blocks, metadata, metadata, steps, umstieg, metadata, Footer(), Header() (+3 more)

### Community 18 - "Lendung: Arbeitsbereich-Konzept"
Cohesion: 0.11
Nodes (13): metadata, IconKerze(), BestatterWorkspace(), Case, Col, cols, Contact, contactMeta (+5 more)

### Community 19 - "Lendung: Vorfuehrung"
Cohesion: 0.17
Nodes (13): metadata, DemoFlow(), stepLabels, Card(), Field(), GhostBtn(), Pill(), PillTone (+5 more)

### Community 20 - "Zielgruppen Bestatter und Familien"
Cohesion: 0.16
Nodes (9): metadata, metadata, metadata, audienceMetadata(), AudiencePage(), bestatter, familien, friedhoefe (+1 more)

### Community 21 - "Zielgruppen: Produkt-Artefakte"
Cohesion: 0.14
Nodes (10): Artifact(), slots, AccessRow, ArtifactSpec, BoardTask, HeroSpec, LossStep, MitStep (+2 more)

### Community 22 - "Erfassungsbogen verstorbene Person"
Cohesion: 0.15
Nodes (15): Stand, ausDaten(), felderDerGruppe, Formular, Gruppe(), text(), VerstorbenePerson(), zahl() (+7 more)

### Community 23 - "Domaenentypen des MVP"
Cohesion: 0.13
Nodes (14): AdminFall, AdminFallKontext, AdminHaus, AdminSitzung, AdminUebersicht, Case, ContactStatus, Doc (+6 more)

### Community 24 - "Fallkarte: Einladungen erzeugen"
Cohesion: 0.15
Nodes (12): AufgabeEingabe, einladungErzeugenAction(), einladungZurueckziehenAction(), Ergebnis, ErzeugenErgebnis, PHASEN, ROLLEN, TIERS (+4 more)

### Community 25 - "Zielgruppen: Seitenbausteine"
Cohesion: 0.23
Nodes (6): AudienceHero(), FaqSection(), QuoteSection(), StepsSection(), FaqItem, WarumSection()

### Community 26 - "Unterlagen: Abruf und Auslieferung"
Cohesion: 0.31
Nodes (8): GET(), GET(), Auslieferung, unterlageFuerHaus(), unterlageFuerSitzung(), ausliefern(), contentDisposition(), KEIN_CACHE

### Community 27 - "Einladungen im Arbeitsbereich"
Cohesion: 0.24
Nodes (9): badgeKlasse, Einladungen(), Kopierstand, datumsformat, EinladungAnsicht, EinladungStatus, status(), zuAnsicht() (+1 more)

### Community 28 - "Migration 0002: RLS-Regeln"
Cohesion: 0.22
Nodes (9): audit_log, cases, deceased, documents, invites, is_case_owner(), participants, profiles (+1 more)

### Community 30 - "Migration 0001: Grundschema"
Cohesion: 0.44
Nodes (8): audit_log, cases, deceased, documents, invites, participants, profiles, tasks

### Community 31 - "Zielgruppen: Szenario-Ansicht"
Cohesion: 0.22
Nodes (3): ScenarioSection(), BoardColumnSpec, ScenarioBlock

### Community 32 - "Lendung: Funktionskarten"
Cohesion: 0.22
Nodes (3): FeatureCards(), IconFloristik(), IconSarg()

### Community 33 - "Lendung: Wurzel-Layout"
Cohesion: 0.29
Nodes (5): inter, metadata, mono, serif, Reveal()

### Community 34 - "Lendung: Hero und Heute/Morgen"
Cohesion: 0.25
Nodes (6): Hero(), HeuteMorgen(), heuteSteps, morgenSteps, HubDiagram(), IconCheck()

### Community 35 - "Vorgang anlegen"
Cohesion: 0.38
Nodes (3): BestattungsartFeld(), NeuerVorgang(), BESTATTUNGSARTEN

### Community 38 - "Vercel-Konfiguration"
Cohesion: 0.33
Nodes (5): framework, installCommand, regions, $schema, fra1

### Community 39 - "Mock: Beispieldaten-Saat"
Cohesion: 0.40
Nodes (5): addInvite(), initState(), saat(), seedCases(), seedPlattform()

### Community 45 - "Rechtematrizen im Anwendungscode"
Cohesion: 0.50
Nodes (4): caseForRole(), darfBestaetigen(), felderSchreibbar(), nachBeginn()

### Community 49 - "Mock: Protokoll"
Cohesion: 0.67
Nodes (3): ereignisEintragen(), fallVon(), protokolliere()

## Knowledge Gaps
- **254 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRuntimeMode()` connect `Datenschicht des MVP` to `Plattform-Uebersicht /admin`, `MVP-Konfiguration und Layouts`, `Fallkarte: Aufgaben und Beteiligte`, `Aeusserer Umkreis: Zugang Eingeladener`, `Unterlagen: Abruf und Auslieferung`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Role` connect `Fallkarte: Aufgaben und Beteiligte` to `Plattform-Uebersicht /admin`, `Aeusserer Umkreis: Zugang Eingeladener`, `Datenschicht des MVP`, `Mock-Speicher`, `Server Actions der Fallkarte`, `Domaenentypen des MVP`, `Fallkarte: Einladungen erzeugen`, `Einladungen im Arbeitsbereich`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `Phase` connect `Fallkarte: Aufgaben und Beteiligte` to `Plattform-Uebersicht /admin`, `Datenschicht des MVP`, `Mock-Speicher`, `Domaenentypen des MVP`, `Fallkarte: Einladungen erzeugen`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Plattform-Uebersicht /admin` be split into smaller, more focused modules?**
  _Cohesion score 0.08281573498964803 - nodes in this community are weakly interconnected._
- **Should `MVP-Konfiguration und Layouts` be split into smaller, more focused modules?**
  _Cohesion score 0.055288461538461536 - nodes in this community are weakly interconnected._
- **Should `Fallkarte: Aufgaben und Beteiligte` be split into smaller, more focused modules?**
  _Cohesion score 0.08272859216255443 - nodes in this community are weakly interconnected._