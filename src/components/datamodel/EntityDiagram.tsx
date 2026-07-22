"use client";

import { useEffect, useRef } from "react";
import type { Entity } from "./data";
import { roles } from "./data";
import { EntityTable, RoleIcon, ReadKeys } from "./ui";

/* Флагманская ER-диаграмма: пишущие роли слева (чёрные стрелки с
   подписью), таблица в центре, читающие справа (синие стрелки).
   Стрелки рисуются на клиенте по факту вёрстки, адаптируются к размеру.
   На узком экране (<=940px) SVG прячется, колонки складываются. */
export function EntityDiagram({ entity }: { entity: Entity }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, svg = svgRef.current, table = tableRef.current;
    if (!wrap || !svg || !table) return;
    const NS = "http://www.w3.org/2000/svg";

    const draw = () => {
      if (window.innerWidth <= 940) { svg.innerHTML = ""; return; }
      const cb = wrap.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${cb.width} ${cb.height}`);
      svg.innerHTML =
        '<defs>' +
        '<marker id="dm-ai" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#242424"/></marker>' +
        '<marker id="dm-ao" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2b59d1"/></marker>' +
        '</defs>';
      const tr = table.getBoundingClientRect();
      const clampY = (y: number) => Math.max(tr.top + 22, Math.min(tr.bottom - 22, y));

      const path = (x1: number, y1: number, x2: number, y2: number, color: string, marker: string, dash?: string) => {
        const mx = (x1 + x2) / 2;
        const p = document.createElementNS(NS, "path");
        p.setAttribute("d", `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
        p.setAttribute("fill", "none");
        p.setAttribute("stroke", color);
        p.setAttribute("stroke-width", "1.6");
        if (dash) p.setAttribute("stroke-dasharray", dash);
        p.setAttribute("marker-end", `url(#${marker})`);
        svg.appendChild(p);
      };
      const label = (x: number, y: number, txt: string) => {
        const w = txt.length * 6 + 10;
        const r = document.createElementNS(NS, "rect");
        r.setAttribute("x", String(x - w / 2)); r.setAttribute("y", String(y - 9));
        r.setAttribute("width", String(w)); r.setAttribute("height", "17");
        r.setAttribute("rx", "5"); r.setAttribute("fill", "#f6f3f1");
        r.setAttribute("stroke", "#cecac8"); r.setAttribute("stroke-width", "1");
        svg.appendChild(r);
        const t = document.createElementNS(NS, "text");
        t.setAttribute("x", String(x)); t.setAttribute("y", String(y + 3.5));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("font-family", "var(--font-mono), ui-monospace, monospace");
        t.setAttribute("font-size", "10.5"); t.setAttribute("fill", "#242424");
        t.textContent = txt;
        svg.appendChild(t);
      };

      wrap.querySelectorAll<HTMLElement>("[data-dm='write']").forEach((c) => {
        const rc = c.getBoundingClientRect();
        const x1 = rc.right - cb.left, y1 = rc.top + rc.height / 2 - cb.top;
        const x2 = tr.left - cb.left, y2 = clampY(rc.top + rc.height / 2) - cb.top;
        path(x1, y1, x2, y2, "#242424", "dm-ai");
        const lb = c.getAttribute("data-label");
        if (lb) label((x1 + x2) / 2, (y1 + y2) / 2 - 11, lb);
      });
      wrap.querySelectorAll<HTMLElement>("[data-dm='read']").forEach((c) => {
        const rc = c.getBoundingClientRect();
        const x1 = tr.right - cb.left, y1 = clampY(rc.top + rc.height / 2) - cb.top;
        const x2 = rc.left - cb.left, y2 = rc.top + rc.height / 2 - cb.top;
        path(x1, y1, x2, y2, "#2b59d1", "dm-ao", "5 4");
      });
    };

    draw();
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(draw, 60); };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    return () => { window.removeEventListener("resize", onResize); ro.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <svg ref={svgRef} className="dm-wires hidden md:block" aria-hidden="true" />
      <div className="relative z-[1] grid gap-6 md:grid-cols-[0.92fr_1.4fr_0.98fr] md:items-center md:gap-[clamp(36px,6vw,88px)]">
        {/* пишущие */}
        <div className="grid gap-3.5">
          <span className="mono-label text-[10px] text-stone">↦ Legt an / schreibt</span>
          {entity.writers.map((w) => (
            <div key={w.role} data-dm="write" data-label={w.label}
              className="rounded-[14px] border border-l-[3px] border-hair border-l-ink bg-card px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <RoleIcon role={w.role} />
                <span className="font-[family-name:var(--font-display)] text-[16px] leading-none text-ink">{roles[w.role].label}</span>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-graphite">{w.note}</p>
            </div>
          ))}
        </div>

        {/* таблица */}
        <div ref={tableRef}><EntityTable entity={entity} /></div>

        {/* читающие */}
        <div className="grid gap-3.5">
          <span className="mono-label text-right text-[10px] text-stone">Liest ⇥</span>
          {entity.readers.map((r) => (
            <div key={r.role} data-dm="read"
              className="rounded-[14px] border border-r-[3px] border-hair border-r-blue bg-card px-3 py-2.5">
              <div className="mb-2 flex items-center gap-2.5">
                <RoleIcon role={r.role} />
                <span className="font-[family-name:var(--font-display)] text-[16px] leading-none text-ink">{roles[r.role].label}</span>
                {r.note && <span className="ml-auto text-[9.5px] text-blue">{r.note}</span>}
              </div>
              <ReadKeys groups={r.groups} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
