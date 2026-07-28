/* Полевой доступ по ролям — ЗЕРКАЛО функции app.allowed_tiers() из БД
   (mvp/supabase/migrations/0004_hardening.sql). Источник истины — БД:
   в live-режиме фильтрует сервер, здесь — mock-режим, подписи в UI и аудит.
   Матрица tier'ов менялась только вместе с миграцией. Держать синхронно! */

import type {
  Role, Tier, Deceased, Case, Phase, RoleView, TerminArt, TerminStatus,
} from "./types";

/* Phasen eines Vorgangs — eine Beschriftung für alle Bildschirme
   (Arbeitsbereich und Plattform-Übersicht). */
export const phaseLabel: Record<Phase, string> = {
  neu: "Neu", unterlagen: "Unterlagen", bestaetigt: "Bestätigt",
  durchfuehrung: "Durchführung", abschluss: "Abschluss",
};

export const roleLabel: Record<Role, string> = {
  bestatter: "Bestatter", familie: "Familie", krematorium: "Krematorium",
  transport: "Transport", friedhof: "Friedhof", floristik: "Floristik",
  klinik: "Klinik / Arzt", standesamt: "Standesamt", steinmetz: "Steinmetz",
  redner: "Trauerredner", verbund: "Verbund-Zentrale",
};

export const tierLabel: Record<Tier, string> = {
  kern: "Identität", org: "Persönlich", op: "Körperlich", sens: "Medizinisch",
};

/* Überschriften der Feldgruppen im Erfassungsbogen. Die Gruppierung ist keine
   Zierde: sie ist genau die Grenze, an der die Datenbank filtert. Wer die
   Gruppe kennt, weiss, wer die Angabe später zu sehen bekommt. */
export const tierGruppenTitel: Record<Tier, string> = {
  kern: "Identität",
  org: "Persönliche Angaben",
  op: "Körperliche Angaben",
  sens: "Medizinische Hinweise",
};

/* Welche Rollen sehen eine Feldgruppe? Abgeleitet aus allowedTiers, damit
   Beschriftung und Filterregel nicht auseinanderlaufen können. Das Haus
   selbst (bestatter) steht nicht dabei — es sieht ohnehin alles. */
export function rollenMitTier(tier: Tier): Role[] {
  return (Object.keys(roleLabel) as Role[])
    .filter((r) => r !== "bestatter" && allowedTiers(r).includes(tier));
}

function aufzaehlung(woerter: string[]): string {
  if (woerter.length <= 1) return woerter[0] ?? "";
  return `${woerter.slice(0, -1).join(", ")} und ${woerter[woerter.length - 1]}`;
}

/* Ein Satz für den Bogen: wer diese Gruppe zu sehen bekommt, sobald ein
   Zugang dieser Rolle vergeben ist. */
export function sichtbarFuerText(tier: Tier): string {
  const namen = rollenMitTier(tier).map((r) => roleLabel[r]);
  if (namen.length === 0) return "Bleibt im Haus.";
  return `Sichtbar für ${aufzaehlung(namen)} — sobald ein Zugang dieser Rolle vergeben ist.`;
}

/* Rollen, für die ein Einladungslink ausgegeben werden darf — Spiegel der
   Prüfregel invites_role_not_bestatter (0004_hardening.sql). «bestatter» fehlt
   hier absichtlich: ein solcher Link wäre ein Zugang ohne Konto mit dem vollen
   Blick des Hauses. Die Datenbank lehnt ihn ohnehin ab; die Oberfläche bietet
   ihn gar nicht erst an. */
export const einladbareRollen: Role[] = (Object.keys(roleLabel) as Role[])
  .filter((r) => r !== "bestatter");

/* Prüfung für die Server Action: sie ist direkt aufrufbar, nicht nur über das
   Formular. Die harte Grenze bleibt die Datenbank. */
export function istEinladbareRolle(value: unknown): value is Role {
  return typeof value === "string" && (einladbareRollen as string[]).includes(value);
}

