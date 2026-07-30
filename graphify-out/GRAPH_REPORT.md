# Graph Report - mementos-landing  (2026-07-30)

## Corpus Check
- 176 files · ~113,596 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1167 nodes · 2287 edges · 85 communities (69 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f5f5b595`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lib/types.ts
- site.ts
- FeatureCards.tsx
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
- ZugangTermine.tsx
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
- 0016_quelle_je_angabe.sql
- 0002_rls.sql
- 0008_plattform_uebersicht.sql
- 0001_init.sql
- fuer-zulieferer/page.tsx
- Einladungen.tsx
- src/app/layout.tsx
- Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`
- .claude/CLAUDE.md
- 0011_termine.sql
- vercel.json
- safeNext
- isSessionId
- (intern)/fall/[id]/page.tsx
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
- env.ts
- Markenzeichen
- ScenarioSection.tsx
- middleware.ts
- (intern)/page.tsx
- zugang/actions.ts
- fuer-krematorien/page.tsx
- unterlagen-actions.ts
- neu/actions.ts
- Nächste Sitzung — Übergabe
- fuer-friedhoefe/page.tsx

## God Nodes (most connected - your core abstractions)
1. `getRuntimeMode()` - 39 edges
2. `meldung()` - 25 edges
3. `pruefe()` - 24 edges
4. `kennung()` - 21 edges
5. `dbFehler()` - 19 edges
6. `compilerOptions` - 16 edges
7. `compilerOptions` - 16 edges
8. `useSpeicherstand()` - 15 edges
9. `MementoOS — Arbeitsstand (durable project knowledge)` - 15 edges
10. `Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`` - 15 edges

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

## Communities (85 total, 16 thin omitted)

### Community 0 - "lib/types.ts"
Cohesion: 0.07
Nodes (70): EreignisseSeite(), AdminErgebnis, ausfuehren(), sitzungBeendenAction(), zugangZurueckziehenAction(), FallSeite(), badgeKlasse, Zugaenge() (+62 more)

### Community 1 - "site.ts"
Cohesion: 0.27
Nodes (8): robots(), Eintrag, SEITEN, sitemap(), STAND, absolut(), seite(), SeitenPfad

### Community 2 - "FeatureCards.tsx"
Cohesion: 0.15
Nodes (6): FeatureCards(), HeuteMorgen(), heuteSteps, morgenSteps, IconCheck(), IconSarg()

### Community 3 - "zugang/page.tsx"
Cohesion: 0.20
Nodes (10): AngabenBogen(), DATUMSFELDER, PLATZHALTER, ZugangPage(), ZugangBeenden(), ZugangTermine(), feldLabel, Deceased (+2 more)

### Community 4 - "datenmodell/page.tsx"
Cohesion: 0.10
Nodes (23): metadata, roleOrder, DocRow, documents, entities, Entity, Field, Group (+15 more)

### Community 5 - "lib/data.ts"
Cohesion: 0.14
Nodes (38): FallPage(), addParticipant(), addTask(), addTermin(), addUnterlage(), alsErgebnis(), angabenErgaenzen(), createCase() (+30 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, next, react, react-dom, server-only, @supabase/ssr, @supabase/supabase-js, devDependencies (+26 more)

### Community 7 - "mock.ts"
Cohesion: 0.06
Nodes (38): addInvite(), alleFaelle(), alleZugaenge(), DEMO_ANGELEGT, demoFaelle(), demoZugaenge(), ereignisEintragen(), fallVon() (+30 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (31): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+23 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (27): mvp, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+19 more)

### Community 10 - "Sections.tsx"
Cohesion: 0.08
Nodes (17): AccessTeaser(), Faq(), items, Hero(), HubDiagram(), IconBrief(), IconKurve(), IconPhone() (+9 more)

### Community 11 - "(intern)/fall/[id]/actions.ts"
Cohesion: 0.14
Nodes (22): AufgabeEingabe, einladungErzeugenAction(), ErzeugenErgebnis, patchDerGruppe(), PHASEN, ROLLEN, terminFelder(), TIERS (+14 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 13 - "0004_hardening.sql"
Cohesion: 0.12
Nodes (16): app.audit_log_append_only(), app.case_for_role(), app.handle_new_user(), app.log(), audit_log_append_only, on_auth_user_created, public.audit_log, public.cases (+8 more)

### Community 14 - "ZugangTermine.tsx"
Cohesion: 0.20
Nodes (14): TerminKarte(), entwurfAus(), terminStatusLabel, abstandMinuten(), ausWanduhr(), gleicherTag(), istWanduhr(), kartenLink() (+6 more)

### Community 15 - "icons.tsx"
Cohesion: 0.13
Nodes (23): tierKey, tierRow, curves, endpoints, Node, nodes, IconBehoerde(), IconBestatter() (+15 more)

### Community 16 - "preise/page.tsx"
Cohesion: 0.23
Nodes (7): cta, metadata, pricing, defaultPlans, Pricing(), PricingPlan, PricingSpec

### Community 17 - "sicherheit/page.tsx"
Cohesion: 0.14
Nodes (13): blocks, metadata, metadata, steps, umstieg, metadata, Footer(), Header() (+5 more)

### Community 18 - "BestatterWorkspace.tsx"
Cohesion: 0.11
Nodes (13): metadata, IconKerze(), BestatterWorkspace(), Case, Col, cols, Contact, contactMeta (+5 more)

### Community 19 - "DemoFlow.tsx"
Cohesion: 0.17
Nodes (12): metadata, DemoFlow(), stepLabels, Card(), Field(), GhostBtn(), Pill(), PillTone (+4 more)

### Community 20 - "audienceMetadata"
Cohesion: 0.16
Nodes (8): metadata, metadata, metadata, audienceMetadata(), AudiencePage(), bestatter, verbuende, faqSchema()

### Community 21 - "audience/types.ts"
Cohesion: 0.12
Nodes (12): Artifact(), AudienceHero(), slots, AccessRow, ArtifactSpec, BoardTask, FaqItem, HeroSpec (+4 more)

### Community 22 - "VerstorbenePerson.tsx"
Cohesion: 0.24
Nodes (9): Stand, ausDaten(), felderDerGruppe, Formular, text(), VerstorbenePerson(), zahl(), tierGruppenTitel (+1 more)

### Community 23 - "MementoOS — Arbeitsstand (durable project knowledge)"
Cohesion: 0.12
Nodes (15): Arbeitsweise, Architektur des MVP, BLOCKED — wartet auf den Eigentümer, nicht auf Technik, CONFIRMED — fertig und auf der echten Datenbank geprüft, Der öffentliche Vertrag, Drei Designsysteme, IN PROGRESS, MementoOS — Arbeitsstand (durable project knowledge) (+7 more)

### Community 24 - "verlauf.ts"
Cohesion: 0.23
Nodes (13): Verlauf(), wann(), zeitpunkt, terminArtLabel, TerminArt, akteure, akteurLabel(), aktionen (+5 more)

### Community 25 - "AudiencePage.tsx"
Cohesion: 0.19
Nodes (9): AudienceCta(), AudienceFooter(), AudienceNav(), familien, FaqSection(), QuoteSection(), StepsSection(), AudienceData (+1 more)

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

### Community 32 - "Einladungen.tsx"
Cohesion: 0.23
Nodes (10): einladungZurueckziehenAction(), badgeKlasse, Kopierstand, datumsformat, EinladungAnsicht, EinladungStatus, status(), zuAnsicht() (+2 more)

### Community 33 - "src/app/layout.tsx"
Cohesion: 0.24
Nodes (8): inter, metadata, mono, RootLayout(), serif, Reveal(), Schema(), softwareSchema()

### Community 34 - "Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`"
Cohesion: 0.05
Nodes (36): Fail-loud вместо тихого mock (`src/lib/env.ts`), Feature: Sicherheit im MVP (`mvp/`) — Rechtemodell, Sitzungen, Kopfzeilen, Middleware (`src/middleware.ts`), Open redirect через управляющие символы в `?next=`, service_role, Вход, Гигиена `search_path`, Два побочных исправления в схеме (+28 more)

### Community 38 - "vercel.json"
Cohesion: 0.33
Nodes (5): framework, installCommand, regions, $schema, fra1

### Community 39 - "safeNext"
Cohesion: 0.18
Nodes (12): AnmeldeErgebnis, mitPasswortAnmelden(), LoginForm(), Zustand, LoginPage(), PasswortForm(), anon, publicSupabaseUrl (+4 more)

### Community 41 - "isSessionId"
Cohesion: 0.24
Nodes (10): zugangBeendenAction(), GET(), GET(), Auslieferung, unterlageFuerHaus(), unterlageFuerSitzung(), ausliefern(), contentDisposition() (+2 more)

### Community 42 - "(intern)/fall/[id]/page.tsx"
Cohesion: 0.12
Nodes (23): Ergebnis, Aufgaben(), ROLLEN, Beteiligte(), ROLLEN, Einladungen(), EntfernenKnopf(), korrekturEntscheidenAction() (+15 more)

### Community 43 - "(admin)/layout.tsx"
Cohesion: 0.24
Nodes (5): metadata, metadata, metadata, Wordmark(), isMock

### Community 45 - "access.ts"
Cohesion: 0.16
Nodes (19): Felder(), Gruppe(), allowedTiers(), aufzaehlung(), caseForRole(), darfBestaetigen(), deceasedForRole(), empfaengerSatz() (+11 more)

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
Cohesion: 0.18
Nodes (9): TerminEingabe, Entwurf, LEER, ROLLEN, TERMIN_ARTEN, TERMIN_STATUS, terminArtHinweis, Termin (+1 more)

### Community 66 - "Компоненты демо-потока (/demo)"
Cohesion: 0.25
Nodes (7): Field, Pill — статусная метка, PrimaryBtn / GhostBtn, Stepper — шаги демо, Компоненты демо-потока (/demo), Переход шагов, Правило данных

### Community 67 - "MementoOS — Landing"
Cohesion: 0.25
Nodes (7): MementoOS — Landing, MVP (`mvp/`), Деплой, Запуск, Команда агентов, Правила контента, Структура

### Community 68 - "Канон дизайн-систем MementoOS"
Cohesion: 0.29
Nodes (6): 1. Monad — лендинг `/`, `/demo` и Monad-подстраницы, 2. Steep — страницы аудиторий `/fuer-*`, 3. Default — CRM `/workspace`, Зона Datenmodell (/datenmodell) — внутри Monad, Канон дизайн-систем MementoOS, Общие законы (все системы)

### Community 69 - "env.ts"
Cohesion: 0.17
Nodes (15): POST(), Art, ARTEN, GET(), istArt(), ab(), GET(), istForm() (+7 more)

### Community 70 - "Markenzeichen"
Cohesion: 0.50
Nodes (3): Entschieden: die Datei gewinnt, Markenzeichen, Wo das Zeichen benutzt wird

### Community 75 - "ScenarioSection.tsx"
Cohesion: 0.22
Nodes (3): ScenarioSection(), BoardColumnSpec, ScenarioBlock

### Community 77 - "middleware.ts"
Cohesion: 0.21
Nodes (13): nextConfig, assertRuntimeConfig(), supabasePublicConfig(), applySecurityHeaders(), contentSecurityPolicy(), HeaderOptions, isVertraulich(), staticSecurityHeaders (+5 more)

### Community 79 - "zugang/actions.ts"
Cohesion: 0.25
Nodes (23): angabenErgaenzenAction(), BestaetigenErgebnis, LAENGE, terminBestaetigenAction(), aufgabeEntfernenAction(), aufgabeHinzufuegenAction(), aufgabeUmschaltenAction(), beteiligtenBeitrittAction() (+15 more)

### Community 81 - "unterlagen-actions.ts"
Cohesion: 0.29
Nodes (11): Ergebnis, ERLAUBT, ROLLEN, unterlageEntfernenAction(), unterlageGepruefetAction(), unterlageHochladenAction(), groesseLesbar(), Hochladen() (+3 more)

### Community 82 - "neu/actions.ts"
Cohesion: 0.22
Nodes (6): BestattungsartFeld(), AnlegenEingabe, AnlegenErgebnis, NeuerVorgang(), BESTATTUNGSARTEN, GRENZEN

### Community 83 - "Nächste Sitzung — Übergabe"
Cohesion: 0.25
Nodes (7): Arbeitsregeln, die nicht verhandelbar sind, Danach, in dieser Reihenfolge, Der nächste Schritt: `0017`, Nächste Sitzung — Übergabe, Vor jeder Arbeit lesen, Wo der Stand steht, Zuerst den Wissensgraphen benutzen

## Knowledge Gaps
- **397 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+392 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRuntimeMode()` connect `lib/data.ts` to `lib/types.ts`, `env.ts`, `isSessionId`, `middleware.ts`, `(intern)/page.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `seite()` connect `site.ts` to `src/app/layout.tsx`, `datenmodell/page.tsx`, `preise/page.tsx`, `sicherheit/page.tsx`, `BestatterWorkspace.tsx`, `DemoFlow.tsx`, `audienceMetadata`, `AudiencePage.tsx`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `Role` connect `unterlagen-actions.ts` to `Einladungen.tsx`, `Termine.tsx`, `lib/types.ts`, `lib/data.ts`, `mock.ts`, `(intern)/fall/[id]/page.tsx`, `(intern)/fall/[id]/actions.ts`, `access.ts`, `verlauf.ts`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _397 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lib/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06582427270055834 - nodes in this community are weakly interconnected._
- **Should `datenmodell/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0962566844919786 - nodes in this community are weakly interconnected._
- **Should `lib/data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14358974358974358 - nodes in this community are weakly interconnected._