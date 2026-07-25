import { zugangBeendenAction } from "./actions";

/* Abmelden auf dem Gerät der Eingeladenen. Als Formular mit POST — ein
   Aufruf per Link (GET) liesse sich von aussen auslösen. */
export function ZugangBeenden() {
  return (
    <form action={zugangBeendenAction}>
      <button type="submit" className="btn-ghost px-3.5 py-2 text-[12.5px]">
        Zugang beenden
      </button>
    </form>
  );
}
