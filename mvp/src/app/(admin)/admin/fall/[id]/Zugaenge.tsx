"use client";

import { useState, useTransition } from "react";
import { sitzungBeendenAction, zugangZurueckziehenAction } from "./actions";
import type { ZugangAnsicht, ZugangStatus } from "./zugang-view";

/* Zugänge eines Vorgangs — Zustand ansehen und eingreifen.

   Zu sehen ist, DASS ein Zugang besteht und von wem er benutzt wird: Rolle,
   Merkhilfe des Hauses, Zeitpunkte, offene Sitzungen. Was hinter dem Zugang
   liegt, steht hier nicht — die Übersicht kennt es nicht.

   Beide Eingriffe fragen einmal nach: sie wirken sofort und lassen sich nicht
   zurücknehmen. */

const badgeKlasse: Record<ZugangStatus, string> = {
  aktiv: "badge-green",
  zurückgezogen: "badge-red",
  abgelaufen: "badge-dim",
};

export function Zugaenge({
  fallId,
  zugaenge,
}: {
  fallId: string;
  zugaenge: ZugangAnsicht[];
}) {
  const [frage, setFrage] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function zurueckziehen(zugangId: string) {
    setFehler(null);
    start(async () => {
      const res = await zugangZurueckziehenAction(fallId, zugangId);
      setFrage(null);
      if (!res.ok) setFehler(res.fehler);
    });
  }

  function beenden(sitzungId: string) {
    setFehler(null);
    start(async () => {
      const res = await sitzungBeendenAction(fallId, sitzungId);
      setFrage(null);
      if (!res.ok) setFehler(res.fehler);
    });
  }

  if (zugaenge.length === 0) {
    return <p className="text-[12.5px] text-steel">Keine Zugänge vergeben.</p>;
  }

  return (
    <div>
      {fehler && (
        <p role="status" className="mb-2.5 text-[12px] leading-relaxed text-coral">
          {fehler}
        </p>
      )}

      <div className="grid gap-2 lg:grid-cols-2">
        {zugaenge.map((z) => (
          <div key={z.id} className="card p-3.5">
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block text-[13px] text-chalk">{z.rolle}</span>
                {z.label && (
                  <span className="mt-0.5 block truncate text-[10.5px] text-fog">{z.label}</span>
                )}
              </span>
              <span className="flex flex-wrap items-center justify-end gap-1.5">
                {z.sitzungenAnzahl > 0 && (
                  <span className="badge badge-blue">
                    {z.sitzungenAnzahl}{" "}
                    {z.sitzungenAnzahl === 1 ? "Sitzung" : "Sitzungen"}
                  </span>
                )}
                <span className={`badge ${badgeKlasse[z.status]}`}>{z.status}</span>
              </span>
            </div>

            <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <Zeile k="Ausgegeben" v={z.erstellt} />
              <Zeile k="Gültig bis" v={z.gueltigBis} />
              <Zeile k="Zuletzt gesehen" v={z.zuletzt} />
              <Zeile k="Aktive Sitzungen" v={String(z.sitzungenAnzahl)} />
            </dl>

            {z.sitzungen.length > 0 && (
              <div className="mt-2.5 grid gap-1.5">
                {z.sitzungen.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[8px] bg-white/[0.03] px-2.5 py-2"
                  >
                    <span className="min-w-0 text-[10.5px] text-fog">
                      Sitzung · zuletzt {s.zuletzt}
                    </span>
                    <button
                      type="button"
                      onClick={() => beenden(s.id)}
                      disabled={pending}
                      className="btn-ghost px-2.5 py-1 text-[11px] disabled:opacity-60"
                    >
                      Sitzung beenden
                    </button>
                  </div>
                ))}
              </div>
            )}

            {z.status === "aktiv" &&
              (frage === z.id ? (
                <div className="mt-2.5">
                  <p className="text-[10.5px] leading-relaxed text-steel">
                    Der Zugang wird ungültig, offene Sitzungen enden sofort.
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => zurueckziehen(z.id)}
                      disabled={pending}
                      className="btn-ghost px-2.5 py-1.5 text-[11.5px] text-coral disabled:opacity-60"
                    >
                      Zurückziehen bestätigen
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrage(null)}
                      className="btn-ghost px-2.5 py-1.5 text-[11.5px]"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setFrage(z.id);
                    setFehler(null);
                  }}
                  className="btn-ghost mt-2.5 px-2.5 py-1.5 text-[11.5px]"
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

function Zeile({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] text-steel">{k}</dt>
      <dd className="tnum text-chalk">{v}</dd>
    </div>
  );
}
