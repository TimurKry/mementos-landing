"use client";

import { useState, useTransition } from "react";
import {
  VORAUSSETZUNGS_ARTEN, roleLabel, terminArtLabel, terminartenFuerVoraussetzung,
  voraussetzungsartHinweis, voraussetzungsartLabel,
} from "@/lib/access";
import type { Role, Voraussetzung, Voraussetzungsart } from "@/lib/types";
import { zeitfenster } from "@/lib/zeit";
import {
  voraussetzungEntfernenAction, voraussetzungErfuelltAction,
  voraussetzungHinzufuegenAction, voraussetzungSpeichernAction,
} from "./actions";
import { EntfernenKnopf } from "./EntfernenKnopf";
import { Speicherstand, useSpeicherstand } from "./speicherstand";

/* Voraussetzungen und Freigaben (0017_voraussetzungen.sql).

   Bis hierher wusste die Anwendung nicht, dass eine Einäscherung ohne Freigabe
   nicht stattfinden darf. Das Krematorium konnte auf «Zeit bestätigen»
   drücken, und die Anwendung sagte ja.

   Was hier erfasst wird, hält den zugehörigen Termin im ÄUSSEREN Umkreis auf.
   Zwei Sätze, die man dem Bildschirm sonst nicht ansieht und die deshalb auch
   auf ihm stehen:

   1) Was hier nicht steht, blockiert nicht. Die Zuordnung «welche Terminart
      braucht was» ist eine Annahme (siehe Kopf der Migration) — ein
      Mechanismus auf einer Annahme darf nicht von selbst Arbeit anhalten.
      Das Haus schaltet ihn je Vorgang ein, indem es eine Zeile erfasst.
   2) Das Haus selbst wird nicht blockiert. Es sieht den Blocker an seinen
      Terminen und entscheidet. Wer das Haus gegen eine unbestätigte Liste
      sperrt, erzieht es dazu, pauschal abzuhaken — und dann steht die
      Blockade auch dort nicht mehr, wo sie richtig wäre.

   «Hält auf: …» ist aus derselben Matrix abgeleitet, die auch prüft
   (terminartenFuerVoraussetzung). Ohne diesen Satz wäre «Grabstelle» eine
   Zeile ohne erkennbare Wirkung. */

const ROLLEN = Object.keys(roleLabel) as Role[];
const OHNE_ZUSTAENDIGKEIT = "";

export function Voraussetzungen({
  caseId,
  voraussetzungen,
}: {
  caseId: string;
  voraussetzungen: Voraussetzung[];
}) {
  /* Nur, was noch nicht erfasst ist: eine Art gibt es je Vorgang einmal
     (eindeutiger Index voraussetzung_je_fall). Ein Auswahlfeld, das einen
     Wert anbietet, der beim Speichern abprallt, ist kein Auswahlfeld. */
  const frei = VORAUSSETZUNGS_ARTEN.filter(
    (a) => !voraussetzungen.some((v) => v.art === a),
  );

  return (
    <div className="grid gap-2.5">
      {voraussetzungen.length === 0 && (
        <p className="text-[12px] leading-relaxed text-steel">
          Noch nichts erfasst. Solange hier nichts steht, hält nichts einen
          Termin auf — Beteiligte können jede Zeit bestätigen.
        </p>
      )}

      {voraussetzungen.map((v) => (
        <VoraussetzungKarte key={v.id ?? v.art} caseId={caseId} v={v} />
      ))}

      {frei.length > 0 && <NeueVoraussetzung caseId={caseId} arten={frei} />}
    </div>
  );
}

/* ── Eine erfasste Voraussetzung ─────────────────────────────────
   Zugeklappt steht da, was gilt: was es ist, ob es vorliegt, welche Termine
   es aufhält und wer es beibringt. Das Abhaken liegt bewusst OBEN und nicht
   hinter «Ändern»: es ist der Handgriff, der täglich vorkommt. */
