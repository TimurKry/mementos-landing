"use client";

import { useEffect, useState } from "react";
import { Pill, GhostBtn, PrimaryBtn, type PillTone } from "../demo/ui";
import { IconKerze, IconDokument, IconCheck } from "../icons";

/* ── типы и Beispieldaten (всё вымышленное) ─────────────────── */

type Contact = "none" | "contacted" | "confirmed" | "skipped";
type Col = "neu" | "unterlagen" | "bestaetigt" | "durchfuehrung" | "abschluss";

type Participant = { name: string; role: string; joined: boolean; contact: Contact };
type Doc = { label: string; done: boolean };
type Task = { title: string; due: string; done: boolean };
type Ev = { t: string; who: string; when: string };

type Case = {
  id: string; name: string; type: string; col: Col;
  created: string; target: string; daysLeft: number; waiting?: boolean;
  participants: Participant[]; docs: Doc[]; tasks: Task[]; events: Ev[];
};

const cols: { key: Col; label: string }[] = [
  { key: "neu", label: "Neu" },
  { key: "unterlagen", label: "Unterlagen" },
  { key: "bestaetigt", label: "Bestätigt" },
  { key: "durchfuehrung", label: "Durchführung" },
  { key: "abschluss", label: "Abschluss" },
];

const contactMeta: Record<Contact, { label: string; tone: PillTone }> = {
  none: { label: "Nicht kontaktiert", tone: "ocker" },
  contacted: { label: "Kontaktiert", tone: "stone" },
  confirmed: { label: "Bestätigt", tone: "wald" },
  skipped: { label: "Übersprungen", tone: "stone" },
};

const seed: Case[] = [
  {
    id: "M-2026-0147", name: "Erika Weber", type: "Einäscherung", col: "unterlagen",
    created: "10. Juli", target: "24. Juli", daysLeft: 7,
    participants: [
      { name: "Krematorium Südstadt", role: "Krematorium", joined: true, contact: "confirmed" },
      { name: "Bestattungswald Meier", role: "Transport", joined: true, contact: "contacted" },
      { name: "Blumen Lange", role: "Floristik", joined: false, contact: "none" },
      { name: "Familie Weber", role: "Familie", joined: true, contact: "confirmed" },
      { name: "Südfriedhof Leipzig", role: "Friedhof", joined: false, contact: "skipped" },
    ],
    docs: [
      { label: "Todesbescheinigung", done: true },
      { label: "Personalausweis", done: true },
      { label: "Auftrag / Vollmacht", done: false },
    ],
    tasks: [
      { title: "Vollmacht bei Familie anfragen", due: "heute", done: false },
      { title: "Urnenmodell bestätigen", due: "Mi", done: false },
      { title: "Slot beim Krematorium anfragen", due: "erledigt", done: true },
    ],
    events: [
      { t: "Fall angelegt", who: "Krematorium Südstadt", when: "Do 09:12" },
      { t: "Angaben eingereicht", who: "Sie", when: "Do 11:40" },
      { t: "Hinweis: Herzschrittmacher markiert", who: "System", when: "Do 11:40" },
      { t: "Familie hat den Status-Link geöffnet", who: "Familie Weber", when: "Fr 08:15" },
    ],
  },
  {
    id: "M-2026-0151", name: "Theodor Krüger", type: "Erdbestattung", col: "neu",
    created: "16. Juli", target: "30. Juli", daysLeft: 13,
    participants: [
      { name: "Südfriedhof Leipzig", role: "Friedhof", joined: false, contact: "none" },
      { name: "Familie Krüger", role: "Familie", joined: false, contact: "none" },
    ],
    docs: [
      { label: "Todesbescheinigung", done: false },
      { label: "Personalausweis", done: false },
      { label: "Auftrag / Vollmacht", done: false },
    ],
    tasks: [{ title: "Erstgespräch mit Familie", due: "morgen", done: false }],
    events: [{ t: "Fall angelegt", who: "Sie", when: "Mi 16:20" }],
  },
  {
    id: "M-2026-0149", name: "Hannelore Schmidt", type: "Einäscherung", col: "bestaetigt",
    created: "12. Juli", target: "21. Juli", daysLeft: 4, waiting: true,
    participants: [
      { name: "Krematorium Südstadt", role: "Krematorium", joined: true, contact: "confirmed" },
      { name: "Fahrdienst Böhme", role: "Transport", joined: true, contact: "confirmed" },
      { name: "Familie Schmidt", role: "Familie", joined: true, contact: "confirmed" },
    ],
    docs: [
      { label: "Todesbescheinigung", done: true },
      { label: "Personalausweis", done: true },
      { label: "Auftrag / Vollmacht", done: true },
    ],
    tasks: [{ title: "Urne abholen", due: "Fr", done: false }],
    events: [
      { t: "Unterlagen vollständig", who: "System", when: "Sa 14:05" },
      { t: "Einäscherung bestätigt: Mo 10:30", who: "Krematorium Südstadt", when: "Sa 15:00" },
    ],
  },
  {
    id: "M-2026-0146", name: "Walter Franz", type: "Einäscherung", col: "durchfuehrung",
    created: "8. Juli", target: "18. Juli", daysLeft: 1,
    participants: [
      { name: "Krematorium Südstadt", role: "Krematorium", joined: true, contact: "confirmed" },
      { name: "Familie Franz", role: "Familie", joined: true, contact: "confirmed" },
    ],
    docs: [
      { label: "Todesbescheinigung", done: true },
      { label: "Personalausweis", done: true },
      { label: "Auftrag / Vollmacht", done: true },
    ],
    tasks: [{ title: "Beisetzung koordinieren", due: "heute", done: false }],
    events: [{ t: "Einäscherung durchgeführt", who: "Krematorium Südstadt", when: "Do 10:30" }],
  },
  {
    id: "M-2026-0144", name: "Gisela Hoffmann", type: "Erdbestattung", col: "abschluss",
    created: "1. Juli", target: "12. Juli", daysLeft: 0,
    participants: [
      { name: "Südfriedhof Leipzig", role: "Friedhof", joined: true, contact: "confirmed" },
      { name: "Familie Hoffmann", role: "Familie", joined: true, contact: "confirmed" },
    ],
    docs: [
      { label: "Todesbescheinigung", done: true },
      { label: "Personalausweis", done: true },
      { label: "Auftrag / Vollmacht", done: true },
    ],
    tasks: [],
    events: [{ t: "Fall abgeschlossen und archiviert", who: "Sie", when: "Sa 12:00" }],
  },
];

