/* Полевой доступ по ролям — ЗЕРКАЛО функции app.sichtbare_felder() из БД
   (mvp/supabase/migrations/0015_rechte_je_feld.sql). Источник истины — БД:
   в live-режиме фильтрует сервер, здесь — mock-режим, подписи в UI и аудит.
   Матрица менялась только вместе с миграцией. Держать синхронно!

   С 0015 право «видеть» задано ПО ПОЛЯМ, а не по группам. Группа осталась
   заголовком бланка и записью в журнале — она больше ничего не решает.
   Причина в миграции; коротко: обещание группы, что её поля всегда ходят
   вместе, для geburtsdatum и anschrift неверно, и на этом обещании роль
   получала поле только потому, что оно лежало рядом. */

import type {
  Role, Tier, Deceased, Case, Phase, RoleView, TerminArt, TerminStatus,
  Voraussetzung, Voraussetzungsart,
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

/* Welche Rollen sehen ein bestimmtes Feld? Abgeleitet aus sichtbareFelder,
   damit Beschriftung und Filterregel nicht auseinanderlaufen können. Das Haus
   selbst (bestatter) steht nicht dabei — es sieht ohnehin alles. */
export function rollenMitFeld(feld: keyof Deceased): Role[] {
  return (Object.keys(roleLabel) as Role[])
    .filter((r) => r !== "bestatter" && sichtbareFelder(r).includes(feld));
}

function aufzaehlung(woerter: string[]): string {
  if (woerter.length <= 1) return woerter[0] ?? "";
  return `${woerter.slice(0, -1).join(", ")} und ${woerter[woerter.length - 1]}`;
}

/* Der Nachsatz gilt für jede Zeile gleichermassen und steht deshalb nur
   einmal, an der letzten. Dreimal derselbe Halbsatz liest sich wie ein
   Fehler in der Vorlage, und der Blick überspringt dann alle drei. */
const ZUGANG_NACHSATZ = " — sobald ein Zugang dieser Rolle vergeben ist.";

function empfaengerSatz(rollen: Role[], mitNachsatz: boolean): string {
  if (rollen.length === 0) return "Bleibt im Haus.";
  const namen = aufzaehlung(rollen.map((r) => roleLabel[r]));
  return `Sichtbar für ${namen}${mitNachsatz ? ZUGANG_NACHSATZ : "."}`;
}

/* Der Hinweis unter der Überschrift einer Feldgruppe im Erfassungsbogen.
   Bis 0015 war das ein Satz je Gruppe, weil eine Gruppe einen Empfängerkreis
   hatte. Das gilt nicht mehr: Geburts- und Sterbedatum sieht der Steinmetz,
   Konfession und Anschrift in derselben Gruppe nicht.

   Deshalb wird nach gleichem Empfängerkreis zusammengefasst — ein Satz je
   Kreis, und die Felder davor genannt, sobald es mehr als einen gibt. Bleibt
   es bei einem, sieht der Bogen aus wie vorher.

   Nebeneffekt, der erwünscht ist: eine Gruppe, die in vier Kreise zerfällt,
   sieht im Bogen unruhig aus. Das ist dann keine Gestaltungsfrage, sondern
   der Hinweis, dass diese Gruppierung nicht mehr die Wirklichkeit abbildet. */
export function sichtbarFuerGruppe(tier: Tier): { felder: string; satz: string }[] {
  const kreise: { schluessel: string; rollen: Role[]; felder: (keyof Deceased)[] }[] = [];

  for (const feld of tierFields[tier]) {
    const rollen = rollenMitFeld(feld);
    const schluessel = rollen.join("|");
    const vorhanden = kreise.find((k) => k.schluessel === schluessel);
    if (vorhanden) vorhanden.felder.push(feld);
    else kreise.push({ schluessel, rollen, felder: [feld] });
  }

  const einzig = kreise.length === 1;
  const letzterMitRollen = kreise.map((k) => k.rollen.length > 0).lastIndexOf(true);

  return kreise.map((k, i) => ({
    felder: einzig ? "" : aufzaehlung(k.felder.map((f) => feldLabel[f])),
    satz: empfaengerSatz(k.rollen, i === letzterMitRollen),
  }));
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

   Bemerkenswert an der oberen Matrix: Floristik und Redner sehen nach
   sichtbareFelder von der verstorbenen Person NICHTS — kein Name, kein Datum.
   Zeit und Ort der Trauerfeier brauchen sie trotzdem, sonst wissen sie nicht,
   wohin die Blumen sollen. Der Termin gibt ihnen genau das und kein Feld mehr
   über den Menschen.

   Der Steinmetz stand bis 0015 in derselben Zeile und konnte deshalb keinen
   Stein beschriften. Er sieht jetzt vier Felder: die beiden Namen und die
   beiden Lebensdaten — genau das, was eingemeisselt wird.

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

/* ── Die fünfte Matrix: Voraussetzungen je Terminart ─────────────
   Spiegel von app.voraussetzungen_fuer_termin aus 0017_voraussetzungen.sql.

   ACHTUNG — JEDE ZEILE DIESER MATRIX IST EINE ANNAHME. Keine ist von einem
   Bestatter bestätigt. Die Begründung je Zeile steht im Kopf der Migration
   und nicht hier: sie gehört zu der Regel, die wirklich prüft.

   Zwei Eigenschaften des Mechanismus, die man dem Code sonst nicht ansieht:

   1) Nur eine ERFASSTE Voraussetzung blockiert. Eine fehlende Zeile hält
      nichts auf — sonst hätte die Migration jeden bestehenden Vorgang von
      selbst angehalten, auf Grundlage einer Liste, die niemand bestätigt hat.
   2) Blockiert wird ausschliesslich der äussere Umkreis. Das Haus sieht den
      Blocker und entscheidet selbst; die Datenbank fährt ihm nicht dazwischen.

   Beide Entscheidungen sind mit der Liste zusammen neu zu bewerten. */

export const voraussetzungsartLabel: Record<Voraussetzungsart, string> = {
  todesbescheinigung: "Todesbescheinigung",
  zweite_leichenschau: "Zweite Leichenschau",
  grabstelle: "Grabstelle",
};

/* Ein Satz je Art, damit im Bogen nicht geraten wird, was gemeint ist. */
export const voraussetzungsartHinweis: Record<Voraussetzungsart, string> = {
  todesbescheinigung: "Ärztliche Bescheinigung des Todes",
  zweite_leichenschau: "Zweite Leichenschau vor einer Feuerbestattung",
  grabstelle: "Vergebene und bestätigte Grabstelle",
};

export const VORAUSSETZUNGS_ARTEN = Object.keys(voraussetzungsartLabel) as Voraussetzungsart[];

/* Welche Voraussetzungen braucht eine Terminart? Abholung, Trauerfeier und
   Abschiednahme stehen bewusst mit leerer Liste da — auch das ist eine
   Annahme, nur eine, die zu keiner Blockade führt. */
export function voraussetzungenFuerTermin(art: TerminArt): Voraussetzungsart[] {
  switch (art) {
    case "ueberfuehrung": return ["todesbescheinigung"];
    case "einaescherung": return ["zweite_leichenschau"];
    case "beisetzung": return ["grabstelle"];
    default: return []; // abholung, trauerfeier, abschiednahme
  }
}

/* Umgekehrt: welche Termine hält eine Voraussetzung auf? Abgeleitet, nicht
   gepflegt — die Beschriftung im Bogen kann so nicht von der Regel abweichen.
   Ohne diesen Satz wäre «Grabstelle» im Bogen eine Zeile ohne Wirkung, und
   niemand wüsste, warum er sie erfassen soll. */
export function terminartenFuerVoraussetzung(art: Voraussetzungsart): TerminArt[] {
  return TERMIN_ARTEN.filter((t) => voraussetzungenFuerTermin(t).includes(art));
}

/* Spiegel von app.offene_voraussetzungen: was diese Terminart braucht, im
   Vorgang erfasst ist und noch nicht erfüllt. Alle drei Bedingungen zusammen.

   Die mittlere ist die entscheidende: `erfasst` enthält nur, was das Haus für
   diesen Vorgang eingetragen hat. Was nicht darin steht, blockiert nicht. */
export function offeneVoraussetzungen(
  art: TerminArt,
  erfasst: Voraussetzung[],
): Voraussetzungsart[] {
  const noetig = voraussetzungenFuerTermin(art);
  return erfasst
    .filter((v) => !v.erfuellt && noetig.includes(v.art))
    .map((v) => v.art)
    .sort((a, b) => VORAUSSETZUNGS_ARTEN.indexOf(a) - VORAUSSETZUNGS_ARTEN.indexOf(b));
}

/* ── Schreibmatrix: welche Felder darf eine Rolle ÄNDERN ─────────
   Spiegel von app.felder_schreibbar aus 0012_angaben_der_familie.sql.

   Die vierte Matrix und die heikelste. Sehen und ändern fallen auch hier
   auseinander: die Familie SIEHT nach sichtbareFelder neun Felder — ändern
   darf sie davon fünf. Sargmass und Gewicht misst das Bestattungshaus, nicht
   die Tochter der Verstorbenen.

   Umgekehrt gilt seit 0015 eine harte Regel, die die Migration auch prüft:
   Schreiben setzt Sehen voraus. Wer den bisherigen Wert nicht kennt,
   überschreibt still die Arbeit eines anderen.

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

/* Поле → группа. Зеркало app.feld_gruppe (0015). Группа больше не решает,
   кто что видит — она задаёт заголовки бланка и запись в журнале. */
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

/* DIE Matrix. Spiegel von app.sichtbare_felder (0015). Neben jeder Rolle steht
   in der Migration, WOFÜR sie das Feld braucht — dort und nicht hier, damit die
   Begründung bei der Regel steht, die wirklich filtert.

   Wer hier ein Feld hinzufügt, ohne die Migration zu ändern, öffnet nichts:
   der Server filtert weiter nach seiner eigenen Liste. Umgekehrt schon. Die
   beiden dürfen nur gemeinsam wandern. */
export function sichtbareFelder(role: Role): (keyof Deceased)[] {
  switch (role) {
    case "bestatter":
      return ["vorname", "nachname",
              "geburtsdatum", "sterbedatum", "konfession", "anschrift",
              "groesse_cm", "gewicht_kg", "sargmass",
              "herzschrittmacher", "infektionshinweis", "freigabe_einaescherung"];
    case "familie":
      return ["vorname", "nachname",
              "geburtsdatum", "sterbedatum", "konfession", "anschrift",
              "groesse_cm", "gewicht_kg", "sargmass"];
    case "krematorium":
      return ["vorname", "nachname", "sterbedatum",
              "groesse_cm", "gewicht_kg", "sargmass",
              "herzschrittmacher", "infektionshinweis", "freigabe_einaescherung"];
    case "transport":
      return ["vorname", "nachname",
              "groesse_cm", "gewicht_kg", "sargmass", "infektionshinweis"];
    case "friedhof":
      return ["vorname", "nachname",
              "geburtsdatum", "sterbedatum", "konfession", "anschrift",
              "gewicht_kg", "sargmass"];
    case "standesamt":
      return ["vorname", "nachname",
              "geburtsdatum", "sterbedatum", "konfession", "anschrift"];
    case "klinik":
      return ["vorname", "nachname",
              "groesse_cm", "gewicht_kg", "sargmass",
              "herzschrittmacher", "infektionshinweis", "freigabe_einaescherung"];
    case "steinmetz":
      return ["vorname", "nachname", "geburtsdatum", "sterbedatum"];
    case "verbund":
      return ["vorname", "nachname"];
    default:
      return []; // floristik, redner — Zeit und Ort über die Termine
  }
}

/* Abgeleitet, nicht gepflegt: eine Rolle «hält» eine Gruppe, wenn sie
   mindestens ein Feld daraus sieht. Reihenfolge wie im Bogen, nicht
   alphabetisch. Spiegel von app.allowed_tiers (0015), das dort ebenfalls
   abgeleitet ist. */
export function allowedTiers(role: Role): Tier[] {
  const felder = new Set(sichtbareFelder(role));
  return (Object.keys(tierFields) as Tier[])
    .filter((tier) => tierFields[tier].some((f) => felder.has(f)));
}

/* Verstorbene, отфильтрованная по разрешённым ПОЛЯМ роли. Whitelist, а не
   blacklist: новое поле не видит никто, пока оно не внесено в матрицу. */
export function deceasedForRole(d: Deceased, role: Role): Partial<Deceased> {
  const out: Partial<Deceased> = {};
  for (const f of sichtbareFelder(role)) {
    const v = d[f];
    if (v !== undefined) (out as Record<string, unknown>)[f] = v;
  }
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
      .map((d) => ({ id: d.id, doc_type: d.doc_type, verified: d.verified })),
    /* Gefiltert nach Terminart, sortiert nach Beginn — Termine ohne Zeit ans
       Ende. zustaendig bleibt draussen: es ist eine Notiz des Hauses.
       darf_bestaetigen kommt je Zeile mit, wie in app.case_for_role.

       blockiert_durch ebenso (0017), und ebenso je Zeile: nach aussen geht
       die ART der offenen Voraussetzung, nie die Notiz des Hauses dazu und
       nie eine Voraussetzung, die zu einem Termin gehört, den diese Rolle
       gar nicht sieht. */
    termine: c.termine
      .filter((t) => termineFuerRolle(role).includes(t.art))
      .slice()
      .sort(nachBeginn)
      .map(({ zustaendig: _egal, ...t }) => ({
        ...t,
        darf_bestaetigen: darfBestaetigen(role, t.art),
        blockiert_durch: offeneVoraussetzungen(t.art, c.voraussetzungen),
      })),
  };
}
