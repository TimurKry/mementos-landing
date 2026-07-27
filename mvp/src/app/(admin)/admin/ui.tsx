import Link from "next/link";
import { phaseLabel } from "@/lib/access";
import type { AdminEreignis, Phase } from "@/lib/types";
import { aktion, akteur, zahl, zeitpunkt } from "./format";

/* Bausteine der Plattform-Übersicht. Alles im Wortschatz der dunklen Zone:
   .card, .badge-*, .hair, .btn-*, Haarlinien statt Rahmen, Blau nur für
   aktive Zustände. Neu ist allein die Tabelle (.tab-dk in globals.css) —
   ohne sie liesse sich eine Spaltenansicht nicht bauen. */

/* ── Kennzahl ────────────────────────────────────────────────── */

export function Kennzahl({
  titel,
  wert,
  hinweis,
}: {
  titel: string;
  wert: number | string;
  hinweis?: string;
}) {
  /* Zähler tragen den Bildschirm und stehen gross; Zeitangaben sind Beiwerk
     und bekommen deshalb weniger Gewicht — sonst brächen sie um und
     schlügen die Reihe schief. */
  const istZahl = typeof wert === "number";
  return (
    <div className="card p-3.5">
      <div className="text-[10px] text-steel">{titel}</div>
      <div className={`tnum mt-2 leading-tight ${istZahl ? "text-[24px]" : "text-[15px]"}`}>
        {istZahl ? zahl(wert) : wert}
      </div>
      {hinweis && <div className="mt-1.5 text-[10.5px] text-fog">{hinweis}</div>}
    </div>
  );
}

/* ── Phasen als Verteilung ───────────────────────────────────────
   Ein Balken statt fünf Zahlen: die Frage lautet «wo steht die Plattform»,
   nicht «wie viele sind es genau». Die Stufen laufen als Helligkeit von
   neu (hell) zu Abschluss (dunkel) — semantische Farben bleiben den
   Zuständen vorbehalten und streiten hier nicht mit. */

const stufen: { phase: Phase; ton: string; punkt: string }[] = [
  { phase: "neu", ton: "bg-white/85", punkt: "bg-white/85" },
  { phase: "unterlagen", ton: "bg-white/60", punkt: "bg-white/60" },
  { phase: "bestaetigt", ton: "bg-white/42", punkt: "bg-white/42" },
  { phase: "durchfuehrung", ton: "bg-white/26", punkt: "bg-white/26" },
  { phase: "abschluss", ton: "bg-white/14", punkt: "bg-white/14" },
];

