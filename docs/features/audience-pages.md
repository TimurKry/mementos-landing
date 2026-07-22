# Feature: Zielgruppen-Seiten & Preise (/fuer-*, /preise)

Sechs Rollen-Landings plus eine neutrale Preisseite — alle in der Steep-Zone,
alle aus einem data-driven Schablonentyp gebaut. Jede Seite beantwortet für
ihre Rolle dieselben vier Fragen: **Warum** (Problem), **Wie helfen wir**
(Szenario), **Was kostet es** (Pricing) und **Wie funktioniert es** (Ablauf).

Umfasst zwei Phasen: **Фаза 0 (Фундамент)** — типы, Schablone, Секции,
общий Pricing, role-router; **Фаза 1** — данные шести аудиторий.

## Зачем

Главная отвечает «für wen» коротко; но каждая роль отрасли (Bestatter,
Krematorien, Friedhöfe, Zulieferer, Familien, Verbünde) должна увидеть свой
язык, свою боль и свою модель оплаты. Вместо шести рукописных страниц —
один типизированный шаблон: одна `AudienceData` описывает страницу целиком,
`page.tsx` остаётся тонким рендером. Так контент правится в data, а вёрстка
и Steep-канон едины для всех.

## Архитектура data-driven шаблона

`AudienceData` (`src/components/audience/types.ts`) → `AudiencePage`
(оркестратор) → секции. Порядок фиксирован:

```
hero → warum → szenario → ablauf → (quote?) → (pricing?) → faq → cta
```

`quote` и `pricing` опциональны (`pricing: null` — блок цен не рисуется).

- `AudiencePage.tsx` — собирает секции из data; `audienceMetadata(data)` —
  хелпер для `export const metadata` на страницах.
- Каждая `src/app/fuer-*/page.tsx` — тонкий рендер: импорт data +
  `<AudiencePage data={…} />` + `metadata = audienceMetadata(…)`.
- Секции в `src/components/audience/`: `AudienceNav`, `AudienceHero`,
  `WarumSection`, `ScenarioSection`, `StepsSection`, `QuoteSection`,
  `FaqSection`, `AudienceCta`, `AudienceFooter`; артефакты — `Artifacts.tsx`.

### Hero-артефакты — `ArtifactSpec`

Плавающий коллаж вокруг заголовка (до 4 артефактов, `.artifact` — тень).
Виды (`kind`):
- `list` — список строк со статусом/галкой (badge, rows).
- `checklist` — чек-лист с `done` и опц. `foot`.
- `ring` — жестовое кольцо заполнения (`ratio` 0..1, штрих sienna).
- `composer` — поле-заглушка ввода (`placeholder`).

### Сценарий — `ScenarioBlock`, три взаимозаменяемых `view`

Ключевой ответ на «Wie helfen wir». Все три вида заложены в типе сразу,
страница выбирает один:
- `loss` — сравнительная схема потерь информации (`heute` + опц. `mit`),
  маркеры потерь sienna.
- `board` — канбан по колонкам `open / doing / done` (offen / in Arbeit /
  erledigt).
- `access` — «что видит роль / что остаётся скрытым» (`visible` / `hidden`),
  для Familien; ссылка на `/datenmodell/`.

### Тон

Поле `tone: "soft"` (по умолчанию `"default"`) → тихий тон без напористых
CTA. Используется только для Familien: `AudienceNav` и `AudienceCta`
получают `soft`.

## Общий Pricing — `src/components/pricing/`

Один спек `PricingSpec` покрывает три случая (`variant`), цифр нет нигде —
условия только текстом:

- `full` — три карты (`defaultPlans`): **Pro Fall** (Kernmodell, приподнят),
  **Haus** (Abo), **Verbund** (Abo). Условия: «in der Pilotphase gemeinsam
  festgelegt» / «Auf Anfrage» / «Individuell».
- `partner-note` — одна карта «Sie treten dem Fall bei — ohne eigene Lizenz»
  (`note`), без собственных планов.
- `custom` — заголовок + произвольные `plans` (заложен, пока не используется).

