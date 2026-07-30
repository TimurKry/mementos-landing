# Graph Report - mementos-landing  (2026-07-30)

## Corpus Check
- 178 files · ~122,475 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1262 nodes · 2496 edges · 78 communities (63 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `01edec28`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin.ts
- 0004_hardening.sql
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
- cases
- zeit.ts
- icons.tsx
- preise/page.tsx
- sicherheit/page.tsx
- site.ts
- DemoFlow.tsx
- seite
- audience/types.ts
- VerstorbenePerson.tsx
- MementoOS — Arbeitsstand (durable project knowledge)
- verlauf.ts
- AudiencePage.tsx
- MementoOS Landing — контекст проекта
- BestatterWorkspace.tsx
- 0008_plattform_uebersicht.sql
- src/app/layout.tsx
- 0016_quelle_je_angabe.sql
- app.case_for_role
- (intern)/fall/[id]/page.tsx
- 0017_voraussetzungen.sql
- Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`
- .claude/CLAUDE.md
- 0011_termine.sql
- 0015_rechte_je_feld.sql
- vercel.json
- fuer-familien/page.tsx
- public.admin_fall
- public.unterlage_fuer_sitzung
- ungueltig/page.tsx
- access.ts
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
- Компоненты демо-потока (/demo)
- MementoOS — Landing
- Канон дизайн-систем MementoOS
- Markenzeichen
- ScenarioSection.tsx
- env.ts
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
10. `Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`` - 16 edges

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

## Communities (78 total, 15 thin omitted)

### Community 0 - "admin.ts"
Cohesion: 0.07
Nodes (64): dynamic, EreignisseSeite(), AdminErgebnis, ausfuehren(), sitzungBeendenAction(), zugangZurueckziehenAction(), dynamic, FallSeite() (+56 more)

### Community 1 - "0004_hardening.sql"
Cohesion: 0.07
Nodes (23): app.audit_log_append_only, app.handle_new_user, app.case_for_role(), app.deceased_for_role(), app.log(), audit_log_append_only, on_auth_user_created, public.end_session() (+15 more)

### Community 2 - "Unterlagen.tsx"
Cohesion: 0.15
Nodes (19): Aufgaben(), ROLLEN, Beteiligte(), ROLLEN, EntfernenKnopf(), Speicherstand(), Stand, STILL (+11 more)

### Community 3 - "lib/types.ts"
Cohesion: 0.09
Nodes (24): AngabenBogen(), DATUMSFELDER, PLATZHALTER, dynamic, ZugangPage(), ZugangBeenden(), ZugangTermine(), feldLabel (+16 more)

### Community 4 - "datamodel/ui.tsx"
Cohesion: 0.09
Nodes (30): metadata, roleOrder, DocRow, documents, entities, Entity, Field, Group (+22 more)

### Community 5 - "lib/data.ts"
Cohesion: 0.05
Nodes (74): metadata, ab(), dynamic, GET(), istForm(), metadata, dynamic, GET() (+66 more)

### Community 6 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, next, react, react-dom, server-only, @supabase/ssr, @supabase/supabase-js, devDependencies (+26 more)

### Community 7 - "mock.ts"
Cohesion: 0.06
Nodes (37): addInvite(), alleFaelle(), alleZugaenge(), DEMO_ANGELEGT, DEMO_HAUS_ID, demoFaelle(), demoZugaenge(), ereignisEintragen() (+29 more)

### Community 8 - "package.json"
Cohesion: 0.06
Nodes (31): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+23 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (27): mvp, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+19 more)

### Community 10 - "Sections.tsx"
Cohesion: 0.09
Nodes (14): Faq(), items, HeuteMorgen(), heuteSteps, morgenSteps, Marquee(), roles, Audiences (+6 more)

### Community 11 - "(intern)/fall/[id]/actions.ts"
Cohesion: 0.08
Nodes (74): angabenErgaenzenAction(), BestaetigenErgebnis, blockerText(), LAENGE, terminBestaetigenAction(), zugangBeendenAction(), BestattungsartFeld(), AufgabeEingabe (+66 more)

