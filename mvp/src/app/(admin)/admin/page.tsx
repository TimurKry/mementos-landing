import Link from "next/link";
import { adminHaeuser, adminUebersicht } from "@/lib/admin";
import { laden } from "./laden";
import { zahl, zeitpunkt } from "./format";
import { Grenzhinweis, KeinZugriff, Kennzahl, PhasenBalken, Stoerung, Tabelle } from "./ui";

/* Plattform-Übersicht — oberste Ebene: was steht wie, wer ist angebunden.
   Von hier geht es in ein Haus, von dort in einen Vorgang, von dort in einen
   Zugang. Auf jeder Ebene nur Zähler und Verbindungen.

   Kein Vorab-Rendern: die Zahlen sind Zustand, kein Inhalt einer Seite. */
export const dynamic = "force-dynamic";

export default async function PlattformSeite() {
  const [uebersicht, haeuser] = await Promise.all([
    laden(adminUebersicht),
    laden(adminHaeuser),
  ]);

  if (!uebersicht.ok) {
    return uebersicht.grund === "betreuung" ? <KeinZugriff /> : <Stoerung />;
  }

  const u = uebersicht.daten;

  return (
    <div>
      <div className="mb-7">
        <div className="text-[11px] text-fog">Plattform</div>
        <h1 className="mt-1.5 text-[30px] leading-tight">Plattform-Übersicht</h1>
        <Grenzhinweis />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kennzahl titel="Häuser" wert={u.haeuser} />
        <Kennzahl titel="Vorgänge gesamt" wert={u.faelle_gesamt} />
        <Kennzahl titel="davon offen" wert={u.faelle_offen} />
        <Kennzahl titel="davon abgeschlossen" wert={u.faelle_abgeschlossen} />
        <Kennzahl titel="Aktive Zugänge" wert={u.zugaenge_aktiv} />
        <Kennzahl titel="Zurückgezogene Zugänge" wert={u.zugaenge_zurueckgezogen} />
        <Kennzahl titel="Aktive Sitzungen" wert={u.sitzungen_aktiv} hinweis="gerade offen" />
        <Kennzahl titel="Ereignisse" wert={u.ereignisse_24h} hinweis="letzte 24 Stunden" />
      </div>

      <div className="mt-3">
        <PhasenBalken phasen={u.phasen} />
      </div>

      <section className="mt-8">
        <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px]">Häuser</h2>
          <Link
            href="/admin/ereignisse"
            className="text-[12px] text-fog transition-colors hover:text-white"
          >
            Ereignisse der Plattform →
          </Link>
        </div>

        {!haeuser.ok && (
          <p className="text-[12.5px] leading-relaxed text-steel">
            {haeuser.grund === "betreuung"
              ? "Diese Übersicht ist der Plattform-Betreuung vorbehalten."
              : "Die Liste der Häuser lässt sich gerade nicht laden."}
          </p>
        )}

        {haeuser.ok && haeuser.daten.length === 0 && (
          <p className="text-[12.5px] text-steel">Keine Häuser angebunden.</p>
        )}

        {haeuser.ok && haeuser.daten.length > 0 && (
          <Tabelle
            minBreite={780}
            kopf={
              <tr>
                <th>Haus</th>
                <th className="r">Vorgänge</th>
                <th className="r">offen</th>
                <th className="r">abgeschlossen</th>
                <th className="r">Zugänge</th>
                <th className="r">Sitzungen</th>
                <th>Letzte Aktivität</th>
              </tr>
            }
          >
            {haeuser.daten.map((h) => (
              <tr key={h.haus_id}>
                <td>
                  <Link
                    href={`/admin/haus/${h.haus_id}`}
                    className="text-chalk transition-colors hover:text-white"
                  >
                    {h.org_name}
                  </Link>
                </td>
                <td className="r text-chalk">{zahl(h.faelle_gesamt)}</td>
                <td className="r text-chalk">{zahl(h.faelle_offen)}</td>
                <td className="r text-fog">{zahl(h.faelle_abgeschlossen)}</td>
                <td className="r text-chalk">{zahl(h.zugaenge_aktiv)}</td>
                <td className="r">
                  {h.sitzungen_aktiv > 0 ? (
                    <span className="badge badge-blue">{zahl(h.sitzungen_aktiv)}</span>
                  ) : (
                    <span className="text-steel">0</span>
                  )}
                </td>
                <td className="text-fog">{zeitpunkt(h.letzte_aktivitaet)}</td>
              </tr>
            ))}
          </Tabelle>
        )}

        <p className="mt-2.5 text-[10.5px] text-steel">Zeitangaben in UTC.</p>
      </section>
    </div>
  );
}
