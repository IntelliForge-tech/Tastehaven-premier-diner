import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

/**
 * Owns the dark/light theme state and keeps the `light` class on
 * `<html>` in sync with it (same behavior as the original inline
 * `useState` + `useEffect` pair in routes/index.tsx).
 */
export function useTheme(initial: Theme = "dark") {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  return { theme, setTheme } as const;
}
