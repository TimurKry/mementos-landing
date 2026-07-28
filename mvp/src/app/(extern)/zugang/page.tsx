import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCaseBySession } from "@/lib/data";
import { roleLabel } from "@/lib/access";
import { ZUGANG_COOKIE } from "@/lib/zugang";
import type { Deceased, RoleView } from "@/lib/types";
import { ZugangBeenden } from "./ZugangBeenden";

/* Ansicht der Eingeladenen. Der Token steht nicht mehr in der Adresszeile —
   die Sitzung kommt aus dem Cookie, gefiltert wird serverseitig nach Rolle
   (get_case_by_session). Was eine Rolle nicht sehen darf, wird nicht
   ausgeblendet, sondern gar nicht erst geliefert. */

export const dynamic = "force-dynamic";

const fieldLabel: Record<keyof Deceased, string> = {
  vorname: "Vorname", nachname: "Nachname",
  geburtsdatum: "Geburtsdatum", sterbedatum: "Sterbedatum",
  konfession: "Konfession", anschrift: "Anschrift",
  groesse_cm: "Größe (cm)", gewicht_kg: "Gewicht (kg)", sargmass: "Sargmaß",
  herzschrittmacher: "Herzschrittmacher", infektionshinweis: "Infektionshinweis",
  freigabe_einaescherung: "Freigabe Einäscherung",
};

export default async function ZugangPage() {
  const session = (await cookies()).get(ZUGANG_COOKIE)?.value;
  if (!session) redirect("/einladung/ungueltig");

  let view: RoleView | null;
  try {
    view = await getCaseBySession(session);
  } catch {
    redirect("/einladung/ungueltig?grund=technik");
  }
  if (!view) redirect("/einladung/ungueltig");

  const d = view.verstorbene;
  /* null zählt wie «nicht vorhanden»: die Datenbankfunktion liefert für eine
     leere Angabe null, und «null» ist keine Auskunft, die jemand lesen soll. */
  const fields = (Object.keys(d) as (keyof Deceased)[]).filter((k) => d[k] != null && d[k] !== "");
  const name = [d.vorname, d.nachname].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="badge badge-blue mb-4">
        <span className="h-1 w-1 rounded-full bg-current" />
        Ansicht als {roleLabel[view.role]}
      </div>
      <div className="text-[10px] font-medium text-fog">{view.ref} · {view.bestattungsart}</div>
      <h1 className="mt-1 text-[26px] leading-tight">{name || view.ref}</h1>
      <p className="mt-2 text-[13px] text-fog">
        Sie sehen nur, was Ihre Rolle betrifft. Alles andere bleibt verborgen.
      </p>

      {/* видимые поля */}
      {fields.length > 0 && (
        <section className="mt-6">
          <div className="mb-2.5 text-[10px] font-medium text-fog">Angaben</div>
          <div className="card grid grid-cols-2 gap-x-4 gap-y-2.5 p-4 text-[13px]">
            {fields.map((k) => (
              <span key={k} className="flex flex-col">
                <span className="text-[10px] text-steel">{fieldLabel[k]}</span>
                <span className="text-chalk">
                  {typeof d[k] === "boolean" ? (d[k] ? "Ja" : "Nein") : String(d[k])}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* участники (без внутренних имён) */}
      <section className="mt-6">
        <div className="mb-2.5 text-[10px] font-medium text-fog">Beteiligte</div>
        <div className="flex flex-wrap gap-2">
          {view.beteiligte.map((p) => (
            <span key={p.role} className={`badge ${p.joined ? "badge-green" : "badge-dim"}`}>
              {roleLabel[p.role]}
            </span>
          ))}
        </div>
      </section>

      {/* задачи роли */}
      {view.aufgaben.length > 0 && (
        <section className="mt-6">
          <div className="mb-2.5 text-[10px] font-medium text-fog">Ihre Aufgaben</div>
          <div className="grid gap-2">
            {view.aufgaben.map((t, i) => (
              <div key={i} className="card flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[13px] text-chalk">{t.title}</span>
                <span className={`badge ${t.status === "erledigt" ? "badge-green" : "badge-dim"}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* документы роли */}
      {view.dokumente.length > 0 && (
        <section className="mt-6">
          <div className="mb-2.5 text-[10px] font-medium text-fog">Unterlagen</div>
          <div className="grid gap-2">
            {view.dokumente.map((doc, i) => (
              <div key={i} className="card flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[13px] text-chalk">{doc.doc_type}</span>
                <span className={`badge ${doc.verified ? "badge-green" : "badge-dim"}`}>
                  {doc.verified ? "verifiziert" : "ausstehend"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* подвал: правила этого доступа + выход */}
      <div className="hair mt-10" />
      <section className="pt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[440px]">
            <p className="text-[11.5px] leading-relaxed text-steel">
              Dieser Zugang ist zeitlich begrenzt und kann jederzeit zurückgezogen
              werden. Bitte geben Sie den Link nicht weiter — er gilt für Ihre Rolle.
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-steel">
              Zugriffe auf diesen Fall werden protokolliert.
            </p>
          </div>
          <ZugangBeenden />
        </div>
        <p className="mt-6 text-[11px] text-steel">
          MementoOS · Zugang ohne Konto · Beispieldaten
        </p>
      </section>
    </div>
  );
}
