# Компоненты демо-потока (/demo)

Мини-документация по дисциплине design-system: каждый новый компонент — с вариантами, состояниями и правилами. Токены — в `src/app/globals.css` (`@theme`).

## Pill — статусная метка

| Вариант (tone) | Цвет | Когда |
|---|---|---|
| `wald` | #3E5C41 на #E7ECE5 | подтверждено / выполнено |
| `ocker` | #8F6A24 на #F1EADA | ожидает |
| `terra` | #8F4527 на #F2E4DD | требует действия |
| `stone` | серый, без заливки | нейтрально / архив |

Правила: uppercase 11px, tracking .12em, прямые углы, всегда рядом с сущностью, к которой относится. Цвет — только статус, никогда украшение.

## Stepper — шаги демо

Состояния шага: `done` (заливка wald, ✓), `current` (заливка ink), `upcoming` (контур hair, некликабелен). Пройденные шаги кликабельны (возврат). `aria-current="step"` на текущем. Номера в «нарисованных» кружках (irregular radius).

## PrimaryBtn / GhostBtn

Состояния: default, hover (сдвиг -1px по обеим осям), focus-visible (outline 2px ink), disabled (opacity .4, без hover-сдвига). Primary — единственный сплошной чёрный элемент на экране; hatch-тень только у primary.

## Field

Label: uppercase 11px tracking .18em цвет stone. Input: рамка hair → ink на focus-visible, фон прозрачный, прямые углы. Ошибок в демо нет — валидация мягкая (кнопка disabled + подсказка).

## Переход шагов

`.step-in`: fade + translateY(10px), 280ms ease-out, по `key={step}`. При `prefers-reduced-motion` анимация отключается глобально.

## Правило данных

Все данные демо — вымышленные и помечены («Testversion · Beispieldaten»). Реальные имена, метрики и клиенты в демо не появляются.
