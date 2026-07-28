"use server";

/* Server Actions der Fallkarte: Vorgang, verstorbene Person, Beteiligte,
   Aufgaben, Einladungen.

   Sie liegen bewusst hier und nicht in src/app/actions.ts: das Action-Manifest
   bindet sie damit an diese Seite des inneren Umkreises statt an jedes Bündel.

   Zu den Rechten: die Prüfung macht die Datenbank — RLS aus 0002_rls.sql
   (cases_owner, deceased_owner, participants_owner, tasks_owner) und, bei den
   Einladungen, is_case_owner innerhalb der SECURITY-DEFINER-Funktionen. Hier
   steht keine zweite, selbstgebaute Prüfung: nur Formprüfungen, damit eine
   Direkteingabe gar nicht erst an der Datenbank landet. Dass die Seite
   geschützt ist, genügt nicht — eine Server Action ist direkt aufrufbar.

   Zu den Angaben der Gruppe sens (herzschrittmacher, infektionshinweis,
   freigabe_einaescherung): sie werden nirgends protokolliert, stehen in
   keiner Fehlermeldung, in keinem Suchparameter, keiner Weiterleitung und
   keinem revalidatePath-Argument. Beanstandet die Prüfung ein Feld, nennt die
   Meldung dessen NAMEN — nie seinen Inhalt.

   Zum Token der Einladungen gilt dasselbe: er wird einmal zurückgegeben und
   lebt danach nur im Zustand der Client-Komponente. */

import { revalidatePath } from "next/cache";
import {
  addParticipant, addTask, createInvite, istKeinZugriff, removeParticipant,
  removeTask, revokeInvite, setParticipantJoined, toggleTask, updateCase,
  updateDeceased,
} from "@/lib/data";
import { istEinladbareRolle, phaseLabel, roleLabel } from "@/lib/access";
import type { Deceased, Phase, Role, Tier } from "@/lib/types";
import {
  BEREICH, Eingabefehler, GRENZEN, ausListe, jaNein, kennung, meldung,
  optDatum, optGanzzahl, optMehrzeilig, optText, pflichtText, pruefe,
} from "@/lib/eingaben";

const FEHLER_ZUGRIFF = "Für diesen Fall besteht kein Zugriff.";
const FEHLER_ROLLE = "Für diese Rolle wird kein Zugangslink ausgegeben.";
const FEHLER_TECHNIK =
  "Der Vorgang war gerade nicht möglich. Bitte in einigen Minuten erneut versuchen.";

/* Merkhilfe: freier Text des Hauses, deshalb begrenzt. */
const LABEL_MAX = 80;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PHASEN = Object.keys(phaseLabel) as Phase[];
const ROLLEN = Object.keys(roleLabel) as Role[];
const TIERS: Tier[] = ["kern", "org", "op", "sens"];

export type Ergebnis = { ok: true } | { ok: false; fehler: string };

export type ErzeugenErgebnis =
  | { ok: true; token: string }
  | { ok: false; fehler: string };

export type ZurueckziehenErgebnis = Ergebnis;

/* Ein Schreibvorgang, einheitlich abgeschlossen: Pfad des Falls auffrischen,
   Datenbankfehler in eine ruhige Auskunft übersetzen. Der Pfad enthält nur
   die Kennung — nie einen eingegebenen Wert. */
