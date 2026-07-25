"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

/* Magic-Link-Anmeldung.

   Zwei bewusste Entscheidungen:

   1. shouldCreateUser: false — sonst legt sich jede Person mit einer
      E-Mail-Adresse selbst ein Konto im Arbeitsbereich an.
   2. Die Antwort ist immer dieselbe, ob die Adresse existiert oder nicht.
      Andernfalls liesse sich über das Formular durchprobieren, welche
      Bestattungshäuser hier arbeiten.

   Der Sende-Zustand ist ein Text am Knopf, kein Laufrad — in diesem Umfeld
   soll nichts flackern. */

type Zustand = "idle" | "sende" | "gesendet";

export function LoginForm({ mock }: { mock: boolean }) {
  const [email, setEmail] = useState("");
  const [zustand, setZustand] = useState<Zustand>("idle");

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (zustand === "sende") return;
    setZustand("sende");

    const sb = supabaseBrowser();
    if (sb) {
      try {
        await sb.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } catch {
        /* Auch ein Fehlschlag ergibt dieselbe Auskunft — siehe oben. */
      }
    }
    setZustand("gesendet");
  }

  return (
    <div className="mt-6">
      <form onSubmit={absenden} className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-[10px] font-medium text-fog">E-Mail-Adresse</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@bestattungshaus.de"
            className="input-dk"
          />
        </label>
        <button
          type="submit"
          disabled={zustand === "sende"}
          className="btn-bone px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
        >
          {zustand === "sende" ? "Wird gesendet …" : "Anmeldelink senden"}
        </button>
      </form>

      {zustand === "gesendet" && (
        <p className="card mt-3 p-3.5 text-[12px] leading-relaxed text-chalk">
          {mock
            ? "Im Mock-Modus wird kein Anmeldelink versendet — es gibt keine Verbindung zu einem Postfach."
            : "Wenn für diese Adresse ein Zugang besteht, ist der Anmeldelink unterwegs. Bitte prüfen Sie Ihr Postfach. Der Link gilt einmalig und läuft nach kurzer Zeit ab."}
        </p>
      )}

      {mock && (
        <div className="mt-6">
          <div className="hair mb-5" />
          <p className="text-[11.5px] leading-relaxed text-steel">
            Mock-Modus: keine Datenbank, keine Konten. Der Arbeitsbereich zeigt
            Beispieldaten.
          </p>
          <Link href="/" className="btn-ghost mt-3 inline-block px-3.5 py-2 text-[12.5px]">
            Weiter zum Arbeitsbereich →
          </Link>
        </div>
      )}
    </div>
  );
}
