import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/common/Button";
import type { FaqItem } from "@/services/faq.service";

interface FaqRowProps {
  item: FaqItem;
  onEdit: (item: FaqItem) => void;
  onDelete: (item: FaqItem) => void;
}

export function FaqRow({ item, onEdit, onDelete }: FaqRowProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {item.displayOrder}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-2">
          <p className="font-medium leading-snug text-foreground">{item.question}</p>
          <Badge variant={item.isActive ? "default" : "secondary"} className="shrink-0 text-[11px]">
            {item.isActive ? "Active" : "Hidden"}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.answer}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          onClick={() => onEdit(item)}
          aria-label={`Edit "${item.question}"`}
          className="size-8 p-0"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onDelete(item)}
          aria-label={`Delete "${item.question}"`}
          className="size-8 p-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/60"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
