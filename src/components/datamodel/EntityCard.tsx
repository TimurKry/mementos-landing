import type { Entity } from "./data";
import { roles } from "./data";
import { EntityTable, RoleIcon, ReadKeys } from "./ui";

/* Компактная сущность: таблица слева, доступ (запись/чтение) справа.
   Стрелки-мотив ↦ (чёрный, запись) и ⇥ (синий, чтение) без SVG —
   надёжно на мобильных. */
export function EntityCard({ entity }: { entity: Entity }) {
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-start">
      <EntityTable entity={entity} />

      <div className="grid gap-4">
        {/* Запись */}
        <div>
          <div className="mono-label mb-2.5 flex items-center gap-2 text-[10px] text-ink">
            <span className="text-[12px]">↦</span> Schreibt / legt an
          </div>
          <div className="grid gap-2">
            {entity.writers.map((w) => (
              <div key={w.role} className="flex items-center gap-3 rounded-[12px] border border-l-[3px] border-hair border-l-ink bg-card px-3 py-2">
                <RoleIcon role={w.role} />
                <span className="min-w-0">
                  <span className="block text-[12.5px] text-ink">
                    {roles[w.role].label}
                    <span className="ml-1.5 rounded-full border border-hair px-1.5 py-0.5 text-[9px] text-graphite">{w.label}</span>
                  </span>
                  <span className="block text-[10.5px] leading-tight text-stone">{w.note}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Чтение */}
        <div>
          <div className="mono-label mb-2.5 flex items-center gap-2 text-[10px] text-blue">
            <span className="text-[12px]">⇥</span> Liest (feldgenau)
          </div>
          <div className="grid gap-2">
            {entity.readers.map((r) => (
              <div key={r.role} className="rounded-[12px] border border-r-[3px] border-hair border-r-blue bg-card px-3 py-2.5">
                <div className="mb-2 flex items-center gap-2.5">
                  <RoleIcon role={r.role} />
                  <span className="text-[12.5px] text-ink">{roles[r.role].label}</span>
                  {r.note && <span className="ml-auto text-[10px] text-blue">{r.note}</span>}
                </div>
                <ReadKeys groups={r.groups} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
