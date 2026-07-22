import { useEffect } from "react";

/**
 * Observes every `.reveal` element in the document and adds the `.in` class
 * once it scrolls into view, triggering the CSS reveal animation.
 * Intended to be called once at the page root (it queries the whole DOM).
 */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) e.target.classList.add("in");
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
