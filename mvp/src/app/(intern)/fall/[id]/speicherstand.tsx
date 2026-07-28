"use client";

import { useState } from "react";

/* Rückmeldung nach dem Speichern — ein Wortschatz für alle Bögen der
   Fallkarte, damit «Gespeichert» überall gleich aussieht und gleich klingt.

   Die Meldung kommt fertig vom Server (siehe actions.ts): sie nennt ein Feld,
   nie dessen Inhalt. Hier wird nichts zusammengesetzt. */

export type Stand = { art: "still" } | { art: "ok" } | { art: "fehler"; text: string };

const STILL: Stand = { art: "still" };

export function useSpeicherstand(): [
  Stand,
  (res: { ok: true } | { ok: false; fehler: string }) => void,
  () => void,
] {
  const [stand, setStand] = useState<Stand>(STILL);
  const melde = (res: { ok: true } | { ok: false; fehler: string }) =>
    setStand(res.ok ? { art: "ok" } : { art: "fehler", text: res.fehler });
  const zuruecksetzen = () => setStand(STILL);
  return [stand, melde, zuruecksetzen];
}

export function Speicherstand({ stand }: { stand: Stand }) {
  if (stand.art === "still") return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-[11.5px] leading-relaxed ${stand.art === "ok" ? "text-mint" : "text-coral"}`}
    >
      {stand.art === "ok" ? "Gespeichert." : stand.text}
    </p>
  );
}