async function schreibe(caseId: string, tun: () => Promise<void>): Promise<Ergebnis> {
  try {
    await tun();
    revalidatePath(`/fall/${caseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}

/* ── Vorgang: Bestattungsart, Wunschtermin, Phase ───────────────── */

export type VorgangEingabe = {
  bestattungsart: string;
  target_date: string;
  phase: string;
};

export async function vorgangSpeichernAction(
  caseId: string,
  e: VorgangEingabe,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    bestattungsart: pflichtText("Bestattungsart", e?.bestattungsart, GRENZEN.bestattungsart),
    target_date: optDatum("Wunschtermin", e?.target_date),
    phase: ausListe("Phase", e?.phase, PHASEN),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, ...patch } = g.wert;
  return schreibe(fall, () => updateCase(fall, patch));
}

/* ── Verstorbene Person, nach Feldgruppen ────────────────────────
   Gespeichert wird immer genau eine Gruppe. Das ist keine Bequemlichkeit:
   die Gruppe ist die Grenze, an der die Datenbank später filtert — und ein
   Fehler in den medizinischen Hinweisen darf nicht verhindern, dass der Name
   gespeichert wird.

   Der Bauplan der Gruppe steht hier auf dem Server. Zusätzliche Schlüssel im
   übergebenen Objekt werden nicht gelesen: eine Direkteingabe kann über die
   Gruppe «kern» keine medizinische Angabe setzen. */
function patchDerGruppe(tier: Tier, w: Record<string, unknown>): Partial<Deceased> {
  switch (tier) {
    case "kern":
      return {
        vorname: pflichtText("Vorname", w.vorname, GRENZEN.name),
        nachname: pflichtText("Nachname", w.nachname, GRENZEN.name),
      };
    case "org": {
      const geburtsdatum = optDatum("Geburtsdatum", w.geburtsdatum);
      const sterbedatum = optDatum("Sterbedatum", w.sterbedatum);
      /* Zeichenweiser Vergleich genügt: beide Werte stehen in der Form
         JJJJ-MM-TT, die lexikalisch wie zeitlich dieselbe Ordnung hat. */
      if (geburtsdatum && sterbedatum && sterbedatum < geburtsdatum) {
        throw new Eingabefehler(
          "Sterbedatum",
          "Das Sterbedatum liegt vor dem Geburtsdatum. Bitte beide Angaben prüfen.",
        );
      }
      return {
        geburtsdatum,
        sterbedatum,
        konfession: optText("Konfession", w.konfession, GRENZEN.konfession),
        anschrift: optText("Anschrift", w.anschrift, GRENZEN.anschrift),
      };
    }
    case "op":
      return {
        groesse_cm: optGanzzahl("Größe", w.groesse_cm, ...BEREICH.groesse_cm),
        gewicht_kg: optGanzzahl("Gewicht", w.gewicht_kg, ...BEREICH.gewicht_kg),
        sargmass: optText("Sargmaß", w.sargmass, GRENZEN.sargmass),
      };
    case "sens":
      return {
        herzschrittmacher: jaNein("Herzschrittmacher", w.herzschrittmacher),
        infektionshinweis: optMehrzeilig(
          "Infektionshinweis", w.infektionshinweis, GRENZEN.infektionshinweis,
        ),
        freigabe_einaescherung: jaNein("Freigabe Einäscherung", w.freigabe_einaescherung),
      };
  }
}

export async function verstorbeneSpeichernAction(
  caseId: string,
  gruppe: string,
  werte: Record<string, unknown>,
): Promise<Ergebnis> {
  const g = pruefe(() => {
    const fall = kennung("Vorgang", caseId);
    const tier = ausListe("Feldgruppe", gruppe, TIERS);
    return { fall, patch: patchDerGruppe(tier, werte ?? {}) };
  });
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, patch } = g.wert;
  return schreibe(fall, () => updateDeceased(fall, patch));
}

/* ── Beteiligte ──────────────────────────────────────────────── */

export async function beteiligtenHinzufuegenAction(
  caseId: string,
  rolle: string,
  org: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    rolle: ausListe("Rolle", rolle, ROLLEN),
    org: pflichtText("Organisation", org, GRENZEN.org),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, rolle: r, org: o } = g.wert;
  return schreibe(fall, () => addParticipant(fall, r, o));
}

export async function beteiligtenEntfernenAction(
  caseId: string,
  beteiligtenId: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Beteiligter", beteiligtenId),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id } = g.wert;
  return schreibe(fall, () => removeParticipant(fall, id));
}

export async function beteiligtenBeitrittAction(
  caseId: string,
  beteiligtenId: string,
  beigetreten: unknown,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Beteiligter", beteiligtenId),
    joined: jaNein("Beigetreten", beigetreten),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id, joined } = g.wert;
  return schreibe(fall, () => setParticipantJoined(fall, id, joined));
}

/* ── Aufgaben ────────────────────────────────────────────────── */

export type AufgabeEingabe = {
  title: string;
  assignee: string;
  due: string;
};

/* Leere Zuständigkeit bleibt zulässig — nicht jede Aufgabe hat schon eine. */
const OHNE_ROLLE = "";

export async function aufgabeHinzufuegenAction(
  caseId: string,
  e: AufgabeEingabe,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    title: pflichtText("Aufgabe", e?.title, GRENZEN.aufgabe),
    assignee:
      (e?.assignee ?? OHNE_ROLLE) === OHNE_ROLLE
        ? null
        : ausListe("Zuständig", e.assignee, ROLLEN),
    due: optText("Frist", e?.due ?? "", GRENZEN.frist),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, ...aufgabe } = g.wert;
  return schreibe(fall, () => addTask(fall, aufgabe));
}

export async function aufgabeEntfernenAction(
  caseId: string,
  aufgabenId: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Aufgabe", aufgabenId),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id } = g.wert;
  return schreibe(fall, () => removeTask(fall, id));
}

/* Umschalten offen ↔ erledigt. Immer an das Paar (Fall, Aufgabe) gebunden —
   siehe toggleTask in src/lib/data.ts. */
export async function aufgabeUmschaltenAction(
  caseId: string,
  aufgabenId: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Aufgabe", aufgabenId),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id } = g.wert;
  return schreibe(fall, () => toggleTask(fall, id));
}

/* ── Einladungen ─────────────────────────────────────────────── */

export async function einladungErzeugenAction(
  caseId: string,
  rolle: string,
  label: string,
): Promise<ErzeugenErgebnis> {
  if (!istEinladbareRolle(rolle)) return { ok: false, fehler: FEHLER_ROLLE };

  const merk = label.trim().slice(0, LABEL_MAX) || null;

  try {
    const { token } = await createInvite(caseId, rolle, merk);
    /* Nur der Pfad des Falls — niemals der Token. */
    revalidatePath(`/fall/${caseId}`);
    return { ok: true, token };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}

/* Zurückziehen beendet in der Datenbank zugleich alle offenen Sitzungen dieser
   Einladung — der Entzug wirkt sofort, nicht erst nach Ablauf. */
export async function einladungZurueckziehenAction(
  caseId: string,
  inviteId: string,
): Promise<ZurueckziehenErgebnis> {
  if (!UUID_RE.test(inviteId)) return { ok: false, fehler: FEHLER_ZUGRIFF };

  try {
    await revokeInvite(inviteId);
    revalidatePath(`/fall/${caseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, fehler: istKeinZugriff(e) ? FEHLER_ZUGRIFF : FEHLER_TECHNIK };
  }
}