const aiExample =
  "Frau Erika Mustermann, 84, verstorben heute früh im Pflegeheim Sonnenhof. Familie wünscht Einäscherung, Beisetzung auf dem Südfriedhof. Herzschrittmacher vorhanden. Kontakt: Tochter Petra, 0176 4455…";

/* ── компонент ──────────────────────────────────────────────── */

export function BestatterWorkspace() {
  const [cases, setCases] = useState<Case[]>(seed);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<"beteiligte" | "unterlagen" | "verlauf">("beteiligte");
  const [ai, setAi] = useState<"closed" | "input" | "working" | "draft">("closed");
  const [aiText, setAiText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const current = cases.find((c) => c.id === openId) ?? null;
  const patch = (id: string, fn: (c: Case) => Case) =>
    setCases((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));

  const active = cases.filter((c) => c.col !== "abschluss").length;
  const dueToday = cases.filter((c) => c.daysLeft <= 1 && c.col !== "abschluss").length;
  const waiting = cases.filter((c) => c.waiting).length;

  const cycleContact = (ci: string, idx: number) =>
    patch(ci, (c) => ({
      ...c,
      participants: c.participants.map((p, i) =>
        i === idx
          ? { ...p, contact: p.contact === "none" ? "contacted" : p.contact === "contacted" ? "confirmed" : p.contact === "confirmed" ? "none" : "none" }
          : p
      ),
    }));

  const toggleSkip = (ci: string, idx: number) =>
    patch(ci, (c) => ({
      ...c,
      participants: c.participants.map((p, i) => (i === idx ? { ...p, contact: p.contact === "skipped" ? "none" : "skipped" } : p)),
    }));

  const movePrio = (ci: string, idx: number, dir: -1 | 1) =>
    patch(ci, (c) => {
      const arr = [...c.participants];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return c;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...c, participants: arr };
    });

  const confirmAi = () => {
    setCases((cs) => [
      {
        id: "M-2026-0152", name: "Erika Mustermann", type: "Einäscherung", col: "neu",
        created: "heute", target: "31. Juli", daysLeft: 14,
        participants: [
          { name: "Südfriedhof Leipzig", role: "Friedhof", joined: false, contact: "none" },
          { name: "Familie Mustermann", role: "Familie", joined: false, contact: "none" },
        ],
        docs: [
          { label: "Todesbescheinigung", done: false },
          { label: "Personalausweis", done: false },
          { label: "Auftrag / Vollmacht", done: false },
        ],
        tasks: [{ title: "Herzschrittmacher: Krematorium informieren", due: "heute", done: false }],
        events: [{ t: "Fall angelegt (KI-Schnellerfassung)", who: "Sie", when: "jetzt" }],
      },
      ...cs,
    ]);
    setAi("closed");
    setAiText("");
    setToast("Vorgang M-2026-0152 angelegt ✓");
  };

  /* ── дашборд ── */
  if (!current)
    return (
      <div className="step-in">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Aktive Vorgänge", String(active), "stone"],
            ["Heute fällig", String(dueToday), dueToday > 0 ? "terra" : "stone"],
            ["Warten auf andere", String(waiting), waiting > 0 ? "ocker" : "stone"],
            ["Diese Woche abzuschließen", "2", "stone"],
          ].map(([l, v, tone]) => (
            <div key={l} className="w1 border border-line bg-card px-4 py-3">
              <div className={`font-[family-name:var(--font-display)] text-[26px] font-medium ${tone === "terra" ? "text-terra" : tone === "ocker" ? "text-ocker" : ""}`}>{v}</div>
              <div className="text-[11px] uppercase tracking-[.14em] text-stone">{l}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">Vorgänge</h2>
          <PrimaryBtn onClick={() => setAi("input")}>+ Neuer Vorgang</PrimaryBtn>
        </div>

        <div className="grid gap-4 overflow-x-auto md:grid-cols-5">
          {cols.map((col) => {
            const items = cases.filter((c) => c.col === col.key);
            return (
              <div key={col.key} className="min-w-[200px]">
                <div className="mb-2.5 flex items-baseline justify-between border-b border-hair pb-1.5">
                  <span className="text-[11px] uppercase tracking-[.16em] text-stone">{col.label}</span>
                  <span className="text-[11px] text-stone">{items.length}</span>
                </div>
                <div className="grid gap-2.5">
                  {items.length === 0 && <div className="border border-dashed border-hair px-3 py-4 text-center text-[12px] text-stone">—</div>}
                  {items.map((c) => {
                    const docsOpen = c.docs.filter((d) => !d.done).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setOpenId(c.id); setTab("beteiligte"); }}
                        className="w2 card-hover press step-in block w-full border border-line bg-card p-3 text-left transition-transform hover:-translate-y-px"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <b className="text-[13.5px] font-semibold">{c.name}</b>
                          <span className="text-[10.5px] text-stone">{c.id.slice(-4)}</span>
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-stone">{c.type}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className={`text-[11px] ${c.daysLeft <= 1 ? "font-medium text-terra" : "text-stone"}`}>
                            {c.col === "abschluss" ? "abgeschlossen" : `noch ${c.daysLeft} Tag${c.daysLeft === 1 ? "" : "e"}`}
                          </span>
                          {docsOpen > 0 && c.col !== "abschluss" && <Pill tone="ocker">{docsOpen} Dok.</Pill>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {ai !== "closed" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5" role="dialog" aria-modal="true" aria-label="Neuer Vorgang per Schnellerfassung">
            <div className="w2 step-in w-full max-w-[620px] border border-line bg-paper p-6">
              <div className="mb-1 mono-label text-[11px] text-ink">KI-Schnellerfassung</div>
              <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl font-medium">Beschreiben Sie den Fall — wir strukturieren.</h3>

              {ai === "input" && (
                <>
                  <textarea
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    rows={5}
                    placeholder="Frei formulieren oder diktieren: Name, Alter, Bestattungsart, Besonderheiten…"
                    className="w-full border border-hair bg-card px-3.5 py-3 text-[15px] outline-none focus-visible:border-ink"
                  />
                  <div className="mt-1.5 text-right">
                    <button onClick={() => setAiText(aiExample)} className="wavy-link text-[12px] text-stone">Beispieltext einfügen</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <PrimaryBtn disabled={aiText.trim().length < 20} onClick={() => { setAi("working"); setTimeout(() => setAi("draft"), 1100); }}>
                      Analysieren <span aria-hidden="true">→</span>
                    </PrimaryBtn>
                    <GhostBtn onClick={() => setAi("closed")}>Abbrechen</GhostBtn>
                  </div>
                </>
              )}

              {ai === "working" && (
                <div className="flex items-center gap-3 py-8 text-sm text-stone">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-[1.5px] border-hair border-t-ink" aria-hidden="true" />
                  Angaben werden strukturiert …
                </div>
              )}

              {ai === "draft" && (
                <div className="step-in">
                  <p className="mb-3 text-[12.5px] text-stone">Bitte prüfen — Felder mit geringer Sicherheit sind markiert:</p>
                  <div className="grid gap-2 text-sm">
                    {([
                      ["Verstorbene Person", "Erika Mustermann", "wald"],
                      ["Alter", "84", "wald"],
                      ["Bestattungsart", "Einäscherung", "wald"],
                      ["Friedhofswunsch", "Südfriedhof Leipzig (bitte prüfen)", "ocker"],
                      ["Kontakt Familie", "Petra Mustermann · 0176 4455…", "wald"],
                    ] as const).map(([l, v, tone]) => (
                      <div key={l} className={`flex items-baseline justify-between gap-4 border px-3.5 py-2 ${tone === "ocker" ? "border-ocker bg-[#F1EADA]" : "border-hair bg-card"}`}>
                        <span className="text-[11px] uppercase tracking-[.14em] text-stone">{l}</span>
                        <span className="text-right font-medium">{v}</span>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-4 border border-terra bg-[#F2E4DD] px-3.5 py-2">
                      <span className="text-[11px] uppercase tracking-[.14em] text-terra">Herzschrittmacher</span>
                      <span className="text-right font-medium text-terra">Ja — Krematorium wird markiert</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <PrimaryBtn onClick={confirmAi}>Bestätigen & Vorgang anlegen</PrimaryBtn>
                    <GhostBtn onClick={() => setAi("input")}>← Bearbeiten</GhostBtn>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {toast && (
          <div className="w1 step-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-line bg-ink px-5 py-2.5 text-sm text-paper">{toast}</div>
        )}
      </div>
    );

  /* ── карточка кейса ── */
  const docsOpen = current.docs.filter((d) => !d.done).length;
  return (
    <div className="step-in">
      <button onClick={() => setOpenId(null)} className="wavy-link mb-4 text-sm text-stone">← Alle Vorgänge</button>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[.16em] text-stone">{current.id} · {current.type}</div>
          <h2 className="font-[family-name:var(--font-display)] text-[28px] font-medium">{current.name}</h2>
        </div>
        <div className="min-w-[220px]">
          <div className="mb-1 flex justify-between text-[11px] text-stone">
            <span>Erstellt: {current.created}</span>
            <span className={current.daysLeft <= 1 ? "font-medium text-terra" : ""}>Ziel: {current.target}</span>
          </div>
          <div className="h-1 w-full bg-hairlight">
            <div className={`h-1 ${current.daysLeft <= 1 ? "bg-terra" : "bg-ink"}`} style={{ width: `${Math.min(100, 100 - current.daysLeft * 6)}%` }} />
          </div>
        </div>
        <Pill tone={docsOpen === 0 ? "wald" : "ocker"}>{docsOpen === 0 ? "Unterlagen vollständig" : `${docsOpen} Unterlagen ausstehend`}</Pill>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="mb-4 flex gap-5 border-b border-hair text-[13px]">
            {([["beteiligte", "Beteiligte"], ["unterlagen", "Unterlagen"], ["verlauf", "Verlauf"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`press -mb-px border-b-2 pb-2 uppercase tracking-[.12em] ${tab === k ? "border-kirsche font-semibold text-ink" : "border-transparent text-stone hover:text-ink"}`}>
                {l}
              </button>
            ))}
          </div>

          {tab === "beteiligte" && (
            <div key="b" className="step-in grid gap-2">
              <p className="mb-1 text-[12.5px] text-stone">Reihenfolge = Priorität. Wen zuerst kontaktieren, wen überspringen:</p>
              {current.participants.map((p, i) => (
                <div key={p.name} className={`flex flex-wrap items-center gap-x-4 gap-y-2 border px-3.5 py-2.5 ${p.contact === "skipped" ? "border-line bg-paper opacity-60" : "border-line bg-card"}`}>
                  <div className="flex flex-col">
                    <b className="text-[13.5px] font-semibold">{p.name}</b>
                    <span className="text-[11px] text-stone">{p.role} · {p.joined ? "beigetreten" : "noch nicht beigetreten"}</span>
                  </div>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Pill tone={contactMeta[p.contact].tone}>{contactMeta[p.contact].label}</Pill>
                    {p.contact !== "skipped" && <GhostBtn small onClick={() => cycleContact(current.id, i)}>Status ändern</GhostBtn>}
                    <GhostBtn small onClick={() => toggleSkip(current.id, i)}>{p.contact === "skipped" ? "Aktivieren" : "Überspringen"}</GhostBtn>
                    <span className="flex flex-col">
                      <button aria-label="Priorität hoch" onClick={() => movePrio(current.id, i, -1)} className="press px-1 text-[11px] text-stone hover:text-ink">▲</button>
                      <button aria-label="Priorität runter" onClick={() => movePrio(current.id, i, 1)} className="press px-1 text-[11px] text-stone hover:text-ink">▼</button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "unterlagen" && (
            <div key="u" className="step-in grid gap-2">
              {current.docs.map((d, i) => (
                <label key={d.label} className="flex cursor-pointer items-center justify-between gap-3 border border-hair bg-card px-3.5 py-2.5">
                  <span className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={d.done} onChange={() => patch(current.id, (c) => ({ ...c, docs: c.docs.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) }))} className="h-4 w-4 accent-ink" />
                    {d.label}
                  </span>
                  <Pill tone={d.done ? "wald" : "ocker"}>{d.done ? "Verifiziert" : "Ausstehend"}</Pill>
                </label>
              ))}
              <p className="mt-1 flex items-center gap-2 text-[12px] text-stone"><IconDokument className="h-3.5 w-3.5" /> Erforderlich nach Landesrecht Sachsen — automatisch ermittelt.</p>
            </div>
          )}

          {tab === "verlauf" && (
            <ol key="v" className="step-in relative ml-2 grid gap-3.5 border-l border-dashed border-hair pl-5">
              {current.events.map((e, i) => (
                <li key={i}>
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-wald" style={{ marginTop: 6 }} />
                  <div className="flex flex-wrap justify-between gap-x-4 text-sm"><b className="font-semibold">{e.t}</b><span className="text-[11.5px] text-stone">{e.when}</span></div>
                  <span className="text-[12px] text-stone">{e.who}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside>
          <div className="w3 border border-line bg-card p-4">
            <div className="mb-2.5 text-[11px] uppercase tracking-[.16em] text-stone">Aufgaben</div>
            <div className="grid gap-2">
              {current.tasks.length === 0 && <span className="text-[12.5px] text-stone">Keine offenen Aufgaben ✓</span>}
              {current.tasks.map((t, i) => (
                <label key={t.title} className="flex cursor-pointer items-start gap-2.5 text-[13px]">
                  <input type="checkbox" checked={t.done} onChange={() => patch(current.id, (c) => ({ ...c, tasks: c.tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) }))} className="mt-0.5 h-4 w-4 accent-ink" />
                  <span className={t.done ? "text-stone line-through" : ""}>{t.title} <span className="text-[11px] text-stone">· {t.due}</span></span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            <PrimaryBtn onClick={() => setToast("Status-Link an die Familie gesendet ✓")}>Familien-Link senden</PrimaryBtn>
            <GhostBtn onClick={() => setToast("Einladung versendet ✓")}>Beteiligten einladen</GhostBtn>
          </div>
          <p className="mt-3 flex items-center gap-2 text-[11.5px] text-stone"><IconKerze className="h-3.5 w-3.5" /> Jede Änderung wird protokolliert.</p>
        </aside>
      </div>

      {toast && (
        <div className="w1 step-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-line bg-ink px-5 py-2.5 text-sm text-paper">
          <span className="mr-1.5 inline-block align-[-2px]"><IconCheck className="h-4 w-4" /></span>{toast}
        </div>
      )}
    </div>
  );
}
