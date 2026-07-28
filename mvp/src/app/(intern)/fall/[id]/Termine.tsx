"use client";

import { useState, useTransition } from "react";
import {
  TERMIN_ARTEN, TERMIN_STATUS, roleLabel, terminArtHinweis, terminArtLabel,
  terminSichtbarFuerText, terminStatusLabel,
} from "@/lib/access";
import type { Role, Termin, TerminArt, TerminStatus } from "@/lib/types";
import { zeitfenster, zuWanduhr } from "@/lib/zeit";
import {
  terminEntfernenAction, terminHinzufuegenAction, terminSpeichernAction,
  type TerminEingabe,
} from "./actions";
import { EntfernenKnopf } from "./EntfernenKnopf";
import { Speicherstand, useSpeicherstand } from "./speicherstand";

/* Termine des Vorgangs: Zeitfenster, Ort, Zuständigkeit.

   Bis hierher hatte ein Vorgang genau ein Datum — den Wunschtermin der
   Familie. Wann abzuholen ist und wo die Trauerfeier stattfindet, stand
   nirgends, und deshalb sah ein Fahrdienst zwar den Namen der verstorbenen
   Person, aber nicht die Adresse, zu der er fahren soll.

   Die Terminart ist hier dasselbe wie die Feldgruppe beim Erfassungsbogen:
   die Grenze, an der die Datenbank filtert. Unter der Auswahl steht deshalb,
   wer diesen Termin später zu sehen bekommt — abgeleitet aus derselben
   Matrix, die auch filtert (terminSichtbarFuerText).

   Zwei Zeiten statt einer, weil eine Abholung in der Praxis ein Fenster ist
   («zwischen 8 und 10»). Beide dürfen leer bleiben: ein Termin wird oft
   angelegt, bevor die Zeit feststeht. */

const ROLLEN = Object.keys(roleLabel) as Role[];
const OHNE_ZUSTAENDIGKEIT = "";

/* Was der Bogen im Formular hält — alles Zeichenketten, wie die Felder sie
   liefern. Umgerechnet wird auf dem Server (optZeitpunkt). */
type Entwurf = TerminEingabe;

function entwurfAus(t: Termin): Entwurf {
  return {
    art: t.art,
    von: zuWanduhr(t.von),
    bis: zuWanduhr(t.bis),
    ort_name: t.ort_name ?? "",
    ort_adresse: t.ort_adresse ?? "",
    zustaendig: t.zustaendig ?? OHNE_ZUSTAENDIGKEIT,
    hinweis: t.hinweis ?? "",
  };
}

const LEER: Entwurf = {
  art: "abholung", von: "", bis: "", ort_name: "",
  ort_adresse: "", zustaendig: OHNE_ZUSTAENDIGKEIT, hinweis: "",
};

export function Termine({ caseId, termine }: { caseId: string; termine: Termin[] }) {
  return (
    <div className="grid gap-2.5">
      {termine.length === 0 && (
        <p className="text-[12px] text-steel">
          Noch keine Termine. Ohne sie sehen Fahrdienst, Krematorium und
          Friedhof kein Datum und keine Adresse.
        </p>
      )}

      {termine.map((t) => (
        <TerminKarte key={t.id ?? `${t.art}-${t.von ?? ""}`} caseId={caseId} termin={t} />
      ))}

      <NeuerTermin caseId={caseId} />
    </div>
  );
}

/* ── Ein vorhandener Termin ──────────────────────────────────────
   Zugeklappt steht da, was gilt: Art, Zeitfenster, Ort. Aufgeklappt wird
   daraus der Bogen. Zugeklappt, weil ein Vorgang leicht sechs Termine hat —
   sechs offene Formulare wären keine Übersicht mehr. */
