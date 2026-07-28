"use server";

import { redirect } from "next/navigation";
import { isMockMode } from "@/lib/env";
import { safeNext } from "@/lib/safe-next";

/* Anmeldung mit Passwort — der zweite Weg neben dem Anmeldelink.

   Warum es ihn gibt: ein Link aus einer E-Mail hängt an der Zustellung. Die
   ist nie sofort und nicht immer zuverlässig — und wer einen Sterbefall
   aufnimmt, kann nicht warten, bis ein Postfach sich meldet. Der Anmeldelink
   bleibt der bequemere Weg, das Passwort der verlässliche.

   Das Passwort steht ausschliesslich im Formularkörper: nicht in der Adresse,
   nicht in einer Meldung, nicht in einem Protokoll. Es wird hier auch nicht
   selbst geprüft — das tut Supabase, samt Hinterlegung als Hash.

   Die Auskunft bei Misserfolg ist immer dieselbe, gleich ob die Adresse
   unbekannt ist oder das Passwort nicht passt. Sonst liesse sich über das
   Formular durchprobieren, welche Bestattungshäuser hier arbeiten. */

export type AnmeldeErgebnis = { fehler: string } | null;

const ABGEWIESEN = "E-Mail-Adresse oder Passwort stimmt nicht.";
const GESTOERT = "Die Anmeldung ist gerade nicht möglich. Bitte in einigen Minuten erneut versuchen.";

export async function mitPasswortAnmelden(
  _vorher: AnmeldeErgebnis,
  formular: FormData,
): Promise<AnmeldeErgebnis> {
  if (isMockMode()) return { fehler: GESTOERT };

  const email = String(formular.get("email") ?? "").trim();
  const passwort = String(formular.get("passwort") ?? "");
  const ziel = safeNext(String(formular.get("next") ?? "/"), "https://mementos.local");

  if (!email || !passwort) return { fehler: ABGEWIESEN };

  try {
    const { supabaseServer } = await import("@/lib/supabase/server");
    const sb = await supabaseServer();
    const { error } = await sb.auth.signInWithPassword({ email, password: passwort });
    /* Der Text von Supabase wird nicht durchgereicht: er unterscheidet
       «Nutzer unbekannt» von «Passwort falsch». */
    if (error) return { fehler: ABGEWIESEN };
  } catch {
    return { fehler: GESTOERT };
  }

  /* redirect wirft — deshalb ausserhalb des try. */
  redirect(ziel);
}
