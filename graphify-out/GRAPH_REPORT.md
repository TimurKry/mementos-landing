# Graph Report - mementos-landing  (2026-07-29)

## Corpus Check
- 164 files · ~92,346 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1103 nodes · 2140 edges · 75 communities (59 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `106ba57d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin.ts
- env.ts
- Unterlagen.tsx
- lib/types.ts
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
- Termine.tsx
- HubDiagram.tsx
- preise/page.tsx
- sicherheit/page.tsx
- BestatterWorkspace.tsx
- DemoFlow.tsx
- fuer-bestatter/page.tsx
- audience/types.ts
- VerstorbenePerson.tsx
- MementoOS — Arbeitsstand (durable project knowledge)
- verlauf.ts
- AudiencePage.tsx
- MementoOS Landing — контекст проекта
- (intern)/fall/[id]/page.tsx
- 0002_rls.sql
- 0008_plattform_uebersicht.sql
- 0001_init.sql
- ScenarioSection.tsx
- icons.tsx
- src/app/layout.tsx
- Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`
- .claude/CLAUDE.md
- 0011_termine.sql
- vercel.json
- isMockMode
- fuer-krematorien/page.tsx
- fuer-verbuende/page.tsx
- fuer-zulieferer/page.tsx
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
- isSessionId
- Конвейер
- Feature: Datenmodell & Zugriff (/datenmodell)
- MementoOS — где мы сейчас
- isMock
- Компоненты демо-потока (/demo)
- MementoOS — Landing
- Канон дизайн-систем MementoOS
- [token]/route.ts
- brand/README.md

## God Nodes (most connected - your core abstractions)
1. `getRuntimeMode()` - 37 edges
2. `meldung()` - 23 edges
3. `pruefe()` - 22 edges
4. `dbFehler()` - 19 edges
5. `kennung()` - 19 edges
6. `compilerOptions` - 16 edges
7. `compilerOptions` - 16 edges
8. `MementoOS — Arbeitsstand (durable project knowledge)` - 15 edges
9. `schreibe()` - 13 edges
10. `useSpeicherstand()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `ZugangPage()` --calls--> `getCaseBySession()`  [EXTRACTED]
  mvp/src/app/(extern)/zugang/page.tsx → mvp/src/lib/data.ts
- `Dashboard()` --calls--> `listCases()`  [EXTRACTED]
  mvp/src/app/(intern)/page.tsx → mvp/src/lib/data.ts
- `zugangZurueckziehenAction()` --indirect_call--> `adminZugangZurueckziehen()`  [INFERRED]
  mvp/src/app/(admin)/admin/fall/[id]/actions.ts → mvp/src/lib/admin.ts
- `sitzungBeendenAction()` --indirect_call--> `adminSitzungBeenden()`  [INFERRED]
  mvp/src/app/(admin)/admin/fall/[id]/actions.ts → mvp/src/lib/admin.ts
- `PlattformSeite()` --indirect_call--> `adminHaeuser()`  [INFERRED]
  mvp/src/app/(admin)/admin/page.tsx → mvp/src/lib/admin.ts

## Import Cycles
- None detected.

## Communities (75 total, 16 thin omitted)

### Community 0 - "admin.ts"
Cohesion: 0.08
Nodes (57): EreignisseSeite(), AdminErgebnis, ausfuehren(), sitzungBeendenAction(), zugangZurueckziehenAction(), FallSeite(), badgeKlasse, Zugaenge() (+49 more)

### Community 1 - "env.ts"
Cohesion: 0.12
Nodes (21): nextConfig, assertRuntimeConfig(), isBuildPhase(), RuntimeMode, serverSecrets(), supabasePublicConfig(), anon, publicSupabaseUrl (+13 more)

### Community 2 - "Unterlagen.tsx"
Cohesion: 0.13
Nodes (22): Aufgaben(), ROLLEN, Beteiligte(), ROLLEN, EntfernenKnopf(), Speicherstand(), Stand, STILL (+14 more)

### Community 3 - "lib/types.ts"
Cohesion: 0.12
Nodes (18): AngabenBogen(), DATUMSFELDER, PLATZHALTER, ZugangPage(), ZugangBeenden(), feldLabel, AdminEreignis, AdminFall (+10 more)

### Community 4 - "datamodel/ui.tsx"
Cohesion: 0.11
Nodes (25): metadata, roleOrder, DocRow, documents, entities, Entity, Field, Group (+17 more)

### Community 5 - "lib/data.ts"
Cohesion: 0.15
Nodes (36): FallPage(), addParticipant(), addTask(), addTermin(), addUnterlage(), angabenErgaenzen(), createCase(), createInvite() (+28 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, next, react, react-dom, server-only, @supabase/ssr, @supabase/supabase-js, devDependencies (+26 more)

### Community 7 - "mock.ts"
Cohesion: 0.06
Nodes (33): addInvite(), alleFaelle(), alleZugaenge(), DEMO_ANGELEGT, demoFaelle(), demoZugaenge(), ereignisEintragen(), fallVon() (+25 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (31): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+23 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (27): mvp, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+19 more)

### Community 10 - "Sections.tsx"
Cohesion: 0.09
Nodes (14): Faq(), items, IconBrief(), IconKurve(), IconPhone(), Marquee(), roles, Audiences (+6 more)

### Community 11 - "(intern)/fall/[id]/actions.ts"
Cohesion: 0.09
Nodes (61): angabenErgaenzenAction(), BestaetigenErgebnis, LAENGE, terminBestaetigenAction(), BestattungsartFeld(), AufgabeEingabe, aufgabeEntfernenAction(), aufgabeHinzufuegenAction() (+53 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 13 - "0004_hardening.sql"
Cohesion: 0.12
Nodes (16): app.audit_log_append_only(), app.case_for_role(), app.handle_new_user(), app.log(), audit_log_append_only, on_auth_user_created, public.audit_log, public.cases (+8 more)

### Community 14 - "Termine.tsx"
Cohesion: 0.10
Nodes (26): TerminKarte(), ZugangTermine(), TerminEingabe, Entwurf, entwurfAus(), LEER, ROLLEN, TERMIN_ARTEN (+18 more)

### Community 15 - "HubDiagram.tsx"
Cohesion: 0.13
Nodes (16): AccessTeaser(), Hero(), curves, endpoints, HubDiagram(), Node, nodes, IconBestatter() (+8 more)

### Community 16 - "preise/page.tsx"
Cohesion: 0.18
Nodes (9): cta, metadata, pricing, AudienceFooter(), AudienceNav(), defaultPlans, Pricing(), PricingPlan (+1 more)

### Community 17 - "sicherheit/page.tsx"
Cohesion: 0.14
Nodes (12): blocks, metadata, metadata, steps, umstieg, metadata, Footer(), Header() (+4 more)

### Community 18 - "BestatterWorkspace.tsx"
Cohesion: 0.12
Nodes (12): metadata, BestatterWorkspace(), Case, Col, cols, Contact, contactMeta, Doc (+4 more)

### Community 19 - "DemoFlow.tsx"
Cohesion: 0.18
Nodes (12): metadata, DemoFlow(), stepLabels, Card(), Field(), GhostBtn(), Pill(), PillTone (+4 more)

### Community 20 - "fuer-bestatter/page.tsx"
Cohesion: 0.17
Nodes (7): metadata, metadata, metadata, audienceMetadata(), AudiencePage(), bestatter, friedhoefe

### Community 21 - "audience/types.ts"
Cohesion: 0.12
Nodes (12): Artifact(), slots, FaqSection(), AccessRow, ArtifactSpec, BoardTask, FaqItem, HeroSpec (+4 more)

### Community 22 - "VerstorbenePerson.tsx"
Cohesion: 0.27
Nodes (8): ausDaten(), felderDerGruppe, Formular, text(), VerstorbenePerson(), zahl(), tierGruppenTitel, Tier

### Community 23 - "MementoOS — Arbeitsstand (durable project knowledge)"
Cohesion: 0.12
Nodes (15): Arbeitsweise, Architektur des MVP, BLOCKED — wartet auf den Eigentümer, nicht auf Technik, CONFIRMED — fertig und auf der echten Datenbank geprüft, Der öffentliche Vertrag, Drei Designsysteme, IN PROGRESS, MementoOS — Arbeitsstand (durable project knowledge) (+7 more)

### Community 24 - "verlauf.ts"
Cohesion: 0.25
Nodes (12): Verlauf(), wann(), zeitpunkt, TerminArt, akteure, akteurLabel(), aktionen, aktionLabel() (+4 more)

### Community 25 - "AudiencePage.tsx"
Cohesion: 0.23
Nodes (7): AudienceCta(), AudienceHero(), familien, QuoteSection(), StepsSection(), AudienceData, WarumSection()

### Community 26 - "MementoOS Landing — контекст проекта"
Cohesion: 0.25
Nodes (7): Git, graphify, MementoOS Landing — контекст проекта, Команды, Правила контента (нарушение = блокер на ревью), Структура, Три дизайн-системы (кратко)

### Community 27 - "(intern)/fall/[id]/page.tsx"
Cohesion: 0.20
Nodes (11): badgeKlasse, Einladungen(), Kopierstand, datumsformat, EinladungAnsicht, EinladungStatus, status(), zuAnsicht() (+3 more)

### Community 28 - "0002_rls.sql"
Cohesion: 0.22
Nodes (9): audit_log, cases, deceased, documents, invites, is_case_owner(), participants, profiles (+1 more)

### Community 30 - "0001_init.sql"
Cohesion: 0.44
Nodes (8): audit_log, cases, deceased, documents, invites, participants, profiles, tasks

### Community 31 - "ScenarioSection.tsx"
Cohesion: 0.22
Nodes (3): ScenarioSection(), BoardColumnSpec, ScenarioBlock

### Community 32 - "icons.tsx"
Cohesion: 0.10
Nodes (15): FeatureCards(), HeuteMorgen(), heuteSteps, morgenSteps, IconBehoerde(), IconCheck(), IconFloristik(), IconHandshake() (+7 more)

### Community 33 - "src/app/layout.tsx"
Cohesion: 0.29
Nodes (5): inter, metadata, mono, serif, Reveal()

### Community 34 - "Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`"
Cohesion: 0.06
Nodes (34): Fail-loud вместо тихого mock (`src/lib/env.ts`), Feature: Sicherheit im MVP (`mvp/`) — Rechtemodell, Sitzungen, Kopfzeilen, Middleware (`src/middleware.ts`), Open redirect через управляющие символы в `?next=`, service_role, Вход, Гигиена `search_path`, Два побочных исправления в схеме (+26 more)

### Community 38 - "vercel.json"
Cohesion: 0.33
Nodes (5): framework, installCommand, regions, $schema, fra1

### Community 39 - "isMockMode"
Cohesion: 0.18
Nodes (14): POST(), Art, ARTEN, GET(), istArt(), AnmeldeErgebnis, mitPasswortAnmelden(), LoginForm() (+6 more)

### Community 45 - "access.ts"
Cohesion: 0.14
Nodes (19): Felder(), Gruppe(), Dashboard(), allowedTiers(), aufzaehlung(), caseForRole(), darfBestaetigen(), deceasedForRole() (+11 more)

### Community 49 - "MementoOS — MVP"
Cohesion: 0.10
Nodes (19): 1. Projekt anlegen, 2. Schema einspielen, 3. Umgebungsvariablen, Aufbau, Build & Verifikation, Demo-Ablauf (die eine Sache, die es zu zeigen gilt), Deployment, Der Token steht nicht in der Adresszeile (+11 more)

### Community 59 - "Feature: Zielgruppen-Seiten & Preise (/fuer-*, /preise)"
Cohesion: 0.15
Nodes (12): Feature: Zielgruppen-Seiten & Preise (/fuer-*, /preise), Hero-артефакты — `ArtifactSpec`, Role-router и связки, Архитектура data-driven шаблона, Зачем, Известные ограничения / открытые вопросы, Как проверить, Общий Pricing — `src/components/pricing/` (+4 more)

### Community 60 - "Что добавлено"
Cohesion: 0.15
Nodes (12): 1. Блок HeuteMorgen на главной — `src/components/HeuteMorgen.tsx`, 2. Страница `/so-funktioniert-es` — `src/app/so-funktioniert-es/page.tsx`, 3. Страница `/sicherheit` — `src/app/sicherheit/page.tsx`, 4. Страница `/ueber-uns` — `src/app/ueber-uns/page.tsx`, 5. Три новых FAQ — `src/components/Faq.tsx`, 6. Навигация и связки, Feature: Vertrauen & Ablauf (Фазы 3–5, система Monad), Зачем (+4 more)

### Community 61 - "isSessionId"
Cohesion: 0.26
Nodes (10): zugangBeendenAction(), GET(), GET(), Auslieferung, unterlageFuerHaus(), unterlageFuerSitzung(), ausliefern(), contentDisposition() (+2 more)

### Community 62 - "Конвейер"
Cohesion: 0.17
Nodes (11): 0. Приём задачи, 1. План — агент architect, 2. Реализация — агент(ы) implementer, 3. Ревью — агент reviewer, затем /code-review, 4. Верификация, 5. Документация — агент doc-writer, 6. Сдача, 7. Итоговый отчёт пользователю (+3 more)

### Community 63 - "Feature: Datenmodell & Zugriff (/datenmodell)"
Cohesion: 0.18
Nodes (10): Feature: Datenmodell & Zugriff (/datenmodell), Данные — `src/components/datamodel/data.ts`, Зачем, Известные ограничения / открытые вопросы, Иконки — `src/components/icons.tsx`, Как проверить, Как устроена схема, Компоненты — `src/components/datamodel/` (+2 more)

### Community 64 - "MementoOS — где мы сейчас"
Cohesion: 0.20
Nodes (9): 1. Что вообще есть в репозитории, 2. Модель данных, 3. Кто какие поля видит, 4. Как участник попадает в дело, 5. Два периметра и что их стережёт, 6. История миграций — включая два бага, найденных на боевой базе, 7. Что готово, что нет, 8. Админка платформы — что предлагаю строить (+1 more)

### Community 65 - "isMock"
Cohesion: 0.20
Nodes (4): metadata, metadata, metadata, isMock

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
Cohesion: 0.52
Nodes (5): ab(), GET(), istForm(), redeemInvite(), zugangCookie()

## Knowledge Gaps
- **383 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+378 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRuntimeMode()` connect `lib/data.ts` to `admin.ts`, `env.ts`, `isSessionId`, `[token]/route.ts`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `Role` connect `Unterlagen.tsx` to `admin.ts`, `lib/types.ts`, `lib/data.ts`, `mock.ts`, `(intern)/fall/[id]/actions.ts`, `access.ts`, `Termine.tsx`, `verlauf.ts`, `(intern)/fall/[id]/page.tsx`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `isMockMode()` connect `isMockMode` to `env.ts`, `lib/data.ts`, `[token]/route.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _383 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08439897698209718 - nodes in this community are weakly interconnected._
- **Should `env.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._
- **Should `Unterlagen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13227513227513227 - nodes in this community are weakly interconnected._