/* Единый тип аудитории (Steep). Один объект описывает страницу
   /fuer-* целиком: hero-коллаж, три fog-карты, сценарий, ablauf-шаги,
   опциональная цитата, прайсинг и FAQ. Все виды артефактов и все три
   вида сценария заложены сразу — Фаза 1 добавляет только данные.
   Данные в мокапах — Beispieldaten. */

import type { PricingSpec } from "../pricing/types";

/* ── плавающие продукт-артефакты hero ──────────────────────── */

export type ArtifactSpec =
  | {
      kind: "list";
      title: string;
      badge?: string;
      width?: number;
      rows: { primary: string; secondary?: string; status: string; done: boolean }[];
    }
  | {
      kind: "checklist";
      title: string;
      width?: number;
      items: { label: string; done: boolean }[];
      foot?: string;
    }
  | {
      /* жестовое кольцо: ratio 0..1 заполнения, штрих sienna */
      kind: "ring";
      title: string;
      width?: number;
      value: string;
      label: string;
      ratio: number;
    }
  | { kind: "composer"; width?: number; placeholder: string };

/* ── сценарий: три взаимозаменяемых вида ────────────────────── */

/* loss — сравнительная схема потерь информации (heute + опц. mit) */
export type LossStep = { from: string; via: string; to: string; loss: string };
export type MitStep = { title: string; text: string };

/* board — канбан offen / in Arbeit / erledigt */
export type BoardTask = { label: string; meta: string };
export type BoardColumnSpec = {
  title: string;
  state: "open" | "doing" | "done";
  tasks: BoardTask[];
};

/* access — что видит роль / что остаётся скрытым (для Familien) */
export type AccessRow = { label: string; note?: string };

export type ScenarioBlock =
  | {
      view: "loss";
      heading: string;
      headingEm: string;
      sub?: string;
      badge?: string;
      heute: LossStep[];
      mit?: MitStep[];
      foot?: string;
    }
  | {
      view: "board";
      heading: string;
      headingEm: string;
      sub?: string;
      columns: BoardColumnSpec[];
      foot?: string;
    }
  | {
      view: "access";
      heading: string;
      headingEm: string;
      sub?: string;
      visible: AccessRow[];
      hidden: AccessRow[];
      link?: { label: string; href: string };
    };

/* ── прочие блоки ───────────────────────────────────────────── */

export type WarumCard = {
  tag: string;
  title: string;
  text: string;
  href: string;
  link: string;
};

export type Step = { title: string; text: string };

export type FaqItem = { q: string; a: string };

export type HeroSpec = {
  kicker?: string;
  headlineLead: string;
  headlineEm: string;
  headlineTail?: string;
  sub: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  artifacts: ArtifactSpec[];
};

export type AudienceData = {
  slug: string;
  meta: { title: string; description: string };
  navLabel: string;
  /* soft → тихий тон без напористых CTA (для Familien) */
  tone?: "default" | "soft";
  hero: HeroSpec;
  warum: { heading: string; headingEm: string; sub?: string; cards: WarumCard[] };
  szenario: ScenarioBlock;
  ablauf: { heading: string; headingEm: string; sub?: string; steps: Step[] };
  quote?: { text: string; textEm: string; source: string };
  pricing: PricingSpec | null;
  faq: FaqItem[];
  cta: { heading: string; sub: string; mailSubject: string };
};
