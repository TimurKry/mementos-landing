# Graph Report - mementos-landing  (2026-07-30)

## Corpus Check
- 175 files · ~112,957 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1159 nodes · 2232 edges · 81 communities (66 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bed0acaa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin.ts
- site.ts
- icons.tsx
- zugang/page.tsx
- datamodel/ui.tsx
- lib/data.ts
- dependencies
- mock.ts
- package.json
- compilerOptions
- Sections.tsx
- (intern)/fall/[id]/actions.ts
- compilerOptions
- 0004_hardening.sql
- ZugangTermine.tsx
- HubDiagram.tsx
- preise/page.tsx
- so-funktioniert-es/page.tsx
- BestatterWorkspace.tsx
- DemoFlow.tsx
- audienceMetadata
- Artifacts.tsx
- VerstorbenePerson.tsx
- MementoOS — Arbeitsstand (durable project knowledge)
- verlauf.ts
- AudiencePage.tsx
- MementoOS Landing — контекст проекта
- 0016_quelle_je_angabe.sql
- 0002_rls.sql
- 0008_plattform_uebersicht.sql
- 0001_init.sql
- fuer-zulieferer/page.tsx
- (intern)/fall/[id]/page.tsx
- src/app/layout.tsx
- Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`
- .claude/CLAUDE.md
- 0011_termine.sql
- vercel.json
- env.ts
- zugang/unterlage/[docId]/route.ts
- lib/types.ts
- (admin)/layout.tsx
- ungueltig/page.tsx
- access.ts
- 0014_unterlagen.sql
- mvp/src/app/layout.tsx
- MementoOS — MVP
- mvp/postcss.config.mjs
- 0006_fall_loeschbar_machen.sql
- 0007_audit_ohne_fremdschluessel.sql
- 0010_fall_anlegen.sql
- next.config.ts
- postcss.config.mjs
- Feature: Zielgruppen-Seiten & Preise (/fuer-*, /preise)
- Что добавлено
- Конвейер
- Feature: Datenmodell & Zugriff (/datenmodell)
- MementoOS — где мы сейчас
- Termine.tsx
- Компоненты демо-потока (/demo)
- MementoOS — Landing
- Канон дизайн-систем MementoOS
- [token]/route.ts
- Markenzeichen
- audience/types.ts
- fuer-familien/page.tsx
- phaseLabel
- angabenErgaenzen
- fuer-krematorien/page.tsx

## God Nodes (most connected - your core abstractions)
1. `meldung()` - 22 edges
2. `pruefe()` - 21 edges
3. `dbFehler()` - 19 edges
4. `kennung()` - 19 edges
5. `compilerOptions` - 16 edges
6. `compilerOptions` - 16 edges
7. `MementoOS — Arbeitsstand (durable project knowledge)` - 15 edges
8. `Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`` - 15 edges
9. `useSpeicherstand()` - 14 edges
10. `istKeinZugriff()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `zugangBeendenAction()` --calls--> `endInviteSession()`  [EXTRACTED]
  mvp/src/app/(extern)/zugang/actions.ts → mvp/src/lib/data.ts
- `terminBestaetigenAction()` --calls--> `terminBestaetigen()`  [EXTRACTED]
  mvp/src/app/(extern)/zugang/actions.ts → mvp/src/lib/data.ts
- `korrekturEntscheidenAction()` --calls--> `korrekturEntscheiden()`  [EXTRACTED]
  mvp/src/app/(intern)/fall/[id]/korrektur-actions.ts → mvp/src/lib/data.ts
- `fallAnlegenAction()` --calls--> `createCase()`  [EXTRACTED]
  mvp/src/app/(intern)/fall/neu/actions.ts → mvp/src/lib/data.ts
- `vorgangSpeichernAction()` --calls--> `updateCase()`  [EXTRACTED]
  mvp/src/app/(intern)/fall/[id]/actions.ts → mvp/src/lib/data.ts

## Import Cycles
- None detected.

## Communities (81 total, 15 thin omitted)

### Community 0 - "admin.ts"
Cohesion: 0.08
Nodes (59): EreignisseSeite(), AdminErgebnis, ausfuehren(), sitzungBeendenAction(), zugangZurueckziehenAction(), FallSeite(), badgeKlasse, Zugaenge() (+51 more)

### Community 1 - "site.ts"
Cohesion: 0.27
Nodes (8): robots(), Eintrag, SEITEN, sitemap(), STAND, absolut(), seite(), SeitenPfad

### Community 2 - "icons.tsx"
Cohesion: 0.09
Nodes (18): blocks, metadata, FeatureCards(), HeuteMorgen(), heuteSteps, morgenSteps, IconBrief(), IconCheck() (+10 more)

### Community 3 - "zugang/page.tsx"
Cohesion: 0.17
Nodes (12): zugangBeendenAction(), AngabenBogen(), DATUMSFELDER, PLATZHALTER, ZugangPage(), ZugangBeenden(), ZugangTermine(), feldLabel (+4 more)

### Community 4 - "datamodel/ui.tsx"
Cohesion: 0.09
Nodes (30): metadata, roleOrder, DocRow, documents, entities, Entity, Field, Group (+22 more)

### Community 5 - "lib/data.ts"
Cohesion: 0.14
Nodes (29): addParticipant(), addTask(), addTermin(), addUnterlage(), createCase(), createInvite(), dbFehler(), endInviteSession() (+21 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, next, react, react-dom, server-only, @supabase/ssr, @supabase/supabase-js, devDependencies (+26 more)

### Community 7 - "mock.ts"
Cohesion: 0.06
Nodes (36): addInvite(), alleFaelle(), alleZugaenge(), DEMO_ANGELEGT, demoFaelle(), demoZugaenge(), ereignisEintragen(), fallVon() (+28 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (31): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+23 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (27): mvp, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+19 more)

### Community 10 - "Sections.tsx"
Cohesion: 0.11
Nodes (11): Faq(), items, Marquee(), roles, Audiences, bandItems, ContactCta(), Process() (+3 more)

### Community 11 - "(intern)/fall/[id]/actions.ts"
Cohesion: 0.06
Nodes (81): BestaetigenErgebnis, LAENGE, BestattungsartFeld(), AufgabeEingabe, aufgabeEntfernenAction(), aufgabeHinzufuegenAction(), aufgabeUmschaltenAction(), beteiligtenBeitrittAction() (+73 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 13 - "0004_hardening.sql"
Cohesion: 0.12
Nodes (16): app.audit_log_append_only(), app.case_for_role(), app.handle_new_user(), app.log(), audit_log_append_only, on_auth_user_created, public.audit_log, public.cases (+8 more)

### Community 14 - "ZugangTermine.tsx"
Cohesion: 0.19
Nodes (15): terminBestaetigenAction(), TerminKarte(), entwurfAus(), terminStatusLabel, abstandMinuten(), ausWanduhr(), gleicherTag(), istWanduhr() (+7 more)

### Community 15 - "HubDiagram.tsx"
Cohesion: 0.13
Nodes (16): AccessTeaser(), Hero(), curves, endpoints, HubDiagram(), Node, nodes, IconBestatter() (+8 more)

### Community 16 - "preise/page.tsx"
Cohesion: 0.21
Nodes (8): cta, metadata, pricing, AudienceFooter(), defaultPlans, Pricing(), PricingPlan, PricingSpec

### Community 17 - "so-funktioniert-es/page.tsx"
Cohesion: 0.18
Nodes (10): metadata, steps, umstieg, metadata, AudienceNav(), Footer(), Header(), links (+2 more)

### Community 18 - "BestatterWorkspace.tsx"
Cohesion: 0.11
Nodes (13): metadata, IconKerze(), BestatterWorkspace(), Case, Col, cols, Contact, contactMeta (+5 more)

### Community 19 - "DemoFlow.tsx"
Cohesion: 0.21
Nodes (10): metadata, DemoFlow(), stepLabels, Card(), Field(), GhostBtn(), Pill(), PillTone (+2 more)

### Community 20 - "audienceMetadata"
Cohesion: 0.14
Nodes (9): metadata, metadata, metadata, audienceMetadata(), AudiencePage(), bestatter, friedhoefe, verbuende (+1 more)

### Community 21 - "Artifacts.tsx"
Cohesion: 0.18
Nodes (5): Artifact(), AudienceHero(), slots, ArtifactSpec, HeroSpec

### Community 22 - "VerstorbenePerson.tsx"
Cohesion: 0.27
Nodes (8): ausDaten(), felderDerGruppe, Formular, text(), VerstorbenePerson(), zahl(), tierGruppenTitel, Tier

### Community 23 - "MementoOS — Arbeitsstand (durable project knowledge)"
Cohesion: 0.12
Nodes (15): Arbeitsweise, Architektur des MVP, BLOCKED — wartet auf den Eigentümer, nicht auf Technik, CONFIRMED — fertig und auf der echten Datenbank geprüft, Der öffentliche Vertrag, Drei Designsysteme, IN PROGRESS, MementoOS — Arbeitsstand (durable project knowledge) (+7 more)

### Community 24 - "verlauf.ts"
Cohesion: 0.24
Nodes (12): Verlauf(), wann(), zeitpunkt, terminArtLabel, TerminArt, akteure, akteurLabel(), aktionen (+4 more)

### Community 25 - "AudiencePage.tsx"
Cohesion: 0.33
Nodes (5): AudienceCta(), QuoteSection(), StepsSection(), AudienceData, WarumSection()

### Community 26 - "MementoOS Landing — контекст проекта"
Cohesion: 0.25
Nodes (7): Git, graphify, MementoOS Landing — контекст проекта, Команды, Правила контента (нарушение = блокер на ревью), Структура, Три дизайн-системы (кратко)

### Community 27 - "0016_quelle_je_angabe.sql"
Cohesion: 0.36
Nodes (5): app.feldquelle_pflegen(), deceased_feldquelle, public.feldquelle, public.korrektur_entscheiden(), public.korrekturvorschlag

### Community 28 - "0002_rls.sql"
Cohesion: 0.22
Nodes (9): audit_log, cases, deceased, documents, invites, is_case_owner(), participants, profiles (+1 more)

### Community 30 - "0001_init.sql"
Cohesion: 0.44
Nodes (8): audit_log, cases, deceased, documents, invites, participants, profiles, tasks

### Community 32 - "(intern)/fall/[id]/page.tsx"
Cohesion: 0.13
Nodes (18): badgeKlasse, Einladungen(), Kopierstand, datumsformat, EinladungAnsicht, EinladungStatus, status(), zuAnsicht() (+10 more)

### Community 33 - "src/app/layout.tsx"
Cohesion: 0.24
Nodes (8): inter, metadata, mono, RootLayout(), serif, Reveal(), Schema(), softwareSchema()

### Community 34 - "Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`"
Cohesion: 0.05
Nodes (36): Fail-loud вместо тихого mock (`src/lib/env.ts`), Feature: Sicherheit im MVP (`mvp/`) — Rechtemodell, Sitzungen, Kopfzeilen, Middleware (`src/middleware.ts`), Open redirect через управляющие символы в `?next=`, service_role, Вход, Гигиена `search_path`, Два побочных исправления в схеме (+28 more)

### Community 38 - "vercel.json"
Cohesion: 0.33
Nodes (5): framework, installCommand, regions, $schema, fra1

### Community 39 - "env.ts"
Cohesion: 0.08
Nodes (36): nextConfig, POST(), Art, ARTEN, GET(), istArt(), AnmeldeErgebnis, mitPasswortAnmelden() (+28 more)

### Community 41 - "zugang/unterlage/[docId]/route.ts"
Cohesion: 0.27
Nodes (9): GET(), GET(), Auslieferung, unterlageFuerHaus(), unterlageFuerSitzung(), ausliefern(), contentDisposition(), KEIN_CACHE (+1 more)

### Community 42 - "lib/types.ts"
Cohesion: 0.14
Nodes (13): AdminFall, AdminFallKontext, AdminHaus, AdminSitzung, AdminUebersicht, AngabenErgebnis, Case, ContactStatus (+5 more)

### Community 43 - "(admin)/layout.tsx"
Cohesion: 0.24
Nodes (5): metadata, metadata, metadata, Wordmark(), isMock

### Community 45 - "access.ts"
Cohesion: 0.17
Nodes (18): Felder(), Gruppe(), allowedTiers(), aufzaehlung(), caseForRole(), darfBestaetigen(), deceasedForRole(), empfaengerSatz() (+10 more)

### Community 49 - "MementoOS — MVP"
Cohesion: 0.10
Nodes (20): 1. Projekt anlegen, 2. Schema einspielen, 3. Umgebungsvariablen, Aufbau, Build & Verifikation, Demo-Ablauf (die eine Sache, die es zu zeigen gilt), Deployment, Der Token steht nicht in der Adresszeile (+12 more)

### Community 59 - "Feature: Zielgruppen-Seiten & Preise (/fuer-*, /preise)"
Cohesion: 0.15
Nodes (12): Feature: Zielgruppen-Seiten & Preise (/fuer-*, /preise), Hero-артефакты — `ArtifactSpec`, Role-router и связки, Архитектура data-driven шаблона, Зачем, Известные ограничения / открытые вопросы, Как проверить, Общий Pricing — `src/components/pricing/` (+4 more)

### Community 60 - "Что добавлено"
Cohesion: 0.15
Nodes (12): 1. Блок HeuteMorgen на главной — `src/components/HeuteMorgen.tsx`, 2. Страница `/so-funktioniert-es` — `src/app/so-funktioniert-es/page.tsx`, 3. Страница `/sicherheit` — `src/app/sicherheit/page.tsx`, 4. Страница `/ueber-uns` — `src/app/ueber-uns/page.tsx`, 5. Три новых FAQ — `src/components/Faq.tsx`, 6. Навигация и связки, Feature: Vertrauen & Ablauf (Фазы 3–5, система Monad), Зачем (+4 more)

### Community 62 - "Конвейер"
Cohesion: 0.17
Nodes (11): 0. Приём задачи, 1. План — агент architect, 2. Реализация — агент(ы) implementer, 3. Ревью — агент reviewer, затем /code-review, 4. Верификация, 5. Документация — агент doc-writer, 6. Сдача, 7. Итоговый отчёт пользователю (+3 more)

### Community 63 - "Feature: Datenmodell & Zugriff (/datenmodell)"
Cohesion: 0.18
Nodes (10): Feature: Datenmodell & Zugriff (/datenmodell), Данные — `src/components/datamodel/data.ts`, Зачем, Известные ограничения / открытые вопросы, Иконки — `src/components/icons.tsx`, Как проверить, Как устроена схема, Компоненты — `src/components/datamodel/` (+2 more)

### Community 64 - "MementoOS — где мы сейчас"
Cohesion: 0.20
Nodes (9): 1. Что вообще есть в репозитории, 2. Модель данных, 3. Кто какие поля видит, 4. Как участник попадает в дело, 5. Два периметра и что их стережёт, 6. История миграций — включая два бага, найденных на боевой базе, 7. Что готово, что нет, 8. Админка платформы — что предлагаю строить (+1 more)

### Community 65 - "Termine.tsx"
Cohesion: 0.17
Nodes (10): TerminEingabe, Entwurf, LEER, ROLLEN, Termine(), TERMIN_ARTEN, TERMIN_STATUS, terminArtHinweis (+2 more)

### Community 66 - "Компоненты демо-потока (/demo)"
Cohesion: 0.25
Nodes (7): Field, Pill — статусная метка, PrimaryBtn / GhostBtn, Stepper — шаги демо, Компоненты демо-потока (/demo), Переход шагов, Правило данных

### Community 67 - "MementoOS — Landing"
Cohesion: 0.25
Nodes (7): MementoOS — Landing, MVP (`mvp/`), Деплой, Запуск, Команда агентов, Правила контента, Структура

### Community 68 - "Канон дизайн-систем MementoOS"
Cohesion: 0.29
Nodes (6): 1. Monad — лендинг `/`, `/demo` и Monad-подстраницы, 2. Steep — страницы аудиторий `/fuer-*`, 3. Default — CRM `/workspace`, Зона Datenmodell (/datenmodell) — внутри Monad, Канон дизайн-систем MementoOS, Общие законы (все системы)

### Community 69 - "[token]/route.ts"
Cohesion: 0.60
Nodes (5): ab(), GET(), istForm(), redeemInvite(), zugangCookie()

### Community 70 - "Markenzeichen"
Cohesion: 0.50
Nodes (3): Entschieden: die Datei gewinnt, Markenzeichen, Wo das Zeichen benutzt wird

### Community 75 - "audience/types.ts"
Cohesion: 0.12
Nodes (11): FaqSection(), ScenarioSection(), AccessRow, BoardColumnSpec, BoardTask, FaqItem, LossStep, MitStep (+3 more)

### Community 78 - "phaseLabel"
Cohesion: 0.67
Nodes (3): Dashboard(), phaseLabel, listCases()

### Community 79 - "angabenErgaenzen"
Cohesion: 0.67
Nodes (3): angabenErgaenzenAction(), alsErgebnis(), angabenErgaenzen()

## Knowledge Gaps
- **391 isolated node(s):** `Produktziel`, `Zwei Anwendungen in einem Repository`, `Drei Designsysteme`, `Architektur des MVP`, `Rechtemodell: vier Matrizen` (+386 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRuntimeMode()` connect `env.ts` to `admin.ts`, `lib/data.ts`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `seite()` connect `site.ts` to `src/app/layout.tsx`, `icons.tsx`, `datamodel/ui.tsx`, `preise/page.tsx`, `so-funktioniert-es/page.tsx`, `BestatterWorkspace.tsx`, `DemoFlow.tsx`, `audienceMetadata`, `AudiencePage.tsx`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `Role` connect `(intern)/fall/[id]/actions.ts` to `(intern)/fall/[id]/page.tsx`, `Termine.tsx`, `admin.ts`, `lib/data.ts`, `mock.ts`, `lib/types.ts`, `access.ts`, `verlauf.ts`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `Produktziel`, `Zwei Anwendungen in einem Repository`, `Drei Designsysteme` to the rest of the system?**
  _391 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08128772635814889 - nodes in this community are weakly interconnected._
- **Should `icons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09032258064516129 - nodes in this community are weakly interconnected._
- **Should `datamodel/ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08710801393728224 - nodes in this community are weakly interconnected._