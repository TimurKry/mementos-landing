# Feature: Vertrauen & Ablauf (Фазы 3–5, система Monad)

Три Monad-подстраницы вне лендинга плюс новый блок на главной. Цель — чтобы
главная и весь сайт закрывали **четыре вопроса** любого посетителя (*Was ist
das · Wie funktioniert es · Ist es sicher · Wer steckt dahinter*) и снимали
главное возражение чувствительной отрасли: **доверие и DSGVO**.

Всё живёт в системе **Monad** (пергамент, Instrument Serif 400 + JetBrains
Mono). Никаких новых токенов — только существующие утилиты Monad.

## Зачем

Лендинг убедительно показывал продукт и роли, но оставлял открытыми
«как это внедрить», «что с моими данными» и «кто это делает». Для отрасли,
где данные крайне чувствительны, недосказанность про доступ/протокол/DSGVO —
это возражение, а не деталь. Фазы 3–5 закрывают их отдельными страницами и
контрастным блоком на главной, не выдумывая ни одного факта.

## Что добавлено

### 1. Блок HeuteMorgen на главной — `src/components/HeuteMorgen.tsx`

Контраст **Heute → Mit MementoOS** двумя картами. Вставлен на главной сразу
после `Why` (`src/app/page.tsx`: `Why → HeuteMorgen → ProductScene`).

- **Слева «Heute»** — нейтральная карта (`border-hair bg-card`): каскад из
  четырёх смен канала (`Familie — Anruf → Bestatter` и т.д.), под каждым —
  строка потери. Потери гасятся **stone + `line-through` + `✕`**; sienna в UI
  Monad запрещена (в отличие от Steep, где потери маркируются sienna).
- **Справа «Mit MementoOS»** — **единственная periwinkle-карта секции**
  (`bg-periwinkle`): четыре шага одного общего Fall с чек-иконкой
  (`IconCheck` в чёрном круге). Правило Monad «одна periwinkle-карта на
  страницу» соблюдено.
- Каскад анимируется через `.diagram-node` (`--node-delay`); внизу ссылка
  `arrow-shift` на `/so-funktioniert-es/`. Плашки помечены `Beispieldaten`.

### 2. Страница `/so-funktioniert-es` — `src/app/so-funktioniert-es/page.tsx`

Ответ на «Wie funktioniert es» в деталях. Структура:
- Hero `.hero-glow` + фирменная схема **`HubDiagram`** (`@/components/HubDiagram`).
- **Schritte 01–05** — путь одного Vorgang (`Der Fall entsteht` … `Abschluss
  & Archiv`), сетка карт `border-hair bg-card`, номера токеном `blue`. Три из
  пяти шагов ведут дальше: 03 → `/datenmodell/` («Wer sieht was»), 04 →
  `/workspace/`, 05 → `/demo/`.
- Секция **Umstieg** — «ruhig und ohne Bruch»: три карты (в своём темпе, рядом
  с текущим ПО, Papier/Fax bleiben möglich) + строка «in der Pilotphase
  gemeinsam».
- Финальный CTA-ряд: `Demo anfragen` (mailto) + `Demo selbst ansehen`.

### 3. Страница `/sicherheit` — `src/app/sicherheit/page.tsx`

Ответ на «Ist es sicher». Метаданные: «Datenschutz & Vertrauen».
- Hero + бейдж `Vorschau · in Entwicklung` (`live-dot`).
- **Четыре Vertrauens-Bausteine** (карты `border-hair bg-card`, иконки в
  круге):
  1. **Zugriff nach Rolle** — feldgenau, ссылка на `/datenmodell/`.
  2. **Lückenloses Protokoll** — каждое изменение/доступ/загрузка протоколируются.
  3. **DSGVO im Blick** — формулировка намеренно обтекаема: «orientiert sich
     an der DSGVO», Umfang/Auftragsverarbeitung/Löschfristen — «in der
     Pilotphase gemeinsam».
  4. **Entwickelt in Leipzig** — близость к отрасли.
- **Единственная periwinkle-карта** — дисклеймер: «Verbindliche Angaben zu
  Verträgen, Hosting und möglichen Zertifizierungen folgen mit der Pilotphase».
- Внизу: «Impressum und Datenschutzerklärung folgen».

**Дисциплина фактов (важно):** страница НЕ называет конкретного хостинг-
провайдера, юрлицо/адрес, сертификаты и сроки хранения — их ещё нет. Все
формулировки обтекаемы по требованию отрасли и юридической честности.

### 4. Страница `/ueber-uns` — `src/app/ueber-uns/page.tsx`

Ответ на «Wer steckt dahinter» — минимально и честно. Узкая колонка
(`max-w-[760px]`), hero «Aus der Praxis, mit der Branche», два абзаца
(Vorschau, entwickelt in Leipzig; «Hinter MementoOS steht Memora»), плашка
`Leipzig, Deutschland · timurkry.dev@gmail.com`, CTA + ссылка на
`/so-funktioniert-es/`, копирайт «© 2026 Memora». Никаких выдуманных команд,
инвесторов, истории.

