"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { endInviteSession } from "@/lib/data";
import { ZUGANG_COOKIE, isSessionId } from "@/lib/zugang";

/* Zugang beenden: Sitzung serverseitig schliessen (end_session) und das
   Cookie entfernen. Beides — eines allein genügt nicht: ohne end_session
   bliebe die Sitzung auf dem Server offen, ohne Cookie-Löschung bliebe sie
   auf dem Gerät liegen. Der Einladungslink selbst bleibt gültig. */
export async function zugangBeendenAction() {
  const jar = await cookies();
  const session = jar.get(ZUGANG_COOKIE)?.value;

  if (isSessionId(session)) {
    try {
      await endInviteSession(session);
    } catch {
      /* Das Cookie wird trotzdem entfernt — auf diesem Gerät ist Schluss. */
    }
  }
  jar.delete(ZUGANG_COOKIE);

  redirect("/einladung/ungueltig?grund=beendet");
}
