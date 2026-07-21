import type { Metadata } from "next";
import Link from "next/link";
import {
  Logo,
  IconCheck,
  IconDokument,
  IconKalender,
  IconHandshake,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "MementoOS für Bestatter — Das Cockpit für Ihr Bestattungshaus",
  description:
    "Fälle, Aufgaben und Partner in einem ruhigen Arbeitsbereich. Offene Punkte schließen sich, bevor sie zu Anrufen werden.",
};

/* Steep-система: serif analytics on warm paper. Белый холст,
   плавающие продукт-артефакты вокруг заголовка, один персиковый
   акцент на страницу, sans-body. Все данные — Beispieldaten. */

const sans = "font-[family-name:var(--font-sans)]";
const serif = "font-[family-name:var(--font-display)]";

/* ── навигация страницы (Steep: прозрачная, тихая) ─────────── */

function AudienceNav() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1200px] items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="MementoOS Startseite">
          <Logo className="h-[24px] w-[28px]" fill="#17191c" />
          <span className={`${serif} text-[22px] text-nero`}>MementoOS</span>
        </Link>
        <span className={`${sans} hidden text-[14px] text-ashen sm:block`}>Für Bestatter</span>
        <nav className={`${sans} ml-auto flex items-center gap-6 text-[15px]`} aria-label="Seitennavigation">
          <Link href="/" className="quiet-link hidden text-slate sm:block">
            Startseite
          </Link>
          <Link href="/demo/" className="btn-nero-ghost press hidden px-5 py-2.5 text-[14px] text-nero md:block">
            Demo ansehen
          </Link>
          <a href="#kontakt" className="btn-nero press px-5 py-2.5 text-[14px]">
            Demo anfragen
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ── плавающие артефакты hero ──────────────────────────────── */

