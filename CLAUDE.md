# MementoOS Landing — контекст проекта

Публичный лендинг платформы MementoOS (превью): координация похоронной отрасли
(Bestatter, Krematorien, Friedhöfe, Transport, Zulieferer, Familien).
Next.js 15 (App Router, static export) + Tailwind CSS 4. Деплой: GitHub Pages
при пуше в `main` (`basePath: /mementos-landing`).

## Команды

```bash
pnpm install
pnpm dev        # http://localhost:3000/mementos-landing
pnpm build      # статический экспорт в out/ — ОБЯЗАТЕЛЬНО перед коммитом
```

## Структура

- `src/app/` — страницы: `/` (лендинг), `/fuer-bestatter` (аудитория),
  `/demo` (процесс-демо), `/workspace` (интерактивный CRM-концепт)
- `src/components/` — компоненты лендинга; `demo/`, `workspace/` — свои
- `src/app/globals.css` — ВСЕ токены и анимационные утилиты (@theme + слои)
- `docs/design-systems.md` — канон трёх дизайн-систем. ЧИТАТЬ ПЕРЕД ЛЮБОЙ
  РАБОТОЙ НАД UI. Каждая страница строго в своей системе.

## Три дизайн-системы (кратко)

1. **Monad** (лендинг `/`, `/demo`): тёплый пергамент #f6f3f1, serif
   Instrument Serif 400 + mono JetBrains Mono, pill-формы, hairline #cecac8,
   единственный акцент Lake Blue #2b59d1, пастель только декоративно.
2. **Steep** (страницы аудиторий `/fuer-*`): белый холст, крупный serif с
   курсивной вставкой, sans Inter, mist/fog-карты 24px, персиковый акцент
   #fbe1d1 максимум один на страницу, плавающие продукт-артефакты с тенью.
3. **Default** (CRM `/workspace`): тёмный void #0b0c0e, графит #131416,
   hairline 0.5px + inset-подсветка вместо теней, Inter 400 (ss01/ss03),
   костяная CTA #f2f2f2, синий #3b82f6 только активные состояния,
   зелёный/красный только семантика.

## Правила контента (нарушение = блокер на ревью)

- Копия на немецком. Тон: ruhig, präzise, respektvoll — отрасль чувствительная.
- НИКАКИХ выдуманных метрик, отзывов, клиентов, цен. Демо-данные всегда
  помечены «Beispieldaten». Конкретика условий — «in der Pilotphase gemeinsam».
- Анимации уважают `prefers-reduced-motion` (глобальный блок в globals.css —
  новые infinite-анимации добавлять в его список).
- Заголовки никогда не жирные: serif 400 (Monad/Steep), Inter 400 (Default).

## Git

- Рабочая ветка: `claude/memento-os-design-fx5ev8`; лайв — merge ff в `main`
  и push (только по явной просьбе пользователя).
- Перед коммитом: `pnpm build` зелёный. Скриншоты через Playwright
  (executablePath: /opt/pw-browsers/chromium) с локального сервера out/.