export function PhasenBalken({ phasen }: { phasen: Record<Phase, number> }) {
  const gesamt = stufen.reduce((n, s) => n + (phasen[s.phase] ?? 0), 0);

  return (
    <div className="card p-4">
      <div className="text-[10px] text-steel">Vorgänge nach Phase</div>

      <div
        className="mt-3 flex h-2 w-full gap-px overflow-hidden rounded-full bg-white/[0.05]"
        role="img"
        aria-label={stufen
          .map((s) => `${phaseLabel[s.phase]}: ${phasen[s.phase] ?? 0}`)
          .join(", ")}
      >
        {gesamt > 0 &&
          stufen.map((s) => {
            const n = phasen[s.phase] ?? 0;
            if (n === 0) return null;
            return (
              <span
                key={s.phase}
                className={s.ton}
                style={{ width: `${(n / gesamt) * 100}%` }}
              />
            );
          })}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2">
        {stufen.map((s) => (
          <span key={s.phase} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${s.punkt}`} aria-hidden="true" />
            <span className="text-[11px] text-fog">{phaseLabel[s.phase]}</span>
            <span className="tnum text-[12px] text-chalk">{zahl(phasen[s.phase] ?? 0)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function PhasenBadge({ phase }: { phase: Phase }) {
  return <span className="badge badge-dim">{phaseLabel[phase]}</span>;
}

/* ── Pfad zurück ─────────────────────────────────────────────── */

export function Krumen({ pfad }: { pfad: { href?: string; text: string }[] }) {
  return (
    <nav aria-label="Pfad" className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-fog">
      <span aria-hidden="true">←</span>
      {pfad.map((k, i) => (
        <span key={`${k.text}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-smoke" aria-hidden="true">
              /
            </span>
          )}
          {k.href ? (
            <Link href={k.href} className="transition-colors hover:text-white">
              {k.text}
            </Link>
          ) : (
            <span className="text-steel">{k.text}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ── Tabelle ─────────────────────────────────────────────────────
   Immer in einem Behälter mit eigener Querlaufleiste: auf einem schmalen
   Gerät rutscht die Tabelle, nie die Seite. */

export function Tabelle({
  minBreite,
  kopf,
  children,
}: {
  minBreite: number;
  kopf: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card overflow-x-auto px-1.5 py-3">
      <table className="tab-dk" style={{ minWidth: `${minBreite}px` }}>
        <thead>{kopf}</thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* ── Ereignisse ──────────────────────────────────────────────────
   Das Journal der Datenbank, unverändert in seiner Sprache: Kürzel der
   Aktion, Art des Akteurs, Nummer des Vorgangs, ein knappes Detail (Rolle,
   Feldgruppen). Kein Inhalt, keine Personendaten — das Journal führt sie
   nicht mit, und die Übersicht könnte sie auch nicht anzeigen. */

export function EreignisTabelle({
  ereignisse,
  mitVorgang = true,
}: {
  ereignisse: AdminEreignis[];
  mitVorgang?: boolean;
}) {
  if (ereignisse.length === 0) {
    return <p className="text-[12.5px] text-steel">Keine Ereignisse aufgezeichnet.</p>;
  }

  return (
    <Tabelle
      minBreite={mitVorgang ? 820 : 680}
      kopf={
        <tr>
          <th>Zeitpunkt</th>
          <th>Ereignis</th>
          <th>Akteur</th>
          {mitVorgang && <th>Vorgang</th>}
          <th>Detail</th>
        </tr>
      }
    >
      {ereignisse.map((e, i) => (
        <tr key={`${e.at}-${i}`}>
          <td className="tnum whitespace-nowrap text-fog">{zeitpunkt(e.at)}</td>
          <td>
            <span className="block text-chalk">{aktion(e.action)}</span>
            <span className="block text-[10px] text-steel">{e.action}</span>
          </td>
          <td>
            <span className="block text-chalk">{akteur(e.actor_kind)}</span>
            {e.actor_ref && (
              <span className="block max-w-[200px] truncate text-[10px] text-steel">
                {e.actor_ref}
              </span>
            )}
          </td>
          {mitVorgang && <td className="tnum text-fog">{e.fall_ref ?? "—"}</td>}
          <td className="max-w-[260px] truncate text-fog">{e.detail ?? "—"}</td>
        </tr>
      ))}
    </Tabelle>
  );
}

/* ── Auskünfte statt Fehlerbildschirme ───────────────────────── */

export function KeinZugriff() {
  return (
    <div className="mx-auto max-w-[520px] py-10">
      <h1 className="text-[26px] leading-tight">Plattform-Übersicht</h1>
      <p className="mt-3 text-[13px] leading-relaxed text-fog">
        Diese Übersicht ist der Plattform-Betreuung vorbehalten.
      </p>
    </div>
  );
}

export function Stoerung() {
  return (
    <div className="mx-auto max-w-[520px] py-10">
      <h1 className="text-[26px] leading-tight">Übersicht nicht verfügbar</h1>
      <p className="mt-3 text-[13px] leading-relaxed text-fog">
        Die Zahlen lassen sich gerade nicht laden. Bitte in einigen Minuten
        erneut versuchen.
      </p>
    </div>
  );
}

/* Ein Hinweis, der auf jedem Bildschirm der Übersicht steht: was hier fehlt,
   fehlt mit Absicht. */
export function Grenzhinweis() {
  return (
    <p className="mt-2 text-[12.5px] leading-relaxed text-fog">
      Metadaten und Verbindungen. Inhalte eines Vorgangs sind hier nicht
      einsehbar — ein Vorgang erscheint als Nummer und Phase.
    </p>
  );
}