function CasesArtifact() {
  const rows = [
    { id: "M-2026-0147", name: "Fall Weber", status: "Bestätigt", done: true },
    { id: "M-2026-0151", name: "Fall Krüger", status: "Unterlagen offen", done: false },
    { id: "M-2026-0149", name: "Fall Sommer", status: "Termin geplant", done: false },
  ];
  return (
    <div className={`artifact ${sans} w-[300px] p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <b className="text-[14px] font-medium text-nero">Aktuelle Fälle</b>
        <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] text-ashen">Beispieldaten</span>
      </div>
      <ul className="flex flex-col">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 border-t border-mist py-2.5 first:border-t-0">
            <span className="min-w-0">
              <span className="block truncate text-[13px] text-nero">{r.name}</span>
              <span className="text-[11px] text-dove">{r.id}</span>
            </span>
            <span
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] ${
                r.done ? "bg-nero text-white" : "bg-mist text-slate"
              }`}
            >
              {r.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TasksArtifact() {
  const tasks = [
    { label: "Todesbescheinigung hochladen", done: true },
    { label: "Krematorium buchen", done: true },
    { label: "Floristik anfragen", done: false },
    { label: "Familie: Angaben ergänzen", done: false },
  ];
  return (
    <div className={`artifact ${sans} w-[290px] p-4`}>
      <b className="text-[14px] font-medium text-nero">Aufgaben heute</b>
      <ul className="mt-3 flex flex-col gap-2.5">
        {tasks.map((t) => (
          <li key={t.label} className="flex items-center gap-2.5">
            <span
              className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full ${
                t.done ? "bg-nero text-white" : "border border-dove"
              }`}
              aria-hidden="true"
            >
              {t.done && <IconCheck className="h-2.5 w-2.5" />}
            </span>
            <span className={`text-[13px] ${t.done ? "text-dove line-through" : "text-nero"}`}>
              {t.label}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3.5 border-t border-mist pt-2.5 text-[11.5px] text-slate">
        2 offen · 2 erledigt
      </div>
    </div>
  );
}

function ProgressArtifact() {
  return (
    <div className={`artifact ${sans} w-[240px] p-4`}>
      <b className="text-[14px] font-medium text-nero">Vorgangsfortschritt</b>
      <div className="mt-3 flex items-center gap-4">
        {/* жестовое кольцо (Steep: chart as gesture, не дашборд) */}
        <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#f2f2f3" strokeWidth="5" />
          <circle
            cx="24" cy="24" r="20" fill="none" stroke="#5d2a1a" strokeWidth="5"
            strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="31.4"
            pathLength={125.6}
          />
        </svg>
        <span>
          <span className="block text-[22px] font-medium leading-none text-nero">3/4</span>
          <span className="mt-1 block text-[12px] text-slate">Unterlagen vollständig</span>
        </span>
      </div>
    </div>
  );
}

function ComposerArtifact() {
  return (
    <div className={`artifact ${sans} flex w-[340px] items-center gap-3 p-3`}>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-mist text-slate" aria-hidden="true">
        <IconDokument className="h-4 w-4" />
      </span>
      <span className="flex-1 text-[14px] text-dove">Notiz zum Fall hinzufügen…</span>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-nero text-white" aria-hidden="true">
        →
      </span>
    </div>
  );
}

/* ── канбан: открытые и закрытые задачи, как в учебнике ─────── */

type BoardTask = { label: string; meta: string };

function BoardColumn({
  title,
  count,
  tasks,
  state,
  delay,
}: {
  title: string;
  count: number;
  tasks: BoardTask[];
  state: "open" | "doing" | "done";
  delay: number;
}) {
  return (
    <div
      className="diagram-node rounded-[24px] bg-mist p-3"
      style={{ "--node-delay": `${delay}s` } as React.CSSProperties}
    >
      <div className={`${sans} mb-3 flex items-center justify-between px-2 pt-1`}>
        <span className="text-[14px] font-medium text-nero">{title}</span>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[12px] text-slate">{count}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {tasks.map((t) => (
          <div key={t.label} className={`artifact-quiet ${sans} p-3.5 ${state === "done" ? "opacity-70" : ""}`}>
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 flex h-[16px] w-[16px] flex-none items-center justify-center rounded-full ${
                  state === "done"
                    ? "bg-nero text-white"
                    : state === "doing"
                      ? "border-[5px] border-nero"
                      : "border border-dove"
                }`}
                aria-hidden="true"
              >
                {state === "done" && <IconCheck className="h-2.5 w-2.5" />}
              </span>
              <span className="min-w-0">
                <span className={`block text-[13px] leading-snug ${state === "done" ? "text-slate line-through" : "text-nero"}`}>
                  {t.label}
                </span>
                <span className="mt-1 block text-[11px] text-dove">{t.meta}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── страница ──────────────────────────────────────────────── */

export default function FuerBestatter() {
  return (
    <div className="bg-white text-nero">
      <AudienceNav />
      <main>
        {/* hero: serif-коллаж с плавающими артефактами */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-14 md:pb-24 md:pt-20">
            <div className="relative">
              {/* артефакты вокруг заголовка (desktop) */}
              <div className="float-a absolute left-0 top-2 hidden -rotate-2 lg:block" data-reveal>
                <CasesArtifact />
              </div>
              <div className="float-b absolute right-0 top-16 hidden rotate-2 lg:block" data-reveal>
                <TasksArtifact />
              </div>
              <div className="absolute bottom-4 left-10 hidden rotate-1 lg:block" data-reveal>
                <ProgressArtifact />
              </div>
              <div className="absolute -bottom-2 right-16 hidden -rotate-1 lg:block" data-reveal>
                <ComposerArtifact />
              </div>

              {/* заголовок */}
              <div className="mx-auto max-w-[720px] py-4 text-center lg:py-28">
                <h1
                  className={`rise ${serif} text-balance text-[48px] leading-[1.15] text-nero md:text-[76px] md:tracking-[-2px]`}
                  style={{ "--rise-delay": "0s" } as React.CSSProperties}
                >
                  Das Cockpit für Ihr <em className="italic">Bestattungshaus</em>.
                </h1>
                <p
                  className={`rise ${sans} mx-auto mt-6 max-w-[46ch] text-[16px] leading-[1.5] text-slate md:text-[18px]`}
                  style={{ "--rise-delay": "0.12s" } as React.CSSProperties}
                >
                  Fälle, Aufgaben und Partner in einem ruhigen Arbeitsbereich.
                  Offene Punkte schließen sich, bevor sie zu Anrufen werden.
                </p>
                <div
                  className="rise mt-9 flex flex-wrap items-center justify-center gap-3.5"
                  style={{ "--rise-delay": "0.24s" } as React.CSSProperties}
                >
                  <a href="#kontakt" className={`btn-nero press ${sans} px-7 py-3.5 text-[15px]`}>
                    Demo anfragen
                  </a>
                  <Link href="/demo/" className={`btn-nero-ghost press ${sans} px-7 py-3.5 text-[15px]`}>
                    Demo ansehen
                  </Link>
                </div>
              </div>

              {/* артефакты стопкой (mobile/tablet) */}
              <div className="mt-10 flex flex-wrap items-start justify-center gap-4 lg:hidden" data-reveal>
                <CasesArtifact />
                <TasksArtifact />
                <ProgressArtifact />
                <ComposerArtifact />
              </div>
            </div>
          </div>
        </section>

        {/* три тихие карты (fog-полоса) */}
        <section className="bg-fog">
          <div className="mx-auto max-w-[1200px] px-6 py-20">
            <div className="max-w-[640px]" data-reveal>
              <h2 className={`${serif} text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
                Ein Arbeitstag ohne <em className="italic">offene Schleifen</em>.
              </h2>
              <p className={`${sans} mt-4 text-[16px] leading-[1.5] text-slate`}>
                Gute Werkzeuge machen Arbeit sichtbar: Jede Aufgabe ist offen
                oder erledigt — nie irgendwo dazwischen.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                {
                  tag: "Fälle",
                  title: "Jeder Fall, ein Faden",
                  text: "Vom ersten Anruf bis zur Archivierung: ein Vorgang, eine Historie, ein Ort für alles.",
                  href: "/demo/",
                  link: "Demo ansehen →",
                },
                {
                  tag: "Aufgaben",
                  title: "Offen oder erledigt",
                  text: "Aufgaben haben einen Besitzer, einen Stichtag und ein klares Ende. Was offen ist, sehen Sie sofort.",
                  href: "/demo/",
                  link: "So funktioniert es →",
                },
                {
                  tag: "Partner",
                  title: "Anfragen statt Anrufe",
                  text: "Krematorium, Transport und Floristik bestätigen ihren Teil selbst — Sie sehen nur das Ergebnis.",
                  href: "/#produkt",
                  link: "Das Produkt →",
                },
              ].map((c, i) => (
                <div
                  key={c.title}
                  data-reveal
                  style={{ transitionDelay: `${i * 80}ms` }}
                  className="rounded-[24px] bg-mist p-7"
                >
                  <div className={`${sans} text-[13px] text-ashen`}>{c.tag}</div>
                  <h3 className={`${sans} mt-2 text-[19px] font-medium text-nero`}>{c.title}</h3>
                  <p className={`${sans} mt-2.5 text-[14.5px] leading-[1.5] text-slate`}>{c.text}</p>
                  <Link href={c.href} className={`quiet-link ${sans} mt-5 inline-block text-[14.5px] text-nero`}>
                    {c.link}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* канбан: как в книжках по менеджменту */}
        <section className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="mx-auto max-w-[640px] text-center" data-reveal>
            <h2 className={`${serif} text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
              Aufgaben wie im Lehrbuch:
              <br />
              <em className="italic">offen, in Arbeit, erledigt.</em>
            </h2>
          </div>
          <div className="mx-auto mt-12 max-w-[960px]" data-reveal>
            <div className="grid gap-4 md:grid-cols-3">
              <BoardColumn
                title="Offen"
                count={2}
                state="open"
                delay={0.1}
                tasks={[
                  { label: "Floristik anfragen", meta: "Fall Krüger · bis Do" },
                  { label: "Urnenauswahl mit Familie", meta: "Fall Sommer · bis Fr" },
                ]}
              />
              <BoardColumn
                title="In Arbeit"
                count={2}
                state="doing"
                delay={0.22}
                tasks={[
                  { label: "Unterlagen für Einäscherung", meta: "Fall Krüger · heute" },
                  { label: "Termin mit Friedhof abstimmen", meta: "Fall Sommer · heute" },
                ]}
              />
              <BoardColumn
                title="Erledigt"
                count={3}
                state="done"
                delay={0.34}
                tasks={[
                  { label: "Krematorium gebucht", meta: "Fall Weber" },
                  { label: "Todesbescheinigung hochgeladen", meta: "Fall Weber" },
                  { label: "Familie eingeladen", meta: "Fall Krüger" },
                ]}
              />
            </div>
            <p className={`${sans} mt-4 text-center text-[12px] text-dove`}>
              Beispieldaten — so ordnet MementoOS den Tag.
            </p>
          </div>
        </section>

        {/* персиковый editorial-кард — единственный акцент страницы */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20">
          <div data-reveal className="rounded-[24px] bg-peach p-10 md:p-14">
            <p className={`${serif} max-w-[26ch] text-[28px] leading-[1.25] text-sienna md:text-[40px]`}>
              „Ein guter Vorgang hinterlässt keine offenen Schleifen. Jede
              Aufgabe hat einen Besitzer, einen Stichtag — <em className="italic">und ein Ende</em>.“
            </p>
            <p className={`${sans} mt-6 text-[14px] text-sienna`}>
              Arbeitsprinzip von MementoOS
            </p>
          </div>
        </section>

        {/* CTA */}
        <section id="kontakt" className="border-t border-mist bg-fog">
          <div className="mx-auto max-w-[720px] px-6 py-20 text-center" data-reveal>
            <h2 className={`${serif} text-balance text-[34px] leading-[1.2] text-nero md:text-[52px] md:tracking-[-1px]`}>
              Sehen Sie Ihr Haus im Cockpit.
            </h2>
            <p className={`${sans} mx-auto mt-4 max-w-[44ch] text-[16px] text-slate`}>
              Wir zeigen MementoOS in 20 Minuten — ruhig, konkret, ohne
              Verkaufsdruck.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="mailto:timurkry.dev@gmail.com?subject=MementoOS%20Demo%20f%C3%BCr%20Bestatter"
                className={`btn-nero press ${sans} px-7 py-3.5 text-[15px]`}
              >
                Demo anfragen
              </a>
              <Link href="/" className={`quiet-link ${sans} px-2 py-3.5 text-[15px] text-nero`}>
                Zur Startseite →
              </Link>
            </div>
            <p className={`${sans} mt-10 text-[13px] text-ashen`}>
              Weitere Bereiche folgen: Krematorien · Friedhöfe · Familien
            </p>
          </div>
        </section>
      </main>

      {/* тихий футер страницы */}
      <footer className="border-t border-mist bg-white">
        <div className={`${sans} mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-[13px] text-slate`}>
          <Link href="/" className="flex items-center gap-2" aria-label="MementoOS Startseite">
            <Logo className="h-4 w-5" fill="#777b86" />
            MementoOS — Vorschau, in Entwicklung
          </Link>
          <span className="flex items-center gap-5">
            <span className="hidden items-center gap-1.5 sm:flex">
              <IconKalender className="h-3.5 w-3.5" /> Leipzig
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <IconHandshake className="h-3.5 w-3.5" /> Mit der Branche entwickelt
            </span>
            <a className="quiet-link text-nero" href="mailto:timurkry.dev@gmail.com">
              Kontakt
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
