import type { AudienceData } from "./types";

/* Единственная персиковая карта страницы (bg-peach / text-sienna).
   Рендерится только если quote задан — правило «одна bg-peach на страницу». */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

export function QuoteSection({ quote }: { quote: NonNullable<AudienceData["quote"]> }) {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-8">
      <div data-reveal className="rounded-[24px] bg-peach p-10 md:p-14">
        <p className={`${serif} max-w-[26ch] text-[28px] leading-[1.25] text-sienna md:text-[40px]`}>
          „{quote.text} <em className="italic">{quote.textEm}</em>“
        </p>
        <p className={`${sans} mt-6 text-[14px] text-sienna`}>{quote.source}</p>
      </div>
    </section>
  );
}
