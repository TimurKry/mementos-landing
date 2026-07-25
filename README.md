# MementoOS — Landing

Публичный лендинг платформы MementoOS (превью). Next.js 15 (App Router, static export) + Tailwind CSS 4.

**Live:** https://timurkry.github.io/mementos-landing/

## Запуск

```bash
pnpm install
pnpm dev        # http://localhost:3000/mementos-landing
pnpm build      # статический экспорт в out/
```

## Структура

```
src/app/            layout, page, /datenmodell, /demo, /workspace, /preise, globals.css (токены + слои)
                    /so-funktioniert-es, /sicherheit, /ueber-uns — Monad-подстраницы (Ablauf/Vertrauen/Über uns)
                    /fuer-bestatter|krematorien|friedhoefe|zulieferer|familien|verbuende — страницы аудиторий
src/components/     Header, Hero (+HubDiagram), Marquee, ProductScene, Sections, HeuteMorgen, AccessTeaser, Faq, Footer, icons
src/components/audience/   data-driven шаблон /fuer-*: types, AudiencePage, секции (Nav/Hero/Warum/Scenario/Steps/Quote/Faq/Cta/Footer), data/*.ts
src/components/pricing/    общий прайсинг: types, data (defaultPlans), Pricing (full/partner-note/custom)
src/components/datamodel/  ER-схема доступа: data.ts, ui, EntityDiagram, EntityCard, DocTable
assets/icons/       исходные SVG-иконки (выбор основателя) — в компонентах инлайнены нормализованными
mvp/                отдельное динамическое Next-приложение (auth + Supabase), НЕ GitHub Pages
```

## MVP (`mvp/`)

Прототип продукта (общий Fall с полевым доступом по ролям) — своё приложение
со своим lockfile и своей документацией на немецком: `mvp/README.md`
(запуск, mock-режим, Sicherheitsmodell, провижн Supabase, offene Punkte).

```bash
cd mvp
pnpm install --ignore-workspace   # свой lockfile, вне workspace лендинга
pnpm dev                          # http://localhost:3000 (mock-режим, без БД)
pnpm build                        # зелёный без переменных окружения
```

Модель угроз, закрытые дыры и чеклист перед провижном Supabase —
`docs/features/mvp-sicherheit.md`. Читать перед правкой SQL-миграций,
`mvp/src/middleware.ts` или потока приглашений.

## Деплой

GitHub Actions (`.github/workflows/deploy.yml`) собирает и публикует `out/` на GitHub Pages при пуше в `main`. `basePath: /mementos-landing` задан в `next.config.ts`.

## Команда агентов

Для Claude Code настроен конвейер `/team` (`.claude/skills/team/`) и роли
в `.claude/agents/`: `architect` (план) → `implementer` (реализация) →
`reviewer` (ревью) → `doc-writer` (документация). Контекст для агентов:
`CLAUDE.md` + `docs/design-systems.md` (канон трёх дизайн-систем).
Отчёты по фичам копятся в `docs/features/`.

## Правила контента

- Копия на немецком, тон: ruhig, präzise, respektvoll
- Никаких выдуманных метрик, отзывов и клиентов
- Бренд: см. приватный репо `mementos-os`, `docs/08-design/`
