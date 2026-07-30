"use client";

import { useState, useTransition } from "react";
import { feldLabel, roleLabel } from "@/lib/access";
import type { Korrektur } from "@/lib/types";
import { korrekturEntscheidenAction } from "./korrektur-actions";
import { Speicherstand, useSpeicherstand } from "./speicherstand";

/* Die Korrekturschlange (0016_quelle_je_angabe.sql).

   Bis 0016 hat ein Eingeladener direkt in die Angaben geschrieben. Wenn das
   Haus «Erika Weber» eingetragen hatte und die Tochter «Erica Weber» schickte,
   war der Eintrag des Hauses weg — ohne Rückfrage, ohne Hinweis. Jetzt bleibt
   der bisherige Wert stehen und die andere Fassung landet hier.

   Deshalb stehen in jeder Zeile BEIDE Werte nebeneinander. Ein Vorschlag ohne
   den bisherigen Wert wäre eine Entscheidung im Blindflug — und wer im
   Blindflug entscheiden muss, klickt irgendwann pauschal auf «Übernehmen».

   Die Schlange steht ganz oben in der Fallkarte und nur dann, wenn etwas offen
   ist. Sie ist keine Zusammenfassung, sondern eine Aufforderung: solange sie
   da ist, hat jemand etwas gesagt, worauf niemand geantwortet hat. */

export function Korrekturen({
  caseId,
  korrekturen,
}: {
  caseId: string;
  korrekturen: Korrektur[];
}) {
  if (korrekturen.length === 0) return null;
  return (
    <section>
      <div className="mb-2.5 text-[10px] font-medium text-fog">
        Vorschläge {korrekturen.length > 1 && `(${korrekturen.length})`}
      </div>
      <p className="mb-2.5 max-w-[560px] text-[11.5px] leading-relaxed text-steel">
        Zu diesen Angaben liegt eine andere Fassung vor. Die bisherige bleibt
        stehen, bis Sie entscheiden.
      </p>
      <div className="grid gap-2">
        {korrekturen.map((k) => (
          <Zeile key={k.id} caseId={caseId} k={k} />
        ))}
      </div>
    </section>
  );
}

function Zeile({ caseId, k }: { caseId: string; k: Korrektur }) {
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();
  /* Welche der beiden Knöpfe gedrückt wurde — sonst tragen beide dieselbe
     Wartemeldung und man weiss nicht, was gerade läuft. */
  const [laeuft, setLaeuft] = useState<"ja" | "nein" | null>(null);

  function entscheide(annehmen: boolean) {
    zuruecksetzen();
    setLaeuft(annehmen ? "ja" : "nein");
    start(async () => {
      melde(await korrekturEntscheidenAction(caseId, k.id, annehmen));
      setLaeuft(null);
    });
  }

  return (
    <div className="card p-3.5">
      <div className="text-[10px] text-steel">
        {feldLabel[k.feld]} · vorgeschlagen von {roleLabel[k.rolle]}
        {k.quelle && k.quelle !== k.rolle && <> · bisher von {roleLabel[k.quelle]}</>}
      </div>

      {/* Zwei Zeilen, nicht ein Pfeil zwischen zwei Werten: die Angaben sind
          Namen und Anschriften und können lang werden. Nebeneinander bricht
          das auf einem Telefon unlesbar um. */}
      <dl className="mt-2 grid gap-1.5 text-[13px]">
        <div className="flex flex-wrap items-baseline gap-2">
          <dt className="text-[10px] uppercase tracking-wide text-steel">bisher</dt>
          <dd className="text-fog line-through decoration-steel/60">{alsText(k.bisher)}</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <dt className="text-[10px] uppercase tracking-wide text-steel">neu</dt>
          <dd className="text-chalk">{k.neu ?? "— (leeren)"}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => entscheide(true)}
          disabled={pending}
          className="btn-bone px-3 py-1.5 text-[12px] font-medium disabled:opacity-60"
        >
          {laeuft === "ja" ? "Einen Moment …" : "Übernehmen"}
        </button>
        <button
          type="button"
          onClick={() => entscheide(false)}
          disabled={pending}
          className="btn-ghost px-3 py-1.5 text-[12px] disabled:opacity-60"
        >
          {laeuft === "nein" ? "Einen Moment …" : "Verwerfen"}
        </button>
        <Speicherstand stand={stand} />
      </div>
    </div>
  );
}

/* bisher kommt aus der Zeile und ist deshalb nicht immer Text: Größe und
   Gewicht sind Zahlen, die medizinischen Hinweise Wahrheitswerte. Der
   Vorschlagsweg betrifft heute nur Textfelder, aber die Anzeige soll nicht
   «[object Object]» zeigen, wenn sich das ändert. */
function alsText(wert: Korrektur["bisher"]): string {
  if (wert === null || wert === undefined) return "— (leer)";
  if (typeof wert === "boolean") return wert ? "ja" : "nein";
  return String(wert);
}
