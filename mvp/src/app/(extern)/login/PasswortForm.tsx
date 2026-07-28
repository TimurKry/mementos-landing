"use client";

import { useActionState } from "react";
import { mitPasswortAnmelden, type AnmeldeErgebnis } from "./actions";

/* Anmeldung mit Passwort. Steht unter dem Anmeldelink, nicht daneben: der
   Link ist der übliche Weg, das Passwort der verlässliche, wenn die E-Mail
   auf sich warten lässt.

   Das Feld hat autoComplete="current-password", damit Passwortverwaltungen
   es erkennen — wer hier arbeitet, soll nichts abtippen müssen. */

export function PasswortForm({ next }: { next: string }) {
  const [ergebnis, absenden, laeuft] = useActionState<AnmeldeErgebnis, FormData>(
    mitPasswortAnmelden,
    null,
  );

  return (
    <form action={absenden} className="mt-3 grid gap-3">
      <input type="hidden" name="next" value={next} />
      <label className="grid gap-1.5">
        <span className="text-[10px] font-medium text-fog">E-Mail-Adresse</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="name@bestattungshaus.de"
          className="input-dk"
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[10px] font-medium text-fog">Passwort</span>
        <input
          type="password"
          name="passwort"
          required
          autoComplete="current-password"
          className="input-dk"
        />
      </label>
      <button
        type="submit"
        disabled={laeuft}
        className="btn-ghost px-3.5 py-2 text-[12.5px] disabled:opacity-60"
      >
        {laeuft ? "Wird geprüft …" : "Mit Passwort anmelden"}
      </button>

      {ergebnis?.fehler && (
        <p className="card p-3.5 text-[12px] leading-relaxed text-chalk">{ergebnis.fehler}</p>
      )}
    </form>
  );
}