function VoraussetzungKarte({ caseId, v }: { caseId: string; v: Voraussetzung }) {
  const [offen, setOffen] = useState(false);
  const [zustaendig, setZustaendig] = useState(v.zustaendig ?? OHNE_ZUSTAENDIGKEIT);
  const [hinweis, setHinweis] = useState(v.hinweis ?? "");
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();

  const id = v.id;
  const haeltAuf = terminartenFuerVoraussetzung(v.art);

  function abhaken() {
    zuruecksetzen();
    if (!id) return;
    start(async () => melde(await voraussetzungErfuelltAction(caseId, id, !v.erfuellt)));
  }

  function speichern(ev: React.FormEvent) {
    ev.preventDefault();
    zuruecksetzen();
    if (!id) return;
    start(async () =>
      melde(await voraussetzungSpeichernAction(caseId, id, zustaendig, hinweis)));
  }

  function entfernen() {
    zuruecksetzen();
    if (!id) return;
    start(async () => melde(await voraussetzungEntfernenAction(caseId, id)));
  }

  return (
    <div className="card p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] text-chalk">{voraussetzungsartLabel[v.art]}</span>
            <span className={`badge ${v.erfuellt ? "badge-green" : "badge-dim"}`}>
              {v.erfuellt ? "liegt vor" : "offen"}
            </span>
          </div>

          {/* Die Wirkung, nicht die Beschreibung: «Hält auf» ist der Grund,
              weshalb diese Zeile überhaupt erfasst wird. */}
          {haeltAuf.length > 0 && (
            <div className="mt-0.5 text-[11.5px] text-fog">
              Hält auf: {haeltAuf.map((t) => terminArtLabel[t]).join(", ")}
            </div>
          )}

          {v.erfuellt && v.erfuellt_am && (
            <div className="mt-0.5 text-[10.5px] text-steel">
              Seit {zeitfenster(v.erfuellt_am, null)}
            </div>
          )}

          {v.hinweis && (
            <p className="mt-1.5 whitespace-pre-line text-[11.5px] leading-relaxed text-fog">
              {v.hinweis}
            </p>
          )}

          {v.zustaendig && (
            <div className="mt-1 text-[10.5px] text-steel">
              Zuständig: {roleLabel[v.zustaendig]}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={abhaken}
            disabled={pending || !id}
            className={`${v.erfuellt ? "btn-ghost" : "btn-bone"} px-2.5 py-1.5 text-[11.5px] font-medium disabled:opacity-60`}
          >
            {pending ? "Einen Moment …" : v.erfuellt ? "Wieder öffnen" : "Liegt vor"}
          </button>
          <button
            type="button"
            onClick={() => setOffen((x) => !x)}
            disabled={!id}
            aria-expanded={offen}
            className="btn-ghost px-2.5 py-1.5 text-[11.5px] disabled:opacity-60"
          >
            {offen ? "Schliessen" : "Ändern"}
          </button>
        </div>
      </div>

      {offen && id && (
        <form onSubmit={speichern} className="mt-3.5">
          <div className="hair mb-3.5" />
          <Felder
            zustaendig={zustaendig}
            setZustaendig={(w) => { setZustaendig(w); zuruecksetzen(); }}
            hinweis={hinweis}
            setHinweis={(w) => { setHinweis(w); zuruecksetzen(); }}
            disabled={pending}
          />
          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="btn-bone px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
            >
              {pending ? "Einen Moment …" : "Speichern"}
            </button>
            <EntfernenKnopf
              frage="Voraussetzung entfernen?"
              entfernen={entfernen}
              disabled={pending}
            />
            <Speicherstand stand={stand} />
          </div>
        </form>
      )}

      {!offen && <Speicherstand stand={stand} />}
    </div>
  );
}

/* ── Eine Voraussetzung erfassen ─────────────────────────────── */
function NeueVoraussetzung({
  caseId,
  arten,
}: {
  caseId: string;
  arten: Voraussetzungsart[];
}) {
  const [offen, setOffen] = useState(false);
  const [art, setArt] = useState<Voraussetzungsart>(arten[0]);
  const [zustaendig, setZustaendig] = useState(OHNE_ZUSTAENDIGKEIT);
  const [hinweis, setHinweis] = useState("");
  const [stand, melde, zuruecksetzen] = useSpeicherstand();
  const [pending, start] = useTransition();

  function hinzufuegen(ev: React.FormEvent) {
    ev.preventDefault();
    zuruecksetzen();
    start(async () => {
      const res = await voraussetzungHinzufuegenAction(caseId, art, zustaendig, hinweis);
      melde(res);
      if (res.ok) {
        setZustaendig(OHNE_ZUSTAENDIGKEIT);
        setHinweis("");
        setOffen(false);
      }
    });
  }

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="btn-ghost justify-self-start px-3.5 py-2 text-[12.5px]"
      >
        Voraussetzung erfassen
      </button>
    );
  }

  const haeltAuf = terminartenFuerVoraussetzung(art);

  return (
    <form onSubmit={hinzufuegen} className="card grid gap-2.5 p-3.5">
      <div className="text-[10px] font-medium text-fog">Voraussetzung erfassen</div>

      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Was muss vorliegen</span>
        <select
          value={art}
          onChange={(ev) => { setArt(ev.target.value as Voraussetzungsart); zuruecksetzen(); }}
          disabled={pending}
          className="select-dk"
        >
          {arten.map((a) => (
            <option key={a} value={a}>
              {voraussetzungsartLabel[a]} — {voraussetzungsartHinweis[a]}
            </option>
          ))}
        </select>
        <span className="text-[10.5px] leading-relaxed text-steel">
          {haeltAuf.length > 0
            ? `Hält auf: ${haeltAuf.map((t) => terminArtLabel[t]).join(", ")} — bis Sie sie als vorliegend markieren.`
            : "Hält derzeit keinen Termin auf."}
        </span>
      </label>

      <Felder
        zustaendig={zustaendig}
        setZustaendig={(w) => { setZustaendig(w); zuruecksetzen(); }}
        hinweis={hinweis}
        setHinweis={(w) => { setHinweis(w); zuruecksetzen(); }}
        disabled={pending}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-bone px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
        >
          {pending ? "Einen Moment …" : "Erfassen"}
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

/* ── Die zwei Felder, einmal für beide Bögen ─────────────────── */
function Felder({
  zustaendig, setZustaendig, hinweis, setHinweis, disabled,
}: {
  zustaendig: string;
  setZustaendig: (w: string) => void;
  hinweis: string;
  setHinweis: (w: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-2.5">
      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Wer bringt es bei</span>
        <select
          value={zustaendig}
          onChange={(ev) => setZustaendig(ev.target.value)}
          disabled={disabled}
          className="select-dk"
        >
          <option value={OHNE_ZUSTAENDIGKEIT}>noch offen</option>
          {ROLLEN.map((r) => (
            <option key={r} value={r}>{roleLabel[r]}</option>
          ))}
        </select>
        <span className="text-[10.5px] leading-relaxed text-steel">
          Eine Notiz für das Haus. Sie erteilt kein Recht und ändert nicht,
          wer den Termin bestätigen darf.
        </span>
      </label>

      <label className="grid gap-1">
        <span className="text-[10px] text-steel">Hinweis (optional)</span>
        <textarea
          value={hinweis}
          onChange={(ev) => setHinweis(ev.target.value)}
          disabled={disabled}
          maxLength={300}
          rows={2}
          placeholder="z. B. Amtsarzt kommt Dienstag"
          className="input-dk resize-y"
        />
        <span className="text-[10.5px] leading-relaxed text-steel">
          Bleibt im Haus. Nach aussen geht nur, WAS fehlt — nie diese Notiz.
        </span>
      </label>
    </div>
  );
}
