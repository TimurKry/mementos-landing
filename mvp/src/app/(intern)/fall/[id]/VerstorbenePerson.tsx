"use client";

import { useState, useTransition } from "react";
import { sichtbarFuerGruppe, tierGruppenTitel } from "@/lib/access";
import type { Deceased, Tier } from "@/lib/types";
import { verstorbeneSpeichernAction } from "./actions";
import { Speicherstand, type Stand } from "./speicherstand";

/* Die Angaben zur verstorbenen Person — nach Feldgruppen getrennt.

   Die Gruppierung ordnet den Bogen und bestimmt, was ein Knopf speichert.
   Über den Zugriff entscheidet sie seit 0015 NICHT mehr: gefiltert wird je
   Feld. Deshalb steht unter der Überschrift nicht ein Satz, sondern ein Satz
   je Empfängerkreis — Geburts- und Sterbedatum sieht der Steinmetz, Konfession
   und Anschrift daneben nicht. Abgeleitet aus derselben Matrix, die auch
   filtert (sichtbareFelder in src/lib/access.ts, Spiegel von
   app.sichtbare_felder).

   Jede Gruppe hat ihren eigenen Knopf und wird für sich gespeichert. Wer am
   Telefon nur den Namen erfährt, speichert den Namen; ein unvollständiges
   Geburtsdatum hält ihn nicht auf. Und beanstandet die Prüfung ein Feld,
   bleibt alles Eingegebene stehen — es geht nichts verloren. */

/* Alles als Zeichenkette: ein Eingabefeld kennt keine Zahl und kein null.
   Umgewandelt und geprüft wird auf dem Server. */
type Formular = {
  vorname: string; nachname: string;
  geburtsdatum: string; sterbedatum: string; konfession: string; anschrift: string;
  groesse_cm: string; gewicht_kg: string; sargmass: string;
  herzschrittmacher: boolean; infektionshinweis: string; freigabe_einaescherung: boolean;
};

const zahl = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));
const text = (s: string | null | undefined) => s ?? "";

function ausDaten(d: Deceased): Formular {
  return {
    vorname: text(d.vorname), nachname: text(d.nachname),
    geburtsdatum: text(d.geburtsdatum), sterbedatum: text(d.sterbedatum),
    konfession: text(d.konfession), anschrift: text(d.anschrift),
    groesse_cm: zahl(d.groesse_cm), gewicht_kg: zahl(d.gewicht_kg),
    sargmass: text(d.sargmass),
    herzschrittmacher: !!d.herzschrittmacher,
    infektionshinweis: text(d.infektionshinweis),
    freigabe_einaescherung: !!d.freigabe_einaescherung,
  };
}

/* Welche Felder eine Gruppe sendet — Spiegel von patchDerGruppe in
   actions.ts. Der Server liest ohnehin nur die Felder seiner Gruppe. */
const felderDerGruppe: Record<Tier, (keyof Formular)[]> = {
  kern: ["vorname", "nachname"],
  org: ["geburtsdatum", "sterbedatum", "konfession", "anschrift"],
  op: ["groesse_cm", "gewicht_kg", "sargmass"],
  sens: ["herzschrittmacher", "infektionshinweis", "freigabe_einaescherung"],
};

