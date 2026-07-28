import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { unterlageFuerSitzung } from "@/lib/data";
import { ZUGANG_COOKIE, isSessionId } from "@/lib/zugang";
import { ausliefern } from "@/lib/unterlage-antwort";

/* Herunterladen einer Unterlage durch einen Eingeladenen.

   In der Adresse steht ausschliesslich die Kennung der Unterlage — keine
   Fall-Kennung, kein Ablagepfad, keine Rolle. Wer die Sitzung ist, sagt das
   Cookie; ob die Rolle diese Unterlage sehen darf, entscheidet
   public.unterlage_fuer_sitzung (0014) anhand von visible_to.

   Ein geratener Wert nützt deshalb nichts: ohne gültige Sitzung gibt es
   keine Antwort, und mit gültiger Sitzung nur die Unterlagen des eigenen
   Vorgangs, die der eigenen Rolle offenstehen. */

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ docId: string }> },
) {
  const { docId } = await params;
  const session = (await cookies()).get(ZUGANG_COOKIE)?.value;
  if (!isSessionId(session)) return new NextResponse("Nicht gefunden", { status: 404 });

  let lieferung;
  try {
    lieferung = await unterlageFuerSitzung(session, docId);
  } catch {
    return NextResponse.json({ fehler: "nicht verfuegbar" }, { status: 503 });
  }
  /* Auch hier: «gibt es nicht» und «darf nicht» sind ununterscheidbar. */
  if (!lieferung) return new NextResponse("Nicht gefunden", { status: 404 });

  return ausliefern(lieferung);
}
