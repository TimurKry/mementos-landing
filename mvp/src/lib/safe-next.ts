/* Rücksprungziele aus Anfrageparametern (`?next=…`) prüfen.

   Warum nicht per Zeichenketten-Vergleich: der URL-Parser entfernt ASCII-Tab
   (0x09), LF (0x0A) und CR (0x0D) aus der Eingabe, BEVOR er sie auswertet.
   Ein Wert, der mit Schrägstrich + Tab + Schrägstrich beginnt, ist also nicht
   "//" und nicht "/\" — er besteht jede Präfix-Prüfung und wird anschliessend
   trotzdem als "//fremde.example" gelesen, also als fremde Herkunft.
   Prozentkodiert übersteht er auch die Abfrageliste, denn searchParams.get()
   dekodiert vor der Prüfung.

   Deshalb: Steuerzeichen ablehnen, dann auflösen und die Herkunft
   vergleichen. Zurück kommt immer ein Pfad auf dieser Seite.

   Kein "server-only": die Middleware (Edge) benutzt dieselbe Funktion. */

/* Alles bis einschliesslich Leerzeichen sowie DEL — in einem Pfad haben diese
   Zeichen nichts zu suchen; kodiert kommen sie als %20/%7F weiterhin durch. */
function hatSteuerzeichen(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) return true;
  }
  return false;
}

export function safeNext(value: string | null | undefined, base: string): string {
  if (!value) return "/";
  if (hatSteuerzeichen(value)) return "/";

  try {
    const ziel = new URL(value, base);
    if (ziel.origin !== new URL(base).origin) return "/";
    /* Ohne Fragment — es wird serverseitig nie gebraucht. */
    return ziel.pathname + ziel.search;
  } catch {
    return "/";
  }
}
