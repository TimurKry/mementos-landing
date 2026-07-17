"use client";

/* Общие примитивы демо/макетов — бренд-язык: прямые углы с wobble,
   мгновенный отклик на нажатие (press), статусные пилюли. */

export type PillTone = "wald" | "ocker" | "terra" | "stone" | "kirsche";

const pillTones: Record<PillTone, string> = {
  wald: "border-wald text-wald bg-[#E7ECE5]",
  ocker: "border-ocker text-ocker bg-[#F1EADA]",
  terra: "border-terra text-terra bg-[#F2E4DD]",
  stone: "border-hair text-stone bg-transparent",
  kirsche: "border-kirsche text-kirsche bg-[#F3E2E5]",
};

export function Pill({ tone, children }: { tone: PillTone; children: React.ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap border px-2.5 py-0.5 text-[11px] uppercase tracking-[.12em] ${pillTones[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w2 border-[1.2px] border-ink bg-card ${className}`}>{children}</div>;
}

export function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-btn hatch kirsche-hover press inline-flex items-center gap-2.5 border-[1.3px] border-ink bg-ink px-5 py-3 text-sm font-medium text-paper enabled:hover:-translate-x-px enabled:hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink disabled:hover:border-ink"
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, small }: { children: React.ReactNode; onClick?: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-btn press inline-flex items-center gap-2 border-[1.3px] border-ink font-medium transition-transform hover:-translate-x-px hover:-translate-y-px ${small ? "px-3 py-1.5 text-[12.5px]" : "px-5 py-3 text-sm"}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
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
