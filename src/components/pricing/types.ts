/* Общий прайсинг-словарь (Steep). Один спек покрывает три случая:
   full — три карты (Kernmodell приподнят), partner-note — одна карта
   «Beitritt ohne Lizenz», custom — заголовок + произвольные планы.
   Никаких цифр: условия только текстом («in der Pilotphase gemeinsam»
   / «Auf Anfrage» / «Individuell»). */

export type PricingPlan = {
  highlight?: boolean; // приподнятая карта (.artifact) — единственная
  badge: string; // «Kernmodell» / «Abo»
  name: string; // «Pro Fall» / «Haus» / «Verbund»
  sub: string; // подзаголовок карты
  features: string[]; // пункты с чек-маркерами
  condition: string; // условие текстом, без цифр
  cta: { label: string; href: string };
};

export type PricingSpec = {
  variant: "full" | "partner-note" | "custom";
  heading: string;
  headingEm: string; // курсивная вставка в заголовке
  sub?: string;
  roleLabel?: string; // контекст-подпись для роли (напр. Verbund/Partner)
  note?: string; // текст карты для partner-note / custom
  plans?: PricingPlan[]; // full/custom; если не задано — defaultPlans
  foot?: string; // тихая сноска под секцией
};