### Community 12 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 13 - "cases"
Cohesion: 0.16
Nodes (16): auth, audit_log, cases, deceased, documents, invites, participants, profiles (+8 more)

### Community 14 - "zeit.ts"
Cohesion: 0.18
Nodes (14): TerminKarte(), entwurfAus(), abstandMinuten(), ausWanduhr(), gleicherTag(), istWanduhr(), kartenLink(), nurTag (+6 more)

### Community 15 - "icons.tsx"
Cohesion: 0.09
Nodes (24): AccessTeaser(), FeatureCards(), Hero(), curves, endpoints, Node, nodes, IconBestatter() (+16 more)

### Community 16 - "preise/page.tsx"
Cohesion: 0.18
Nodes (9): cta, metadata, pricing, AudienceFooter(), AudienceNav(), defaultPlans, Pricing(), PricingPlan (+1 more)

### Community 17 - "sicherheit/page.tsx"
Cohesion: 0.13
Nodes (15): blocks, metadata, metadata, steps, umstieg, metadata, Footer(), Header() (+7 more)

### Community 18 - "site.ts"
Cohesion: 0.16
Nodes (13): dynamic, robots(), dynamic, Eintrag, SEITEN, sitemap(), STAND, absolut() (+5 more)

### Community 19 - "DemoFlow.tsx"
Cohesion: 0.19
Nodes (11): metadata, DemoFlow(), stepLabels, Card(), Field(), GhostBtn(), Pill(), PillTone (+3 more)

### Community 20 - "seite"
Cohesion: 0.13
Nodes (10): metadata, metadata, metadata, audienceMetadata(), AudiencePage(), bestatter, verbuende, zulieferer (+2 more)

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
Cohesion: 0.23
Nodes (13): Verlauf(), wann(), zeitpunkt, terminArtLabel, TerminArt, akteure, akteurLabel(), aktionen (+5 more)

### Community 25 - "AudiencePage.tsx"
Cohesion: 0.33
Nodes (5): AudienceCta(), QuoteSection(), StepsSection(), AudienceData, WarumSection()

### Community 26 - "MementoOS Landing — контекст проекта"
Cohesion: 0.25
Nodes (7): Git, graphify, MementoOS Landing — контекст проекта, Команды, Правила контента (нарушение = блокер на ревью), Структура, Три дизайн-системы (кратко)

### Community 27 - "BestatterWorkspace.tsx"
Cohesion: 0.11
Nodes (13): metadata, IconKerze(), BestatterWorkspace(), Case, Col, cols, Contact, contactMeta (+5 more)

### Community 28 - "0008_plattform_uebersicht.sql"
Cohesion: 0.22
Nodes (11): app.is_platform_admin(), public.admin_faelle(), public.admin_haeuser(), public.admin_overview(), public.admin_zugaenge(), public.platform_admins, auth.users, public.audit_log (+3 more)

### Community 29 - "src/app/layout.tsx"
Cohesion: 0.21
Nodes (9): inter, metadata, mono, RootLayout(), serif, Reveal(), Schema(), SITE_URL (+1 more)

### Community 30 - "0016_quelle_je_angabe.sql"
Cohesion: 0.21
Nodes (10): app.feldquelle_pflegen, app.feldquelle_pflegen(), deceased_feldquelle, public.feldquelle, public.korrektur_entscheiden(), public.korrekturen(), public.korrekturvorschlag, public.cases (+2 more)

### Community 31 - "app.case_for_role"
Cohesion: 0.20
Nodes (6): app.case_for_role(), public.cases, public.documents, public.participants, public.tasks, public.termine

### Community 32 - "(intern)/fall/[id]/page.tsx"
Cohesion: 0.13
Nodes (19): badgeKlasse, Einladungen(), Kopierstand, datumsformat, EinladungAnsicht, EinladungStatus, status(), zuAnsicht() (+11 more)

