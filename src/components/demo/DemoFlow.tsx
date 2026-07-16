"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconKalender,
  IconDokument,
  IconHandshake,
  IconKerze,
  IconBestatter,
  IconKrematorium,
  IconTransport,
  IconFloristik,
  IconFamilie,
  IconCheck,
  Logo,
} from "../icons";

/* ── примитивы демо ─────────────────────────────────────────── */

type PillTone = "wald" | "ocker" | "terra" | "stone";

const pillTones: Record<PillTone, string> = {
  wald: "border-wald text-wald bg-[#E7ECE5]",
  ocker: "border-ocker text-ocker bg-[#F1EADA]",
  terra: "border-terra text-terra bg-[#F2E4DD]",
  stone: "border-hair text-stone bg-transparent",
};

function Pill({ tone, children }: { tone: PillTone; children: React.ReactNode }) {
  return (
    <span className={`inline-block border px-2.5 py-0.5 text-[11px] uppercase tracking-[.12em] ${pillTones[tone]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w2 border-[1.2px] border-ink bg-card ${className}`}>{children}</div>;
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-btn hatch kirsche-hover inline-flex items-center gap-2.5 border-[1.3px] border-ink bg-ink px-5 py-3 text-sm font-medium text-paper enabled:hover:-translate-x-px enabled:hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink disabled:hover:border-ink"
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-btn inline-flex items-center gap-2 border-[1.3px] border-ink px-5 py-3 text-sm font-medium transition-transform hover:-translate-x-px hover:-translate-y-px">
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = label.toLowerCase().replace(/[^a-zäöüß]+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] uppercase tracking-[.18em] text-stone">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-hair bg-transparent px-3.5 py-2.5 text-[15px] outline-none focus-visible:border-ink"
      />
    </div>
  );
}

/* ── шаги ───────────────────────────────────────────────────── */

const stepLabels = ["Buchung", "Link", "Angaben", "Beteiligte", "Status", "Abschluss"];

