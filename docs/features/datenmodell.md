# Feature: Datenmodell & Zugriff (/datenmodell)

Страница-схема доступа к данным MementoOS: показывает, кто какие данные
**создаёт/пишет** и кто какие **поля читает** — feldgenau (по группам полей).
Формат — ER-диаграмма (таблицы-сущности как в БД) со стрелками.

## Зачем

Ролевые дашборды невозможно строить без явной модели доступа. Эта страница —
источник истины «кто что видит и меняет», в стилистике Monad, пригодна для
показа клиенту. После согласования по ней строятся CRM-виды каждой роли.

## Маршрут и связки

- Страница: `src/app/datenmodell/page.tsx` → `/datenmodell/`.
- В навигации (`Header.tsx`) пункт **Zugriff**; в футере — **Datenmodell & Zugriff**.
- На главной — тизер-секция `AccessTeaser` (между ValueBand и Audiences):
  «одно событие — две сихты» (Bestatter видит всё, Familie — отфильтровано)
  со ссылкой на полную схему.

## Как устроена схема

Визуальный язык (референс — «Default/Monad» ER-стиль):
- **Чёрная стрелка** `↦` + подпись = кто **пишет/создаёт** запись.
- **Синяя пунктирная стрелка** `⇥` = кто **читает** (доступ).
- Поля таблицы сгруппированы по **уровню чувствительности** (tier), каждый
  со своим цветовым ключом:
  - `kern` (Identität) — чёрный
  - `org` (Organisatorisch) — золотой `#ecda98`
  - `op` (Operativ) — персиковый `#f0a17a`
  - `sens` (Sensibel) — sienna `#5d2a1a`
- У читающей роли перечислены доступные группы (ключ + подпись); недоступные
  перечёркнуты серым. Это и есть feldgenau-доступ.

## Данные — `src/components/datamodel/data.ts`

Единый типизированный источник. Всё — Beispieldaten/Entwurf.

- `roles` — 11 участников: bestatter, familie, krematorium, transport,
  friedhof, floristik, klinik, standesamt, steinmetz, redner, verbund.
- `entities` — 10 сущностей-таблиц по 4 разделам (`sections`): Stammdaten,
  Ablauf, Partner, Kaufmännisch. У каждой: `groups` (поля по tier),
  `writers` (WriteAccess), `readers` (ReadAccess по группам с флагом `on`).
- `documents` — ACL-строки для таблицы «Dokumente» (кто загрузил / кому видно).

Сущности: Verstorbene Person, Auftraggeber, Dokumente (ACL), Bestattung &
Wünsche, Termine, Transport-Auftrag, Krematoriums-Auftrag, Friedhof·Grab,
Floristik-Auftrag, Kommerzielles, Prozess·Protokoll.

`kind: "diagram"` → флагман со стрелками (Verstorbene Person, Transport-Auftrag).
`kind: "card"` → компактный вид (таблица + блоки записи/чтения). Документы —
отдельный вид `DocTable`.

## Компоненты — `src/components/datamodel/`

- `ui.tsx` — `roleIcon` (карта ролей→иконки), `GroupKey`, `RoleHead`,
  `RoleIcon`, `EntityTable` (таблица-сущность), `ReadKeys` (группы чтения).
- `EntityDiagram.tsx` — **клиентский**: рисует SVG-стрелки по факту вёрстки
  (пишущие слева → таблица → читающие справа), пересчёт на resize/ResizeObserver.
  На `<=940px` SVG прячется, колонки складываются вертикально (↦/⇥ в подписях).
- `EntityCard.tsx` — компактная сущность (таблица + запись/чтение).
- `DocTable.tsx` — ACL-таблица документов + правило хранения.

## Стили — `src/app/globals.css`

Блок «Datenmodell / ER» (перед FAQ): `.dm-table`, ключи групп `.dm-key-*`,
полосы рядов `.dm-row-*`, слой связей `.dm-wires`, каскад `.dm-node`.
Цвета групп заданы хексами намеренно (диаграммная иллюстрация), акцент чтения —
токен `blue` (#2b59d1), запись — `ink`.

## Иконки — `src/components/icons.tsx`

Добавлены: IconKlinik, IconBehoerde (Standesamt), IconSteinmetz, IconRedner,
IconVerbund, IconEuro (в стиле служебных Line-иконок).

## Как проверить

1. `pnpm build` — зелёный, маршрут `/datenmodell` в выводе.
2. `/datenmodell/`: hero с легендой → 11 ролей → 4 раздела с сущностями.
   Диаграммы Person и Transport показывают SVG-стрелки на десктопе.
3. Мобильный (390px): стрелки скрыты, всё складывается в колонку.
4. Главная: тизер «feldgenau» ведёт на страницу; пункт Zugriff в навигации.

## Известные ограничения / открытые вопросы

- Доступ показан по группам полей; исключения на уровне отдельного поля пока
  не выделены (см. «Offene Punkte» на странице).
- Klinik/Arzt и Standesamt как пишущие роли — черновик, требует подтверждения.
- Роль Verbund-Zentrale заявлена, но не раскрыта отдельной сущностью.
- Значения — Beispieldaten; финальная модель согласуется с пилот-партнёрами.
