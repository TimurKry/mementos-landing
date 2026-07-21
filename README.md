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
src/app/            layout (шрифты, метаданные), page, globals.css (токены + анимационный слой)
src/components/     Header, Hero (+HubDiagram), Marquee, ProductScene, Sections (Why/Process/ValueBand/Audiences/Cta), Faq, Footer, icons
assets/icons/       исходные SVG-иконки (выбор основателя) — в компонентах инлайнены нормализованными
```

## Деплой

GitHub Actions (`.github/workflows/deploy.yml`) собирает и публикует `out/` на GitHub Pages при пуше в `main`. `basePath: /mementos-landing` задан в `next.config.ts`.

## Правила контента

- Копия на немецком, тон: ruhig, präzise, respektvoll
- Никаких выдуманных метрик, отзывов и клиентов
- Бренд: см. приватный репо `mementos-os`, `docs/08-design/`
