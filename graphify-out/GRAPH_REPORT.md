# Graph Report - mementos-landing  (2026-07-30)

## Corpus Check
- 178 files · ~121,528 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1261 nodes · 2495 edges · 84 communities (69 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1017dd8f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lib/types.ts
- 0004_hardening.sql
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
- cases
- zeit.ts
- HubDiagram.tsx
- Pricing.tsx
- so-funktioniert-es/page.tsx
- site.ts
- DemoFlow.tsx
- AudienceData
- Artifacts.tsx
- VerstorbenePerson.tsx
- MementoOS — Arbeitsstand (durable project knowledge)
- verlauf.ts
- AudiencePage.tsx
- MementoOS Landing — контекст проекта
- BestatterWorkspace.tsx
- 0008_plattform_uebersicht.sql
- Termine.tsx
- 0016_quelle_je_angabe.sql
- app.case_for_role
- Einladungen.tsx
- 0017_voraussetzungen.sql
- Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`
- .claude/CLAUDE.md
- 0011_termine.sql
- 0015_rechte_je_feld.sql
- vercel.json
- login/page.tsx
- public.admin_fall
- unterlage-antwort.ts
- public.unterlage_fuer_sitzung
- (admin)/layout.tsx
- ungueltig/page.tsx
- access.ts
- fuer-zulieferer/page.tsx
- mvp/src/app/layout.tsx
- MementoOS — MVP
- public.audit_log
- mvp/postcss.config.mjs
- next.config.ts
- postcss.config.mjs
- public.audit_log
- Feature: Zielgruppen-Seiten & Preise (/fuer-*, /preise)
- Что добавлено
- Конвейер
- Feature: Datenmodell & Zugriff (/datenmodell)
- MementoOS — где мы сейчас
- Voraussetzungen.tsx
- Компоненты демо-потока (/demo)
- MementoOS — Landing
- Канон дизайн-систем MementoOS
- zugang/actions.ts
- Markenzeichen
- audience/types.ts
- env.ts
- (intern)/fall/[id]/page.tsx
- public.cases
- fuer-krematorien/page.tsx
- public.documents
- Nächste Sitzung — Übergabe
- fuer-friedhoefe/page.tsx

## God Nodes (most connected - your core abstractions)
1. `getRuntimeMode()` - 43 edges
2. `meldung()` - 29 edges
3. `pruefe()` - 28 edges
4. `kennung()` - 25 edges
5. `dbFehler()` - 23 edges
6. `useSpeicherstand()` - 18 edges
7. `schreibe()` - 17 edges
8. `compilerOptions` - 16 edges
9. `compilerOptions` - 16 edges
10. `MementoOS — Arbeitsstand (durable project knowledge)` - 15 edges

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

## Communities (84 total, 15 thin omitted)

### Community 0 - "lib/types.ts"
Cohesion: 0.06
Nodes (74): dynamic, EreignisseSeite(), AdminErgebnis, ausfuehren(), sitzungBeendenAction(), zugangZurueckziehenAction(), dynamic, FallSeite() (+66 more)

### Community 1 - "0004_hardening.sql"
Cohesion: 0.07
Nodes (23): app.audit_log_append_only, app.handle_new_user, app.case_for_role(), app.deceased_for_role(), app.log(), audit_log_append_only, on_auth_user_created, public.end_session() (+15 more)

### Community 2 - "icons.tsx"
Cohesion: 0.11
Nodes (14): blocks, metadata, FeatureCards(), heuteSteps, morgenSteps, IconCheck(), IconDokument(), IconFloristik() (+6 more)

### Community 3 - "zugang/page.tsx"
Cohesion: 0.21
Nodes (10): AngabenBogen(), DATUMSFELDER, PLATZHALTER, dynamic, ZugangPage(), ZugangTermine(), feldLabel, Deceased (+2 more)

### Community 4 - "datamodel/ui.tsx"
Cohesion: 0.09
Nodes (30): metadata, roleOrder, DocRow, documents, entities, Entity, Field, Group (+22 more)

### Community 5 - "lib/data.ts"
Cohesion: 0.12
Nodes (46): FallPage(), addParticipant(), addTask(), addTermin(), addUnterlage(), addVoraussetzung(), alsErgebnis(), alsTerminErgebnis() (+38 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, next, react, react-dom, server-only, @supabase/ssr, @supabase/supabase-js, devDependencies (+26 more)

### Community 7 - "mock.ts"
Cohesion: 0.05
Nodes (41): addInvite(), alleFaelle(), alleZugaenge(), DEMO_ANGELEGT, DEMO_CASE_ID, DEMO_HAUS_ID, demoFaelle(), demoZugaenge() (+33 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (31): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+23 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (27): mvp, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+19 more)

### Community 10 - "Sections.tsx"
Cohesion: 0.09
Nodes (16): Faq(), items, Hero(), HeuteMorgen(), IconBrief(), IconKurve(), IconPhone(), Marquee() (+8 more)

### Community 11 - "(intern)/fall/[id]/actions.ts"
Cohesion: 0.06
Nodes (88): angabenErgaenzenAction(), terminBestaetigenAction(), BestattungsartFeld(), AufgabeEingabe, aufgabeEntfernenAction(), aufgabeHinzufuegenAction(), aufgabeUmschaltenAction(), beteiligtenBeitrittAction() (+80 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 13 - "cases"
Cohesion: 0.16
Nodes (16): auth, audit_log, cases, deceased, documents, invites, participants, profiles (+8 more)

### Community 14 - "zeit.ts"
Cohesion: 0.18
Nodes (15): TerminKarte(), entwurfAus(), terminStatusLabel, abstandMinuten(), ausWanduhr(), gleicherTag(), istWanduhr(), kartenLink() (+7 more)

### Community 15 - "HubDiagram.tsx"
Cohesion: 0.15
Nodes (14): AccessTeaser(), curves, endpoints, Node, nodes, IconBestatter(), IconFamilie(), IconFriedhof() (+6 more)

### Community 16 - "Pricing.tsx"
Cohesion: 0.43
Nodes (3): defaultPlans, PricingPlan, PricingSpec

### Community 17 - "so-funktioniert-es/page.tsx"
Cohesion: 0.17
Nodes (11): metadata, steps, umstieg, metadata, AudienceNav(), Footer(), Header(), links (+3 more)

### Community 18 - "site.ts"
Cohesion: 0.10
Nodes (22): inter, metadata, mono, RootLayout(), serif, dynamic, robots(), dynamic (+14 more)

### Community 19 - "DemoFlow.tsx"
Cohesion: 0.19
Nodes (11): metadata, DemoFlow(), stepLabels, Card(), Field(), GhostBtn(), Pill(), PillTone (+3 more)

### Community 20 - "AudienceData"
Cohesion: 0.15
Nodes (10): metadata, metadata, metadata, audienceMetadata(), AudiencePage(), bestatter, familien, verbuende (+2 more)

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
Cohesion: 0.17
Nodes (9): cta, metadata, pricing, AudienceCta(), AudienceFooter(), QuoteSection(), StepsSection(), WarumSection() (+1 more)

### Community 26 - "MementoOS Landing — контекст проекта"
Cohesion: 0.25
Nodes (7): Git, graphify, MementoOS Landing — контекст проекта, Команды, Правила контента (нарушение = блокер на ревью), Структура, Три дизайн-системы (кратко)

### Community 27 - "BestatterWorkspace.tsx"
Cohesion: 0.11
Nodes (13): metadata, IconKerze(), BestatterWorkspace(), Case, Col, cols, Contact, contactMeta (+5 more)

### Community 28 - "0008_plattform_uebersicht.sql"
Cohesion: 0.22
Nodes (11): app.is_platform_admin(), public.admin_faelle(), public.admin_haeuser(), public.admin_overview(), public.admin_zugaenge(), public.platform_admins, auth.users, public.audit_log (+3 more)

### Community 29 - "Termine.tsx"
Cohesion: 0.17
Nodes (11): TerminEingabe, Entwurf, Felder(), LEER, ROLLEN, TERMIN_ARTEN, TERMIN_STATUS, terminArtHinweis (+3 more)

### Community 30 - "0016_quelle_je_angabe.sql"
Cohesion: 0.21
Nodes (10): app.feldquelle_pflegen, app.feldquelle_pflegen(), deceased_feldquelle, public.feldquelle, public.korrektur_entscheiden(), public.korrekturen(), public.korrekturvorschlag, public.cases (+2 more)

### Community 31 - "app.case_for_role"
Cohesion: 0.20
Nodes (6): app.case_for_role(), public.cases, public.documents, public.participants, public.tasks, public.termine

### Community 32 - "Einladungen.tsx"
Cohesion: 0.23
Nodes (10): badgeKlasse, Einladungen(), Kopierstand, datumsformat, EinladungAnsicht, EinladungStatus, status(), zuAnsicht() (+2 more)

### Community 34 - "Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`"
Cohesion: 0.05
Nodes (36): Fail-loud вместо тихого mock (`src/lib/env.ts`), Feature: Sicherheit im MVP (`mvp/`) — Rechtemodell, Sitzungen, Kopfzeilen, Middleware (`src/middleware.ts`), Open redirect через управляющие символы в `?next=`, service_role, Вход, Гигиена `search_path`, Два побочных исправления в схеме (+28 more)

### Community 38 - "vercel.json"
Cohesion: 0.33
Nodes (5): framework, installCommand, regions, $schema, fra1

### Community 39 - "login/page.tsx"
Cohesion: 0.18
Nodes (15): dynamic, POST(), Art, ARTEN, dynamic, GET(), istArt(), AnmeldeErgebnis (+7 more)

### Community 40 - "public.admin_fall"
Cohesion: 0.40
Nodes (5): public.admin_fall(), public.admin_zugaenge(), public.audit_log, public.invite_sessions, public.invites

### Community 41 - "unterlage-antwort.ts"
Cohesion: 0.33
Nodes (7): dynamic, GET(), Auslieferung, unterlageFuerHaus(), ausliefern(), contentDisposition(), KEIN_CACHE

### Community 42 - "public.unterlage_fuer_sitzung"
Cohesion: 0.40
Nodes (3): public.unterlage_fuer_sitzung(), public.invite_sessions, public.invites

### Community 43 - "(admin)/layout.tsx"
Cohesion: 0.24
Nodes (5): metadata, metadata, metadata, Wordmark(), isMock

### Community 44 - "ungueltig/page.tsx"
Cohesion: 0.40
Nodes (3): dynamic, Grund, texte

### Community 45 - "access.ts"
Cohesion: 0.21
Nodes (15): Gruppe(), allowedTiers(), aufzaehlung(), caseForRole(), darfBestaetigen(), deceasedForRole(), empfaengerSatz(), felderSchreibbar() (+7 more)

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

### Community 65 - "Voraussetzungen.tsx"
Cohesion: 0.16
Nodes (12): Termine(), NeueVoraussetzung(), ROLLEN, Voraussetzungen(), offeneVoraussetzungen(), terminartenFuerVoraussetzung(), voraussetzungenFuerTermin(), VORAUSSETZUNGS_ARTEN (+4 more)

### Community 66 - "Компоненты демо-потока (/demo)"
Cohesion: 0.25
Nodes (7): Field, Pill — статусная метка, PrimaryBtn / GhostBtn, Stepper — шаги демо, Компоненты демо-потока (/demo), Переход шагов, Правило данных

### Community 67 - "MementoOS — Landing"
Cohesion: 0.25
Nodes (7): MementoOS — Landing, MVP (`mvp/`), Деплой, Запуск, Команда агентов, Правила контента, Структура

### Community 68 - "Канон дизайн-систем MementoOS"
Cohesion: 0.29
Nodes (6): 1. Monad — лендинг `/`, `/demo` и Monad-подстраницы, 2. Steep — страницы аудиторий `/fuer-*`, 3. Default — CRM `/workspace`, Зона Datenmodell (/datenmodell) — внутри Monad, Канон дизайн-систем MementoOS, Общие законы (все системы)

### Community 69 - "zugang/actions.ts"
Cohesion: 0.14
Nodes (19): ab(), dynamic, GET(), istForm(), BestaetigenErgebnis, blockerText(), LAENGE, zugangBeendenAction() (+11 more)

### Community 70 - "Markenzeichen"
Cohesion: 0.50
Nodes (3): Entschieden: die Datei gewinnt, Markenzeichen, Wo das Zeichen benutzt wird

### Community 75 - "audience/types.ts"
Cohesion: 0.12
Nodes (11): FaqSection(), ScenarioSection(), AccessRow, BoardColumnSpec, BoardTask, FaqItem, LossStep, MitStep (+3 more)

### Community 77 - "env.ts"
Cohesion: 0.11
Nodes (24): nextConfig, LoginForm(), Zustand, assertRuntimeConfig(), isBuildPhase(), RuntimeMode, serverSecrets(), supabasePublicConfig() (+16 more)

### Community 78 - "(intern)/fall/[id]/page.tsx"
Cohesion: 0.17
Nodes (10): dynamic, Dashboard(), dynamic, phaseLabel, listCases(), DEMO_FAMILY_TOKEN, DEMO_KREMATORIUM_TOKEN, InviteSummary (+2 more)

### Community 83 - "Nächste Sitzung — Übergabe"
Cohesion: 0.25
Nodes (7): `0017` — gebaut, aber auf die Liste wartend, Arbeitsregeln, die nicht verhandelbar sind, Danach, in dieser Reihenfolge, Nächste Sitzung — Übergabe, Vor jeder Arbeit lesen, Wo der Stand steht, Zuerst den Wissensgraphen benutzen

## Knowledge Gaps
- **415 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRuntimeMode()` connect `lib/data.ts` to `lib/types.ts`, `zugang/actions.ts`, `unterlage-antwort.ts`, `env.ts`, `(intern)/fall/[id]/page.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `Role` connect `lib/types.ts` to `Einladungen.tsx`, `Voraussetzungen.tsx`, `lib/data.ts`, `mock.ts`, `(intern)/fall/[id]/actions.ts`, `access.ts`, `verlauf.ts`, `Termine.tsx`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `seite()` connect `DemoFlow.tsx` to `icons.tsx`, `datamodel/ui.tsx`, `so-funktioniert-es/page.tsx`, `site.ts`, `AudienceData`, `AudiencePage.tsx`, `BestatterWorkspace.tsx`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lib/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061213579256883185 - nodes in this community are weakly interconnected._
- **Should `0004_hardening.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.0748663101604278 - nodes in this community are weakly interconnected._
- **Should `icons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10826210826210826 - nodes in this community are weakly interconnected._