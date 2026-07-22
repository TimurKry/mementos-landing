"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Наблюдатель scroll-reveal: элементы с [data-reveal] плавно проявляются
   при входе в вьюпорт. Уважает prefers-reduced-motion (transition глушится в CSS).
   Перезапускается на каждый переход (usePathname): в App Router корневой layout
   не размонтируется при клиентской навигации, поэтому без этого элементы новых
   страниц никогда не наблюдались бы и оставались бы прозрачными. */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]:not(.revealed)");
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
