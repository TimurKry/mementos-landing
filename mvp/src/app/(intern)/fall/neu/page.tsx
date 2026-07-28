import Link from "next/link";
import { NeuerVorgang } from "./NeuerVorgang";

/* Neuen Vorgang anlegen. Statischer Pfad — er geht /fall/[id] vor, eine
   Fallkennung «neu» kann es deshalb nicht geben.

   Kein Vorab-Rendern: die Seite gehört in den inneren Umkreis, und die CSP
   bekommt je Anfrage einen frischen nonce. */
export const dynamic = "force-dynamic";

export default function NeuerVorgangPage() {
  return (
    <div className="mx-auto max-w-[720px]">
      <Link href="/" className="text-[13px] text-fog hover:text-white">← Alle Vorgänge</Link>

      <div className="hair mb-6 mt-4 pb-5">
        <div className="text-[11px] font-medium text-signal">Neuer Vorgang</div>
        <h1 className="mt-1.5 text-[28px] leading-tight">Wen begleiten Sie?</h1>
        <p className="mt-2 max-w-[520px] text-[13px] leading-relaxed text-fog">
          Nur das Nötigste, damit der Vorgang steht. Was jetzt noch nicht
          feststeht, bleibt offen und wird später ergänzt.
        </p>
      </div>

      <NeuerVorgang />
    </div>
  );
}
