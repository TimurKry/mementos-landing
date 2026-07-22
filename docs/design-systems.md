# Канон дизайн-систем MementoOS

Три системы, три зоны. Смешивать нельзя: каждая страница живёт строго в
своей. Токены определены в `src/app/globals.css` (@theme). Этот файл —
источник истины для architect/implementer/reviewer.

---

## 1. Monad — лендинг `/` и `/demo`

> editorial tech journal on warm parchment

- **Холст:** пергамент `#f6f3f1` (token `paper`). Никогда чистый белый.
- **Шрифты:** заголовки Instrument Serif 400 (`--font-display`) — никогда
  жирные; ВЕСЬ остальной UI — JetBrains Mono (`--font-body`), кнопки и
  навигация uppercase с трекингом (`.mono-label`).
- **Формы:** кнопки/теги — pill 999px; карты 16–40px радиус; границы 1px
  Ash `#cecac8` (`hair`) — глубина слоями цвета, не тенями (одна мягкая
  `.soft-ambient` разрешена).
- **Цвет:** единственный акцент Lake Blue `#2b59d1` (`blue`) — только
  primary action и сигнальные точки. Пастель (sky/minted/coral/gold) —
  только градиентные заливки и иллюстрации, никогда UI.
- **Сигнатуры:** hero-заливки `.hero-glow` (дрейфующие), схема HubDiagram
  (кривые pathLength=1 + .diagram-path draw, flow-точки animateMotion),
  вертикальный пайплайн в Process, ProductScene (14s CSS-цикл), marquee,
  зерно плёнки (body::after), периwinkle-карта `#cfdaf5` — одна на страницу.

## 2. Steep — страницы аудиторий `/fuer-*`

> serif analytics on warm paper

- **Холст:** белый `#ffffff`; чередование секций через fog `#fafafb`.
- **Шрифты:** дисплей Instrument Serif 400 с *курсивной вставкой* в
  заголовке; body/UI — Inter (`--font-sans`). Никакого mono.
- **Карты:** neutral mist `#f2f2f3` радиус 24px без тени; плавающие
  продукт-артефакты `.artifact` (белые, 20px, мягкая многослойная тень) —
  единственные элементы с тенью.
- **Акцент:** персиковый `#fbe1d1` + sienna `#5d2a1a` — МАКСИМУМ ОДНА
  персиковая карта на страницу, только на белом. Sienna вне персика —
  только штрихи графиков и маркеры потерь.
- **Кнопки:** nero `#17191c` pill (`.btn-nero`) + ghost (`.btn-nero-ghost`);
  текстовые ссылки со стрелкой →, подчёркивание только на hover
  (`.quiet-link`).
- **Сигнатуры:** hero-коллаж из 4 артефактов вокруг заголовка (лёгкие
  повороты, float), канбан offen/in Arbeit/erledigt, сравнительная схема
  потерь информации (`.loss-pulse`), прайсинг Pro Fall / Haus / Verbund.
- **Data-driven:** зона строится из одного шаблона — `AudiencePage`
  (`src/components/audience/`): одна `AudienceData` описывает страницу
  `/fuer-*` целиком (hero → warum → szenario → ablauf → quote? → pricing?
  → faq → cta), `page.tsx` — тонкий рендер. Сценарий выбирает один из трёх
  видов: `loss` / `board` / `access`. Общий прайсинг — `src/components/
  pricing/` (`full` / `partner-note` / `custom`); отдельная страница
  `/preise` тоже в Steep. Тон `tone:"soft"` (Familien) глушит CTA.
- На `lg` заголовок hero сужен до `max-w-[560px]` (против `720px` на mobile),
  чтобы не пересекаться с плавающими артефактами по краям коллажа.

## 3. Default — CRM `/workspace`

> mission control behind frosted glass

- **Поверхности:** void `#0b0c0e` → графит `#131416` (`.dk-card`) →
  charcoal `#1f1f21`. Границы — hairline 0.5px rgba(255,255,255,.07) +
  inset-подсветка сверху; НИКАКИХ обычных drop-теней и градиентов.
- **Шрифт:** Inter везде, font-feature ss01+ss03 (обёртка `.dk`),
  заголовки weight 400 (32–42px), плотный отрицательный трекинг.
  `.dk h1-h3` принудительно белые (глобальный ink-цвет вне слоёв).
- **Цвет строго:** костяная CTA `#f2f2f2` (`.btn-bone`) — единственный
  яркий элемент; синий `#3b82f6` ТОЛЬКО активные состояния (вкладка,
  прогресс, фокус-кольцо, чекбоксы); зелёный `#4ade80` / красный `#f87171`
  ТОЛЬКО семантика (успех/срочность) как контурные бейджи `.badge-dk-*`.
- **Плотность:** compact — текст 10–13px, паддинги 12–16px, радиусы
  9–12px.

---

## Зона Datenmodell (/datenmodell) — внутри Monad

ER-схема доступа живёт в системе Monad (пергамент, serif+mono), но добавляет
диаграммный словарь:
- Стрелки: чёрная `↦` = запись (ink), синяя пунктирная `⇥` = чтение (blue).
- Ключи групп полей по чувствительности (хексами, как диаграммная
  иллюстрация): kern `#242424`, org `#ecda98`, op `#f0a17a`, sens `#5d2a1a`.
- Утилиты в globals.css: `.dm-table`, `.dm-key-*`, `.dm-row-*`, `.dm-wires`,
  `.dm-node`. Данные — `src/components/datamodel/data.ts`.
- Флагманы (`kind:diagram`) рисуют SVG-стрелки на клиенте (EntityDiagram),
  на `<=940px` складываются вертикально. Остальные — компактные карты.

## Общие законы (все системы)

1. Заголовки не бывают жирными.
2. `prefers-reduced-motion` глушит всё; новые infinite-анимации — в список
   исключений в globals.css.
3. Данные в мокапах — вымышленные и помечены «Beispieldaten».
4. Немецкая копия: ruhig, präzise, respektvoll. Без маркетингового крика.
5. Новые токены — только в `@theme` globals.css; хексы в компонентах
   допустимы только внутри `.dk`-зоны (у неё свой словарь) и в SVG-арте.
