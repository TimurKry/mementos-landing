import { IconCheck, IconDokument } from "../icons";
import type { ArtifactSpec } from "./types";

/* Плавающие продукт-артефакты hero (Steep): .artifact — единственные
   элементы с тенью. Четыре примитива по kind. Все данные — Beispieldaten. */

const sans = "font-[family-name:var(--font-sans)]";

/* list → «Aktuelle Fälle»: строки со статус-пилюлей */
function ListArtifact({ a }: { a: Extract<ArtifactSpec, { kind: "list" }> }) {
  return (
    <div className={`artifact ${sans} p-4`} style={{ width: a.width ?? 300, maxWidth: "100%" }}>
      <div className="mb-3 flex items-center justify-between">
        <b className="text-[14px] font-medium text-nero">{a.title}</b>
        {a.badge && <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] text-ashen">{a.badge}</span>}
      </div>
      <ul className="flex flex-col">
        {a.rows.map((r) => (
          <li
            key={r.primary + r.secondary}
            className="flex items-center justify-between gap-3 border-t border-mist py-2.5 first:border-t-0"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13px] text-nero">{r.primary}</span>
              {r.secondary && <span className="text-[11px] text-dove">{r.secondary}</span>}
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

/* checklist → «Aufgaben heute»: круглые чек-маркеры, foot-итог */
function ChecklistArtifact({ a }: { a: Extract<ArtifactSpec, { kind: "checklist" }> }) {
  return (
    <div className={`artifact ${sans} p-4`} style={{ width: a.width ?? 290, maxWidth: "100%" }}>
      <b className="text-[14px] font-medium text-nero">{a.title}</b>
      <ul className="mt-3 flex flex-col gap-2.5">
        {a.items.map((t) => (
          <li key={t.label} className="flex items-center gap-2.5">
            <span
              className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full ${
                t.done ? "bg-nero text-white" : "border border-dove"
              }`}
              aria-hidden="true"
            >
              {t.done && <IconCheck className="h-2.5 w-2.5" />}
            </span>
            <span className={`text-[13px] ${t.done ? "text-dove line-through" : "text-nero"}`}>{t.label}</span>
          </li>
        ))}
      </ul>
      {a.foot && <div className="mt-3.5 border-t border-mist pt-2.5 text-[11.5px] text-slate">{a.foot}</div>}
    </div>
  );
}

/* ring → «Vorgangsfortschritt»: жестовое кольцо (pathLength), штрих sienna */
function RingArtifact({ a }: { a: Extract<ArtifactSpec, { kind: "ring" }> }) {
  const filled = Math.max(0, Math.min(1, a.ratio)) * 100;
  return (
    <div className={`artifact ${sans} p-4`} style={{ width: a.width ?? 240, maxWidth: "100%" }}>
      <b className="text-[14px] font-medium text-nero">{a.title}</b>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#f2f2f3" strokeWidth="5" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#5d2a1a"
            strokeWidth="5"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - filled}
          />
        </svg>
        <span>
          <span className="block text-[22px] font-medium leading-none text-nero">{a.value}</span>
          <span className="mt-1 block text-[12px] text-slate">{a.label}</span>
        </span>
      </div>
    </div>
  );
}

/* composer → строка ввода заметки к делу */
function ComposerArtifact({ a }: { a: Extract<ArtifactSpec, { kind: "composer" }> }) {
  return (
    <div className={`artifact ${sans} flex items-center gap-3 p-3`} style={{ width: a.width ?? 340, maxWidth: "100%" }}>
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-mist text-slate"
        aria-hidden="true"
      >
        <IconDokument className="h-4 w-4" />
      </span>
      <span className="flex-1 text-[14px] text-dove">{a.placeholder}</span>
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-nero text-white"
        aria-hidden="true"
      >
        →
      </span>
    </div>
  );
}

export function Artifact({ spec }: { spec: ArtifactSpec }) {
  switch (spec.kind) {
    case "list":
      return <ListArtifact a={spec} />;
    case "checklist":
      return <ChecklistArtifact a={spec} />;
    case "ring":
      return <RingArtifact a={spec} />;
    case "composer":
      return <ComposerArtifact a={spec} />;
  }
}
