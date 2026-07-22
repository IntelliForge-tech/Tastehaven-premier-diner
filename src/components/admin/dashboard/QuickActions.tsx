import { CalendarCheck, ImagePlus, Settings, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/common/Button";

interface QuickAction {
  label: string;
  icon: LucideIcon;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Add Menu Item", icon: UtensilsCrossed },
  { label: "Upload Image", icon: ImagePlus },
  { label: "View Reservations", icon: CalendarCheck },
  { label: "Restaurant Settings", icon: Settings },
];

/**
 * Placeholder quick-action buttons for the dashboard home. Intentionally
 * inert per this phase's scope ("Buttons only. No functionality yet.") —
 * wiring these to real create-item flows / navigation is later work.
 */
export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
        <Button
          key={label}
          type="button"
          variant="outline-gold"
          className="flex items-center justify-center gap-2 px-4 py-3"
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </Button>
      ))}
    </div>
  );
}
