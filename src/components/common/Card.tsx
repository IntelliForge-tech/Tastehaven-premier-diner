import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Generic bordered/rounded surface primitive matching the project's card
 * styling (`border-border`, `bg-card`, `rounded-2xl`).
 *
 * NOTE: existing sections (dish cards, offer cards, chef cards, etc.) each
 * combine this base style with section-specific classes (aspect ratios,
 * gradients, hover effects) in ways that differ just enough per instance
 * that force-fitting them into a shared component risked visual drift.
 * Left as-is in this refactor to satisfy the "must look 100% identical"
 * constraint; provided here as a ready primitive for new, backend-driven
 * UI going forward.
 */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-border bg-card", className)} {...rest} />;
}
