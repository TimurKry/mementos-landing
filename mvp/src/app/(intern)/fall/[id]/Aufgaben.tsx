"use client";

import { useState, useTransition } from "react";
import { roleLabel } from "@/lib/access";
import type { Role, Task } from "@/lib/types";
import {
  aufgabeEntfernenAction, aufgabeHinzufuegenAction, aufgabeUmschaltenAction,
} from "./actions";
import { EntfernenKnopf } from "./EntfernenKnopf";
import { Speicherstand, useSpeicherstand } from "./speicherstand";

/* Aufgaben des Vorgangs: anlegen, abhaken, entfernen.

   Die zuständige Rolle ist zugleich der Filter der geteilten Ansicht: ein
   Zugang sieht nur die Aufgaben seiner Rolle (caseForRole). Ohne Rolle bleibt
   die Aufgabe im Haus. Die Frist ist bewusst freier Text — in der Praxis
   steht dort «heute», «vor der Trauerfeier», «Mi vormittags». */

const ROLLEN = Object.keys(roleLabel) as Role[];
const OHNE_ROLLE = "";

export function Aufgaben({ caseId, aufgaben }: { caseId: string; aufgaben: Task[] }) {
  const [titel, setTitel] = useState("");
  const [rolle, setRolle] = useState<string>("bestatter");
  const [frist, setFrist] = useState("");
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();

  function hinzufuegen(e: React.FormEvent) {
    e.preventDefault();
    zuruecksetzen();
    start(async () => {
      const res = await aufgabeHinzufuegenAction(caseId, {
        title: titel, assignee: rolle, due: frist,
      });
      melde(res);
      if (res.ok) { setTitel(""); setFrist(""); }
    });
  }

  function umschalten(id: string) {
    zuruecksetzen();
    start(async () => melde(await aufgabeUmschaltenAction(caseId, id)));
  }

  function entfernen(id: string) {
    zuruecksetzen();
    start(async () => melde(await aufgabeEntfernenAction(caseId, id)));
  }

  return (
    <div className="grid gap-2">
      {aufgaben.length === 0 && (
        <p className="text-[12px] text-steel">Noch keine Aufgaben.</p>
      )}

      {aufgaben.map((t) => {
        const erledigt = t.status === "erledigt";
        return (
          <div key={t.id ?? t.title} className="card p-3">
            <button
              type="button"
              onClick={() => t.id && umschalten(t.id)}
              disabled={pending || !t.id}
              className="flex w-full items-start gap-2.5 text-left disabled:opacity-60"
            >
              <span
                className={`mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[11px] ${
                  erledigt ? "bg-white text-void" : "border border-steel"
                }`}
                aria-hidden="true"
              >
                {erledigt && "✓"}
              </span>
              <span className="min-w-0">
                <span className={`block text-[13px] ${erledigt ? "text-steel line-through" : ""}`}>
                  {t.title}
                </span>
                <span className="mt-0.5 block text-[10.5px] text-steel">
                  {t.assignee ? roleLabel[t.assignee] : "ohne Zuständigkeit"}
                  {t.due ? ` · ${t.due}` : ""}
                </span>
              </span>
            </button>

            {t.id && (
              <div className="mt-2">
                <EntfernenKnopf
                  frage="Aufgabe entfernen?"
                  entfernen={() => entfernen(t.id!)}
                  disabled={pending}
                />
              </div>
            )}
          </div>
        );
      })}

      <form onSubmit={hinzufuegen} className="card mt-1 grid gap-2.5 p-3">
        <div className="text-[10px] font-medium text-fog">Aufgabe hinzufügen</div>

        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Aufgabe</span>
          <input
            type="text"
            value={titel}
            onChange={(e) => { setTitel(e.target.value); zuruecksetzen(); }}
            maxLength={160}
            autoComplete="off"
            required
            placeholder="z. B. Vollmacht bei der Familie anfragen"
            className="input-dk"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Zuständig</span>
          <select
            value={rolle}
            onChange={(e) => setRolle(e.target.value)}
            disabled={pending}
            className="select-dk"
          >
            <option value={OHNE_ROLLE}>ohne Zuständigkeit</option>
            {ROLLEN.map((r) => (
              <option key={r} value={r}>{roleLabel[r]}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Frist (optional)</span>
          <input
            type="text"
            value={frist}
            onChange={(e) => { setFrist(e.target.value); zuruecksetzen(); }}
            maxLength={40}
            autoComplete="off"
            placeholder="z. B. Mi vormittags"
            className="input-dk"
          />
        </label>

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
