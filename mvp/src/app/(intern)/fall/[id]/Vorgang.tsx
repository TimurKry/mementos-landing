"use client";

import { useState, useTransition } from "react";
import { phaseLabel } from "@/lib/access";
import type { Phase } from "@/lib/types";
import { BestattungsartFeld } from "../BestattungsartFeld";
import { vorgangSpeichernAction } from "./actions";
import { Speicherstand, useSpeicherstand } from "./speicherstand";

/* Der Vorgang selbst: Bestattungsart, Wunschtermin, Phase.
   Ein Bogen, ein Knopf — die drei Angaben gehören zusammen. */

const PHASEN = Object.keys(phaseLabel) as Phase[];

export function Vorgang({
  caseId,
  bestattungsart,
  targetDate,
  phase,
}: {
  caseId: string;
  bestattungsart: string;
  targetDate: string | null;
  phase: Phase;
}) {
  const [art, setArt] = useState(bestattungsart);
  const [termin, setTermin] = useState(targetDate ?? "");
  const [ph, setPh] = useState<Phase>(phase);
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();

  function speichern(e: React.FormEvent) {
    e.preventDefault();
    zuruecksetzen();
    start(async () => {
      melde(await vorgangSpeichernAction(caseId, {
        bestattungsart: art,
        target_date: termin,
        phase: ph,
      }));
    });
  }

  return (
    <form onSubmit={speichern} className="card p-4">
      {/* Ohne eigene Überschrift: die Abschnittszeile der Seite steht schon
          darüber, zweimal «Vorgang» wäre nur Lärm. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Bestattungsart</span>
          <BestattungsartFeld wert={art} setzeWert={setArt} disabled={pending} />
        </label>

        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Wunschtermin</span>
          <input
            type="date"
            value={termin}
            onChange={(e) => { setTermin(e.target.value); zuruecksetzen(); }}
            disabled={pending}
            className="input-dk"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Phase</span>
          <select
            value={ph}
            onChange={(e) => { setPh(e.target.value as Phase); zuruecksetzen(); }}
            disabled={pending}
            className="select-dk"
          >
            {PHASEN.map((p) => (
              <option key={p} value={p}>{phaseLabel[p]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-bone px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
        >
          {pending ? "Einen Moment …" : "Speichern"}
        </button>
        <Speicherstand stand={stand} />
      </div>
    </form>
  );
}
