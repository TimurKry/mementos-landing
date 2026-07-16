"use client";

import { useEffect } from "react";

/* Наблюдатель scroll-reveal: элементы с [data-reveal] плавно проявляются
   при входе в вьюпорт. Уважает prefers-reduced-motion (transition глушится в CSS). */
export function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
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
  }, []);
  return null;
}
