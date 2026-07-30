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
  /* Kein Fehler und kein blosses «gespeichert»: seit 0016 kann ein Teil der
     Eingabe als Vorschlag beim Haus liegen, weil dort schon eine andere
     Angabe steht. Wer das nicht liest, glaubt, seine Korrektur sei drin. */
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [pending, start] = useTransition();

  /* Der zuletzt gespeicherte Stand — Bezugspunkt dafür, was «geändert» ist.
     Wird nach jedem erfolgreichen Speichern nachgezogen, sonst schickte der
     zweite Klick dieselbe Änderung noch einmal. */
  const [gespeichert, setGespeichert] = useState<Record<string, string>>(() => ({ ...entwurf }));

  function speichern(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    setFertig(false);
    setHinweis(null);

    /* Nur die tatsächlich geänderten Felder. Sonst stünde nach jedem
       Speichern im Journal des Hauses, die Familie habe alle fünf Angaben
       geändert — auch wenn sie nur die Konfession berichtigt hat. Ein
       Journal, das zu viel behauptet, ist so wenig wert wie eines, das
       schweigt. */
    const geaendert: Record<string, string> = {};
    for (const [feld, wert] of Object.entries(entwurf)) {
      if (wert !== gespeichert[feld]) geaendert[feld] = wert;
    }

    if (Object.keys(geaendert).length === 0) {
      setFertig(true);   // nichts zu tun ist kein Fehler
      return;
    }

    start(async () => {
      const res = await angabenErgaenzenAction(geaendert);
      if (res.ok) {
        /* Auch bei einem Vorschlag gilt der Entwurf als abgeschickt: sonst
           meldet der nächste Klick dieselben Felder erneut, und beim Haus
           stapelt sich derselbe Vorschlag. Was davon schon eine Angabe im
           Vorgang ist und was noch beim Haus liegt, sagt der Hinweis. */
        setGespeichert({ ...entwurf });
        setHinweis(res.hinweis ?? null);
        setFertig(true);
      } else {
        setFehler(res.fehler);
      }
    });
  }

  function setze(feld: string, wert: string) {
    setEntwurf((alt) => ({ ...alt, [feld]: wert }));
    setFehler(null);
    setFertig(false);
    setHinweis(null);
  }

  return (
    <form onSubmit={speichern} className="card p-4">
      <p className="text-[12.5px] leading-relaxed text-fog">
        Diese Angaben kennen meist nur die Angehörigen. Was noch offen ist,
        können Sie hier eintragen — das Bestattungshaus sieht es sofort. Steht
        eine Angabe schon da, wird sie nicht überschrieben: Ihre Fassung geht
        als Vorschlag an das Haus. Was Sie nicht wissen, lassen Sie bitte offen.
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
        {fertig && !hinweis && (
          <p role="status" aria-live="polite" className="text-[12px] text-mint">
            Gespeichert. Vielen Dank.
          </p>
        )}
        {fertig && hinweis && (
          <p role="status" aria-live="polite" className="text-[12px] leading-relaxed text-fog">
            {hinweis}
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
