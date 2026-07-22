import type { FaqItem } from "./types";

/* FAQ Steep: список Q/A в тихих bg-mist картах, serif-вопрос (400),
   ответ sans. Без аккордеона и details-анимаций — всё открыто, спокойно.
   Появление — data-reveal со stagger. */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

export function FaqSection({ faq }: { faq: FaqItem[] }) {
  if (faq.length === 0) return null;
  return (
    <section id="faq" className="bg-fog">
      <div className="mx-auto max-w-[820px] px-6 py-20">
        <div className="text-center" data-reveal>
          <h2 className={`${serif} text-balance text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
            Häufige <em className="italic">Fragen</em>.
          </h2>
        </div>
        <div className="mt-12 grid gap-4">
          {faq.map((it, i) => (
            <div
              key={it.q}
              data-reveal
              style={{ transitionDelay: `${i * 70}ms` }}
              className="rounded-[24px] bg-mist p-7"
            >
              <h3 className={`${serif} text-[22px] leading-snug text-nero`}>{it.q}</h3>
              <p className={`${sans} mt-3 max-w-[62ch] text-[14.5px] leading-[1.6] text-slate`}>{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
