"use client";

import { useState } from "react";

/* Entfernen in zwei Schritten. Löschen ist der einzige Schritt in diesem
   Bildschirm, der etwas fortnimmt statt hinzuzufügen — an einem Tag, an dem
   nebenbei telefoniert wird, soll er nicht aus Versehen geschehen.

   Derselbe Bau wie beim Zurückziehen eines Zugangs (Einladungen.tsx). */
export function EntfernenKnopf({
  frage,
  entfernen,
  disabled,
}: {
  frage: string;
  entfernen: () => void;
  disabled?: boolean;
}) {
  const [offen, setOffen] = useState(false);

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        disabled={disabled}
        className="btn-ghost px-2.5 py-1.5 text-[11.5px] disabled:opacity-60"
      >
        Entfernen
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10.5px] leading-relaxed text-steel">{frage}</span>
      <button
        type="button"
        onClick={() => { setOffen(false); entfernen(); }}
        disabled={disabled}
        className="btn-ghost px-2.5 py-1.5 text-[11.5px] text-coral disabled:opacity-60"
      >
        Entfernen bestätigen
      </button>
      <button
        type="button"
        onClick={() => setOffen(false)}
        className="btn-ghost px-2.5 py-1.5 text-[11.5px]"
      >
        Abbrechen
      </button>
    </div>
  );
}
