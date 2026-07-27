import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase, isMock, listInvites } from "@/lib/data";
import { roleLabel } from "@/lib/access";
import type { InviteSummary } from "@/lib/types";
import { DEMO_CASE_ID, DEMO_FAMILY_TOKEN, DEMO_KREMATORIUM_TOKEN } from "@/lib/mock";
import { TaskItem } from "./TaskItem";
import { Einladungen } from "./Einladungen";
import { zuAnsicht } from "./invite-view";

/* Карточка фалла — полный вид владельца (Bestatter): все поля, участники,
   задачи, документы + ссылки-приглашения (роль-фильтрованный вид).

   Kein Vorab-Rendern: Falldaten gehören in keinen Cache, und die CSP
   bekommt je Anfrage einen frischen nonce. */
export const dynamic = "force-dynamic";

export default async function FallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCase(id);
  if (!c) notFound();

  const d = c.verstorbene;
  const name = [d.vorname, d.nachname].filter(Boolean).join(" ");
  const offen = c.aufgaben.filter((t) => t.status === "offen").length;

  /* Die Übersicht der Einladungen darf den Fall nicht mitreissen: eine Störung
     hier heisst nicht, dass keine Zugänge vergeben sind — das sagt die
     Oberfläche dann auch so, statt eine leere Liste zu zeigen. */
  let invites: InviteSummary[] = [];
  let ladefehler = false;
  try {
    invites = await listInvites(id);
  } catch {
    ladefehler = true;
  }

  return (
    <div>
      <Link href="/" className="text-[13px] text-fog hover:text-white">← Alle Vorgänge</Link>

      <div className="hair mb-6 mt-4 flex flex-wrap items-end justify-between gap-4 pb-5">
        <div>
          <div className="text-[10px] font-medium text-fog">{c.ref} · {c.bestattungsart}</div>
          <h1 className="mt-1 text-[28px] leading-tight">{name || c.ref}</h1>
        </div>
        <span className={`badge ${offen === 0 ? "badge-green" : "badge-dim"}`}>
          {offen === 0 ? "keine offenen Aufgaben" : `${offen} offen`}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-6">
          {/* Verstorbene — полный набор полей (владелец) */}
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Verstorbene Person</div>
            <div className="card grid grid-cols-2 gap-x-4 gap-y-2.5 p-4 text-[13px]">
              <Field k="Name" v={name} />
              <Field k="Geburts-/Sterbedatum" v={`${d.geburtsdatum ?? "—"} · ${d.sterbedatum ?? "—"}`} />
              <Field k="Konfession" v={d.konfession} />
              <Field k="Anschrift" v={d.anschrift} />
              <Field k="Größe · Gewicht" v={`${d.groesse_cm ?? "—"} cm · ${d.gewicht_kg ?? "—"} kg`} />
              <Field k="Sargmaß" v={d.sargmass} />
              <Field k="Herzschrittmacher" v={d.herzschrittmacher ? "Ja" : "Nein"} accent={d.herzschrittmacher} />
              <Field k="Freigabe Einäscherung" v={d.freigabe_einaescherung ? "Ja" : "offen"} />
            </div>
          </section>

          {/* Beteiligte */}
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Beteiligte</div>
            <div className="grid gap-2">
              {c.beteiligte.map((p) => (
                <div key={p.role} className="card flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span>
                    <b className="text-[13px] font-medium">{p.org ?? roleLabel[p.role]}</b>
                    <span className="ml-2 text-[10.5px] text-fog">{roleLabel[p.role]}</span>
                  </span>
                  <span className={`badge ${p.joined ? "badge-green" : "badge-dim"}`}>
                    {p.joined ? "beigetreten" : "offen"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Dokumente */}
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Unterlagen</div>
            <div className="grid gap-2">
              {c.dokumente.length === 0 && <div className="text-[12px] text-steel">Noch keine Unterlagen.</div>}
              {c.dokumente.map((doc) => (
                <div key={doc.doc_type} className="card flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="text-[13px] text-chalk">{doc.doc_type}</span>
                  <span className={`badge ${doc.verified ? "badge-green" : "badge-dim"}`}>
                    {doc.verified ? "verifiziert" : "ausstehend"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* правая колонка: задачи + ссылки-приглашения */}
        <aside className="grid gap-5">
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Aufgaben</div>
            <div className="grid gap-2">
              {c.aufgaben.map((t) => <TaskItem key={t.id} caseId={c.id} task={t} />)}
            </div>
          </section>

          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Zugang per Link</div>
            <p className="mb-2.5 text-[11.5px] leading-relaxed text-steel">
              Beteiligte treten ohne Konto bei und sehen nur ihren Teil.
            </p>

            <Einladungen caseId={c.id} einladungen={zuAnsicht(invites)} ladefehler={ladefehler} />

            {/* Die beiden festen Ansichten der Vorführung — nur im Mock-Modus
                und nur an dem Fall, zu dem ihre Einladungen gehören. */}
            {isMock && c.id === DEMO_CASE_ID && (
              <div className="mt-4">
                <div className="hair mb-3" />
                <p className="mb-2 text-[10.5px] leading-relaxed text-steel">
                  Beispieldaten: zwei feste Ansichten zum Vorführen.
                </p>
                <div className="grid gap-2">
                  <InviteLink token={DEMO_FAMILY_TOKEN} label="Als Familie ansehen" />
                  <InviteLink token={DEMO_KREMATORIUM_TOKEN} label="Als Krematorium ansehen" />
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Field({ k, v, accent }: { k: string; v?: string | null; accent?: boolean }) {
  return (
    <span className="flex flex-col">
      <span className="text-[10px] text-steel">{k}</span>
      <span className={accent ? "text-coral" : "text-chalk"}>{v || "—"}</span>
    </span>
  );
}

/* Bewusst ein <a> statt next/link: hinter dem Pfad steht kein Bildschirm,
   sondern der Einlöse-Handler. Ein Prefetch beim Überfahren des Knopfes
   würde den Link einlösen, bevor jemand geklickt hat. */
function InviteLink({ token, label }: { token: string; label: string }) {
  return (
    <a href={`/einladung/${token}`} className="btn-ghost px-3.5 py-2 text-[12.5px]">
      {label} →
    </a>
  );
}
