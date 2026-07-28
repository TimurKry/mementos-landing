"use client";

import { useState, useTransition } from "react";
import { BestattungsartFeld } from "../BestattungsartFeld";
import { fallAnlegenAction } from "./actions";

/* Erfassungsbogen für einen neuen Vorgang.

   Bewusst kurz: Name, Bestattungsart, auf Wunsch ein Termin. Alles Weitere
   steht auf der Fallkarte und kann in Ruhe nachgetragen werden — oft wird
   dieser Bogen am Telefon ausgefüllt, während gegenüber jemand weint.

   Die Eingaben liegen im Zustand dieser Komponente und bleiben stehen, wenn
   die Prüfung ein Feld beanstandet. Es geht nichts verloren. */

export function NeuerVorgang() {
  const [bestattungsart, setBestattungsart] = useState("Einäscherung");
  const [termin, setTermin] = useState("");
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    start(async () => {
      const res = await fallAnlegenAction({
        bestattungsart,
        target_date: termin,
        vorname,
        nachname,
      });
      /* Bei Erfolg leitet die Action weiter und kehrt nie hierher zurück. */
      if (res && !res.ok) setFehler(res.fehler);
    });
  }

  return (
    <form onSubmit={absenden} className="grid gap-5">
      <section className="card p-4">
        <div className="text-[10px] font-medium text-fog">Verstorbene Person</div>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-steel">
          Vor- und Nachname genügen für den Anfang. Identität — sichtbar für
          alle Beteiligten mit Zugang.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[10px] text-steel">Vorname</span>
            <input
              type="text"
              value={vorname}
              onChange={(e) => setVorname(e.target.value)}
              maxLength={80}
              autoComplete="off"
              required
              className="input-dk"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] text-steel">Nachname</span>
            <input
              type="text"
              value={nachname}
              onChange={(e) => setNachname(e.target.value)}
              maxLength={80}
              autoComplete="off"
              required
              className="input-dk"
            />
          </label>
        </div>
      </section>

      <section className="card p-4">
        <div className="text-[10px] font-medium text-fog">Vorgang</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[10px] text-steel">Bestattungsart</span>
            <BestattungsartFeld wert={bestattungsart} setzeWert={setBestattungsart} />
          </label>
          <label className="grid gap-1">
            <span className="text-[10px] text-steel">Wunschtermin (optional)</span>
            <input
              type="date"
              value={termin}
              onChange={(e) => setTermin(e.target.value)}
              className="input-dk"
            />
          </label>
        </div>
      </section>

      {fehler && (
        <p role="status" className="text-[11.5px] leading-relaxed text-coral">
          {fehler}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-bone px-4 py-2.5 text-[13px] font-medium disabled:opacity-60"
        >
          {pending ? "Einen Moment …" : "Vorgang anlegen"}
        </button>
        <span className="text-[11.5px] text-steel">
          Alle weiteren Angaben lassen sich danach ergänzen.
        </span>
      </div>
    </form>
  );
}
