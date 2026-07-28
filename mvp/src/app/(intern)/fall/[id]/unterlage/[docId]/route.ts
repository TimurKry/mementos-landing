import { NextResponse } from "next/server";
import { unterlageFuerHaus } from "@/lib/data";
import { ausliefern } from "@/lib/unterlage-antwort";

/* Herunterladen einer Unterlage durch das Haus.

   Ein eigener Weg statt eines Verweises auf die Ablage: die signierte Adresse
   ist nur eine Minute gültig und würde in einer vorgerenderten Seite längst
   abgelaufen sein. Hier entsteht sie im Moment des Klicks — und steht in
   keiner Seite, keinem Verlauf, keinem Bildschirmfoto.

   Die Berechtigung prüft die Regel unterlagen_eigentuemer (0014) über den
   angemeldeten Client. Hier steht keine zweite Prüfung. */

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const { id, docId } = await params;

  let lieferung;
  try {
    lieferung = await unterlageFuerHaus(id, docId);
  } catch {
    return NextResponse.json({ fehler: "nicht verfuegbar" }, { status: 503 });
  }
  /* «Gibt es nicht» und «darf nicht» sehen gleich aus — sonst liesse sich
     über die Antwort abtasten, welche Unterlagen es gibt. */
  if (!lieferung) return new NextResponse("Nicht gefunden", { status: 404 });

  return ausliefern(lieferung);
}
