"use client";

import { useState, useTransition } from "react";
import { roleLabel } from "@/lib/access";
import type { Participant, Role } from "@/lib/types";
import {
  beteiligtenBeitrittAction, beteiligtenEntfernenAction, beteiligtenHinzufuegenAction,
} from "./actions";
import { EntfernenKnopf } from "./EntfernenKnopf";
import { Speicherstand, useSpeicherstand } from "./speicherstand";

/* Beteiligte am Vorgang: hinzufügen, beitreten lassen, entfernen.

   Die Rolle entscheidet später, welche Feldgruppen ein Zugang dieser Rolle
   zu sehen bekommt. Der Name der Firma bleibt im Haus — die rollengefilterte
   Ansicht gibt ihn nicht heraus (caseForRole in src/lib/access.ts).

   «Beigetreten» ist eine Notiz des Hauses, kein Zugang. Einen Zugang gibt es
   erst mit einem Link (Abschnitt «Zugang per Link»). */

const ROLLEN = Object.keys(roleLabel) as Role[];

export function Beteiligte({
  caseId,
  beteiligte,
}: {
  caseId: string;
  beteiligte: Participant[];
}) {
  const [rolle, setRolle] = useState<Role>("krematorium");
  const [org, setOrg] = useState("");
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();

  function hinzufuegen(e: React.FormEvent) {
    e.preventDefault();
    zuruecksetzen();
    start(async () => {
      const res = await beteiligtenHinzufuegenAction(caseId, rolle, org);
      melde(res);
      if (res.ok) setOrg("");
    });
  }

  function entfernen(id: string) {
    zuruecksetzen();
    start(async () => melde(await beteiligtenEntfernenAction(caseId, id)));
  }

  function beitritt(id: string, beigetreten: boolean) {
    zuruecksetzen();
    start(async () => melde(await beteiligtenBeitrittAction(caseId, id, beigetreten)));
  }

  return (
    <div className="grid gap-2">
      {beteiligte.length === 0 && (
        <p className="text-[12px] text-steel">Noch niemand beteiligt.</p>
      )}

      {beteiligte.map((p) => (
        <div key={p.id ?? p.role} className="card px-3.5 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="min-w-0">
              <b className="text-[13px] font-medium">{p.org ?? roleLabel[p.role]}</b>
              <span className="ml-2 text-[10.5px] text-fog">{roleLabel[p.role]}</span>
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="check-dk"
                  checked={p.joined}
                  disabled={pending || !p.id}
                  onChange={(e) => p.id && beitritt(p.id, e.target.checked)}
                />
                <span className="text-[11px] text-fog">beigetreten</span>
              </label>

              {p.id && (
                <EntfernenKnopf
                  frage={`${p.org ?? roleLabel[p.role]} entfernen?`}
                  entfernen={() => entfernen(p.id!)}
                  disabled={pending}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      <form onSubmit={hinzufuegen} className="card mt-1 grid gap-2.5 p-3">
        <div className="text-[10px] font-medium text-fog">Beteiligten hinzufügen</div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[10px] text-steel">Rolle</span>
            <select
              value={rolle}
              onChange={(e) => setRolle(e.target.value as Role)}
              disabled={pending}
              className="select-dk"
            >
              {ROLLEN.map((r) => (
                <option key={r} value={r}>{roleLabel[r]}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-[10px] text-steel">Organisation</span>
            <input
              type="text"
              value={org}
              onChange={(e) => { setOrg(e.target.value); zuruecksetzen(); }}
              maxLength={120}
              autoComplete="off"
              required
              placeholder="z. B. Krematorium Südstadt"
              className="input-dk"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="btn-ghost px-3.5 py-2 text-[12.5px] disabled:opacity-60"
          >
            {pending ? "Einen Moment …" : "Hinzufügen"}
          </button>
          <Speicherstand stand={stand} />
        </div>
      </form>
    </div>
  );
}