/* ── Termine: zwei Matrizen, nicht eine ──────────────────────────
   Spiegel von app.termine_fuer_rolle und app.darf_bestaetigen aus
   0011_termine.sql. Sehen und ändern sind verschiedene Rechte und fallen hier
   bewusst auseinander: eine Floristik sieht die Trauerfeier, bestätigen kann
   sie sie nicht. Ein Krematorium sieht die Überführung, bestätigt aber nur die
   Einäscherung.

   Bemerkenswert an der oberen Matrix: Floristik, Redner und Steinmetz sehen
   nach allowedTiers von der verstorbenen Person NICHTS — kein Name, kein
   Datum. Das bleibt so. Zeit und Ort der Trauerfeier brauchen sie trotzdem,
   sonst wissen sie nicht, wohin die Blumen sollen. Der Termin gibt ihnen genau
   das und kein Feld mehr über den Menschen.

   Beide Matrizen gehören zur Migration und dürfen nur zusammen mit ihr
   wandern. Die harte Grenze bleibt die Datenbank. */

export const terminArtLabel: Record<TerminArt, string> = {
  abholung: "Abholung",
  ueberfuehrung: "Überführung",
  einaescherung: "Einäscherung",
  trauerfeier: "Trauerfeier",
  beisetzung: "Beisetzung",
  abschiednahme: "Abschiednahme",
};

/* Was an der Terminart hängt — ein Satz, damit im Bogen nicht geraten wird,
   wofür «Überführung» steht. */
export const terminArtHinweis: Record<TerminArt, string> = {
  abholung: "Abholung der verstorbenen Person",
  ueberfuehrung: "Fahrt zum Krematorium oder zur Kühlung",
  einaescherung: "Im Krematorium",
  trauerfeier: "Feier mit den Angehörigen",
  beisetzung: "Grab oder Urnenbeisetzung",
  abschiednahme: "Abschied der Angehörigen am Sarg",
};

export const terminStatusLabel: Record<TerminStatus, string> = {
  geplant: "geplant", bestaetigt: "bestätigt",
  erledigt: "erledigt", abgesagt: "abgesagt",
};

export const TERMIN_ARTEN = Object.keys(terminArtLabel) as TerminArt[];
export const TERMIN_STATUS = Object.keys(terminStatusLabel) as TerminStatus[];

/* Welche Terminarten sieht eine Rolle? */
export function termineFuerRolle(role: Role): TerminArt[] {
  switch (role) {
    case "bestatter":
      return ["abholung", "ueberfuehrung", "einaescherung",
              "trauerfeier", "beisetzung", "abschiednahme"];
    case "transport": return ["abholung", "ueberfuehrung"];
    case "krematorium": return ["ueberfuehrung", "einaescherung"];
    case "friedhof": return ["beisetzung"];
    case "familie": return ["abholung", "abschiednahme", "trauerfeier", "beisetzung"];
    case "klinik": return ["abholung"];
    case "floristik": return ["trauerfeier", "beisetzung"];
    case "redner": return ["trauerfeier"];
    case "steinmetz": return ["beisetzung"];
    default: return []; // standesamt, verbund
  }
}

/* Wer darf welchen Termin bestätigen? Gilt nur für Eingeladene ohne Konto —
   der Eigentümer pflegt seine Termine ohnehin direkt. */
export function darfBestaetigen(role: Role, art: TerminArt): boolean {
  switch (role) {
    case "transport": return art === "abholung" || art === "ueberfuehrung";
    case "krematorium": return art === "einaescherung";
    case "friedhof": return art === "beisetzung";
    default: return false;
  }
}

/* Reihenfolge wie in der Datenbank: «order by von asc nulls last». Ein Termin
   ohne Zeit steht am Ende, nicht am Anfang — er ist noch nicht verabredet. */
export function nachBeginn(a: { von?: string | null }, b: { von?: string | null }): number {
  if (!a.von && !b.von) return 0;
  if (!a.von) return 1;
  if (!b.von) return -1;
  return a.von < b.von ? -1 : a.von > b.von ? 1 : 0;
}

/* Ein Satz für den Bogen: wer diesen Termin zu sehen bekommt. Aus der Matrix
   abgeleitet, damit Beschriftung und Filter nicht auseinanderlaufen. */
export function terminSichtbarFuerText(art: TerminArt): string {
  const namen = (Object.keys(roleLabel) as Role[])
    .filter((r) => r !== "bestatter" && termineFuerRolle(r).includes(art))
    .map((r) => roleLabel[r]);
  if (namen.length === 0) return "Bleibt im Haus.";
  return `Sichtbar für ${aufzaehlung(namen)} — sobald ein Zugang dieser Rolle vergeben ist.`;
}

