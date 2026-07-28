import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase, isMock, listInvites, listVerlauf } from "@/lib/data";
import { phaseLabel } from "@/lib/access";
import type { InviteSummary } from "@/lib/types";
import { DEMO_CASE_ID, DEMO_FAMILY_TOKEN, DEMO_KREMATORIUM_TOKEN } from "@/lib/mock";
import { Aufgaben } from "./Aufgaben";
import { Beteiligte } from "./Beteiligte";
import { Einladungen } from "./Einladungen";
import { Termine } from "./Termine";
import { VerstorbenePerson } from "./VerstorbenePerson";
import { Verlauf } from "./Verlauf";
import { Vorgang } from "./Vorgang";
import { zuAnsicht } from "./invite-view";
import type { Verlaufseintrag } from "@/lib/verlauf";

/* Карточка фалла — полный вид владельца (Bestatter): все поля, участники,
   задачи, документы + ссылки-приглашения (роль-фильтрованный вид).
   Zugleich der Arbeitsplatz: alle Angaben sind hier auch änderbar.

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

  /* Dasselbe für den Verlauf: eine Störung hier darf weder den Fall
     mitreissen noch aussehen wie «es ist nichts geschehen». */
  let verlauf: Verlaufseintrag[] = [];
  let verlaufFehler = false;
  try {
    verlauf = await listVerlauf(id);
  } catch {
    verlaufFehler = true;
  }

  return (
    <div>
      <Link href="/" className="text-[13px] text-fog hover:text-white">← Alle Vorgänge</Link>

      <div className="hair mb-6 mt-4 flex flex-wrap items-end justify-between gap-4 pb-5">
        <div>
          <div className="text-[10px] font-medium text-fog">{c.ref} · {c.bestattungsart}</div>
          <h1 className="mt-1 text-[28px] leading-tight">{name || c.ref}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="badge badge-dim">{phaseLabel[c.phase]}</span>
          <span className={`badge ${offen === 0 ? "badge-green" : "badge-dim"}`}>
            {offen === 0 ? "keine offenen Aufgaben" : `${offen} offen`}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-6">
          {/* Vorgang — Bestattungsart, Termin, Phase */}
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Vorgang</div>
            <Vorgang
              caseId={c.id}
              bestattungsart={c.bestattungsart}
              targetDate={c.target_date ?? null}
              phase={c.phase}
            />
          </section>

          {/* Verstorbene Person — nach Feldgruppen, jede für sich zu speichern */}
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Verstorbene Person</div>
            <p className="mb-2.5 max-w-[560px] text-[11.5px] leading-relaxed text-steel">
              Die Gruppen bestimmen, wer welche Angabe später zu sehen bekommt.
              Jede Gruppe wird für sich gespeichert — unvollständige Angaben in
              einer Gruppe halten die übrigen nicht auf.
            </p>
            <VerstorbenePerson caseId={c.id} verstorbene={d} />
          </section>

          {/* Termine — Zeit und Ort. Steht bewusst vor den Beteiligten:
              wer beteiligt ist, ergibt sich meist erst daraus, was wann
              wo geschieht. */}
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Termine</div>
            <p className="mb-2.5 max-w-[560px] text-[11.5px] leading-relaxed text-steel">
              Zeit und Ort der einzelnen Schritte. Die Terminart bestimmt, wer
              den Termin zu sehen bekommt — Fahrdienst, Krematorium und
              Friedhof sehen sonst kein Datum und keine Adresse.
            </p>
            <Termine caseId={c.id} termine={c.termine} />
          </section>

          {/* Beteiligte */}
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Beteiligte</div>
            <Beteiligte caseId={c.id} beteiligte={c.beteiligte} />
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

          {/* Verlauf — ganz unten: er wird gelesen, wenn etwas zu klären ist,
              nicht bei jedem Öffnen der Akte. */}
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Verlauf</div>
            <p className="mb-2.5 max-w-[560px] text-[11.5px] leading-relaxed text-steel">
              Wer wann was geändert hat. Beteiligte tragen inzwischen selbst
              ein — bestätigte Zeiten und Angaben der Familie stehen hier mit
              Zeitpunkt und Herkunft.
            </p>
            <Verlauf eintraege={verlauf} ladefehler={verlaufFehler} />
          </section>
        </div>

        {/* правая колонка: задачи + ссылки-приглашения */}
        <aside className="grid gap-5">
          <section>
            <div className="mb-2.5 text-[10px] font-medium text-fog">Aufgaben</div>
            <Aufgaben caseId={c.id} aufgaben={c.aufgaben} />
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
