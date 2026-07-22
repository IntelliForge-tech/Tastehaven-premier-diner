import { Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/common/Button";
import type { ChefItem } from "@/services/chefs.service";

interface ChefRowProps {
  chef: ChefItem;
  /** Navigate to the edit page for this chef. */
  onEdit: (chef: ChefItem) => void;
  /** Open the delete confirmation dialog for this chef. */
  onDelete: (chef: ChefItem) => void;
}

/** Derives up to two initials from a full name for the avatar fallback. */
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function ChefRow({ chef, onEdit, onDelete }: ChefRowProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: avatar + name + position + bio preview */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 shrink-0">
          {chef.imageUrl && (
            <AvatarImage src={chef.imageUrl} alt={chef.name} />
          )}
          <AvatarFallback className="bg-secondary text-sm font-medium text-secondary-foreground">
            {getInitials(chef.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium text-foreground">{chef.name}</p>
            <span className="text-sm text-muted-foreground">{chef.position}</span>
          </div>

          {chef.bio && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {chef.bio}
            </p>
          )}
        </div>
      </div>

      {/* Right: metadata + actions */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-nowrap">
        {chef.yearsExperience !== null && (
          <span className="text-sm text-muted-foreground">
            {chef.yearsExperience} yr{chef.yearsExperience !== 1 ? "s" : ""}
          </span>
        )}

        <span className="text-sm text-muted-foreground">#{chef.displayOrder}</span>

        <Badge variant={chef.isActive ? "secondary" : "outline"}>
          {chef.isActive ? "Active" : "Inactive"}
        </Badge>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            aria-label={`Edit ${chef.name}`}
            onClick={() => onEdit(chef)}
            className="inline-flex size-8 items-center justify-center p-0"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label={`Delete ${chef.name}`}
            onClick={() => onDelete(chef)}
            className="inline-flex size-8 items-center justify-center p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
