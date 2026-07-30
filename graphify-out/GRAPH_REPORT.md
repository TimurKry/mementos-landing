# Graph Report - mementos-landing  (2026-07-30)

## Corpus Check
- 172 files · ~105,714 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1135 nodes · 2213 edges · 81 communities (65 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d8224de9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin.ts
- site.ts
- Unterlagen.tsx
- zugang/page.tsx
- datenmodell/page.tsx
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
- sicherheit/page.tsx
- BestatterWorkspace.tsx
- DemoFlow.tsx
- audienceMetadata
- audience/types.ts
- VerstorbenePerson.tsx
- MementoOS — Arbeitsstand (durable project knowledge)
- verlauf.ts
- AudiencePage.tsx
- MementoOS Landing — контекст проекта
- Einladungen.tsx
- 0002_rls.sql
- 0008_plattform_uebersicht.sql
- 0001_init.sql
- safeNext
- (intern)/fall/[id]/page.tsx
- src/app/layout.tsx
- Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`
- .claude/CLAUDE.md
- 0011_termine.sql
- vercel.json
- middleware.ts
- env.ts
- lib/types.ts
- isSessionId
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
- (admin)/layout.tsx
- Компоненты демо-потока (/demo)
- MementoOS — Landing
- Канон дизайн-систем MementoOS
- public-env.ts
- Markenzeichen
- ScenarioSection.tsx
- fuer-familien/page.tsx
- fuer-friedhoefe/page.tsx
- fuer-verbuende/page.tsx
- fuer-krematorien/page.tsx

## God Nodes (most connected - your core abstractions)
1. `getRuntimeMode()` - 37 edges
2. `meldung()` - 23 edges
3. `pruefe()` - 22 edges
4. `dbFehler()` - 19 edges
5. `kennung()` - 19 edges
6. `compilerOptions` - 16 edges
7. `compilerOptions` - 16 edges
8. `MementoOS — Arbeitsstand (durable project knowledge)` - 15 edges
9. `Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`` - 14 edges
10. `schreibe()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `ZugangPage()` --calls--> `getCaseBySession()`  [EXTRACTED]
  mvp/src/app/(extern)/zugang/page.tsx → mvp/src/lib/data.ts
- `zugangZurueckziehenAction()` --indirect_call--> `adminZugangZurueckziehen()`  [INFERRED]
  mvp/src/app/(admin)/admin/fall/[id]/actions.ts → mvp/src/lib/admin.ts
- `sitzungBeendenAction()` --indirect_call--> `adminSitzungBeenden()`  [INFERRED]
  mvp/src/app/(admin)/admin/fall/[id]/actions.ts → mvp/src/lib/admin.ts
- `PlattformSeite()` --indirect_call--> `adminHaeuser()`  [INFERRED]
  mvp/src/app/(admin)/admin/page.tsx → mvp/src/lib/admin.ts
- `PlattformSeite()` --indirect_call--> `adminUebersicht()`  [INFERRED]
  mvp/src/app/(admin)/admin/page.tsx → mvp/src/lib/admin.ts

## Import Cycles
- None detected.

## Communities (81 total, 16 thin omitted)

### Community 0 - "admin.ts"
Cohesion: 0.08
Nodes (59): EreignisseSeite(), AdminErgebnis, ausfuehren(), sitzungBeendenAction(), zugangZurueckziehenAction(), FallSeite(), badgeKlasse, Zugaenge() (+51 more)

### Community 1 - "site.ts"
Cohesion: 0.19
Nodes (10): metadata, robots(), Eintrag, SEITEN, sitemap(), STAND, DemoFlow(), absolut() (+2 more)

### Community 2 - "Unterlagen.tsx"
Cohesion: 0.13
Nodes (21): Aufgaben(), ROLLEN, Beteiligte(), ROLLEN, EntfernenKnopf(), Speicherstand(), Stand, STILL (+13 more)

### Community 3 - "zugang/page.tsx"
Cohesion: 0.20
Nodes (10): zugangBeendenAction(), AngabenBogen(), DATUMSFELDER, PLATZHALTER, ZugangPage(), ZugangBeenden(), ZugangTermine(), feldLabel (+2 more)

### Community 4 - "datenmodell/page.tsx"
Cohesion: 0.10
Nodes (23): metadata, roleOrder, DocRow, documents, entities, Entity, Field, Group (+15 more)

### Community 5 - "lib/data.ts"
Cohesion: 0.17
Nodes (32): addParticipant(), addTask(), addTermin(), addUnterlage(), angabenErgaenzen(), createCase(), createInvite(), dbFehler() (+24 more)

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
Cohesion: 0.06
Nodes (23): AccessTeaser(), Faq(), items, FeatureCards(), Hero(), HeuteMorgen(), heuteSteps, morgenSteps (+15 more)

### Community 11 - "(intern)/fall/[id]/actions.ts"
Cohesion: 0.09
Nodes (60): angabenErgaenzenAction(), BestaetigenErgebnis, LAENGE, terminBestaetigenAction(), BestattungsartFeld(), AufgabeEingabe, aufgabeEntfernenAction(), aufgabeHinzufuegenAction() (+52 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 13 - "0004_hardening.sql"
Cohesion: 0.12
Nodes (16): app.audit_log_append_only(), app.case_for_role(), app.handle_new_user(), app.log(), audit_log_append_only, on_auth_user_created, public.audit_log, public.cases (+8 more)

### Community 14 - "Termine.tsx"
Cohesion: 0.10
Nodes (27): TerminKarte(), TerminEingabe, Entwurf, entwurfAus(), Felder(), LEER, ROLLEN, Termine() (+19 more)

### Community 15 - "icons.tsx"
Cohesion: 0.13
Nodes (23): tierKey, tierRow, curves, endpoints, Node, nodes, IconBehoerde(), IconBestatter() (+15 more)

### Community 16 - "preise/page.tsx"
Cohesion: 0.19
Nodes (9): cta, metadata, pricing, AudienceFooter(), AudienceNav(), defaultPlans, Pricing(), PricingPlan (+1 more)

### Community 17 - "sicherheit/page.tsx"
Cohesion: 0.14
Nodes (13): blocks, metadata, metadata, steps, umstieg, metadata, Footer(), Header() (+5 more)

### Community 18 - "BestatterWorkspace.tsx"
Cohesion: 0.11
Nodes (13): metadata, IconKerze(), BestatterWorkspace(), Case, Col, cols, Contact, contactMeta (+5 more)

### Community 19 - "DemoFlow.tsx"
Cohesion: 0.23
Nodes (10): stepLabels, Card(), Field(), GhostBtn(), Pill(), PillTone, pillTones, PrimaryBtn() (+2 more)

### Community 20 - "audienceMetadata"
Cohesion: 0.19
Nodes (7): metadata, metadata, audienceMetadata(), AudiencePage(), bestatter, zulieferer, faqSchema()

### Community 21 - "audience/types.ts"
Cohesion: 0.11
Nodes (13): Artifact(), AudienceHero(), slots, FaqSection(), AccessRow, ArtifactSpec, BoardTask, FaqItem (+5 more)

### Community 22 - "VerstorbenePerson.tsx"
Cohesion: 0.27
Nodes (8): ausDaten(), felderDerGruppe, Formular, text(), VerstorbenePerson(), zahl(), tierGruppenTitel, Tier

### Community 23 - "MementoOS — Arbeitsstand (durable project knowledge)"
Cohesion: 0.12
Nodes (15): Arbeitsweise, Architektur des MVP, BLOCKED — wartet auf den Eigentümer, nicht auf Technik, CONFIRMED — fertig und auf der echten Datenbank geprüft, Der öffentliche Vertrag, Drei Designsysteme, IN PROGRESS, MementoOS — Arbeitsstand (durable project knowledge) (+7 more)

### Community 24 - "verlauf.ts"
Cohesion: 0.27
Nodes (11): Verlauf(), wann(), zeitpunkt, TerminArt, akteure, akteurLabel(), aktionen, aktionLabel() (+3 more)

### Community 25 - "AudiencePage.tsx"
Cohesion: 0.33
Nodes (5): AudienceCta(), QuoteSection(), StepsSection(), AudienceData, WarumSection()

### Community 26 - "MementoOS Landing — контекст проекта"
Cohesion: 0.25
Nodes (7): Git, graphify, MementoOS Landing — контекст проекта, Команды, Правила контента (нарушение = блокер на ревью), Структура, Три дизайн-системы (кратко)

### Community 27 - "Einladungen.tsx"
Cohesion: 0.29
Nodes (6): badgeKlasse, Einladungen(), Kopierstand, EinladungAnsicht, EinladungStatus, roleLabel

### Community 28 - "0002_rls.sql"
Cohesion: 0.22
Nodes (9): audit_log, cases, deceased, documents, invites, is_case_owner(), participants, profiles (+1 more)

### Community 30 - "0001_init.sql"
Cohesion: 0.44
Nodes (8): audit_log, cases, deceased, documents, invites, participants, profiles, tasks

### Community 31 - "safeNext"
Cohesion: 0.26
Nodes (10): Art, ARTEN, GET(), istArt(), AnmeldeErgebnis, mitPasswortAnmelden(), LoginPage(), PasswortForm() (+2 more)

### Community 32 - "(intern)/fall/[id]/page.tsx"
Cohesion: 0.20
Nodes (11): datumsformat, status(), zuAnsicht(), FallPage(), Dashboard(), phaseLabel, getCase(), listCases() (+3 more)

### Community 33 - "src/app/layout.tsx"
Cohesion: 0.24
Nodes (8): inter, metadata, mono, RootLayout(), serif, Reveal(), Schema(), softwareSchema()

### Community 34 - "Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`"
Cohesion: 0.06
Nodes (35): Fail-loud вместо тихого mock (`src/lib/env.ts`), Feature: Sicherheit im MVP (`mvp/`) — Rechtemodell, Sitzungen, Kopfzeilen, Middleware (`src/middleware.ts`), Open redirect через управляющие символы в `?next=`, service_role, Вход, Гигиена `search_path`, Два побочных исправления в схеме (+27 more)

### Community 38 - "vercel.json"
Cohesion: 0.33
Nodes (5): framework, installCommand, regions, $schema, fra1

### Community 39 - "middleware.ts"
Cohesion: 0.21
Nodes (13): nextConfig, assertRuntimeConfig(), supabasePublicConfig(), applySecurityHeaders(), contentSecurityPolicy(), HeaderOptions, isVertraulich(), staticSecurityHeaders (+5 more)

### Community 41 - "env.ts"
Cohesion: 0.23
Nodes (11): POST(), ab(), GET(), istForm(), redeemInvite(), isBuildPhase(), isMockMode(), RuntimeMode (+3 more)

### Community 42 - "lib/types.ts"
Cohesion: 0.15
Nodes (12): AdminFall, AdminFallKontext, AdminHaus, AdminSitzung, AdminUebersicht, Case, ContactStatus, Event (+4 more)

### Community 43 - "isSessionId"
Cohesion: 0.27
Nodes (9): GET(), GET(), Auslieferung, unterlageFuerHaus(), unterlageFuerSitzung(), ausliefern(), contentDisposition(), KEIN_CACHE (+1 more)

### Community 45 - "access.ts"
Cohesion: 0.19
Nodes (16): Gruppe(), allowedTiers(), aufzaehlung(), caseForRole(), darfBestaetigen(), deceasedForRole(), empfaengerSatz(), felderSchreibbar() (+8 more)

### Community 49 - "MementoOS — MVP"
Cohesion: 0.10
Nodes (19): 1. Projekt anlegen, 2. Schema einspielen, 3. Umgebungsvariablen, Aufbau, Build & Verifikation, Demo-Ablauf (die eine Sache, die es zu zeigen gilt), Deployment, Der Token steht nicht in der Adresszeile (+11 more)

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

### Community 65 - "(admin)/layout.tsx"
Cohesion: 0.24
Nodes (5): metadata, metadata, metadata, Wordmark(), isMock

### Community 66 - "Компоненты демо-потока (/demo)"
Cohesion: 0.25
Nodes (7): Field, Pill — статусная метка, PrimaryBtn / GhostBtn, Stepper — шаги демо, Компоненты демо-потока (/demo), Переход шагов, Правило данных

### Community 67 - "MementoOS — Landing"
Cohesion: 0.25
Nodes (7): MementoOS — Landing, MVP (`mvp/`), Деплой, Запуск, Команда агентов, Правила контента, Структура

### Community 68 - "Канон дизайн-систем MementoOS"
Cohesion: 0.29
Nodes (6): 1. Monad — лендинг `/`, `/demo` и Monad-подстраницы, 2. Steep — страницы аудиторий `/fuer-*`, 3. Default — CRM `/workspace`, Зона Datenmodell (/datenmodell) — внутри Monad, Канон дизайн-систем MementoOS, Общие законы (все системы)

### Community 69 - "public-env.ts"
Cohesion: 0.28
Nodes (6): LoginForm(), Zustand, anon, publicSupabaseUrl, publishable, supabaseBrowser()

### Community 70 - "Markenzeichen"
Cohesion: 0.50
Nodes (3): Entschieden: die Datei gewinnt, Markenzeichen, Wo das Zeichen benutzt wird

### Community 75 - "ScenarioSection.tsx"
Cohesion: 0.22
Nodes (3): ScenarioSection(), BoardColumnSpec, ScenarioBlock

## Knowledge Gaps
- **389 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+384 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRuntimeMode()` connect `lib/data.ts` to `admin.ts`, `(intern)/fall/[id]/page.tsx`, `middleware.ts`, `env.ts`, `isSessionId`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `Role` connect `Unterlagen.tsx` to `admin.ts`, `lib/data.ts`, `mock.ts`, `lib/types.ts`, `(intern)/fall/[id]/actions.ts`, `access.ts`, `Termine.tsx`, `verlauf.ts`, `Einladungen.tsx`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `seite()` connect `site.ts` to `src/app/layout.tsx`, `datenmodell/page.tsx`, `preise/page.tsx`, `sicherheit/page.tsx`, `BestatterWorkspace.tsx`, `audienceMetadata`, `AudiencePage.tsx`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _389 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08128772635814889 - nodes in this community are weakly interconnected._
- **Should `Unterlagen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1339031339031339 - nodes in this community are weakly interconnected._
- **Should `datenmodell/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0962566844919786 - nodes in this community are weakly interconnected._