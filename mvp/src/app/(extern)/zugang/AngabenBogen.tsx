"use client";

import { useState, useTransition } from "react";
import { feldLabel } from "@/lib/access";
import type { Deceased } from "@/lib/types";
import { angabenErgaenzenAction } from "./actions";

/* Was die Familie beitragen kann.

   Bis hierher war der äussere Umkreis fast nur zum Lesen da: das Haus trug
   alles ein, auch das, was ausschliesslich die Angehörigen wissen —
   Geburtsdatum, Konfession, letzte Anschrift. In der Praxis heisst das:
   jemand ruft an, jemand schreibt mit, jemand tippt ab.

   Welche Felder hier erscheinen, bestimmt der Server (RoleView.schreibbar,
   Spiegel von app.felder_schreibbar). Die Liste wird nicht hier gebaut: was
   die Oberfläche zeigt, darf nie mehr sein als das, was die Datenbank
   annimmt.

   Der Ton ist bewusst zurückhaltend. Wer diesen Bogen ausfüllt, hat gerade
   einen Menschen verloren — das ist kein Konto, das «vervollständigt» wird.
   Deshalb keine Fortschrittsanzeige, keine Pflichtsterne, kein Drängen. */

/* Ein Datumsfeld statt eines Textfeldes, wo es passt. */
const DATUMSFELDER: (keyof Deceased)[] = ["geburtsdatum", "sterbedatum"];

const PLATZHALTER: Partial<Record<keyof Deceased, string>> = {
  konfession: "z. B. evangelisch, katholisch, ohne",
  anschrift: "Strasse, PLZ, Ort",
};

export function AngabenBogen({
  felder,
  werte,
}: {
  felder: (keyof Deceased)[];
  werte: Partial<Deceased>;
}) {
  const [entwurf, setEntwurf] = useState<Record<string, string>>(() => {
    const start: Record<string, string> = {};
    for (const f of felder) {
      const v = werte[f];
      start[f] = v === null || v === undefined ? "" : String(v);
    }
    return start;
  });
  const [fehler, setFehler] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);
  const [pending, start] = useTransition();

  function speichern(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    setFertig(false);
    start(async () => {
      const res = await angabenErgaenzenAction(entwurf);
      if (res.ok) setFertig(true);
      else setFehler(res.fehler);
    });
  }

  function setze(feld: string, wert: string) {
    setEntwurf((alt) => ({ ...alt, [feld]: wert }));
    setFehler(null);
    setFertig(false);
  }

  return (
    <form onSubmit={speichern} className="card p-4">
      <p className="text-[12.5px] leading-relaxed text-fog">
        Diese Angaben kennen meist nur die Angehörigen. Sie können sie hier
        selbst eintragen oder korrigieren — das Bestattungshaus sieht die
        Änderung sofort. Was Sie nicht wissen, lassen Sie bitte offen.
      </p>

      <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
        {felder.map((f) => (
          <label key={f} className={`grid gap-1 ${f === "anschrift" ? "sm:col-span-2" : ""}`}>
            <span className="text-[10px] text-steel">{feldLabel[f]}</span>
            <input
              type={DATUMSFELDER.includes(f) ? "date" : "text"}
              value={entwurf[f] ?? ""}
              onChange={(e) => setze(f, e.target.value)}
              disabled={pending}
              maxLength={f === "anschrift" ? 200 : f === "konfession" ? 60 : 80}
              autoComplete="off"
              placeholder={PLATZHALTER[f]}
              className="input-dk"
            />
          </label>
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-bone px-3.5 py-2.5 text-[13px] font-medium disabled:opacity-60"
        >
          {pending ? "Einen Moment …" : "Angaben speichern"}
        </button>
        {fertig && (
          <p role="status" aria-live="polite" className="text-[12px] text-mint">
            Gespeichert. Vielen Dank.
          </p>
        )}
        {fehler && (
          <p role="status" aria-live="polite" className="text-[12px] leading-relaxed text-coral">
            {fehler}
          </p>
        )}
      </div>
    </form>
  );
}
