"use client";

import { useState, useTransition } from "react";
import { einladbareRollen, roleLabel } from "@/lib/access";
import type { Role } from "@/lib/types";
import { einladungErzeugenAction, einladungZurueckziehenAction } from "./actions";
import type { EinladungAnsicht, EinladungStatus } from "./invite-view";

/* Zugang per Link — Ausgeben, Übersicht, Zurückziehen.

   Der erzeugte Link steht genau einmal hier im Zustand dieser Komponente. Er
   wird nicht in die Adresszeile geschrieben, nicht gespeichert und nach einem
   Seitenwechsel oder Neuladen ist er fort — die Datenbank hält nur den Hash
   und gibt den Klartext kein zweites Mal heraus. Deshalb der Hinweis direkt
   am Link statt einer stillen Anzeige.

   Die Rolle «bestatter» steht nicht zur Auswahl: sie ist in der Datenbank
   ausgeschlossen (invites_role_not_bestatter), ein solcher Link wäre ein
   Zugang ohne Konto mit dem vollen Blick des Hauses. */

const badgeKlasse: Record<EinladungStatus, string> = {
  aktiv: "badge-green",
  zurückgezogen: "badge-red",
  abgelaufen: "badge-dim",
};

type Kopierstand = "idle" | "ok" | "fehler";

export function Einladungen({
  caseId,
  einladungen,
  ladefehler,
}: {
  caseId: string;
  einladungen: EinladungAnsicht[];
  ladefehler: boolean;
}) {
  const [rolle, setRolle] = useState<Role>("familie");
  const [merk, setMerk] = useState("");
  const [neuerLink, setNeuerLink] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState<Kopierstand>("idle");
  const [fehler, setFehler] = useState<string | null>(null);
  const [bestaetigung, setBestaetigung] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function erzeugen(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    start(async () => {
      const res = await einladungErzeugenAction(caseId, rolle, merk);
      if (!res.ok) {
        setFehler(res.fehler);
        return;
      }
      /* Erst hier entsteht die vollständige Adresse — im Browser, aus dem
         Rückgabewert. Der Token war nie Teil einer Adresse. */
      setNeuerLink(`${window.location.origin}/einladung/${res.token}`);
      setKopiert("idle");
      setMerk("");
    });
  }

  function zurueckziehen(inviteId: string) {
    setFehler(null);
    start(async () => {
      const res = await einladungZurueckziehenAction(caseId, inviteId);
      setBestaetigung(null);
      if (!res.ok) setFehler(res.fehler);
    });
  }

  async function kopieren() {
    if (!neuerLink) return;
    try {
      await navigator.clipboard.writeText(neuerLink);
      setKopiert("ok");
    } catch {
      setKopiert("fehler");
    }
  }

  return (
    <div>
      <form onSubmit={erzeugen} className="card grid gap-2.5 p-3">
        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Rolle</span>
          <select
            value={rolle}
            onChange={(e) => setRolle(e.target.value as Role)}
            className="select-dk"
          >
            {einladbareRollen.map((r) => (
              <option key={r} value={r}>{roleLabel[r]}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-[10px] text-steel">Merkhilfe (optional)</span>
          <input
            type="text"
            value={merk}
            onChange={(e) => setMerk(e.target.value)}
            maxLength={80}
            placeholder="z. B. Familie Weber"
            className="input-dk"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn-bone px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
        >
          {pending ? "Einen Moment …" : "Link erzeugen"}
        </button>
      </form>

      {fehler && (
        <p role="status" className="mt-2 text-[11.5px] leading-relaxed text-coral">
          {fehler}
        </p>
      )}

      {neuerLink && (
        <div className="card mt-2.5 p-3">
          <div className="text-[10px] font-medium text-fog">Neuer Zugangslink</div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-chalk">
            Der Link wird nur jetzt angezeigt. Bitte kopieren und direkt an die
            betreffende Person senden.
          </p>
          <p className="mt-2 select-all break-all rounded-[8px] bg-white/[0.04] p-2 text-[10.5px] leading-relaxed text-chalk">
            {neuerLink}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={kopieren}
              className="btn-bone px-3 py-1.5 text-[12px] font-medium"
            >
              Kopieren
            </button>
            <button
              type="button"
              onClick={() => setNeuerLink(null)}
              className="btn-ghost px-3 py-1.5 text-[12px]"
            >
              Ausblenden
            </button>
          </div>
          <p aria-live="polite" className="mt-1.5 text-[10.5px] leading-relaxed text-steel">
            {kopiert === "ok" && "In die Zwischenablage kopiert."}
            {kopiert === "fehler" && "Kopieren war nicht möglich — bitte den Link von Hand markieren."}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-2">
        {ladefehler && (
          <p className="text-[11.5px] leading-relaxed text-steel">
            Die vergebenen Zugänge konnten gerade nicht geladen werden.
          </p>
        )}
        {!ladefehler && einladungen.length === 0 && (
          <p className="text-[11.5px] text-steel">Noch keine Zugänge vergeben.</p>
        )}

        {einladungen.map((e) => (
          <div key={e.id} className="card p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block text-[13px] text-chalk">{e.rolle}</span>
                {e.label && (
                  <span className="mt-0.5 block truncate text-[10.5px] text-fog">{e.label}</span>
                )}
              </span>
              <span className={`badge ${badgeKlasse[e.status]}`}>{e.status}</span>
            </div>

            <div className="mt-1.5 text-[10.5px] leading-relaxed text-steel">
              Erzeugt am {e.erstellt}
              {e.sitzungen > 0 &&
                ` · ${e.sitzungen} offene ${e.sitzungen === 1 ? "Sitzung" : "Sitzungen"}`}
            </div>

            {e.status === "aktiv" &&
              (bestaetigung === e.id ? (
                <div className="mt-2">
                  <p className="text-[10.5px] leading-relaxed text-steel">
                    Der Link wird ungültig, offene Sitzungen enden sofort.
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => zurueckziehen(e.id)}
                      disabled={pending}
                      className="btn-ghost px-2.5 py-1.5 text-[11.5px] text-coral disabled:opacity-60"
                    >
                      Zurückziehen bestätigen
                    </button>
                    <button
                      type="button"
                      onClick={() => setBestaetigung(null)}
                      className="btn-ghost px-2.5 py-1.5 text-[11.5px]"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setBestaetigung(e.id); setFehler(null); }}
                  className="btn-ghost mt-2 px-2.5 py-1.5 text-[11.5px]"
                >
                  Zugang zurückziehen
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
