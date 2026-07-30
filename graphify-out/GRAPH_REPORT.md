# Graph Report - mementos-landing  (2026-07-30)

## Corpus Check
- 169 files · ~98,027 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1122 nodes · 2194 edges · 81 communities (64 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da8f63ec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin/ui.tsx
- middleware.ts
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
- icons.tsx
- preise/page.tsx
- site.ts
- BestatterWorkspace.tsx
- DemoFlow.tsx
- audienceMetadata
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
- Artifacts.tsx
- FeatureCards.tsx
- src/app/layout.tsx
- Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`
- .claude/CLAUDE.md
- 0011_termine.sql
- vercel.json
- env.ts
- fuer-krematorien/page.tsx
- admin.ts
- zugang-view.ts
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
- (admin)/layout.tsx
- Компоненты демо-потока (/demo)
- MementoOS — Landing
- Канон дизайн-систем MementoOS
- [token]/route.ts
- Markenzeichen
- mock
- IconCheck
- fuer-familien/page.tsx
- fuer-friedhoefe/page.tsx
- fuer-verbuende/page.tsx
- (intern)/page.tsx

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
- `Felder()` --calls--> `terminSichtbarFuerText()`  [EXTRACTED]
  mvp/src/app/(intern)/fall/[id]/Termine.tsx → mvp/src/lib/access.ts
- `Gruppe()` --calls--> `sichtbarFuerText()`  [EXTRACTED]
  mvp/src/app/(intern)/fall/[id]/VerstorbenePerson.tsx → mvp/src/lib/access.ts
- `zugangZurueckziehenAction()` --indirect_call--> `adminZugangZurueckziehen()`  [INFERRED]
  mvp/src/app/(admin)/admin/fall/[id]/actions.ts → mvp/src/lib/admin.ts
- `sitzungBeendenAction()` --indirect_call--> `adminSitzungBeenden()`  [INFERRED]
  mvp/src/app/(admin)/admin/fall/[id]/actions.ts → mvp/src/lib/admin.ts
- `FallSeite()` --calls--> `datum()`  [EXTRACTED]
  mvp/src/app/(admin)/admin/fall/[id]/page.tsx → mvp/src/app/(admin)/admin/format.ts

## Import Cycles
- None detected.

## Communities (81 total, 17 thin omitted)

### Community 0 - "admin/ui.tsx"
Cohesion: 0.18
Nodes (24): EreignisseSeite(), datum(), fDatum, fZahl, fZeitpunkt, zahl(), HausSeite(), laden() (+16 more)

### Community 1 - "middleware.ts"
Cohesion: 0.18
Nodes (15): nextConfig, assertRuntimeConfig(), serverSecrets(), supabasePublicConfig(), applySecurityHeaders(), contentSecurityPolicy(), HeaderOptions, isVertraulich() (+7 more)

### Community 2 - "Unterlagen.tsx"
Cohesion: 0.13
Nodes (22): Aufgaben(), ROLLEN, Beteiligte(), ROLLEN, EntfernenKnopf(), Speicherstand(), STILL, useSpeicherstand() (+14 more)

### Community 3 - "lib/types.ts"
Cohesion: 0.17
Nodes (13): AngabenBogen(), DATUMSFELDER, PLATZHALTER, feldLabel, Case, ContactStatus, Deceased, Event (+5 more)

### Community 4 - "datamodel/ui.tsx"
Cohesion: 0.09
Nodes (30): metadata, roleOrder, DocRow, documents, entities, Entity, Field, Group (+22 more)

### Community 5 - "lib/data.ts"
Cohesion: 0.15
Nodes (36): ZugangPage(), FallPage(), addParticipant(), addTask(), addTermin(), addUnterlage(), angabenErgaenzen(), createCase() (+28 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, next, react, react-dom, server-only, @supabase/ssr, @supabase/supabase-js, devDependencies (+26 more)

### Community 7 - "mock.ts"
Cohesion: 0.06
Nodes (32): addInvite(), alleFaelle(), alleZugaenge(), DEMO_ANGELEGT, demoFaelle(), demoZugaenge(), ereignisEintragen(), fallVon() (+24 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (31): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+23 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (27): mvp, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+19 more)

### Community 10 - "Sections.tsx"
Cohesion: 0.10
Nodes (13): Faq(), items, IconBrief(), IconKurve(), Marquee(), roles, Audiences, bandItems (+5 more)

### Community 11 - "(intern)/fall/[id]/actions.ts"
Cohesion: 0.09
Nodes (62): angabenErgaenzenAction(), BestaetigenErgebnis, LAENGE, terminBestaetigenAction(), BestattungsartFeld(), AufgabeEingabe, aufgabeEntfernenAction(), aufgabeHinzufuegenAction() (+54 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 13 - "0004_hardening.sql"
Cohesion: 0.12
Nodes (16): app.audit_log_append_only(), app.case_for_role(), app.handle_new_user(), app.log(), audit_log_append_only, on_auth_user_created, public.audit_log, public.cases (+8 more)

### Community 14 - "Termine.tsx"
Cohesion: 0.10
Nodes (26): TerminKarte(), ZugangTermine(), Entwurf, entwurfAus(), Felder(), LEER, ROLLEN, Termine() (+18 more)

### Community 15 - "icons.tsx"
Cohesion: 0.14
Nodes (17): AccessTeaser(), curves, endpoints, Node, nodes, IconBestatter(), IconDokument(), IconFamilie() (+9 more)

### Community 16 - "preise/page.tsx"
Cohesion: 0.20
Nodes (8): cta, metadata, pricing, AudienceCta(), defaultPlans, Pricing(), PricingPlan, PricingSpec

### Community 17 - "site.ts"
Cohesion: 0.10
Nodes (20): robots(), blocks, metadata, Eintrag, SEITEN, sitemap(), STAND, metadata (+12 more)

### Community 18 - "BestatterWorkspace.tsx"
Cohesion: 0.12
Nodes (12): IconKerze(), BestatterWorkspace(), Case, Col, cols, Contact, contactMeta, Doc (+4 more)

### Community 19 - "DemoFlow.tsx"
Cohesion: 0.14
Nodes (15): metadata, AudienceFooter(), AudienceNav(), DemoFlow(), stepLabels, Card(), Field(), GhostBtn() (+7 more)

### Community 20 - "audienceMetadata"
Cohesion: 0.19
Nodes (7): metadata, metadata, audienceMetadata(), AudiencePage(), bestatter, zulieferer, faqSchema()

### Community 21 - "audience/types.ts"
Cohesion: 0.12
Nodes (11): FaqSection(), ScenarioSection(), AccessRow, BoardColumnSpec, BoardTask, FaqItem, LossStep, MitStep (+3 more)

### Community 22 - "VerstorbenePerson.tsx"
Cohesion: 0.21
Nodes (10): Stand, ausDaten(), felderDerGruppe, Formular, Gruppe(), text(), VerstorbenePerson(), zahl() (+2 more)

### Community 23 - "MementoOS — Arbeitsstand (durable project knowledge)"
Cohesion: 0.12
Nodes (15): Arbeitsweise, Architektur des MVP, BLOCKED — wartet auf den Eigentümer, nicht auf Technik, CONFIRMED — fertig und auf der echten Datenbank geprüft, Der öffentliche Vertrag, Drei Designsysteme, IN PROGRESS, MementoOS — Arbeitsstand (durable project knowledge) (+7 more)

### Community 24 - "verlauf.ts"
Cohesion: 0.25
Nodes (12): Verlauf(), wann(), zeitpunkt, TerminArt, akteure, akteurLabel(), aktionen, aktionLabel() (+4 more)

### Community 25 - "AudiencePage.tsx"
Cohesion: 0.39
Nodes (4): QuoteSection(), StepsSection(), AudienceData, WarumSection()

### Community 26 - "MementoOS Landing — контекст проекта"
Cohesion: 0.25
Nodes (7): Git, graphify, MementoOS Landing — контекст проекта, Команды, Правила контента (нарушение = блокер на ревью), Структура, Три дизайн-системы (кратко)

### Community 27 - "(intern)/fall/[id]/page.tsx"
Cohesion: 0.22
Nodes (10): badgeKlasse, Einladungen(), Kopierstand, datumsformat, EinladungAnsicht, EinladungStatus, status(), zuAnsicht() (+2 more)

### Community 28 - "0002_rls.sql"
Cohesion: 0.22
Nodes (9): audit_log, cases, deceased, documents, invites, is_case_owner(), participants, profiles (+1 more)

### Community 30 - "0001_init.sql"
Cohesion: 0.44
Nodes (8): audit_log, cases, deceased, documents, invites, participants, profiles, tasks

### Community 31 - "Artifacts.tsx"
Cohesion: 0.18
Nodes (5): Artifact(), AudienceHero(), slots, ArtifactSpec, HeroSpec

### Community 32 - "FeatureCards.tsx"
Cohesion: 0.22
Nodes (3): FeatureCards(), IconFloristik(), IconSarg()

### Community 33 - "src/app/layout.tsx"
Cohesion: 0.24
Nodes (8): inter, metadata, mono, RootLayout(), serif, Reveal(), Schema(), softwareSchema()

### Community 34 - "Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`"
Cohesion: 0.06
Nodes (34): Fail-loud вместо тихого mock (`src/lib/env.ts`), Feature: Sicherheit im MVP (`mvp/`) — Rechtemodell, Sitzungen, Kopfzeilen, Middleware (`src/middleware.ts`), Open redirect через управляющие символы в `?next=`, service_role, Вход, Гигиена `search_path`, Два побочных исправления в схеме (+26 more)

### Community 38 - "vercel.json"
Cohesion: 0.33
Nodes (5): framework, installCommand, regions, $schema, fra1

### Community 39 - "env.ts"
Cohesion: 0.12
Nodes (20): POST(), Art, ARTEN, GET(), istArt(), AnmeldeErgebnis, mitPasswortAnmelden(), LoginForm() (+12 more)

### Community 42 - "admin.ts"
Cohesion: 0.16
Nodes (22): adminFallKontext(), adminZugaenge(), dbFehler(), detailText(), phase(), PHASEN, Roh, rpc() (+14 more)

### Community 43 - "zugang-view.ts"
Cohesion: 0.22
Nodes (10): FallSeite(), badgeKlasse, Zugaenge(), SitzungAnsicht, status(), zuAnsicht(), ZugangAnsicht, ZugangStatus (+2 more)

### Community 45 - "access.ts"
Cohesion: 0.24
Nodes (13): allowedTiers(), aufzaehlung(), caseForRole(), darfBestaetigen(), deceasedForRole(), felderSchreibbar(), nachBeginn(), rollenMitTier() (+5 more)

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
Cohesion: 0.20
Nodes (11): zugangBeendenAction(), GET(), ZugangBeenden(), GET(), Auslieferung, unterlageFuerHaus(), unterlageFuerSitzung(), ausliefern() (+3 more)

### Community 62 - "Конвейер"
Cohesion: 0.17
Nodes (11): 0. Приём задачи, 1. План — агент architect, 2. Реализация — агент(ы) implementer, 3. Ревью — агент reviewer, затем /code-review, 4. Верификация, 5. Документация — агент doc-writer, 6. Сдача, 7. Итоговый отчёт пользователю (+3 more)

### Community 63 - "Feature: Datenmodell & Zugriff (/datenmodell)"
Cohesion: 0.18
Nodes (10): Feature: Datenmodell & Zugriff (/datenmodell), Данные — `src/components/datamodel/data.ts`, Зачем, Известные ограничения / открытые вопросы, Иконки — `src/components/icons.tsx`, Как проверить, Как устроена схема, Компоненты — `src/components/datamodel/` (+2 more)

### Community 64 - "MementoOS — где мы сейчас"
Cohesion: 0.20
Nodes (9): 1. Что вообще есть в репозитории, 2. Модель данных, 3. Кто какие поля видит, 4. Как участник попадает в дело, 5. Два периметра и что их стережёт, 6. История миграций — включая два бага, найденных на боевой базе, 7. Что готово, что нет, 8. Админка платформы — что предлагаю строить (+1 more)

### Community 65 - "(admin)/layout.tsx"
Cohesion: 0.24
Nodes (5): metadata, metadata, metadata, Logo(), isMock

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
Nodes (3): Markenzeichen, Offen: zwei verschiedene Wortmarken, Wo das Zeichen benutzt wird

### Community 75 - "mock"
Cohesion: 0.39
Nodes (8): AdminErgebnis, ausfuehren(), sitzungBeendenAction(), zugangZurueckziehenAction(), adminSitzungBeenden(), adminZugangZurueckziehen(), istKeineBetreuung(), mock()

### Community 76 - "IconCheck"
Cohesion: 0.25
Nodes (6): Hero(), HeuteMorgen(), heuteSteps, morgenSteps, HubDiagram(), IconCheck()

## Knowledge Gaps
- **388 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+383 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRuntimeMode()` connect `lib/data.ts` to `middleware.ts`, `[token]/route.ts`, `env.ts`, `admin.ts`, `mock`, `(intern)/page.tsx`, `isSessionId`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `Role` connect `Unterlagen.tsx` to `lib/types.ts`, `lib/data.ts`, `mock.ts`, `admin.ts`, `(intern)/fall/[id]/actions.ts`, `access.ts`, `Termine.tsx`, `verlauf.ts`, `(intern)/fall/[id]/page.tsx`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `seite()` connect `site.ts` to `src/app/layout.tsx`, `datamodel/ui.tsx`, `preise/page.tsx`, `DemoFlow.tsx`, `audienceMetadata`, `AudiencePage.tsx`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _388 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Unterlagen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13227513227513227 - nodes in this community are weakly interconnected._
- **Should `datamodel/ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08710801393728224 - nodes in this community are weakly interconnected._
- **Should `lib/data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14935988620199148 - nodes in this community are weakly interconnected._