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
                    /fuer-bestatter|krematorien|friedhoefe|zulieferer|familien|verbuende — страницы аудиторий
src/components/     Header, Hero (+HubDiagram), Marquee, ProductScene, Sections, AccessTeaser, Faq, Footer, icons
src/components/audience/   data-driven шаблон /fuer-*: types, AudiencePage, секции (Nav/Hero/Warum/Scenario/Steps/Quote/Faq/Cta/Footer), data/*.ts
src/components/pricing/    общий прайсинг: types, data (defaultPlans), Pricing (full/partner-note/custom)
src/components/datamodel/  ER-схема доступа: data.ts, ui, EntityDiagram, EntityCard, DocTable
assets/icons/       исходные SVG-иконки (выбор основателя) — в компонентах инлайнены нормализованными
```

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
