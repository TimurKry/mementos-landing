import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "MementoOS — Über uns",
  description:
    "MementoOS ist eine Vorschau und wird in Leipzig entwickelt — im direkten Austausch mit Bestattern, Krematorien und Partnern. Hinter MementoOS steht Memora.",
};

export default function UeberUnsPage() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="hero-glow overflow-hidden">
          <div className="mx-auto max-w-[760px] px-6 pb-24 pt-16 md:pt-20">
            <div className="mono-label text-[11px] text-stone" data-reveal>Über uns</div>
            <h1 className="mt-4 max-w-[18ch] text-balance font-[family-name:var(--font-display)] text-[40px] leading-[1.08] text-ink md:text-[60px]" data-reveal>
              Aus der Praxis, mit der Branche.
            </h1>

            <div className="mt-8 grid max-w-[62ch] gap-5 text-[16px] leading-relaxed text-graphite md:text-[17px]" data-reveal>
              <p>
                MementoOS ist eine Vorschau und wird in Leipzig entwickelt — im direkten Austausch mit
                Bestattern, Krematorien und Partnern. Wir bauen ruhig und gründlich, weil die Branche
                Sorgfalt verdient.
              </p>
              <p>Hinter MementoOS steht Memora.</p>
            </div>

            <div className="mono-label mt-8 inline-flex flex-wrap items-center gap-2 rounded-full border border-hair bg-paper px-3.5 py-1.5 text-[10px] text-stone" data-reveal>
              Leipzig, Deutschland · timurkry.dev@gmail.com
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4" data-reveal>
              <a
                href="mailto:timurkry.dev@gmail.com?subject=MementoOS%20Demo"
                className="btn-blue press arrow-shift mono-label inline-flex items-center gap-2.5 px-7 py-3.5 text-[13px]"
              >
                Demo anfragen <span aria-hidden="true">▸</span>
              </a>
              <Link href="/so-funktioniert-es/" className="arrow-shift mono-label inline-flex items-center gap-2 text-[13px] text-ink">
                So funktioniert es <span aria-hidden="true">→</span>
              </Link>
            </div>

            <p className="mono-label mt-14 text-[10px] text-stone" data-reveal>
              © 2026 Memora · MementoOS — Vorschau, in Entwicklung
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