Якорь секции — `id="preise"`; сюда ведёт `#preise` из `AudienceNav`.
`defaultPlans` в `data.ts` — единый источник для `full`.

### Решение владельца: партнёры без лицензии

Модель оплаты завязана на роль в Fall. Ядро — оплата **pro abgeschlossenem
Fall** несёт Bestatter (владелец кейса). Партнёры присоединяются к чужому
Fall без собственной лицензии, поэтому у них нет своего прайса:

- `krematorien`, `friedhoefe`, `zulieferer` → `partner-note`.
- `familien` → `pricing: null` (для семьи вопроса цены нет).
- `bestatter` → `full` (владелец лицензии).
- `verbuende` → `full`, но с акцентом **Verbund** (`roleLabel: "Für
  Verbünde"`, заголовок «Ein Modell für *den Verbund*»): Abo je Gruppe.
- `/preise` → `full`, role-neutral.

## Шесть страниц: маршрут → szenario view → pricing

| Маршрут | Роль | szenario `view` | pricing `variant` |
|---|---|---|---|
| `/fuer-bestatter` | Bestatter (эталон) | `loss` | `full` |
| `/fuer-krematorien` | Krematorien | `loss` | `partner-note` |
| `/fuer-friedhoefe` | Friedhöfe | `loss` | `partner-note` |
| `/fuer-zulieferer` | Zulieferer | `board` | `partner-note` |
| `/fuer-familien` | Familien (`tone: soft`) | `access` | `null` |
| `/fuer-verbuende` | Verbünde | `board` | `full` (Akzent Verbund) |

Данные — `src/components/audience/data/<slug>.ts`. Всё — Beispieldaten.

## Role-router и связки

- Главная (`Sections.tsx`): секция `#ich-bin` «Ich bin… / Wählen Sie Ihre
  Rolle» — сетка из 6 карт, каждая ведёт на свою `/fuer-*` («Eigene Seite →»).
- `Header.tsx`: пункт **Für wen** (`#ich-bin`) и **Preise** (`/preise/`).
- `Footer.tsx`: колонка ссылок на все шесть `/fuer-*` и на `/preise/`.
- `AudienceNav`: якорь **Preise** (`#preise`) показывается только когда
  `hasPricing` (т.е. `pricing !== null`).
- Сценарий Familien и Verbünde ссылаются на `/datenmodell/` (кто что видит).

## Как проверить

1. `pnpm build` — зелёный; в выводе все шесть `/fuer-*` и `/preise`.
2. Каждая `/fuer-*` отвечает на 4 вопроса по порядку: hero → Warum →
   Szenario → Ablauf → (Quote) → (Preise) → FAQ → CTA.
3. Szenario-вид совпадает с таблицей выше (loss/board/access).
4. Прайсинг: bestatter/verbuende/preise — три карты; krematorien/friedhoefe/
   zulieferer — одна карта «ohne eigene Lizenz»; familien — блока цен нет.
5. Familien (`soft`): тон тихий, без напористых CTA.
6. Мобильный (390px): hero-артефакты складываются стопкой под заголовком;
   на `<lg` коллаж не absolute.
7. Role-router: главная `#ich-bin` и футер ведут на все шесть страниц;
   Header → Preise открывает `/preise`.

## Известные ограничения / открытые вопросы

- **Partner-Pricing** (`partner-note`) — рабочее решение владельца; может
  пересматриваться (напр. если партнёрам понадобится собственный тариф).
- Цифр нет намеренно — условия «in der Pilotphase gemeinsam»; финальные
  тарифы согласуются с пилот-партнёрами.
- Роль **Verbund-Zentrale** заявлена в FAQ/Datenmodell, но глубина обзора
  для центра («sieht den Überblick») ещё не зафиксирована.
- **Familien tone: soft** — приём применён только к nav/CTA; при расширении
  может понадобиться отдельная проверка тона на всех секциях.
- `variant: "custom"` заложен в типе, но ни одной страницей пока не занят.
- Все данные — Beispieldaten.
</content>
</invoke>
