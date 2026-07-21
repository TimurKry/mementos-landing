"use client";

import { useEffect, useState } from "react";
import { IconKerze, IconDokument } from "../icons";

/* «Default» dark-CRM: void-холст, графитовые панели, hairline 0.5px,
   Inter weight 400, костяная CTA, синий — только активные состояния,
   зелёный/красный — только семантика. Все данные — Beispieldaten. */

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

const contactMeta: Record<Contact, { label: string; cls: string }> = {
  none: { label: "Nicht kontaktiert", cls: "badge-dk-dim" },
  contacted: { label: "Kontaktiert", cls: "badge-dk-blue" },
  confirmed: { label: "Bestätigt", cls: "badge-dk-green" },
  skipped: { label: "Übersprungen", cls: "badge-dk-dim" },
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

/* ── локальные dark-примитивы ───────────────────────────────── */

function BoneBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className="btn-bone press px-4 py-2 text-[13px] font-normal">
      {children}
    </button>
  );
}

function GhostDk({ children, small, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { small?: boolean }) {
  return (
    <button {...props} className={`btn-dk-ghost press ${small ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-2 text-[13px]"}`}>
      {children}
    </button>
  );
}

function Badge({ cls, dot, children }: { cls: string; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={`badge-dk ${cls}`}>
      {dot && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />}
      {children}
    </span>
  );
}

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
          ? { ...p, contact: p.contact === "none" ? "contacted" : p.contact === "contacted" ? "confirmed" : "none" }
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
    setToast("Vorgang M-2026-0152 angelegt");
  };

  const toastEl = toast && (
    <div className="dk-panel step-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 px-4 py-2.5 text-[13px] text-white">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" style={{ boxShadow: "0 0 4px rgba(34,197,94,0.55)" }} />
      {toast}
    </div>
  );

  /* ── дашборд ── */
  if (!current)
    return (
      <div className="step-in">
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Aktive Vorgänge", v: String(active), accent: "" },
            { l: "Heute fällig", v: String(dueToday), accent: dueToday > 0 ? "text-[#f87171]" : "" },
            { l: "Warten auf andere", v: String(waiting), accent: waiting > 0 ? "text-[#60a5fa]" : "" },
            { l: "Diese Woche abzuschließen", v: "2", accent: "" },
          ].map((s) => (
            <div key={s.l} className="dk-card px-4 py-3.5">
              <div className={`text-[26px] font-normal leading-tight tracking-[-0.02em] ${s.accent || "text-white"}`}>{s.v}</div>
              <div className="mt-0.5 text-[10px] font-medium text-[#858687]">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-normal text-white">Vorgänge</h2>
          <BoneBtn onClick={() => setAi("input")}>+ Neuer Vorgang</BoneBtn>
        </div>

        <div className="grid gap-3 overflow-x-auto md:grid-cols-5">
          {cols.map((col) => {
            const items = cases.filter((c) => c.col === col.key);
            return (
              <div key={col.key} className="min-w-[200px]">
                <div className="mb-2.5 flex items-baseline justify-between px-1 pb-1.5" style={{ boxShadow: "0 0.5px 0 rgba(255,255,255,0.07)" }}>
                  <span className="text-[10px] font-medium text-[#858687]">{col.label}</span>
                  <span className="text-[10px] text-[#71717a]">{items.length}</span>
                </div>
                <div className="grid gap-2">
                  {items.length === 0 && (
                    <div className="rounded-[9px] px-3 py-4 text-center text-[11px] text-[#71717a]" style={{ boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.1)" }}>
                      —
                    </div>
                  )}
                  {items.map((c) => {
                    const docsOpen = c.docs.filter((d) => !d.done).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setOpenId(c.id); setTab("beteiligte"); }}
                        className="dk-card dk-card-hover press step-in block w-full p-3 text-left"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <b className="text-[13px] font-medium text-white">{c.name}</b>
                          <span className="text-[10px] text-[#71717a]">{c.id.slice(-4)}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#858687]">{c.type}</div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {c.col === "abschluss" ? (
                            <Badge cls="badge-dk-green" dot>Abgeschlossen</Badge>
                          ) : (
                            <span className={`text-[10.5px] ${c.daysLeft <= 1 ? "text-[#f87171]" : "text-[#858687]"}`}>
                              noch {c.daysLeft} Tag{c.daysLeft === 1 ? "" : "e"}
                            </span>
                          )}
                          {docsOpen > 0 && c.col !== "abschluss" && <Badge cls="badge-dk-dim">{docsOpen} Dok.</Badge>}
                          {c.waiting && <Badge cls="badge-dk-blue" dot>wartet</Badge>}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Neuer Vorgang per Schnellerfassung">
            <div className="dk-panel step-in w-full max-w-[620px] p-6">
              <div className="mb-1 text-[10px] font-medium text-[#3b82f6]">KI-Schnellerfassung</div>
              <h3 className="mb-4 text-[20px] font-normal text-white">Beschreiben Sie den Fall — wir strukturieren.</h3>

              {ai === "input" && (
                <>
                  <textarea
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    rows={5}
                    placeholder="Frei formulieren oder diktieren: Name, Alter, Bestattungsart, Besonderheiten…"
                    className="dk-input w-full px-3.5 py-3 text-[14px]"
                  />
                  <div className="mt-1.5 text-right">
                    <button onClick={() => setAiText(aiExample)} className="press text-[11.5px] text-[#71717a] hover:text-white">
                      Beispieltext einfügen
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <BoneBtn disabled={aiText.trim().length < 20} onClick={() => { setAi("working"); setTimeout(() => setAi("draft"), 1100); }}>
                      Analysieren →
                    </BoneBtn>
                    <GhostDk onClick={() => setAi("closed")}>Abbrechen</GhostDk>
                  </div>
                </>
              )}

              {ai === "working" && (
                <div className="flex items-center gap-3 py-8 text-[13px] text-[#858687]">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-[1.5px] border-[#3c3d3e] border-t-[#3b82f6]" aria-hidden="true" />
                  Angaben werden strukturiert …
                </div>
              )}

              {ai === "draft" && (
                <div className="step-in">
                  <p className="mb-3 text-[12px] text-[#858687]">Bitte prüfen — Felder mit geringer Sicherheit sind markiert:</p>
                  <div className="grid gap-1.5 text-[13px]">
                    {([
                      ["Verstorbene Person", "Erika Mustermann", "ok"],
                      ["Alter", "84", "ok"],
                      ["Bestattungsart", "Einäscherung", "ok"],
                      ["Friedhofswunsch", "Südfriedhof Leipzig — bitte prüfen", "check"],
                      ["Kontakt Familie", "Petra Mustermann · 0176 4455…", "ok"],
                    ] as const).map(([l, v, st]) => (
                      <div
                        key={l}
                        className="flex items-baseline justify-between gap-4 rounded-[9px] bg-[#1f1f21] px-3.5 py-2.5"
                        style={st === "check" ? { boxShadow: "0 0 0 1px rgba(59,130,246,0.45)" } : { boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.07)" }}
                      >
                        <span className="text-[10px] font-medium text-[#858687]">{l}</span>
                        <span className={`text-right ${st === "check" ? "text-[#60a5fa]" : "text-[#cececf]"}`}>{v}</span>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-4 rounded-[9px] bg-[#1f1f21] px-3.5 py-2.5" style={{ boxShadow: "0 0 0 1px rgba(248,113,113,0.45)" }}>
                      <span className="text-[10px] font-medium text-[#f87171]">Herzschrittmacher</span>
                      <span className="text-right text-[#f87171]">Ja — Krematorium wird markiert</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <BoneBtn onClick={confirmAi}>Bestätigen & Vorgang anlegen</BoneBtn>
                    <GhostDk onClick={() => setAi("input")}>← Bearbeiten</GhostDk>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {toastEl}
      </div>
    );

  /* ── карточка кейса ── */
  const docsOpen = current.docs.filter((d) => !d.done).length;
  return (
    <div className="step-in">
      <button onClick={() => setOpenId(null)} className="press mb-5 text-[13px] text-[#858687] hover:text-white">
        ← Alle Vorgänge
      </button>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 pb-5" style={{ boxShadow: "0 0.5px 0 rgba(255,255,255,0.07)" }}>
        <div>
          <div className="text-[10px] font-medium text-[#858687]">{current.id} · {current.type}</div>
          <h2 className="mt-1 text-[28px] font-normal leading-tight tracking-[-0.02em] text-white">{current.name}</h2>
        </div>
        <div className="min-w-[220px]">
          <div className="mb-1.5 flex justify-between text-[10.5px] text-[#858687]">
            <span>Erstellt: {current.created}</span>
            <span className={current.daysLeft <= 1 ? "text-[#f87171]" : ""}>Ziel: {current.target}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#1f1f21]">
            <div
              className={`h-1 rounded-full ${current.daysLeft <= 1 ? "bg-[#f87171]" : "bg-[#3b82f6]"}`}
              style={{ width: `${Math.min(100, 100 - current.daysLeft * 6)}%` }}
            />
          </div>
        </div>
        {docsOpen === 0 ? (
          <Badge cls="badge-dk-green" dot>Unterlagen vollständig</Badge>
        ) : (
          <Badge cls="badge-dk-dim">{docsOpen} Unterlagen ausstehend</Badge>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="mb-4 flex gap-5 text-[12px]" style={{ boxShadow: "0 0.5px 0 rgba(255,255,255,0.07)" }}>
            {([["beteiligte", "Beteiligte"], ["unterlagen", "Unterlagen"], ["verlauf", "Verlauf"]] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`press -mb-px border-b-2 pb-2 font-medium ${tab === k ? "border-[#3b82f6] text-white" : "border-transparent text-[#858687] hover:text-white"}`}
              >
                {l}
              </button>
            ))}
          </div>

          {tab === "beteiligte" && (
            <div key="b" className="step-in grid gap-2">
              <p className="mb-1 text-[12px] text-[#858687]">Reihenfolge = Priorität. Wen zuerst kontaktieren, wen überspringen:</p>
              {current.participants.map((p, i) => (
                <div key={p.name} className={`dk-card flex flex-wrap items-center gap-x-4 gap-y-2 px-3.5 py-2.5 ${p.contact === "skipped" ? "opacity-50" : ""}`}>
                  <div className="flex flex-col">
                    <b className="text-[13px] font-medium text-white">{p.name}</b>
                    <span className="text-[10.5px] text-[#858687]">{p.role} · {p.joined ? "beigetreten" : "noch nicht beigetreten"}</span>
                  </div>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Badge cls={contactMeta[p.contact].cls} dot={p.contact === "confirmed"}>{contactMeta[p.contact].label}</Badge>
                    {p.contact !== "skipped" && <GhostDk small onClick={() => cycleContact(current.id, i)}>Status ändern</GhostDk>}
                    <GhostDk small onClick={() => toggleSkip(current.id, i)}>{p.contact === "skipped" ? "Aktivieren" : "Überspringen"}</GhostDk>
                    <span className="flex flex-col">
                      <button aria-label="Priorität hoch" onClick={() => movePrio(current.id, i, -1)} className="press px-1 text-[10px] text-[#71717a] hover:text-white">▲</button>
                      <button aria-label="Priorität runter" onClick={() => movePrio(current.id, i, 1)} className="press px-1 text-[10px] text-[#71717a] hover:text-white">▼</button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "unterlagen" && (
            <div key="u" className="step-in grid gap-2">
              {current.docs.map((d, i) => (
                <label key={d.label} className="dk-card flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="flex items-center gap-3 text-[13px] text-[#cececf]">
                    <input
                      type="checkbox"
                      checked={d.done}
                      onChange={() => patch(current.id, (c) => ({ ...c, docs: c.docs.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) }))}
                      className="h-4 w-4 accent-[#3b82f6]"
                    />
                    {d.label}
                  </span>
                  {d.done ? <Badge cls="badge-dk-green" dot>Verifiziert</Badge> : <Badge cls="badge-dk-dim">Ausstehend</Badge>}
                </label>
              ))}
              <p className="mt-1 flex items-center gap-2 text-[11.5px] text-[#71717a]">
                <IconDokument className="h-3.5 w-3.5" /> Erforderlich nach Landesrecht Sachsen — automatisch ermittelt.
              </p>
            </div>
          )}

          {tab === "verlauf" && (
            <ol key="v" className="step-in relative ml-2 grid gap-3.5 border-l border-dashed border-white/15 pl-5">
              {current.events.map((e, i) => (
                <li key={i}>
                  <span
                    className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-[#4ade80]"
                    style={{ marginTop: 6, boxShadow: "0 0 4px rgba(34,197,94,0.55)" }}
                  />
                  <div className="flex flex-wrap justify-between gap-x-4 text-[13px]">
                    <b className="font-medium text-white">{e.t}</b>
                    <span className="text-[10.5px] text-[#71717a]">{e.when}</span>
                  </div>
                  <span className="text-[11.5px] text-[#858687]">{e.who}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside>
          <div className="dk-card p-4">
            <div className="mb-3 text-[10px] font-medium text-[#858687]">Aufgaben</div>
            <div className="grid gap-2">
              {current.tasks.length === 0 && <span className="text-[12px] text-[#4ade80]">Keine offenen Aufgaben ✓</span>}
              {current.tasks.map((t, i) => (
                <label key={t.title} className="flex cursor-pointer items-start gap-2.5 text-[12.5px] text-[#cececf]">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => patch(current.id, (c) => ({ ...c, tasks: c.tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) }))}
                    className="mt-0.5 h-4 w-4 accent-[#3b82f6]"
                  />
                  <span className={t.done ? "text-[#71717a] line-through" : ""}>
                    {t.title} <span className="text-[10.5px] text-[#71717a]">· {t.due}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            <BoneBtn onClick={() => setToast("Status-Link an die Familie gesendet")}>Familien-Link senden</BoneBtn>
            <GhostDk onClick={() => setToast("Einladung versendet")}>Beteiligten einladen</GhostDk>
          </div>
          <p className="mt-3.5 flex items-center gap-2 text-[11px] text-[#71717a]">
            <IconKerze className="h-3.5 w-3.5" /> Jede Änderung wird protokolliert.
          </p>
        </aside>
      </div>

      {toastEl}
    </div>
  );
}
