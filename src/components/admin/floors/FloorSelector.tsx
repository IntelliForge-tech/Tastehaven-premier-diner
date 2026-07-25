import { cn } from "@/lib/utils";
import type { Floor } from "@/services/floors.service";

interface FloorSelectorProps {
  floors: Floor[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showAll?: boolean;
}

export function FloorSelector({ floors, selectedId, onSelect, showAll = true }: FloorSelectorProps) {
  const active = floors.filter((f) => f.isActive);

  return (
    <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Select floor">
      {showAll && (
        <button
          role="tab"
          aria-selected={selectedId === null}
          onClick={() => onSelect(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            selectedId === null
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          All Floors
        </button>
      )}
      {active.map((floor) => (
        <button
          key={floor.id}
          role="tab"
          aria-selected={selectedId === floor.id}
          onClick={() => onSelect(floor.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            selectedId === floor.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {floor.name}
        </button>
      ))}
    </div>
  );
}
