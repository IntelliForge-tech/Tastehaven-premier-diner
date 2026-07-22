import type { ReactNode } from "react";

import { Card } from "@/components/common/Card";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Generic card-style content area for a CMS page's main content. Today
 * every page just puts an `EmptyState` in here; later, once CRUD
 * lands, this is where each page's real list/table will live instead —
 * built now so that swap doesn't require new layout code.
 */
export function SectionContainer({ children, className }: SectionContainerProps) {
  return <Card className={cn("p-6", className)}>{children}</Card>;
}
