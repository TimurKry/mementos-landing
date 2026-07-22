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

/* Оркестратор Steep-страницы аудитории: собирает страницу из data.
   Порядок: hero → warum → szenario → ablauf → (quote) → (pricing)
   → faq → cta. Блоки quote/pricing опциональны. */

export function AudiencePage({ data }: { data: AudienceData }) {
  return (
    <div className="bg-white text-nero">
      <AudienceNav navLabel={data.navLabel} hasPricing={data.pricing !== null} />
      <main>
        <AudienceHero hero={data.hero} />
        <WarumSection warum={data.warum} />
        <ScenarioSection szenario={data.szenario} />
        <StepsSection ablauf={data.ablauf} />
        {data.quote && <QuoteSection quote={data.quote} />}
        {data.pricing && <Pricing spec={data.pricing} />}
        <FaqSection faq={data.faq} />
        <AudienceCta cta={data.cta} />
      </main>
      <AudienceFooter />
    </div>
  );
}

/* хелпер для export const metadata на страницах аудиторий */
export function audienceMetadata(data: AudienceData): Metadata {
  return { title: data.meta.title, description: data.meta.description };
}
