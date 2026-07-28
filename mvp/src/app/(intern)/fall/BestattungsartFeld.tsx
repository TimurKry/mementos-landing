"use client";

import { useState } from "react";
import { BESTATTUNGSARTEN } from "@/lib/eingaben";

/* Bestattungsart: vier gebräuchliche Formen zur Auswahl, dazu «Andere Form».
   Die Praxis kennt mehr als vier (anonyme Beisetzung, Überführung ins
   Ausland, Diamantbestattung …) — eine geschlossene Liste würde das Haus
   zwingen, etwas Falsches anzugeben. Frei eingegeben, aber begrenzt.

   Geteilt zwischen «Neuer Vorgang» und der Fallkarte, damit beide Stellen
   dieselbe Liste anbieten. */

const FREI = "__frei";

export function BestattungsartFeld({
  wert,
  setzeWert,
  disabled,
}: {
  wert: string;
  setzeWert: (w: string) => void;
  disabled?: boolean;
}) {
  const bekannt = (BESTATTUNGSARTEN as readonly string[]).includes(wert);
  const [frei, setFrei] = useState(!bekannt && wert !== "");

  function auswahl(v: string) {
    if (v === FREI) {
      setFrei(true);
      setzeWert("");
      return;
    }
    setFrei(false);
    setzeWert(v);
  }

  return (
    <div className="grid gap-2">
      <select
        value={frei ? FREI : wert}
        onChange={(e) => auswahl(e.target.value)}
        disabled={disabled}
        className="select-dk"
        aria-label="Bestattungsart"
      >
        {BESTATTUNGSARTEN.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
        <option value={FREI}>Andere Form …</option>
      </select>

      {frei && (
        <input
          type="text"
          value={wert}
          onChange={(e) => setzeWert(e.target.value)}
          disabled={disabled}
          maxLength={60}
          autoFocus
          placeholder="z. B. anonyme Beisetzung"
          aria-label="Bestattungsart, freie Angabe"
          className="input-dk"
        />
      )}
    </div>
  );
}