### Community 34 - "Как закрыто: `mvp/supabase/migrations/0004_hardening.sql`"
Cohesion: 0.05
Nodes (37): Fail-loud вместо тихого mock (`src/lib/env.ts`), Feature: Sicherheit im MVP (`mvp/`) — Rechtemodell, Sitzungen, Kopfzeilen, Middleware (`src/middleware.ts`), Open redirect через управляющие символы в `?next=`, service_role, Вход, Гигиена `search_path`, Два побочных исправления в схеме (+29 more)

### Community 38 - "vercel.json"
Cohesion: 0.33
Nodes (5): framework, installCommand, regions, $schema, fra1

### Community 40 - "public.admin_fall"
Cohesion: 0.40
Nodes (5): public.admin_fall(), public.admin_zugaenge(), public.audit_log, public.invite_sessions, public.invites

### Community 42 - "public.unterlage_fuer_sitzung"
Cohesion: 0.40
Nodes (3): public.unterlage_fuer_sitzung(), public.invite_sessions, public.invites

### Community 44 - "ungueltig/page.tsx"
Cohesion: 0.40
Nodes (3): dynamic, Grund, texte

### Community 45 - "access.ts"
Cohesion: 0.09
Nodes (37): TerminEingabe, Entwurf, Felder(), LEER, ROLLEN, Termine(), Gruppe(), NeueVoraussetzung() (+29 more)

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

### Community 66 - "Компоненты демо-потока (/demo)"
Cohesion: 0.25
Nodes (7): Field, Pill — статусная метка, PrimaryBtn / GhostBtn, Stepper — шаги демо, Компоненты демо-потока (/demo), Переход шагов, Правило данных

### Community 67 - "MementoOS — Landing"
Cohesion: 0.25
Nodes (7): MementoOS — Landing, MVP (`mvp/`), Деплой, Запуск, Команда агентов, Правила контента, Структура

### Community 68 - "Канон дизайн-систем MementoOS"
Cohesion: 0.29
Nodes (6): 1. Monad — лендинг `/`, `/demo` и Monad-подстраницы, 2. Steep — страницы аудиторий `/fuer-*`, 3. Default — CRM `/workspace`, Зона Datenmodell (/datenmodell) — внутри Monad, Канон дизайн-систем MementoOS, Общие законы (все системы)

### Community 70 - "Markenzeichen"
Cohesion: 0.50
Nodes (3): Entschieden: die Datei gewinnt, Markenzeichen, Wo das Zeichen benutzt wird

### Community 75 - "ScenarioSection.tsx"
Cohesion: 0.22
Nodes (3): ScenarioSection(), BoardColumnSpec, ScenarioBlock

### Community 77 - "env.ts"
Cohesion: 0.07
Nodes (39): nextConfig, dynamic, POST(), Art, ARTEN, dynamic, GET(), istArt() (+31 more)

### Community 83 - "Nächste Sitzung — Übergabe"
Cohesion: 0.25
Nodes (7): `0017` — gebaut, aber auf die Liste wartend, Arbeitsregeln, die nicht verhandelbar sind, Danach, in dieser Reihenfolge, Nächste Sitzung — Übergabe, Vor jeder Arbeit lesen, Wo der Stand steht, Zuerst den Wissensgraphen benutzen

## Knowledge Gaps
- **416 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+411 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getRuntimeMode()` connect `lib/data.ts` to `admin.ts`, `(intern)/fall/[id]/actions.ts`, `env.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `Role` connect `Unterlagen.tsx` to `(intern)/fall/[id]/page.tsx`, `admin.ts`, `lib/types.ts`, `lib/data.ts`, `mock.ts`, `(intern)/fall/[id]/actions.ts`, `access.ts`, `verlauf.ts`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `seite()` connect `seite` to `datamodel/ui.tsx`, `preise/page.tsx`, `sicherheit/page.tsx`, `site.ts`, `DemoFlow.tsx`, `AudiencePage.tsx`, `BestatterWorkspace.tsx`, `src/app/layout.tsx`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _416 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07263157894736842 - nodes in this community are weakly interconnected._
- **Should `0004_hardening.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.0748663101604278 - nodes in this community are weakly interconnected._
- **Should `lib/types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09425287356321839 - nodes in this community are weakly interconnected._