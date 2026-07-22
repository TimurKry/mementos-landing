/* Три плана из эталона /fuer-bestatter — единый источник для всех
   Steep-страниц. Условия только текстом, без цифр (Regel: keine Preise).
   Ядро — оплата pro abgeschlossenem Fall; Abos для постоянного объёма. */

import type { PricingPlan } from "./types";

export const defaultPlans: PricingPlan[] = [
  {
    highlight: true,
    badge: "Kernmodell",
    name: "Pro Fall",
    sub: "Abrechnung je abgeschlossenem Fall",
    features: [
      "Alle Beteiligten am Fall inklusive",
      "Partner treten ohne eigene Lizenz bei",
      "Zugang für Angehörige inklusive",
      "Archiv & lückenloses Protokoll",
    ],
    condition: "Konditionen: in der Pilotphase gemeinsam festgelegt",
    cta: { label: "Demo anfragen", href: "#kontakt" },
  },
  {
    badge: "Abo",
    name: "Haus",
    sub: "Monatlich, je Standort",
    features: [
      "Unbegrenzte Fälle im Monat",
      "Alles aus dem Kernmodell",
      "Auswertungen für das Haus",
    ],
    condition: "Auf Anfrage",
    cta: { label: "Gespräch vereinbaren →", href: "#kontakt" },
  },
  {
    badge: "Abo",
    name: "Verbund",
    sub: "Für Gruppen & mehrere Standorte",
    features: [
      "Zentrale Übersicht über alle Häuser",
      "Einheitliche Abläufe im Verbund",
      "Onboarding je Standort",
    ],
    condition: "Individuell",
    cta: { label: "Gespräch vereinbaren →", href: "#kontakt" },
  },
];
