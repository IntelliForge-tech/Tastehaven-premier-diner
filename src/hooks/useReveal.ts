import { useEffect } from "react";

/**
 * Observes every `.reveal` element in the document and adds the `.in` class
 * once it scrolls into view, triggering the CSS reveal animation.
 * Intended to be called once at the page root (it queries the whole DOM).
 *
 * A `.reveal` element that is added to the DOM *after* the initial scan
 * (e.g. a Menu dish card whose key drops out of a filtered list and later
 * reappears, forcing React to mount a fresh node) would otherwise never be
 * observed and stay stuck at `opacity: 0` (see the `.reveal` rule in
 * styles.css) — which reads as a blank/black region against the dark
 * theme background. The MutationObserver below catches exactly that case.
 */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) e.target.classList.add("in");
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => io.observe(el));

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(".reveal")) io.observe(node);
          node.querySelectorAll<HTMLElement>(".reveal").forEach((el) => io.observe(el));
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