export function DemoFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [groesse, setGroesse] = useState("");
  const [schrittmacher, setSchrittmacher] = useState(false);
  const [docs, setDocs] = useState({ tb: false, ausweis: false, vollmacht: false });
  const [joined, setJoined] = useState<string[]>([]);

  const formReady = name.trim() !== "" && groesse.trim() !== "";
  const allDocs = docs.tb && docs.ausweis && docs.vollmacht;

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="mx-auto max-w-[880px] px-7 pb-24">
      {/* степпер */}
      <ol className="mb-10 flex flex-wrap items-center gap-y-3" aria-label="Demo-Schritte">
        {stepLabels.map((l, i) => (
          <li key={l} className="flex items-center">
            <button
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              className={`flex items-center gap-2 text-[12px] uppercase tracking-[.14em] ${i === step ? "font-semibold text-ink" : i < step ? "text-stone hover:text-ink" : "cursor-default text-hair"}`}
              aria-current={i === step ? "step" : undefined}
            >
              <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-[50%_44%_52%_46%] border text-[11px] ${i < step ? "border-wald bg-wald text-paper" : i === step ? "border-ink bg-ink text-paper" : "border-hair text-stone"}`}>
                {i < step ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{l}</span>
            </button>
            {i < stepLabels.length - 1 && <span aria-hidden="true" className="mx-2.5 h-px w-5 bg-hair sm:w-8" />}
          </li>
        ))}
      </ol>

      <div key={step} className="step-in">
        {/* 1 — Buchung beim Krematorium */}
        {step === 0 && (
          <Card className="p-7">
            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[.18em] text-stone">
              <IconKrematorium className="h-4 w-4" /> Ansicht: Krematorium
            </div>
            <h2 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-medium">Neue Buchungsanfrage</h2>
            <div className="w1 mb-5 border border-hair bg-paper p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <b className="text-sm font-semibold">Bestattungshaus Weber, Leipzig</b>
                <Pill tone="ocker">Anfrage</Pill>
              </div>
              <p className="text-sm text-stone">Einäscherung · gewünschter Termin: <b className="font-medium text-ink">Fr, 24. Juli, 10:30</b></p>
              <p className="mt-1 text-sm text-stone">Bisher per Telefon: Rückfragen, Fax, Warten. Jetzt: ein Klick.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              <PrimaryBtn onClick={next}>Termin bestätigen — Fall anlegen <span aria-hidden="true">→</span></PrimaryBtn>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[12.5px] text-stone">
              <IconCheck className="h-3.5 w-3.5" /> Mit der Bestätigung entsteht der digitale Fall M-2026-0147 — und ein Link für den Bestatter.
            </p>
          </Card>
        )}

        {/* 2 — Link */}
        {step === 1 && (
          <Card className="p-7">
            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[.18em] text-stone">
              <IconBestatter className="h-4 w-4" /> Ansicht: Bestatter (E-Mail-Postfach)
            </div>
            <h2 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-medium">Ein Link. Kein Konto nötig.</h2>
            <div className="w3 mb-5 border border-hair bg-paper p-5">
              <p className="text-[11px] uppercase tracking-[.14em] text-stone">Von: Krematorium Südstadt</p>
              <p className="mb-3 mt-1 text-sm font-medium">Termin bestätigt: Fr, 24. Juli, 10:30 — Fall M-2026-0147</p>
              <p className="mb-4 text-sm text-stone">Bitte ergänzen Sie die Angaben zur verstorbenen Person über den folgenden Zugang:</p>
              <div className="inline-flex items-center gap-2 border border-dashed border-ink px-3.5 py-2 text-[13px]">
                <Logo className="h-3.5 w-4" /> mementos.app/fall/M-2026-0147
              </div>
            </div>
            <div className="flex flex-wrap gap-3.5">
              <PrimaryBtn onClick={next}>Vorgang öffnen <span aria-hidden="true">→</span></PrimaryBtn>
              <GhostBtn onClick={back}>← Zurück</GhostBtn>
            </div>
          </Card>
        )}

        {/* 3 — Angaben (IntakeForm) */}
        {step === 2 && (
          <Card className="p-7">
            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[.18em] text-stone">
              <IconDokument className="h-4 w-4" /> Ansicht: Bestatter · Fall M-2026-0147
            </div>
            <h2 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-medium">Angaben zur Einäscherung</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Verstorbene Person" value={name} onChange={setName} placeholder="Vor- und Nachname" />
              <Field label="Körpergröße / Maße" value={groesse} onChange={setGroesse} placeholder="z. B. 178 cm" />
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={schrittmacher} onChange={(e) => setSchrittmacher(e.target.checked)} className="mt-1 h-4 w-4 accent-ink" />
              <span className="text-sm">
                Herzschrittmacher / Implantat vorhanden
                {schrittmacher && (
                  <span className="mt-1 block text-[12.5px] text-terra">Wird dem Krematorium automatisch markiert — Entfernung vor der Einäscherung erforderlich.</span>
                )}
              </span>
            </label>
            <div className="mt-6 border-t border-dashed border-hair pt-5">
              <p className="mb-3 text-[11px] uppercase tracking-[.18em] text-stone">Erforderliche Unterlagen (Sachsen)</p>
              <div className="grid gap-2.5">
                {(
                  [
                    ["tb", "Todesbescheinigung"],
                    ["ausweis", "Personalausweis der verstorbenen Person"],
                    ["vollmacht", "Auftrag / Vollmacht der Angehörigen"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between gap-3 border border-hair px-3.5 py-2.5">
                    <span className="flex items-center gap-3 text-sm">
                      <input type="checkbox" checked={docs[key]} onChange={(e) => setDocs({ ...docs, [key]: e.target.checked })} className="h-4 w-4 accent-ink" />
                      {label}
                    </span>
                    <Pill tone={docs[key] ? "wald" : "ocker"}>{docs[key] ? "Beigefügt" : "Ausstehend"}</Pill>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <PrimaryBtn onClick={next} disabled={!formReady}>Angaben senden <span aria-hidden="true">→</span></PrimaryBtn>
              <GhostBtn onClick={back}>← Zurück</GhostBtn>
              {!formReady && <span className="text-[12.5px] text-stone">Name und Maße ausfüllen, um fortzufahren.</span>}
            </div>
          </Card>
        )}

        {/* 4 — Beteiligte */}
        {step === 3 && (
          <Card className="p-7">
            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[.18em] text-stone">
              <IconHandshake className="h-4 w-4" /> Fall M-2026-0147 · Beteiligte
            </div>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-medium">Alle an einen Tisch — per Link.</h2>
            <p className="mb-5 max-w-[52ch] text-sm text-stone">Jeder Beteiligte erhält einen eigenen Zugang und sieht nur, was seine Rolle braucht. Klicken Sie, um einzuladen:</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["Transport", <IconTransport key="t" className="h-6 w-6" />],
                  ["Floristik", <IconFloristik key="f" className="h-6 w-6" />],
                  ["Familie", <IconFamilie key="fam" className="h-6 w-6" />],
                ] as const
              ).map(([label, icon]) => {
                const active = joined.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => setJoined(active ? joined.filter((j) => j !== label) : [...joined, label])}
                    className={`w1 border-[1.2px] p-4 text-center transition-colors ${active ? "border-wald bg-[#E7ECE5]" : "border-ink bg-card hover:bg-paper"}`}
                  >
                    <span className="mx-auto mb-1.5 block w-fit">{icon}</span>
                    <b className="block text-sm font-semibold">{label}</b>
                    <span className="mt-1 block">
                      <Pill tone={active ? "wald" : "stone"}>{active ? "Beigetreten" : "Einladen"}</Pill>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <PrimaryBtn onClick={next} disabled={joined.length === 0}>Weiter zum Status <span aria-hidden="true">→</span></PrimaryBtn>
              <GhostBtn onClick={back}>← Zurück</GhostBtn>
              {joined.length === 0 && <span className="text-[12.5px] text-stone">Mindestens einen Beteiligten einladen.</span>}
            </div>
          </Card>
        )}

        {/* 5 — Status */}
        {step === 4 && (
          <Card className="p-7">
            <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[.18em] text-stone">
              <IconKalender className="h-4 w-4" /> Fall M-2026-0147 · Verlauf
            </div>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-medium">Ein Blick — alle wissen Bescheid.</h2>
            <p className="mb-5 max-w-[52ch] text-sm text-stone">Jeder Schritt wird protokolliert. Kein Nachtelefonieren: der Stand ist für alle Beteiligten sichtbar.</p>
            <ol className="relative ml-2.5 grid gap-4 border-l border-dashed border-hair pl-6">
              {[
                ["Fall angelegt", "Krematorium Südstadt", "wald", "Do, 09:12"],
                [`Angaben eingereicht${name ? ` — ${name}` : ""}`, "Bestattungshaus Weber", "wald", "Do, 11:40"],
                [schrittmacher ? "Hinweis: Herzschrittmacher — Entfernung geplant" : "Keine Implantate gemeldet", "System", schrittmacher ? "terra" : "wald", "Do, 11:40"],
                [allDocs ? "Unterlagen vollständig" : "Unterlagen unvollständig — 1+ ausstehend", "System", allDocs ? "wald" : "ocker", "Do, 14:05"],
                [`Beteiligte beigetreten: ${joined.join(", ") || "—"}`, "per Link", joined.length ? "wald" : "ocker", "Fr, 08:30"],
                ["Einäscherung bestätigt: Fr, 24. Juli, 10:30", "Krematorium Südstadt", "wald", "Fr, 09:00"],
              ].map(([title, who, tone, time], i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full ${tone === "wald" ? "bg-wald" : tone === "ocker" ? "bg-ocker" : "bg-terra"}`} />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <b className="text-sm font-semibold">{title}</b>
                    <span className="text-[11.5px] text-stone">{time}</span>
                  </div>
                  <span className="text-[12.5px] text-stone">{who}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3.5">
              <PrimaryBtn onClick={next}>Fall abschließen <span aria-hidden="true">→</span></PrimaryBtn>
              <GhostBtn onClick={back}>← Zurück</GhostBtn>
            </div>
          </Card>
        )}

        {/* 6 — Abschluss */}
        {step === 5 && (
          <Card className="p-9 text-center">
            <span className="mx-auto mb-3 block w-fit text-wald"><IconKerze className="h-9 w-9" /></span>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-medium">Fall M-2026-0147 abgeschlossen.</h2>
            <p className="mx-auto mb-6 max-w-[46ch] text-sm text-stone">
              Vollständig dokumentiert und archiviert. Jeder Beteiligte hat seinen Teil bestätigt — ohne eine einzige Fax-Seite.
            </p>
            <div className="mx-auto mb-7 grid max-w-[420px] gap-2 text-left text-sm">
              {[
                "6 Ereignisse protokolliert",
                `${joined.length + 2} Organisationen im Fall verbunden`,
                "Unterlagen revisionssicher abgelegt",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2.5 border border-hair px-3.5 py-2">
                  <IconCheck className="h-4 w-4 text-wald" /> {t}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3.5">
              <GhostBtn onClick={() => { setStep(0); setName(""); setGroesse(""); setSchrittmacher(false); setDocs({ tb: false, ausweis: false, vollmacht: false }); setJoined([]); }}>
                Demo neu starten
              </GhostBtn>
              <Link href="/#kontakt" className="w-btn hatch inline-flex items-center gap-2.5 border-[1.3px] border-ink bg-ink px-5 py-3 text-sm font-medium text-paper">
                Demo anfragen <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
