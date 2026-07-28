"use client";

import { useRef, useState, useTransition } from "react";
import { einladbareRollen, roleLabel } from "@/lib/access";
import type { Doc, Role } from "@/lib/types";
import {
  unterlageEntfernenAction, unterlageGepruefetAction, unterlageHochladenAction,
} from "./unterlagen-actions";
import { EntfernenKnopf } from "./EntfernenKnopf";
import { Speicherstand, useSpeicherstand } from "./speicherstand";

/* Unterlagen des Vorgangs: hochladen, freigeben, entfernen.

   Der wichtige Teil dieses Bogens ist nicht der Knopf zum Hochladen, sondern
   die Auswahl darunter: WER die Unterlage sehen darf. Sie ist leer
   vorbelegt — eine Todesbescheinigung geht nicht versehentlich an alle, nur
   weil jemand ein Häkchen übersehen hat. Wer nichts auswählt, legt sie im
   Haus ab, und das ist der sichere Ausgang.

   «bestatter» steht nicht in der Liste: das Haus sieht ohnehin alles. */

const ROLLEN: Role[] = einladbareRollen;

function groesseLesbar(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function Unterlagen({ caseId, dokumente }: { caseId: string; dokumente: Doc[] }) {
  return (
    <div className="grid gap-2.5">
      {dokumente.length === 0 && (
        <p className="text-[12px] text-steel">Noch keine Unterlagen.</p>
      )}

      {dokumente.map((d) => (
        <UnterlageKarte key={d.id ?? d.doc_type} caseId={caseId} dok={d} />
      ))}

      <Hochladen caseId={caseId} />
    </div>
  );
}

function UnterlageKarte({ caseId, dok }: { caseId: string; dok: Doc }) {
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();
  const id = dok.id;
  const sichtbar = dok.visible_to ?? [];

  function umschalten() {
    zuruecksetzen();
    if (!id) return;
    start(async () => melde(await unterlageGepruefetAction(caseId, id, !dok.verified)));
  }

  function entfernen() {
    zuruecksetzen();
    if (!id) return;
    start(async () => melde(await unterlageEntfernenAction(caseId, id)));
  }

  return (
    <div className="card p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] text-chalk">{dok.doc_type}</span>
            <span className={`badge ${dok.verified ? "badge-green" : "badge-dim"}`}>
              {dok.verified ? "geprüft" : "ausstehend"}
            </span>
            {!dok.hat_datei && <span className="badge badge-dim">keine Datei</span>}
          </div>

          {dok.dateiname && (
            <div className="mt-0.5 text-[11.5px] text-fog">
              {dok.dateiname}
              {dok.groesse ? ` · ${groesseLesbar(dok.groesse)}` : ""}
            </div>
          )}

          <div className="mt-1 text-[10.5px] leading-relaxed text-steel">
            {sichtbar.length === 0
              ? "Bleibt im Haus."
              : `Sichtbar für ${sichtbar.map((r) => roleLabel[r]).join(", ")}.`}
          </div>
        </div>

        {dok.hat_datei && id && (
          /* Bewusst ein <a> und kein next/link: dahinter steht kein
             Bildschirm, sondern ein Abruf. Ein Prefetch beim Überfahren
             würde ihn auslösen, bevor jemand geklickt hat. */
          <a
            href={`/fall/${caseId}/unterlage/${id}`}
            className="btn-ghost px-2.5 py-1.5 text-[11.5px]"
          >
            Öffnen
          </a>
        )}
      </div>

      {id && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={umschalten}
            disabled={pending}
            className="btn-ghost px-2.5 py-1.5 text-[11.5px] disabled:opacity-60"
          >
            {dok.verified ? "Prüfung zurücknehmen" : "Als geprüft markieren"}
          </button>
          <EntfernenKnopf
            frage="Unterlage samt Datei entfernen?"
            entfernen={entfernen}
            disabled={pending}
          />
          <Speicherstand stand={stand} />
        </div>
      )}
    </div>
  );
}

function Hochladen({ caseId }: { caseId: string }) {
  const [offen, setOffen] = useState(false);
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function absenden(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    zuruecksetzen();
    const daten = new FormData(e.currentTarget);
    start(async () => {
      const res = await unterlageHochladenAction(caseId, daten);
      melde(res);
      if (res.ok) { formRef.current?.reset(); setOffen(false); }
    });
  }

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="btn-ghost justify-self-start px-3.5 py-2 text-[12.5px]"
      >
        Unterlage hochladen
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={absenden} className="card grid gap-2.5 p-3.5">
      <div className="text-[10px] font-medium text-fog">Unterlage hochladen</div>

      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Bezeichnung</span>
        <input
          type="text"
          name="doc_type"
          required
          maxLength={160}
          autoComplete="off"
          placeholder="z. B. Todesbescheinigung"
          className="input-dk"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Datei</span>
        <input
          type="file"
          name="datei"
          required
          accept="application/pdf,image/jpeg,image/png"
          className="input-dk file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-2.5 file:py-1 file:text-[11.5px] file:text-chalk"
        />
        <span className="text-[10.5px] leading-relaxed text-steel">
          PDF, JPEG oder PNG, bis 10 MB.
        </span>
      </label>

      <fieldset className="grid gap-1.5">
        <legend className="text-[10px] text-steel">Sichtbar für</legend>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {ROLLEN.map((r) => (
            <label key={r} className="flex items-center gap-1.5 text-[11.5px] text-chalk">
              <input
                type="checkbox"
                name="sichtbar_fuer"
                value={r}
                className="h-3.5 w-3.5 accent-signal"
              />
              {roleLabel[r]}
            </label>
          ))}
        </div>
        <span className="text-[10.5px] leading-relaxed text-steel">
          Nichts ausgewählt heisst: die Unterlage bleibt im Haus. Sie lässt
          sich später nicht nachträglich freigeben — dann bitte neu hochladen.
        </span>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-bone px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
        >
          {pending ? "Wird übertragen …" : "Hochladen"}
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
