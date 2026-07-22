import type { ReactNode } from "react";

/**
 * The small uppercase "kicker" label shown above most section headings
 * (e.g. "Our Story", "Featured Menu"). Identical markup/classes to the
 * original inline `SectionKicker` component.
 */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-primary">
      <span className="h-px w-8 bg-primary" />
      {children}
    </div>
  );
}
