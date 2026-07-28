import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCaseBySession } from "@/lib/data";
import { feldLabel, roleLabel } from "@/lib/access";
import { ZUGANG_COOKIE } from "@/lib/zugang";
import type { Deceased, RoleView, RollenTermin } from "@/lib/types";
import { AngabenBogen } from "./AngabenBogen";
import { ZugangBeenden } from "./ZugangBeenden";
import { ZugangTermine } from "./ZugangTermine";

/* Ansicht der Eingeladenen. Der Token steht nicht mehr in der Adresszeile —
   die Sitzung kommt aus dem Cookie, gefiltert wird serverseitig nach Rolle
   (get_case_by_session). Was eine Rolle nicht sehen darf, wird nicht
   ausgeblendet, sondern gar nicht erst geliefert. */

export const dynamic = "force-dynamic";

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
  /* Was diese Rolle ändern darf (0012). Fehlt der Schlüssel, ist die Sitzung
     älter als die Migration — dann nur lesen, wie bisher. */
  const schreibbar = view.schreibbar ?? [];
  /* Ein änderbares Feld steht im Bogen, nicht zusätzlich in der Leseliste:
     zweimal dieselbe Angabe untereinander liest sich wie ein Fehler. */
  const fields = (Object.keys(d) as (keyof Deceased)[])
    .filter((k) => d[k] != null && d[k] !== "")
    .filter((k) => !schreibbar.includes(k));
  const name = [d.vorname, d.nachname].filter(Boolean).join(" ");
  /* Fehlt der Schlüssel, ist die Sitzung älter als 0011 — dann keine Termine,
     aber auch kein Absturz. */
  const termine = view.termine ?? [];
  /* Floristik, Redner und Steinmetz sehen von der verstorbenen Person nichts
     — für sie ist der Termin die ganze Auskunft. Dann steht er oben. */
  const terminZuerst = fields.length === 0 && schreibbar.length === 0;

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="badge badge-blue mb-4">
        <span className="h-1 w-1 rounded-full bg-current" />
        Ansicht als {roleLabel[view.role]}
      </div>
      {/* Ohne Namen wäre die Kennung zweimal zu lesen — Floristik, Redner und
          Steinmetz bekommen keinen Namen zu sehen, und «M-2026-0147» über
          «M-2026-0147» sieht aus wie ein Fehler. */}
      <div className="text-[10px] font-medium text-fog">
        {name ? `${view.ref} · ${view.bestattungsart}` : view.bestattungsart}
      </div>
      <h1 className="mt-1 text-[26px] leading-tight">{name || view.ref}</h1>
      <p className="mt-2 text-[13px] text-fog">
        Sie sehen nur, was Ihre Rolle betrifft. Alles andere bleibt verborgen.
      </p>

      {terminZuerst && <TermineAbschnitt termine={termine} />}

      {/* видимые поля */}
      {fields.length > 0 && (
        <section className="mt-6">
          <div className="mb-2.5 text-[10px] font-medium text-fog">Angaben</div>
          <div className="card grid grid-cols-2 gap-x-4 gap-y-2.5 p-4 text-[13px]">
            {fields.map((k) => (
              <span key={k} className="flex flex-col">
                <span className="text-[10px] text-steel">{feldLabel[k]}</span>
                <span className="text-chalk">
                  {typeof d[k] === "boolean" ? (d[k] ? "Ja" : "Nein") : String(d[k])}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Was die Familie beitragen kann. Steht unter den bekannten Angaben:
          erst zeigen, was schon da ist, dann fragen. */}
      {schreibbar.length > 0 && (
        <section className="mt-6">
          <div className="mb-2.5 text-[10px] font-medium text-fog">Ihre Angaben</div>
          <AngabenBogen felder={schreibbar} werte={d} />
        </section>
      )}

      {!terminZuerst && <TermineAbschnitt termine={termine} />}

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

/* Termine der eigenen Rolle. Ein leerer Abschnitt bleibt weg — aber nur,
   wenn wirklich keiner vorliegt: «keine Termine» ist eine Auskunft, eine
   leere Fläche ist keine. */
function TermineAbschnitt({ termine }: { termine: RollenTermin[] }) {
  return (
    <section className="mt-6">
      <div className="mb-2.5 text-[10px] font-medium text-fog">Termine</div>
      {termine.length === 0 ? (
        <p className="text-[12.5px] leading-relaxed text-steel">
          Für Ihre Rolle ist noch kein Termin eingetragen. Sobald das
          Bestattungshaus Zeit und Ort festlegt, stehen sie hier.
        </p>
      ) : (
        <ZugangTermine termine={termine} />
      )}
    </section>
  );
}
