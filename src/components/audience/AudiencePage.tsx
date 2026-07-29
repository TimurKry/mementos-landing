import type { Metadata } from "next";
import type { AudienceData } from "./types";
import { AudienceNav } from "./AudienceNav";
import { AudienceHero } from "./AudienceHero";
import { WarumSection } from "./WarumSection";
import { ScenarioSection } from "./ScenarioSection";
import { StepsSection } from "./StepsSection";
import { QuoteSection } from "./QuoteSection";
import { FaqSection } from "./FaqSection";
import { AudienceCta } from "./AudienceCta";
import { AudienceFooter } from "./AudienceFooter";
import { Pricing } from "../pricing/Pricing";
import { Schema } from "../Schema";
import { faqSchema, seite } from "@/lib/site";

/* Оркестратор Steep-страницы аудитории: собирает страницу из data.
   Порядок: hero → warum → szenario → ablauf → (quote) → (pricing)
   → faq → cta. Блоки quote/pricing опциональны. */

export function AudiencePage({ data }: { data: AudienceData }) {
  return (
    <div className="bg-white text-nero">
      {/* Die FAQ steht sichtbar auf der Seite und maschinenlesbar daneben —
          dieselben Fragen, dieselben Antworten, aus derselben Datenquelle.
          Auseinanderlaufen können sie damit nicht, und genau das prüft
          Google: eine FAQ-Auszeichnung ohne sichtbare Entsprechung gilt als
          Verstoß. */}
      <Schema daten={faqSchema(data.faq)} />
      <AudienceNav navLabel={data.navLabel} hasPricing={data.pricing !== null} soft={data.tone === "soft"} />
      <main>
        <AudienceHero hero={data.hero} />
        <WarumSection warum={data.warum} />
        <ScenarioSection szenario={data.szenario} />
        <StepsSection ablauf={data.ablauf} />
        {data.quote && <QuoteSection quote={data.quote} />}
        {data.pricing && <Pricing spec={data.pricing} />}
        <FaqSection faq={data.faq} />
        <AudienceCta cta={data.cta} soft={data.tone === "soft"} />
      </main>
      <AudienceFooter />
    </div>
  );
}

/* хелпер для export const metadata на страницах аудиторий.
   Der slug liefert zugleich die kanonische Adresse — er ist ohnehin der
   Ordnername unter src/app/, also kann er nicht auseinanderlaufen. */
export function audienceMetadata(data: AudienceData): Metadata {
  return seite({
    titel: data.meta.title,
    beschreibung: data.meta.description,
    pfad: data.slug,
  });
}
