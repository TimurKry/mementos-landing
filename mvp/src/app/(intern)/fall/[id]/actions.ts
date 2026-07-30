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
  addParticipant, addTask, addTermin, addVoraussetzung, createInvite,
  istKeinZugriff, removeParticipant, removeTask, removeTermin,
  removeVoraussetzung, revokeInvite, setParticipantJoined,
  setVoraussetzungErfuellt, toggleTask, updateCase, updateDeceased,
  updateTermin, updateVoraussetzung,
} from "@/lib/data";
import {
  TERMIN_ARTEN, TERMIN_STATUS, VORAUSSETZUNGS_ARTEN, istEinladbareRolle,
  phaseLabel, roleLabel,
} from "@/lib/access";
import type { Deceased, Phase, Role, Tier } from "@/lib/types";
import {
  BEREICH, Eingabefehler, GRENZEN, ausListe, jaNein, kennung, meldung,
  optDatum, optGanzzahl, optMehrzeilig, optText, pflichtText, pruefe,
  zeitfensterGeprueft,
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

/* ── Termine ─────────────────────────────────────────────────────
   Ort und Hinweis sind freier Text und deshalb begrenzt. Zeitpunkte kommen
   als Wanduhrzeit aus dem Formular und gehen als Zeitpunkt in die Datenbank
   (optZeitpunkt); ein Ende ohne Beginn und ein Ende vor dem Beginn werden
   abgelehnt, statt sie stillschweigend zu übernehmen.

   Die Terminart bestimmt, welche Rolle den Termin später zu sehen bekommt
   (app.termine_fuer_rolle). Sie darf deshalb nicht frei sein: geprüft wird
   gegen die Aufzählung, nicht gegen den Text im Formular. */

export type TerminEingabe = {
  art: string;
  von: string;
  bis: string;
  ort_name: string;
  ort_adresse: string;
  zustaendig: string;
  hinweis: string;
};

const OHNE_ZUSTAENDIGKEIT = "";

function terminFelder(e: TerminEingabe | undefined) {
  const { von, bis } = zeitfensterGeprueft("Beginn", "Ende", e?.von, e?.bis);
  return {
    art: ausListe("Terminart", e?.art, TERMIN_ARTEN),
    von,
    bis,
    ort_name: optText("Ort", e?.ort_name ?? "", GRENZEN.ort_name),
    ort_adresse: optText("Adresse", e?.ort_adresse ?? "", GRENZEN.ort_adresse),
    zustaendig:
      (e?.zustaendig ?? OHNE_ZUSTAENDIGKEIT) === OHNE_ZUSTAENDIGKEIT
        ? null
        : ausListe("Zuständig", e!.zustaendig, ROLLEN),
    hinweis: optMehrzeilig("Hinweis", e?.hinweis ?? "", GRENZEN.termin_hinweis),
  };
}

export async function terminHinzufuegenAction(
  caseId: string,
  e: TerminEingabe,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    termin: terminFelder(e),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, termin } = g.wert;
  return schreibe(fall, () => addTermin(fall, termin));
}

export async function terminSpeichernAction(
  caseId: string,
  terminId: string,
  e: TerminEingabe,
  status: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Termin", terminId),
    patch: { ...terminFelder(e), status: ausListe("Status", status, TERMIN_STATUS) },
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id, patch } = g.wert;
  return schreibe(fall, () => updateTermin(fall, id, patch));
}

export async function terminEntfernenAction(
  caseId: string,
  terminId: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Termin", terminId),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id } = g.wert;
  return schreibe(fall, () => removeTermin(fall, id));
}

/* ── Voraussetzungen (0017) ──────────────────────────────────────
   Was beigebracht sein muss, bevor ein Termin bestätigt werden kann.

   Zwei Dinge, die hier bewusst NICHT stehen:

   · Keine Prüfung, ob die Art zu einer Terminart des Vorgangs passt. Das Haus
     darf eine Voraussetzung erfassen, bevor der zugehörige Termin angelegt
     ist — das ist die übliche Reihenfolge, nicht ein Fehler.
   · Kein Weg, über den ein Eingeladener «erfüllt» setzt. Diese Actions
     gehören zum inneren Umkreis; die Datenbank kennt für den äusseren gar
     keine Tür zu dieser Tabelle (siehe Kopf der Migration). */

const VORAUSSETZUNG_HINWEIS_MAX = 300;

export async function voraussetzungHinzufuegenAction(
  caseId: string,
  art: string,
  zustaendig: string,
  hinweis: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    art: ausListe("Voraussetzung", art, VORAUSSETZUNGS_ARTEN),
    zustaendig:
      (zustaendig ?? OHNE_ZUSTAENDIGKEIT) === OHNE_ZUSTAENDIGKEIT
        ? null
        : ausListe("Zuständig", zustaendig, ROLLEN),
    hinweis: optMehrzeilig("Hinweis", hinweis ?? "", VORAUSSETZUNG_HINWEIS_MAX),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, ...v } = g.wert;
  return schreibe(fall, () => addVoraussetzung(fall, v));
}

/* Abhaken und wieder aufmachen sind derselbe Weg. Das Zurücknehmen ist keine
   Nebensache: wer versehentlich abhakt, hat damit einen Blocker abgeschaltet,
   und ohne Rückweg bliebe er abgeschaltet. */
export async function voraussetzungErfuelltAction(
  caseId: string,
  vorId: string,
  erfuellt: unknown,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Voraussetzung", vorId),
    erfuellt: jaNein("Stand", erfuellt),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id, erfuellt: wert } = g.wert;
  return schreibe(fall, () => setVoraussetzungErfuellt(fall, id, wert));
}

export async function voraussetzungSpeichernAction(
  caseId: string,
  vorId: string,
  zustaendig: string,
  hinweis: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Voraussetzung", vorId),
    patch: {
      zustaendig:
        (zustaendig ?? OHNE_ZUSTAENDIGKEIT) === OHNE_ZUSTAENDIGKEIT
          ? null
          : ausListe("Zuständig", zustaendig, ROLLEN),
      hinweis: optMehrzeilig("Hinweis", hinweis ?? "", VORAUSSETZUNG_HINWEIS_MAX),
    },
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id, patch } = g.wert;
  return schreibe(fall, () => updateVoraussetzung(fall, id, patch));
}

export async function voraussetzungEntfernenAction(
  caseId: string,
  vorId: string,
): Promise<Ergebnis> {
  const g = pruefe(() => ({
    fall: kennung("Vorgang", caseId),
    id: kennung("Voraussetzung", vorId),
  }));
  if (!g.ok) return { ok: false, fehler: meldung(g) };

  const { fall, id } = g.wert;
  return schreibe(fall, () => removeVoraussetzung(fall, id));
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
