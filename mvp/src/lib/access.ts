/* Полевой доступ по ролям — ЗЕРКАЛО функции allowed_tiers() из БД
   (mvp/supabase/migrations/0003_access.sql). Источник истины — БД;
   это нужно для mock-режима и для подписей в UI. Держать синхронно! */

import type { Role, Tier, Deceased, Case, RoleView } from "./types";

export const roleLabel: Record<Role, string> = {
  bestatter: "Bestatter", familie: "Familie", krematorium: "Krematorium",
  transport: "Transport", friedhof: "Friedhof", floristik: "Floristik",
  klinik: "Klinik / Arzt", standesamt: "Standesamt", steinmetz: "Steinmetz",
  redner: "Trauerredner", verbund: "Verbund-Zentrale",
};

export const tierLabel: Record<Tier, string> = {
  kern: "Identität", org: "Persönlich", op: "Körperlich", sens: "Medizinisch",
};

/* какие поля Verstorbene относятся к какой группе */
const tierFields: Record<Tier, (keyof Deceased)[]> = {
  kern: ["vorname", "nachname"],
  org: ["geburtsdatum", "sterbedatum", "konfession", "anschrift"],
  op: ["groesse_cm", "gewicht_kg", "sargmass"],
  sens: ["herzschrittmacher", "infektionshinweis", "freigabe_einaescherung"],
};

export function allowedTiers(role: Role): Tier[] {
  switch (role) {
    case "bestatter": return ["kern", "org", "op", "sens"];
    case "familie": return ["kern", "org", "op"];
    case "krematorium": return ["kern", "op", "sens"];
    case "transport": return ["kern", "op"];
    case "friedhof": return ["kern", "org"];
    case "standesamt": return ["kern", "org"];
    case "klinik": return ["kern", "op", "sens"];
    case "verbund": return ["kern"];
    default: return []; // floristik / redner / steinmetz
  }
}

/* Verstorbene, отфильтрованная по разрешённым группам роли */
export function deceasedForRole(d: Deceased, role: Role): Partial<Deceased> {
  const tiers = new Set(allowedTiers(role));
  const out: Partial<Deceased> = {};
  (Object.keys(tierFields) as Tier[]).forEach((tier) => {
    if (!tiers.has(tier)) return;
    for (const f of tierFields[tier]) {
      const v = d[f];
      if (v !== undefined) (out as Record<string, unknown>)[f] = v;
    }
  });
  return out;
}

/* Полный Fall → роль-фильтрованный вид (зеркало get_case_for_role) */
export function caseForRole(c: Case, role: Role): RoleView {
  const isBestatter = role === "bestatter";
  return {
    ref: c.ref,
    bestattungsart: c.bestattungsart,
    phase: c.phase,
    target_date: c.target_date,
    role,
    verstorbene: deceasedForRole(c.verstorbene, role),
    beteiligte: c.beteiligte.map((p) => ({
      role: p.role,
      org: isBestatter ? p.org ?? null : null, // внутренние имена скрыты
      joined: p.joined,
    })),
    aufgaben: c.aufgaben.filter((t) => isBestatter || t.assignee === role),
    dokumente: c.dokumente
      .filter((d) => isBestatter || (d.visible_to ?? []).includes(role))
      .map((d) => ({ doc_type: d.doc_type, verified: d.verified })),
  };
}
