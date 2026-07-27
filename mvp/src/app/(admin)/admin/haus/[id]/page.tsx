import Link from "next/link";
import { notFound } from "next/navigation";
import { adminFaelle, adminHaeuser } from "@/lib/admin";
import { laden } from "../../laden";
import { datum, zahl, zeitpunkt } from "../../format";
import {
  Grenzhinweis, KeinZugriff, Kennzahl, Krumen, PhasenBadge, Stoerung, Tabelle,
} from "../../ui";

/* Zweite Ebene: ein Haus mit seinen Vorgängen. Weiterhin nur Metadaten —
   Nummer, Phase, Zeitpunkte, Zähler. */
export const dynamic = "force-dynamic";

export default async function HausSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ladung = await laden(async () => {
    const haus = (await adminHaeuser()).find((h) => h.haus_id === id) ?? null;
    if (!haus) return null;
    return { haus, faelle: await adminFaelle(id) };
  });

  if (!ladung.ok) return ladung.grund === "betreuung" ? <KeinZugriff /> : <Stoerung />;
  if (!ladung.daten) notFound();

  const { haus, faelle } = ladung.daten;

  return (
    <div>
      <Krumen pfad={[{ href: "/admin", text: "Plattform-Übersicht" }, { text: haus.org_name }]} />

      <div className="mb-7 mt-4">
        <div className="text-[11px] text-fog">Haus</div>
        <h1 className="mt-1.5 text-[28px] leading-tight">{haus.org_name}</h1>
        <Grenzhinweis />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kennzahl titel="Vorgänge gesamt" wert={haus.faelle_gesamt} />
        <Kennzahl titel="davon offen" wert={haus.faelle_offen} />
        <Kennzahl titel="davon abgeschlossen" wert={haus.faelle_abgeschlossen} />
        <Kennzahl titel="Aktive Zugänge" wert={haus.zugaenge_aktiv} />
        <Kennzahl titel="Aktive Sitzungen" wert={haus.sitzungen_aktiv} />
        <Kennzahl titel="Letzte Aktivität" wert={zeitpunkt(haus.letzte_aktivitaet)} />
      </div>

      <section className="mt-8">
        <h2 className="mb-2.5 text-[15px]">Vorgänge</h2>

        {faelle.length === 0 ? (
          <p className="text-[12.5px] text-steel">Keine Vorgänge in diesem Haus.</p>
        ) : (
          <Tabelle
            minBreite={860}
            kopf={
              <tr>
                <th>Vorgang</th>
                <th>Phase</th>
                <th>Angelegt</th>
                <th>Termin</th>
                <th className="r">Beteiligte</th>
                <th className="r">Zugänge</th>
                <th className="r">Sitzungen</th>
                <th>Letzte Aktivität</th>
              </tr>
            }
          >
            {faelle.map((f) => (
              <tr key={f.fall_id}>
                <td>
                  <Link
                    href={`/admin/fall/${f.fall_id}`}
                    className="tnum text-chalk transition-colors hover:text-white"
                  >
                    {f.ref}
                  </Link>
                </td>
                <td>
                  <PhasenBadge phase={f.phase} />
                </td>
                <td className="tnum text-fog">{datum(f.created_at)}</td>
                <td className="tnum text-fog">{datum(f.target_date)}</td>
                <td className="r text-chalk">{zahl(f.beteiligte)}</td>
                <td className="r text-chalk">{zahl(f.zugaenge_aktiv)}</td>
                <td className="r">
                  {f.sitzungen_aktiv > 0 ? (
                    <span className="badge badge-blue">{zahl(f.sitzungen_aktiv)}</span>
                  ) : (
                    <span className="text-steel">0</span>
                  )}
                </td>
                <td className="text-fog">{zeitpunkt(f.letzte_aktivitaet)}</td>
              </tr>
            ))}
          </Tabelle>
        )}

        <p className="mt-2.5 text-[10.5px] text-steel">Zeitangaben in UTC.</p>
      </section>
    </div>
  );
}
