import type { Metadata } from "next";
import { AudienceNav } from "@/components/audience/AudienceNav";
import { AudienceCta } from "@/components/audience/AudienceCta";
import { AudienceFooter } from "@/components/audience/AudienceFooter";
import { Pricing } from "@/components/pricing/Pricing";
import type { PricingSpec } from "@/components/pricing/types";

/* Preise — Steep, role-neutral. Nav + Pricing (full, defaultPlans)
   + CTA + Footer. Keine Zahlen: Konditionen nur als Text. */

export const metadata: Metadata = {
  title: "MementoOS — Preise",
  description:
    "Das Kernmodell rechnet pro abgeschlossenem Fall ab. Für Häuser und Verbünde mit konstantem Volumen gibt es Abos. Konditionen legen wir in der Pilotphase gemeinsam fest.",
};

const pricing: PricingSpec = {
  variant: "full",
  heading: "Bezahlt wird ein",
  headingEm: "abgeschlossener Fall",
  sub: "Keine Grundgebühr, keine Schulungskosten. Das Kernmodell rechnet pro erfolgreich abgeschlossenem Fall ab — Partner treten ohne eigene Lizenz bei. Für Häuser mit konstantem Volumen gibt es Abos.",
  foot: "Vorschau — endgültige Konditionen werden mit den Pilotpartnern festgelegt.",
};

const cta = {
  heading: "Fragen zu den Konditionen?",
  sub: "Wir besprechen Preise und Ablauf in einem ruhigen Gespräch — konkret und ohne Verkaufsdruck.",
  mailSubject: "MementoOS — Frage zu den Preisen",
};

export default function PreisePage() {
  return (
    <div className="bg-white text-nero">
      <AudienceNav navLabel="Preise" hasPricing={false} />
      <main className="pt-8 md:pt-14">
        <Pricing spec={pricing} />
        <AudienceCta cta={cta} />
      </main>
      <AudienceFooter />
    </div>
  );
}
