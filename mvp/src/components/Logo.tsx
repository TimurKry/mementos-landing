/* Das Markenzeichen für den Arbeitsbereich.

   Geometrie 1:1 aus assets/mementoos-symbol.svg (Repo-Wurzel) — dieselben
   drei Kreise wie auf dem Lendung, damit beide Umkreise dasselbe Zeichen
   tragen. Vorher standen hier drei Punkte in einer REIHE mit abnehmender
   Deckkraft; das war ein Platzhalter ohne Bezug zur Marke.

   currentColor statt einer festen Farbe: im Arbeitsbereich erbt das Zeichen
   die Textfarbe (knochenfarben auf Void), auf hellem Grund würde es dunkel.
   Ein festes Schwarz wäre hier schwarz auf schwarz.

   Inline und nicht als <img>: so kostet es keine zusätzliche Anfrage, es
   flackert beim Laden nicht, und es folgt der Farbe des Umfelds. */

export function Logo({ className = "h-[15px] w-[16px]" }: { className?: string }) {
  return (
    <svg viewBox="32 34 176 166" className={className} aria-hidden="true">
      <g fill="currentColor">
        <circle cx="74" cy="76" r="42" />
        <circle cx="166" cy="76" r="42" />
        <circle cx="120" cy="158" r="42" />
      </g>
    </svg>
  );
}
