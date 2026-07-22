import { useEffect, useState } from "react";

/**
 * Fixed "back to top" button that fades in after scrolling past 500px.
 * Extracted from the original page-level scroll listener into its own
 * self-contained component (same threshold, same behavior).
 */
export function ScrollToTopButton() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full btn-gold transition-all ${showTop ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"}`}
    >
      <i className="fa-solid fa-arrow-up" />
    </button>
  );
}