function TerminKarte({ caseId, termin }: { caseId: string; termin: Termin }) {
  const [offen, setOffen] = useState(false);
  const [e, setE] = useState<Entwurf>(() => entwurfAus(termin));
  const [status, setStatus] = useState<TerminStatus>(termin.status);
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();

  const id = termin.id;

  function speichern(ev: React.FormEvent) {
    ev.preventDefault();
    zuruecksetzen();
    if (!id) return;
    start(async () => melde(await terminSpeichernAction(caseId, id, e, status)));
  }

  function entfernen() {
    zuruecksetzen();
    if (!id) return;
    start(async () => melde(await terminEntfernenAction(caseId, id)));
  }

  return (
    <div className="card p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] text-chalk">{terminArtLabel[termin.art]}</span>
            <StatusMerkmal status={termin.status} />
          </div>
          <div className="mt-0.5 text-[11.5px] text-fog">
            {zeitfenster(termin.von, termin.bis)}
          </div>
          {(termin.ort_name || termin.ort_adresse) && (
            <div className="mt-0.5 text-[11.5px] text-steel">
              {[termin.ort_name, termin.ort_adresse].filter(Boolean).join(" · ")}
            </div>
          )}
          {/* Der Hinweis steht auch zugeklappt da. Er ist die einzige Stelle,
              an der ein Eingeladener dem Haus etwas zurückschreiben kann —
              hinter einem «Ändern»-Knopf wäre er so gut wie nicht vorhanden. */}
          {termin.hinweis && (
            <p className="mt-1.5 whitespace-pre-line text-[11.5px] leading-relaxed text-fog">
              {termin.hinweis}
            </p>
          )}
          {termin.zustaendig && (
            <div className="mt-1 text-[10.5px] text-steel">
              Zuständig: {roleLabel[termin.zustaendig]}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOffen((v) => !v)}
          disabled={!id}
          aria-expanded={offen}
          className="btn-ghost px-2.5 py-1.5 text-[11.5px] disabled:opacity-60"
        >
          {offen ? "Schliessen" : "Ändern"}
        </button>
      </div>

      {offen && id && (
        <form onSubmit={speichern} className="mt-3.5">
          <div className="hair mb-3.5" />
          <Felder e={e} setE={setE} disabled={pending} beiAenderung={zuruecksetzen} />

          <label className="mt-2.5 grid gap-1">
            <span className="text-[10px] text-steel">Status</span>
            <select
              value={status}
              onChange={(ev) => { setStatus(ev.target.value as TerminStatus); zuruecksetzen(); }}
              disabled={pending}
              className="select-dk"
            >
              {TERMIN_STATUS.map((s) => (
                <option key={s} value={s}>{terminStatusLabel[s]}</option>
              ))}
            </select>
          </label>

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="btn-bone px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
            >
              {pending ? "Einen Moment …" : "Speichern"}
            </button>
            <EntfernenKnopf
              frage="Termin entfernen?"
              entfernen={entfernen}
              disabled={pending}
            />
            <Speicherstand stand={stand} />
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Neuer Termin ────────────────────────────────────────────── */
function NeuerTermin({ caseId }: { caseId: string }) {
  const [offen, setOffen] = useState(false);
  const [e, setE] = useState<Entwurf>(LEER);
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();

  function hinzufuegen(ev: React.FormEvent) {
    ev.preventDefault();
    zuruecksetzen();
    start(async () => {
      const res = await terminHinzufuegenAction(caseId, e);
      melde(res);
      if (res.ok) { setE(LEER); setOffen(false); }
    });
  }

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="btn-ghost justify-self-start px-3.5 py-2 text-[12.5px]"
      >
        Termin hinzufügen
      </button>
    );
  }

  return (
    <form onSubmit={hinzufuegen} className="card grid gap-2.5 p-3.5">
      <div className="text-[10px] font-medium text-fog">Termin hinzufügen</div>
      <Felder e={e} setE={setE} disabled={pending} beiAenderung={zuruecksetzen} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-bone px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
        >
          {pending ? "Einen Moment …" : "Hinzufügen"}
        </button>
        <button
          type="button"
          onClick={() => { setOffen(false); zuruecksetzen(); }}
          className="btn-ghost px-3.5 py-2 text-[12.5px]"
        >
          Abbrechen
        </button>
        <Speicherstand stand={stand} />
      </div>
    </form>
  );
}

/* ── Die Felder, einmal für beide Bögen ──────────────────────── */
function Felder({
  e, setE, disabled, beiAenderung,
}: {
  e: Entwurf;
  setE: (f: (v: Entwurf) => Entwurf) => void;
  disabled: boolean;
  beiAenderung: () => void;
}) {
  const setze = <K extends keyof Entwurf>(k: K, v: Entwurf[K]) => {
    setE((alt) => ({ ...alt, [k]: v }));
    beiAenderung();
  };

  return (
    <div className="grid gap-2.5">
      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Terminart</span>
        <select
          value={e.art}
          onChange={(ev) => setze("art", ev.target.value)}
          disabled={disabled}
          className="select-dk"
        >
          {TERMIN_ARTEN.map((a) => (
            <option key={a} value={a}>
              {terminArtLabel[a]} — {terminArtHinweis[a]}
            </option>
          ))}
        </select>
        <span className="text-[10.5px] leading-relaxed text-steel">
          {terminSichtbarFuerText(e.art as TerminArt)}
        </span>
      </label>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Beginn</span>
          <input
            type="datetime-local"
            value={e.von}
            onChange={(ev) => setze("von", ev.target.value)}
            disabled={disabled}
            className="input-dk"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Ende (optional)</span>
          <input
            type="datetime-local"
            value={e.bis}
            onChange={(ev) => setze("bis", ev.target.value)}
            disabled={disabled}
            className="input-dk"
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Ort</span>
        <input
          type="text"
          value={e.ort_name}
          onChange={(ev) => setze("ort_name", ev.target.value)}
          disabled={disabled}
          maxLength={120}
          autoComplete="off"
          placeholder="z. B. Krematorium Südstadt"
          className="input-dk"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Adresse</span>
        <input
          type="text"
          value={e.ort_adresse}
          onChange={(ev) => setze("ort_adresse", ev.target.value)}
          disabled={disabled}
          maxLength={200}
          autoComplete="off"
          placeholder="Strasse, PLZ, Ort"
          className="input-dk"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Zuständig</span>
        <select
          value={e.zustaendig}
          onChange={(ev) => setze("zustaendig", ev.target.value)}
          disabled={disabled}
          className="select-dk"
        >
          <option value={OHNE_ZUSTAENDIGKEIT}>ohne Zuständigkeit</option>
          {ROLLEN.map((r) => (
            <option key={r} value={r}>{roleLabel[r]}</option>
          ))}
        </select>
        <span className="text-[10.5px] leading-relaxed text-steel">
          Eine Notiz für das Haus — sie bleibt hier und ändert nichts daran,
          wer den Termin sieht.
        </span>
      </label>

      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Hinweis (optional)</span>
        <textarea
          value={e.hinweis}
          onChange={(ev) => setze("hinweis", ev.target.value)}
          disabled={disabled}
          maxLength={300}
          rows={2}
          placeholder="z. B. Zufahrt über die Rückseite, Pforte anmelden"
          className="input-dk resize-y"
        />
      </label>
    </div>
  );
}

function StatusMerkmal({ status }: { status: TerminStatus }) {
  const klasse =
    status === "bestaetigt" || status === "erledigt" ? "badge-green"
      : status === "abgesagt" ? "badge-red"
        : "badge-dim";
  return <span className={`badge ${klasse}`}>{terminStatusLabel[status]}</span>;
}
