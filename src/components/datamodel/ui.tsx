import {
  IconBestatter, IconFamilie, IconKrematorium, IconTransport, IconFriedhof,
  IconFloristik, IconKlinik, IconBehoerde, IconSteinmetz, IconRedner, IconVerbund,
} from "../icons";
import type { RoleId, Tier, Group, Entity } from "./data";
import { roles } from "./data";

export const roleIcon: Record<RoleId, (p: { className?: string }) => React.ReactNode> = {
  bestatter: IconBestatter, familie: IconFamilie, krematorium: IconKrematorium,
  transport: IconTransport, friedhof: IconFriedhof, floristik: IconFloristik,
  klinik: IconKlinik, standesamt: IconBehoerde, steinmetz: IconSteinmetz,
  redner: IconRedner, verbund: IconVerbund,
};

export const tierKey: Record<Tier, string> = {
  kern: "dm-key-kern", org: "dm-key-org", op: "dm-key-op", sens: "dm-key-sens",
};
export const tierRow: Record<Tier, string> = {
  kern: "dm-row-kern", org: "dm-row-org", op: "dm-row-op", sens: "dm-row-sens",
};

export function GroupKey({ tier }: { tier: Tier }) {
  return <span className={`dm-key ${tierKey[tier]}`} aria-hidden="true" />;
}

/* иконка роли в квадрате */
export function RoleIcon({ role, className = "h-[15px] w-[15px]" }: { role: RoleId; className?: string }) {
  const Ico = roleIcon[role];
  return (
    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[8px] bg-ink text-paper">
      <Ico className={className} />
    </span>
  );
}

/* заголовок роли */
export function RoleHead({ role }: { role: RoleId }) {
  const r = roles[role];
  return (
    <span className="flex items-center gap-2.5">
      <RoleIcon role={role} />
      <span>
        <span className="mono-label block text-[9px] text-blue">{r.tag}</span>
        <span className="block font-[family-name:var(--font-display)] text-[16px] leading-none text-ink">{r.label}</span>
      </span>
    </span>
  );
}

/* таблица-сущность: заголовок + группы полей */
export function EntityTable({ entity }: { entity: Entity }) {
  return (
    <div className="dm-table overflow-hidden rounded-[16px] border border-ink bg-card">
      <div className="flex items-center justify-between gap-2.5 bg-ink px-4 py-3 text-paper">
        <span className="font-[family-name:var(--font-display)] text-[19px] leading-none">
          {entity.name}
          <span className="mono-label mt-1.5 block text-[9px] text-periwinkle">{entity.table}</span>
        </span>
        <span className="mono-label flex-none rounded-full border border-paper/35 px-2.5 py-1 text-[8.5px] text-paper">
          Bestatter · Vollzugriff
        </span>
      </div>
      {entity.groups.map((g: Group) => (
        <div key={g.label}>
          <div className="mono-label flex items-center gap-2 px-3.5 pb-1 pt-2.5 text-[9px] text-graphite">
            <GroupKey tier={g.tier} /> {g.label}
          </div>
          {g.fields.map((f) => (
            <div key={f.name} className={`flex items-baseline justify-between gap-3 px-3.5 py-[5px] ${tierRow[g.tier]}`}>
              <span className="text-[12px] text-ink">{f.name}</span>
              <span className="text-[10px] text-stone">{f.type}</span>
            </div>
          ))}
        </div>
      ))}
      {entity.foot && (
        <div className="border-t border-line px-3.5 py-2.5 text-[10px] leading-relaxed text-stone">{entity.foot}</div>
      )}
    </div>
  );
}

/* блок доступа роли на чтение — группы с ключами, off перечёркнут */
export function ReadKeys({ groups }: { groups: { tier: Tier; label: string; on: boolean }[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {groups.map((g, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9.5px] ${
            g.on ? "border-hair bg-paper text-ink" : "border-dashed border-hair text-stone line-through"
          }`}
        >
          {g.on && <GroupKey tier={g.tier} />}
          {g.label}
        </span>
      ))}
    </span>
  );
}