export function VerstorbenePerson({
  caseId,
  verstorbene,
}: {
  caseId: string;
  verstorbene: Deceased;
}) {
  const [f, setF] = useState<Formular>(() => ausDaten(verstorbene));
  const [staende, setStaende] = useState<Partial<Record<Tier, Stand>>>({});
  const [laeuft, setLaeuft] = useState<Tier | null>(null);
  const [pending, start] = useTransition();

  function setze<K extends keyof Formular>(feld: K, wert: Formular[K], tier: Tier) {
    setF((alt) => ({ ...alt, [feld]: wert }));
    setStaende((alt) => ({ ...alt, [tier]: { art: "still" } }));
  }

  function speichern(tier: Tier) {
    setLaeuft(tier);
    start(async () => {
      const werte: Record<string, unknown> = {};
      for (const k of felderDerGruppe[tier]) werte[k] = f[k];
      const res = await verstorbeneSpeichernAction(caseId, tier, werte);
      setStaende((alt) => ({
        ...alt,
        [tier]: res.ok ? { art: "ok" } : { art: "fehler", text: res.fehler },
      }));
      setLaeuft(null);
    });
  }

  const busy = (tier: Tier) => pending && laeuft === tier;

  return (
    <div className="grid gap-3">
      <Gruppe tier="kern" stand={staende.kern} laeuft={busy("kern")} speichern={speichern}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Feld beschriftung="Vorname">
            <input
              type="text" className="input-dk" maxLength={80} autoComplete="off"
              value={f.vorname}
              onChange={(e) => setze("vorname", e.target.value, "kern")}
            />
          </Feld>
          <Feld beschriftung="Nachname">
            <input
              type="text" className="input-dk" maxLength={80} autoComplete="off"
              value={f.nachname}
              onChange={(e) => setze("nachname", e.target.value, "kern")}
            />
          </Feld>
        </div>
      </Gruppe>

      <Gruppe tier="org" stand={staende.org} laeuft={busy("org")} speichern={speichern}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Feld beschriftung="Geburtsdatum">
            <input
              type="date" className="input-dk"
              value={f.geburtsdatum}
              onChange={(e) => setze("geburtsdatum", e.target.value, "org")}
            />
          </Feld>
          <Feld beschriftung="Sterbedatum">
            <input
              type="date" className="input-dk"
              value={f.sterbedatum}
              onChange={(e) => setze("sterbedatum", e.target.value, "org")}
            />
          </Feld>
          <Feld beschriftung="Konfession">
            <input
              type="text" className="input-dk" maxLength={60} autoComplete="off"
              placeholder="ohne Angabe"
              value={f.konfession}
              onChange={(e) => setze("konfession", e.target.value, "org")}
            />
          </Feld>
          <Feld beschriftung="Anschrift">
            <input
              type="text" className="input-dk" maxLength={200} autoComplete="off"
              placeholder="ohne Angabe"
              value={f.anschrift}
              onChange={(e) => setze("anschrift", e.target.value, "org")}
            />
          </Feld>
        </div>
      </Gruppe>

      <Gruppe tier="op" stand={staende.op} laeuft={busy("op")} speichern={speichern}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Feld beschriftung="Größe (cm)">
            <input
              type="number" inputMode="numeric" className="input-dk" min={30} max={260} step={1}
              placeholder="—"
              value={f.groesse_cm}
              onChange={(e) => setze("groesse_cm", e.target.value, "op")}
            />
          </Feld>
          <Feld beschriftung="Gewicht (kg)">
            <input
              type="number" inputMode="numeric" className="input-dk" min={1} max={400} step={1}
              placeholder="—"
              value={f.gewicht_kg}
              onChange={(e) => setze("gewicht_kg", e.target.value, "op")}
            />
          </Feld>
          <Feld beschriftung="Sargmaß">
            <input
              type="text" className="input-dk" maxLength={60} autoComplete="off"
              placeholder="z. B. Standard"
              value={f.sargmass}
              onChange={(e) => setze("sargmass", e.target.value, "op")}
            />
          </Feld>
        </div>
      </Gruppe>

      <Gruppe tier="sens" stand={staende.sens} laeuft={busy("sens")} speichern={speichern}>
        <div className="grid gap-3">
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox" className="check-dk"
              checked={f.herzschrittmacher}
              onChange={(e) => setze("herzschrittmacher", e.target.checked, "sens")}
            />
            <span className="text-[13px] text-chalk">Herzschrittmacher vorhanden</span>
          </label>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox" className="check-dk"
              checked={f.freigabe_einaescherung}
              onChange={(e) => setze("freigabe_einaescherung", e.target.checked, "sens")}
            />
            <span className="text-[13px] text-chalk">Freigabe zur Einäscherung liegt vor</span>
          </label>

          <Feld beschriftung="Infektionshinweis">
            <textarea
              className="textarea-dk" maxLength={500} rows={3}
              placeholder="nur, wenn ein Hinweis vorliegt"
              value={f.infektionshinweis}
              onChange={(e) => setze("infektionshinweis", e.target.value, "sens")}
            />
          </Feld>
        </div>
      </Gruppe>
    </div>
  );
}

function Gruppe({
  tier,
  stand,
  laeuft,
  speichern,
  children,
}: {
  tier: Tier;
  stand: Stand | undefined;
  laeuft: boolean;
  speichern: (t: Tier) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4">
      <div className="text-[10px] font-medium text-fog">{tierGruppenTitel[tier]}</div>
      {sichtbarFuerGruppe(tier).map((kreis) => (
        <p key={kreis.satz} className="mt-1 text-[10.5px] leading-relaxed text-steel">
          {kreis.felder && <span className="text-fog">{kreis.felder}: </span>}
          {kreis.satz}
        </p>
      ))}

      <div className="mt-3">{children}</div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => speichern(tier)}
          disabled={laeuft}
          className="btn-ghost px-3.5 py-2 text-[12.5px] disabled:opacity-60"
        >
          {laeuft ? "Einen Moment …" : "Speichern"}
        </button>
        <Speicherstand stand={stand ?? { art: "still" }} />
      </div>
    </section>
  );
}

function Feld({ beschriftung, children }: { beschriftung: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] text-steel">{beschriftung}</span>
      {children}
    </label>
  );
}
