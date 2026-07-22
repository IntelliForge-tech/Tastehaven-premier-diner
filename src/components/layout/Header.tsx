import { useEffect, useState } from "react";

import type { Theme } from "@/hooks/useTheme";
import { MOBILE_NAV_LINKS, NAV_LINKS } from "@/utils/constants";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  cartCount: number;
  flyKey: number;
  onNavigate: (id: string) => void;
}

/**
 * Fixed top navigation. Owns its own `scrolled` (background blur on scroll)
 * and `mobileOpen` (hamburger menu) state, since neither is needed outside
 * this component. Identical markup/classes to the original inline header.
 */
export function Header({ theme, onToggleTheme, cartCount, flyKey, onNavigate }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigate = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"}`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <button onClick={() => handleNavigate("home")} className="flex items-center gap-2" aria-label="Taste Haven home">
          <i className="fa-solid fa-utensils text-primary text-lg" />
          <span className="font-display text-xl font-semibold tracking-wide">Taste <span className="text-gradient-gold">Haven</span></span>
        </button>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((s) => (
            <li key={s}>
              <button onClick={() => handleNavigate(s)} className="text-sm capitalize text-muted-foreground transition-colors hover:text-primary">
                {s}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle theme"
            onClick={onToggleTheme}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:text-primary transition-colors"
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
          </button>
          <div className="relative grid h-9 w-9 place-items-center rounded-full border border-border">
            <i className="fa-solid fa-bag-shopping text-muted-foreground" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {cartCount}
              </span>
            )}
            {flyKey > 0 && (
              <span key={flyKey} className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              </span>
            )}
          </div>
          <button onClick={() => handleNavigate("reserve")} className="hidden rounded-full px-5 py-2 text-sm font-medium btn-gold md:inline-flex">
            Reserve
          </button>
          <button onClick={() => setMobileOpen((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full border border-border lg:hidden" aria-label="Menu">
            <i className={`fa-solid ${mobileOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {MOBILE_NAV_LINKS.map((s) => (
              <li key={s}>
                <button onClick={() => handleNavigate(s)} className="block w-full rounded-md px-3 py-2 text-left capitalize hover:bg-secondary">
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
