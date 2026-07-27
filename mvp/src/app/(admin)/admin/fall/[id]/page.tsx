import { notFound } from "next/navigation";
import { adminEreignisse, adminFallKontext, adminZugaenge } from "@/lib/admin";
import { laden } from "../../laden";
import { datum, zeitpunkt } from "../../format";
import {
  EreignisTabelle, KeinZugriff, Kennzahl, Krumen, PhasenBadge, Stoerung,
} from "../../ui";
import { Zugaenge } from "./Zugaenge";
import { zuAnsicht } from "./zugang-view";

/* Tiefste Ebene: ein Vorgang. Zu sehen ist, welche Zugänge bestehen und wer
   sie benutzt — nicht, was hinter ihnen liegt. Der Vorgang trägt hier keinen
   Namen, nur seine Nummer und seine Phase.

   Vorgang und Haus kommen aus einem Aufruf (admin_fall, 0009); die Adresse
   braucht deshalb keinen Hinweis auf das Haus mehr. */
export const dynamic = "force-dynamic";

const EREIGNISSE_JE_FALL = 25;

export default async function FallSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ladung = await laden(async () => {
    const kontext = await adminFallKontext(id);
    if (!kontext) return null;
    const [zugaenge, ereignisse] = await Promise.all([
      adminZugaenge(id),
      adminEreignisse(id, EREIGNISSE_JE_FALL),
    ]);
    return { ...kontext, zugaenge, ereignisse };
  });

  if (!ladung.ok) return ladung.grund === "betreuung" ? <KeinZugriff /> : <Stoerung />;
  if (!ladung.daten) notFound();

  const { fall, haus, zugaenge, ereignisse } = ladung.daten;
  const abgeschlossen = fall.phase === "abschluss";

  return (
    <div>
      <Krumen
        pfad={[
          { href: "/admin", text: "Plattform-Übersicht" },
          { href: `/admin/haus/${haus.haus_id}`, text: haus.org_name },
          { text: fall.ref },
        ]}
      />

      <div className="hair mb-6 mt-4 flex flex-wrap items-end justify-between gap-4 pb-5">
        <div>
          <div className="text-[11px] text-fog">Vorgang</div>
          <h1 className="tnum mt-1.5 text-[28px] leading-tight">{fall.ref}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <PhasenBadge phase={fall.phase} />
          <span className="badge badge-dim">{abgeschlossen ? "abgeschlossen" : "offen"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kennzahl titel="Angelegt" wert={datum(fall.created_at)} />
        <Kennzahl titel="Termin" wert={datum(fall.target_date)} />
        <Kennzahl titel="Beteiligte" wert={fall.beteiligte} />
        <Kennzahl titel="Aktive Zugänge" wert={fall.zugaenge_aktiv} />
        <Kennzahl titel="Aktive Sitzungen" wert={fall.sitzungen_aktiv} />
        <Kennzahl titel="Letzte Aktivität" wert={zeitpunkt(fall.letzte_aktivitaet)} />
      </div>

      <section className="mt-8">
        <h2 className="mb-1.5 text-[15px]">Zugänge</h2>
        <p className="mb-3 text-[12.5px] leading-relaxed text-fog">
          Wer Zugang zu diesem Vorgang hat, in welcher Rolle und seit wann.
          Zurückziehen wirkt sofort und beendet die offenen Sitzungen des
          Zugangs.
        </p>
        <Zugaenge fallId={id} zugaenge={zuAnsicht(zugaenge)} />
      </section>

      <section className="mt-8">
        <h2 className="mb-2.5 text-[15px]">Ereignisse</h2>
        <EreignisTabelle ereignisse={ereignisse} mitVorgang={false} />
        <p className="mt-2.5 text-[10.5px] text-steel">
          Die letzten {EREIGNISSE_JE_FALL} Ereignisse dieses Vorgangs. Zeitangaben in UTC.
        </p>
      </section>
    </div>
  );
}
