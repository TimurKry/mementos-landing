/* Ruhiger Abschluss statt 404. Drei Fälle, drei Auskünfte — die Familie soll
   wissen, ob sie warten oder anrufen muss.

   Statisches Segment vor [token]: Next bevorzugt den festen Pfad, ein
   Konflikt mit dem Einlöse-Handler entsteht nicht. */

export const dynamic = "force-dynamic";

type Grund = "ungueltig" | "technik" | "beendet";

const texte: Record<Grund, { titel: string; text: string }> = {
  ungueltig: {
    titel: "Zugang nicht möglich",
    text:
      "Dieser Link ist nicht mehr gültig — er wurde zurückgezogen oder ist " +
      "abgelaufen. Bitte wenden Sie sich an das Bestattungshaus, das Ihnen " +
      "den Link geschickt hat.",
  },
  technik: {
    titel: "Zugang nicht möglich",
    text:
      "Der Zugang lässt sich gerade nicht herstellen. Bitte versuchen Sie es " +
      "in einigen Minuten erneut. Ihr Link bleibt gültig.",
  },
  beendet: {
    titel: "Zugang beendet",
    text:
      "Sie sind auf diesem Gerät abgemeldet. Ihr Link bleibt gültig — Sie " +
      "können ihn erneut öffnen.",
  },
};

export default async function UngueltigPage({
  searchParams,
}: {
  searchParams: Promise<{ grund?: string }>;
}) {
  const { grund } = await searchParams;
  const key: Grund = grund === "technik" || grund === "beendet" ? grund : "ungueltig";
  const { titel, text } = texte[key];

  return (
    <div className="mx-auto max-w-[520px] py-10">
      <h1 className="text-[26px] leading-tight">{titel}</h1>
      <p className="mt-3 text-[13px] leading-relaxed text-fog">{text}</p>
      <p className="mt-8 text-[11px] text-steel">MementoOS · Zugang ohne Konto</p>
    </div>
  );
}
