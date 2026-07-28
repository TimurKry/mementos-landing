import "server-only";

import { NextResponse } from "next/server";
import type { Auslieferung } from "./data";

/* Die Antwort auf einen Abruf — für beide Umkreise dieselbe.

   Mit Datenbank steht dahinter eine signierte Adresse, auf die umgeleitet
   wird; im Mock-Betrieb liegen die Bytes im Speicher und gehen direkt raus.
   Beides sieht für den Browser gleich aus.

   Die Kopfzeilen sind in beiden Fällen streng: nichts wird zwischengelagert,
   und der Browser bekommt ausdrücklich gesagt, dass er den Inhaltstyp nicht
   selbst erraten soll. Eine hochgeladene Datei ist fremder Inhalt — sie darf
   nicht als HTML im eigenen Umkreis ausgeführt werden. Deshalb geht sie immer
   als Anhang raus, nie zur Anzeige. */

const KEIN_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

/* Der Dateiname geht in eine Kopfzeile — dort haben Anführungszeichen,
   Zeilenumbrüche und Steuerzeichen nichts zu suchen. Zusätzlich der
   RFC-5987-Weg, damit Umlaute erhalten bleiben. */
function contentDisposition(name: string): string {
  const schlicht = name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${schlicht}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export function ausliefern(l: Auslieferung): NextResponse {
  if (l.art === "adresse") {
    /* 303: der Browser folgt mit GET, und die Adresse landet nicht im
       Verlauf als bleibendes Ziel. */
    return NextResponse.redirect(l.url, { status: 303, headers: KEIN_CACHE });
  }

  return new NextResponse(l.inhalt as ArrayBuffer, {
    status: 200,
    headers: {
      ...KEIN_CACHE,
      "Content-Type": l.mime || "application/octet-stream",
      "Content-Disposition": contentDisposition(l.dateiname),
    },
  });
}