### 5. Три новых FAQ — `src/components/Faq.tsx`

Добавлены к существующим (теперь 8 пунктов):
- «Was, wenn ein Partner nicht mitmacht?» — Link/Browser, Papier/Telefon bleibt.
- «Läuft das neben unserer bestehenden Software?» — «ersetzt nicht … in der
  Pilotphase gemeinsam».
- «Was passiert mit den Daten nach Abschluss?» — Archiv + «gesetzliche
  Vorgaben … Details in der Pilotphase» (без конкретных сроков).

### 6. Навигация и связки

- **Header** (`src/components/Header.tsx`) — 6 ссылок; якоря главной ведутся
  через `/#…` (работают и с подстраниц). Лейбл «Ablauf» → `/so-funktioniert-es/`.
  Порядок: Produkt · Ablauf · Für wen · Sicherheit · Preise · Demo. Лейблы
  короткие, чтобы ряд не переполнял планшет 768–1024.
- **Footer** (`src/components/Footer.tsx`) — в колонке «Plattform» добавлены
  «So funktioniert es» и «Sicherheit & Datenschutz»; в «Kontakt» — «Über uns».
- **Process** на главной (`src/components/Sections.tsx`) — под схемой ряд из
  трёх ссылок: `/demo/`, `/datenmodell/`, `/so-funktioniert-es/`.

## Как проверить

1. `pnpm build` — зелёный; в выводе маршруты `/so-funktioniert-es`,
   `/sicherheit`, `/ueber-uns`.
2. Главная: `Why → HeuteMorgen → …`; слева потери зачёркнуты (stone, без
   sienna), справа одна periwinkle-карта. Ссылка ведёт на `/so-funktioniert-es/`.
3. `/so-funktioniert-es`: HubDiagram в hero; шаги 01–05; переходы 03/04/05 →
   `/datenmodell/`, `/workspace/`, `/demo/`; секция Umstieg.
4. `/sicherheit`: 4 блока, «Zugriff nach Rolle» → `/datenmodell/`, одна
   periwinkle-карта-дисклеймер. Тон — ruhig, никаких конкретных гарантий.
5. `/ueber-uns`: Leipzig, Memora, контакт; ничего лишнего.
6. Header — 6 ссылок, якоря работают и с подстраниц; Footer — новые ссылки.
7. Мобилка/планшет (768): карты складываются в колонку, ряд навигации не
   переполняется.

## Факты на подтверждение владельцем перед публичным запуском

Сейчас все формулировки на `/sicherheit` и в FAQ намеренно обтекаемы —
**ничего не выдумано**. Ниже — решения владельца (2026-07) и что осталось.

- **Хостинг данных** — РЕШЕНИЕ: старт на **Supabase EU (Frankfurt)** ради
  скорости MVP → при росте переезд на **Hetzner (Deutschland)**. Оба дёшевы и
  DSGVO-дружелюбны; берём только EU-регион + **AV-Vertrag (DPA)**. Альтернатива
  среднего звена — OVHcloud/Scaleway (EU). Избегать дефолтных US-регионов
  (Vercel Postgres/Neon/Railway US, Firebase). Фронт остаётся статикой на
  GitHub Pages. На `/sicherheit` вписать конкретику («Daten in Deutschland/EU,
  AV-Vertrag verfügbar») ТОЛЬКО после фактического выбора и подписания DPA.
- **Impressum / юрлицо** — РЕШЕНИЕ: юрлица пока НЕТ, оставляем открытым.
  На сайте без изменений: «Impressum … folgt», футер «Impressum & Datenschutz
  folgen». Вписать при регистрации юрлица.
- **Сроки хранения/удаления** — НАПРАВЛЕНИЕ: активные/оперативные данные —
  ~1 год, затем минимизация/сжатие. НО публично «1 Jahr» НЕ фиксировать:
  законные минимумы почти наверняка длиннее и различаются по типу данных и
  Bundesland. Ориентиры для юр-проверки (НЕ юр-консультация):
  Rechnungen/Buchungsbelege — обычно 8–10 лет (HGB §257, AO §147);
  Bestattungs-/Einäscherungsunterlagen — часто до ~30 лет (Bestattungsgesetz
  земли); DSGVO — Datenminimierung. TODO: **Löschkonzept по типам данных**
  с юристом; юридически обязательные записи хранить по срокам или передавать
  ответственной стороне (крематорий ведёт своё Einäscherungsbuch). На сайте
  оставляем «richten sich nach den gesetzlichen Vorgaben … in der Pilotphase».
- **«Zertifizierung»** — РЕШЕНИЕ: допустимо как «folgt». Оставляем «mögliche
  Zertifizierungen folgen mit der Pilotphase».

## Известные ограничения

- Все данные и примеры — Beispieldaten; DSGVO/Verträge/Hosting не
  зафиксированы (см. раздел выше).
- `/ueber-uns` минимальна намеренно — расширять после появления команды/фактов.
- HeuteMorgen дублирует посыл Process; оба оставлены как разные ракурсы
  (контраст vs. пайплайн) — при перегрузке главной пересмотреть.
