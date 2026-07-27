import { adminEreignisse } from "@/lib/admin";
import { laden } from "../laden";
import { EreignisTabelle, KeinZugriff, Krumen, Stoerung } from "../ui";

/* Journal der ganzen Plattform. Dieselben Zeilen wie im Vorgang, nur ohne
   Vorauswahl — und mit der Nummer des Vorgangs als Spalte. */
export const dynamic = "force-dynamic";

const GRENZE = 50;

export default async function EreignisseSeite() {
  const ladung = await laden(() => adminEreignisse(null, GRENZE));
  if (!ladung.ok) return ladung.grund === "betreuung" ? <KeinZugriff /> : <Stoerung />;

  return (
    <div>
      <Krumen pfad={[{ href: "/admin", text: "Plattform-Übersicht" }, { text: "Ereignisse" }]} />

      <div className="mb-6 mt-4">
        <div className="text-[11px] text-fog">Plattform</div>
        <h1 className="mt-1.5 text-[28px] leading-tight">Ereignisse</h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-fog">
          Zugänge, Einlösungen, Sitzungen. Das Journal führt Rolle, Zeitpunkt
          und Vorgangsnummer — keine Inhalte.
        </p>
      </div>

      <EreignisTabelle ereignisse={ladung.daten} />

      <p className="mt-2.5 text-[10.5px] text-steel">
        Die letzten {GRENZE} Ereignisse. Zeitangaben in UTC.
      </p>
    </div>
  );
}
