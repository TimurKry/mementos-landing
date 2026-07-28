import { aktionLabel, akteurLabel, detailText, type Verlaufseintrag } from "@/lib/verlauf";

/* Was an diesem Vorgang geschehen ist — und durch wen.

   Seit die Beteiligten selbst schreiben (Termine bestätigen, Angaben
   ergänzen), ändern sich Daten, ohne dass jemand im Haus etwas davon merkt.
   Für eine Akte über einen Sterbefall ist das die falsche Eigenschaft: wenn
   die Konfession plötzlich anders lautet, muss nachvollziehbar sein, dass die
   Familie sie korrigiert hat und nicht jemand sich vertippt hat.

   Der Akteur steht als Rolle und gekürzte Kennung da — acht Zeichen. Die
   volle Sitzungs-Kennung gibt die Datenbank nicht heraus (app.akteur_kurz,
   0013): sie ist ein Schlüssel auf Vorzeigen, und mit ihr liessen sich
   Einträge unterschieben, die das Journal wertlos machen würden.

   Keine Client-Komponente: hier wird nichts angeklickt. */

const zeitpunkt = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
});

function wann(iso: string): string {
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? "—" : `${zeitpunkt.format(new Date(ms))} Uhr`;
}

export function Verlauf({
  eintraege,
  ladefehler,
}: {
  eintraege: Verlaufseintrag[];
  ladefehler: boolean;
}) {
  if (ladefehler) {
    return (
      <p className="text-[12px] leading-relaxed text-steel">
        Der Verlauf lässt sich gerade nicht laden. Das heisst nicht, dass keiner
        vorliegt — bitte die Seite später erneut öffnen.
      </p>
    );
  }

  if (eintraege.length === 0) {
    return <p className="text-[12px] text-steel">Noch nichts geschehen.</p>;
  }

  return (
    <ol className="card divide-y divide-white/5 p-0">
      {eintraege.map((e, i) => {
        const zusatz = detailText(e.action, e.detail);
        return (
          <li key={`${e.at}-${i}`} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 px-3.5 py-2.5">
            <span className="min-w-[124px] text-[10.5px] tabular-nums text-steel">
              {wann(e.at)}
            </span>
            <span className="text-[12.5px] text-chalk">{aktionLabel(e.action)}</span>
            {zusatz && <span className="text-[11.5px] text-fog">{zusatz}</span>}
            <span className="ml-auto text-[10.5px] text-steel">
              {akteurLabel(e.actor_kind)}
              {e.actor_ref ? ` · ${e.actor_ref}` : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
