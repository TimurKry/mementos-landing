"use client";

import { useEffect, useRef, useState } from "react";
import { Logo, IconCheck, IconKalender } from "./icons";

/* Плавающий продуктовый мокап (мини-Cockpit) — «дорогой» момент hero:
   3D-наклон по курсору, слоистая тень, парящие чипы, счётчик KPI.
   Всё уважает prefers-reduced-motion. */

function useCountUp(target: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) { setN(target); return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setN(target); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

export function HeroMockup() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const aktiv = useCountUp(24, visible);
  const faellig = useCountUp(3, visible);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = scene.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 8}deg)`;
    };
    const onLeave = () => { card.style.transform = "rotateY(0deg) rotateX(0deg)"; };
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerleave", onLeave);
    return () => {
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={sceneRef} className="tilt-scene relative mx-auto w-full max-w-[520px]">
      <div ref={cardRef} className="tilt-card soft-ambient bg-paper">
        {/* панель окна */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Logo className="h-4 w-[18px]" />
          <span className="text-[12.5px] font-semibold">MementoOS · Cockpit</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-stone">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-wald" /> live
          </span>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="rounded-xl bg-keylime px-3.5 py-3">
            <div className="font-[family-name:var(--font-display)] text-[30px] font-medium leading-none tabular-nums">{aktiv}</div>
            <div className="mt-1 mono-label text-[10px] text-stone">Aktive Vorgänge</div>
          </div>
          <div className="rounded-xl bg-keylime px-3.5 py-3">
            <div className="font-[family-name:var(--font-display)] text-[30px] font-medium leading-none tabular-nums text-terra">{faellig}</div>
            <div className="mt-1 mono-label text-[10px] text-stone">Heute fällig</div>
          </div>
        </div>

        {/* строки кейсов */}
        <div className="grid gap-2 px-4 pb-4">
          {[
            ["Erika Weber", "Einäscherung", "Unterlagen", "border-ocker text-ocker bg-[#F1EADA]"],
            ["Hannelore Schmidt", "Einäscherung", "Bestätigt", "border-wald text-wald bg-[#E7ECE5]"],
            ["Theodor Krüger", "Erdbestattung", "Neu", "border-line text-stone bg-paper"],
          ].map(([name, type, label, cls]) => (
            <div key={name} className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-mint text-[11px] font-semibold text-ink">
                {(name as string).split(" ").map((w) => w[0]).join("")}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-medium">{name}</div>
                <div className="text-[10.5px] text-stone">{type}</div>
              </div>
              <span className={`ml-auto whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[.1em] ${cls}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* парящие чипы поверх */}
      <div className="float-a elev-lg absolute -left-4 top-[38%] hidden items-center gap-2 rounded-full bg-paper px-4 py-2 text-[11.5px] font-medium sm:flex">
        <IconCheck className="h-4 w-4 text-wald" /> Familie eingebunden
      </div>
      <div className="float-b elev-lg absolute -right-3 -bottom-3 hidden items-center gap-2 rounded-full bg-paper px-4 py-2 text-[11.5px] font-medium sm:flex">
        <IconKalender className="h-4 w-4 text-ink" /> Termin: Fr, 10:30
      </div>
    </div>
  );
}
