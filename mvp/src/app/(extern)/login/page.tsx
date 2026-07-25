import { isMock } from "@/lib/data";
import { LoginForm } from "./LoginForm";

/* Anmeldung der Bestatter — Magic Link, kein Passwort.
   Liegt im äußeren Umkreis: wer hier steht, ist noch nicht angemeldet und
   soll keine Navigation des Arbeitsbereichs sehen. */

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-[420px] py-8">
      <div className="text-[11px] font-medium text-signal">Arbeitsbereich</div>
      <h1 className="mt-1.5 text-[30px] leading-tight">Anmeldung</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-fog">
        Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen einmaligen
        Anmeldelink — ein Passwort gibt es nicht.
      </p>

      <LoginForm mock={isMock} />

      <p className="mt-8 text-[11px] leading-relaxed text-steel">
        Zugänge werden in der Pilotphase manuell freigeschaltet.
      </p>
    </div>
  );
}
