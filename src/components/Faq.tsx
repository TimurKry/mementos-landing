"use client";

import { useState } from "react";

/* Monad FAQ-аккордеон: serif-вопрос 22px, только нижний hairline,
   плавное раскрытие через grid-template-rows, chevron поворачивается. */

const items = [
  {
    q: "Was ist MementoOS?",
    a: "Eine Plattform, die alle Beteiligten eines Bestattungsfalls — Bestatter, Krematorium, Friedhof, Transport und Zulieferer — in einem gemeinsamen digitalen Vorgang verbindet. Jeder sieht den aktuellen Stand, nichts geht zwischen Telefon, Fax und Papier verloren.",
  },
  {
    q: "Wie treten Partner einem Vorgang bei?",
    a: "Über einen einfachen Link — ohne Registrierung und ohne Installation. Partner sehen nur den Teil des Vorgangs, der sie betrifft, und bestätigen ihren Schritt direkt im Browser.",
  },
  {
    q: "Müssen Angehörige ein Konto anlegen?",
    a: "Nein. Familien erhalten einen Link, über den sie den Stand einsehen und fehlende Angaben ergänzen können — bewusst einfach und ohne Hürden gestaltet.",
  },
  {
    q: "Wie steht es um Datenschutz?",
    a: "Vertraulichkeit nach Rolle: Jede Organisation sieht nur, was sie betrifft. Jede Änderung wird protokolliert, die Verarbeitung orientiert sich an der DSGVO. Details klären wir transparent im Gespräch.",
  },
  {
    q: "In welcher Phase ist MementoOS?",
    a: "MementoOS ist in Entwicklung und wird in Leipzig im direkten Austausch mit der Branche aufgebaut. Wir suchen Pilotpartner, die den Ablauf mit uns gestalten möchten.",
  },
  {
    q: "Was, wenn ein Partner nicht mitmacht?",
    a: "Niemand muss ein Konto anlegen. Partner treten über einen Link bei und bestätigen ihren Teil im Browser. Wer nicht digital arbeitet, wird weiterhin per Telefon, Ausdruck oder E-Mail eingebunden — der Vorgang bleibt trotzdem an einem Ort vollständig.",
  },
  {
    q: "Läuft das neben unserer bestehenden Software?",
    a: "Ja. MementoOS ersetzt nicht, was bei Ihnen funktioniert — es verbindet die Beteiligten eines Falls. Wie sich MementoOS konkret in Ihre Abläufe einfügt, klären wir in der Pilotphase gemeinsam.",
  },
  {
    q: "Was passiert mit den Daten nach Abschluss?",
    a: "Ein abgeschlossener Fall wird dokumentiert archiviert und bleibt nachvollziehbar. Aufbewahrung und Löschung richten sich nach den gesetzlichen Vorgaben; die Details legen wir in der Pilotphase transparent fest.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-[820px] px-6 py-20">
      <div className="text-center" data-reveal>
        <div className="mono-label text-[12px] text-stone">FAQ</div>
        <h2 className="mb-10 mt-4 text-balance font-[family-name:var(--font-display)] text-[34px] leading-[1.15] md:text-[44px]">
          Häufige Fragen
        </h2>
      </div>
      <div data-reveal className="border-t border-hair">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={it.q} className="border-b border-hair">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-7 text-left"
              >
                <span className="font-[family-name:var(--font-display)] text-[21px] leading-snug text-ink md:text-[23px]">
                  {it.q}
                </span>
                <span
                  aria-hidden="true"
                  data-open={isOpen}
                  className="faq-chevron flex-none text-[18px] text-ink"
                >
                  ↓
                </span>
              </button>
              <div className="faq-answer" data-open={isOpen}>
                <div>
                  <p className="max-w-[62ch] pb-7 text-[14px] leading-relaxed text-graphite">
                    {it.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
