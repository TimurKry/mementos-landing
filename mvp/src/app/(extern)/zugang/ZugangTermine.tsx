"use client";

import { useState, useTransition } from "react";
import { terminArtLabel, terminStatusLabel, voraussetzungsartLabel } from "@/lib/access";
import type { RollenTermin } from "@/lib/types";
import { kartenLink, zeitfenster, zuWanduhr } from "@/lib/zeit";
import { terminBestaetigenAction } from "./actions";

/* Termine, wie ein Eingeladener sie sieht — und, wenn es seine Terminart ist,
   auch bestätigen kann.

   Für das Telefon gebaut, nicht für den Schreibtisch: der Fahrer steht am
   Wagen, der Mitarbeiter des Krematoriums an der Anlage. Deshalb eine Spalte,
   grosse Schaltflächen und die Adresse als Verweis auf die Karte, statt zum
   Abtippen.

   darf_bestaetigen kommt vom Server je Zeile mit. Es entscheidet hier nur,
   ob ein Formular überhaupt erscheint — die Entscheidung selbst trifft
   public.termin_bestaetigen (0011). Eine Oberfläche, die etwas anzeigt, hat
   damit noch kein Recht erteilt.

   Dasselbe gilt seit 0017 für blockiert_durch: steht dort etwas offen, wird
   der Bogen gar nicht erst angeboten. Ein Formular, das beim Absenden immer
   abgewiesen wird, ist eine Falle. Die Meldung aus der Server Action bleibt
   trotzdem nötig — zwischen dem Laden dieser Seite und dem Absenden kann das
   Haus eine Voraussetzung nachtragen, und dann ist die Datenbank diejenige,
   die es merkt. */

export function ZugangTermine({ termine }: { termine: RollenTermin[] }) {
  return (
    <div className="grid gap-2.5">
      {termine.map((t, i) => (
        <TerminKarte key={t.id ?? `${t.art}-${i}`} termin={t} />
      ))}
    </div>
  );
}

function TerminKarte({ termin }: { termin: RollenTermin }) {
  const [offen, setOffen] = useState(false);
  const [von, setVon] = useState(() => zuWanduhr(termin.von));
  const [bis, setBis] = useState(() => zuWanduhr(termin.bis));
  const [hinweis, setHinweis] = useState(termin.hinweis ?? "");
  const [fehler, setFehler] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);
  const [pending, start] = useTransition();

  const bestaetigt = termin.status === "bestaetigt" || termin.status === "erledigt";
  /* Fehlt der Schlüssel, ist die Ansicht älter als 0017 — dann wird nichts
     angezeigt, und die Datenbank weist einen Versuch trotzdem ab. */
  const offeneVor = termin.blockiert_durch ?? [];
  const kannBestaetigen =
    termin.darf_bestaetigen && !!termin.id && termin.status !== "abgesagt"
    && offeneVor.length === 0;

  function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler(null);
    if (!termin.id) return;
    start(async () => {
      const res = await terminBestaetigenAction(termin.id!, von, bis, hinweis);
      if (res.ok) { setFertig(true); setOffen(false); }
      else setFehler(res.fehler);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[14px] text-chalk">{terminArtLabel[termin.art]}</span>
        <span className={`badge ${bestaetigt ? "badge-green" : termin.status === "abgesagt" ? "badge-red" : "badge-dim"}`}>
          {terminStatusLabel[termin.status]}
        </span>
      </div>

      <div className="mt-1 text-[13px] text-chalk">
        {zeitfenster(termin.von, termin.bis)}
      </div>

      {termin.ort_name && (
        <div className="mt-1.5 text-[12.5px] text-fog">{termin.ort_name}</div>
      )}
      {termin.ort_adresse && (
        <div className="mt-0.5 text-[12.5px] leading-relaxed text-fog">
          {/* Die Adresse steht immer auch als Text da: öffnet das Gerät keine
              Karte, bleibt sie trotzdem lesbar. */}
          <a
            href={kartenLink(termin.ort_adresse)}
            className="underline decoration-smoke underline-offset-2 hover:text-chalk"
          >
            {termin.ort_adresse}
          </a>
          <span className="ml-1.5 text-[11px] text-steel">· in der Karte öffnen</span>
        </div>
      )}

      {termin.hinweis && (
        <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed text-fog">
          {termin.hinweis}
        </p>
      )}

      {fertig && (
        <p role="status" aria-live="polite" className="mt-2.5 text-[12px] text-mint">
          Bestätigt. Das Bestattungshaus sieht die Zeit sofort.
        </p>
      )}

      {/* Angehalten. Steht nur bei denen, die diesen Termin überhaupt
          bestätigen dürfen: für alle anderen wäre es eine Auskunft über einen
          Ablauf, mit dem sie nichts zu tun haben. */}
      {offeneVor.length > 0 && termin.darf_bestaetigen && (
        <div className="mt-3">
          <div className="hair mb-3" />
          <div className="text-[10px] uppercase tracking-wide text-steel">Angehalten</div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fog">
            {offeneVor.length > 1 ? "Es fehlen noch" : "Es fehlt noch"}:{" "}
            <span className="text-chalk">
              {offeneVor.map((a) => voraussetzungsartLabel[a]).join(", ")}
            </span>
            . Sobald das vorliegt, lässt sich die Zeit hier bestätigen.
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-steel">
            Das Bestattungshaus sieht, was offen ist — eine Rückmeldung von
            Ihnen ist dafür nicht nötig.
          </p>
        </div>
      )}

      {kannBestaetigen && !offen && (
        <button
          type="button"
          onClick={() => { setOffen(true); setFehler(null); }}
          className="btn-bone mt-3 w-full px-3.5 py-2.5 text-[13px] font-medium sm:w-auto"
        >
          {bestaetigt ? "Zeit ändern" : "Zeit bestätigen"}
        </button>
      )}

      {kannBestaetigen && offen && (
        <form onSubmit={absenden} className="mt-3.5">
          <div className="hair mb-3.5" />
          <p className="mb-2.5 text-[11.5px] leading-relaxed text-steel">
            Tragen Sie ein, wann es tatsächlich passt. Das Bestattungshaus sieht
            die Änderung sofort.
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-[10px] text-steel">Beginn</span>
              <input
                type="datetime-local"
                value={von}
                onChange={(e) => { setVon(e.target.value); setFehler(null); }}
                disabled={pending}
                className="input-dk"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] text-steel">Ende (optional)</span>
              <input
                type="datetime-local"
                value={bis}
                onChange={(e) => { setBis(e.target.value); setFehler(null); }}
                disabled={pending}
                className="input-dk"
              />
            </label>
          </div>

          <label className="mt-2.5 grid gap-1">
            <span className="text-[10px] text-steel">Hinweis (optional)</span>
            <textarea
              value={hinweis}
              onChange={(e) => { setHinweis(e.target.value); setFehler(null); }}
              disabled={pending}
              maxLength={300}
              rows={2}
              placeholder="z. B. Fahrzeug steht ab 7:45 bereit"
              className="input-dk resize-y"
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              disabled={pending}
              className="btn-bone px-3.5 py-2.5 text-[13px] font-medium disabled:opacity-60"
            >
              {pending ? "Einen Moment …" : "Bestätigen"}
            </button>
            <button
              type="button"
              onClick={() => { setOffen(false); setFehler(null); }}
              className="btn-ghost px-3.5 py-2.5 text-[13px]"
            >
              Abbrechen
            </button>
          </div>

          {fehler && (
            <p role="status" aria-live="polite" className="mt-2.5 text-[12px] leading-relaxed text-coral">
              {fehler}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