/* ── Schreibmatrix: welche Felder darf eine Rolle ÄNDERN ─────────
   Spiegel von app.felder_schreibbar aus 0012_angaben_der_familie.sql.

   Die vierte Matrix und die heikelste. Sehen und ändern fallen auch hier
   auseinander: die Familie SIEHT nach allowedTiers die Gruppen kern, org und
   op — ändern darf sie davon nur einen Teil. Sargmass und Gewicht misst das
   Bestattungshaus, nicht die Tochter der Verstorbenen.

   sterbedatum fehlt absichtlich: es steht in der Todesbescheinigung. Was aus
   einer Urkunde kommt, wird nicht aus dem Gedächtnis überschrieben.

   Die Klinik hat bewusst kein Schreibrecht auf die Gruppe sens — die
   Begründung steht im Kopf der Migration. */
export function felderSchreibbar(role: Role): (keyof Deceased)[] {
  switch (role) {
    case "familie":
      return ["vorname", "nachname", "geburtsdatum", "konfession", "anschrift"];
    default:
      return [];
  }
}

/* Alle Felder, die überhaupt je von aussen beschreibbar sind — die Formhürde
   der Server Action. Welche davon eine konkrete Rolle darf, entscheidet die
   Datenbank; hier wird nur verhindert, dass ein Direktaufruf ein Feld
   mitschickt, das für keine Rolle vorgesehen ist. */
export const VON_AUSSEN_SCHREIBBAR: (keyof Deceased)[] = [
  ...new Set(
    (Object.keys(roleLabel) as Role[]).flatMap((r) => felderSchreibbar(r)),
  ),
];

/* Beschriftungen der Felder — ein Wortschatz für beide Umkreise. Stand
   vorher zweimal da, im Arbeitsbereich und in der Ansicht der Eingeladenen. */
export const feldLabel: Record<keyof Deceased, string> = {
  vorname: "Vorname", nachname: "Nachname",
  geburtsdatum: "Geburtsdatum", sterbedatum: "Sterbedatum",
  konfession: "Konfession", anschrift: "Anschrift",
  groesse_cm: "Größe (cm)", gewicht_kg: "Gewicht (kg)", sargmass: "Sargmaß",
  herzschrittmacher: "Herzschrittmacher", infektionshinweis: "Infektionshinweis",
  freigabe_einaescherung: "Freigabe Einäscherung",
};

/* какие поля Verstorbene относятся к какой группе */
const tierFields: Record<Tier, (keyof Deceased)[]> = {
  kern: ["vorname", "nachname"],
  org: ["geburtsdatum", "sterbedatum", "konfession", "anschrift"],
  op: ["groesse_cm", "gewicht_kg", "sargmass"],
  sens: ["herzschrittmacher", "infektionshinweis", "freigabe_einaescherung"],
};

/* Zu welcher Gruppe gehört ein Feld — für Beschriftungen und Audit. */
export function tierOfField(field: keyof Deceased): Tier | null {
  for (const tier of Object.keys(tierFields) as Tier[]) {
    if (tierFields[tier].includes(field)) return tier;
  }
  return null;
}

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
    schreibbar: felderSchreibbar(role),
    beteiligte: c.beteiligte.map((p) => ({
      role: p.role,
      org: isBestatter ? p.org ?? null : null, // внутренние имена скрыты
      joined: p.joined,
    })),
    aufgaben: c.aufgaben.filter((t) => isBestatter || t.assignee === role),
    dokumente: c.dokumente
      .filter((d) => isBestatter || (d.visible_to ?? []).includes(role))
      .map((d) => ({ doc_type: d.doc_type, verified: d.verified })),
    /* Gefiltert nach Terminart, sortiert nach Beginn — Termine ohne Zeit ans
       Ende. zustaendig bleibt draussen: es ist eine Notiz des Hauses.
       darf_bestaetigen kommt je Zeile mit, wie in app.case_for_role. */
    termine: c.termine
      .filter((t) => termineFuerRolle(role).includes(t.art))
      .slice()
      .sort(nachBeginn)
      .map(({ zustaendig: _egal, ...t }) => ({
        ...t,
        darf_bestaetigen: darfBestaetigen(role, t.art),
      })),
  };
}
