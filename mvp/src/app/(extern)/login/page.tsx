import { isMock } from "@/lib/data";
import { LoginForm } from "./LoginForm";
import { PasswortForm } from "./PasswortForm";
import { safeNext } from "@/lib/safe-next";

/* Anmeldung der Bestatter — Magic Link, kein Passwort.
   Liegt im äußeren Umkreis: wer hier steht, ist noch nicht angemeldet und
   soll keine Navigation des Arbeitsbereichs sehen. */

export const dynamic = "force-dynamic";

/* Ein gescheiterter Anmeldelink sah bisher aus wie ein gewöhnlicher Aufruf
   der Seite: beides führte wortlos hierher. Wer den Link anklickt und wieder
   im Formular steht, hält das für einen Fehler der Anwendung — und ohne
   Hinweis ist auch nicht zu erkennen, woran es lag. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string; next?: string }>;
}) {
  const { fehler, next } = await searchParams;
  /* Dasselbe Ziel wie beim Anmeldelink — und derselbe Riegel dagegen, dass
     jemand von hier auf eine fremde Adresse geschickt wird. */
  const ziel = safeNext(next, "https://mementos.local");

  return (
    <div className="mx-auto max-w-[420px] py-8">
      <div className="text-[11px] font-medium text-signal">Arbeitsbereich</div>
      <h1 className="mt-1.5 text-[30px] leading-tight">Anmeldung</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-fog">
        Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen einmaligen
        Anmeldelink — ein Passwort gibt es nicht.
      </p>

      {fehler === "anmeldelink" && (
        <div className="card mt-4 p-3.5 text-[12.5px] leading-relaxed text-chalk">
          Dieser Anmeldelink ist nicht mehr gültig — er wurde bereits benutzt
          oder ist abgelaufen. Bitte fordern Sie unten einen neuen an.
        </div>
      )}

      <LoginForm mock={isMock} />

      {!isMock && (
        <div className="mt-7">
          <div className="hair mb-5" />
          <div className="text-[10px] font-medium text-fog">Oder mit Passwort</div>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-steel">
            Falls der Anmeldelink auf sich warten lässt.
          </p>
          <PasswortForm next={ziel} />
        </div>
      )}

      <p className="mt-8 text-[11px] leading-relaxed text-steel">
        Zugänge werden in der Pilotphase manuell freigeschaltet.
      </p>
    </div>
  );
}
