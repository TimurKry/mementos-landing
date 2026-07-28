import Link from "next/link";
import { listCases } from "@/lib/data";
import { phaseLabel } from "@/lib/access";

/* Dashboard: обзор фаллов владельца (Bestatter).
   Kein Vorab-Rendern: die Vorgänge hängen am angemeldeten Haus, und die
   Konfigurationsprüfung muss bei jeder Anfrage laufen. */
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const cases = await listCases();
  const active = cases.filter((c) => c.phase !== "abschluss").length;

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium text-signal">Arbeitsbereich</div>
          <h1 className="mt-1.5 text-[30px] leading-tight">Guten Morgen. Hier steht alles.</h1>
          <p className="mt-2 text-[13px] text-fog">
            {active} aktive Vorgänge · klicken Sie einen Fall an.
          </p>
        </div>
        <Link href="/fall/neu" className="btn-bone px-4 py-2.5 text-[13px] font-medium">
          Neuer Vorgang
        </Link>
      </div>

      {cases.length === 0 && (
        <p className="text-[13px] text-steel">
          Noch kein Vorgang angelegt.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => {
          const offen = c.aufgaben.filter((t) => t.status === "offen").length;
          const name = [c.verstorbene.vorname, c.verstorbene.nachname].filter(Boolean).join(" ");
          return (
            <Link key={c.id} href={`/fall/${c.id}`} className="card card-hover block p-4">
              <div className="flex items-baseline justify-between gap-2">
                <b className="text-[14px] font-medium">{name || c.ref}</b>
                <span className="text-[10px] text-steel">{c.ref.slice(-4)}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-fog">{c.bestattungsart}</div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="badge badge-dim">{phaseLabel[c.phase]}</span>
                {offen > 0 ? (
                  <span className="badge badge-blue">{offen} offen</span>
                ) : (
                  <span className="badge badge-green">alles erledigt</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
