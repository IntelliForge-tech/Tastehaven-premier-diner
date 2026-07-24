import {
  ExternalLink,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { quickLinkSchema, type QuickLinkFormValues } from "./footer-schema";
import { Button } from "@/components/common/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateQuickLink,
  useDeleteQuickLink,
  useReorderQuickLinks,
  useUpdateQuickLink,
} from "@/hooks/useQuickLinksMutations";
import type { QuickLink } from "@/services/footer.service";

interface QuickLinksManagerProps {
  links: QuickLink[];
  onRefetch: () => void;
}

/**
 * Full CRUD + drag-and-drop reorder manager for quick_links.
 * Uses native HTML5 drag-and-drop to avoid external dependencies.
 */
export function QuickLinksManager({ links, onRefetch }: QuickLinksManagerProps) {
  const [orderedLinks, setOrderedLinks] = useState<QuickLink[]>(links);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    setOrderedLinks([...links].sort((a, b) => a.displayOrder - b.displayOrder));
  }, [links]);

  const { createItem, isCreating } = useCreateQuickLink();
  const { updateItem, isUpdating } = useUpdateQuickLink();
  const { deleteItem, deletingId } = useDeleteQuickLink();
  const { reorderItems } = useReorderQuickLinks();

  // ── Drag-and-drop ─────────────────────────────────────────────────────
  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;

    const newLinks = [...orderedLinks];
    const [moved] = newLinks.splice(dragIndex.current, 1);
    newLinks.splice(index, 0, moved);
    dragIndex.current = index;
    setOrderedLinks(newLinks);
  }

  async function handleDrop() {
    dragIndex.current = null;
    const result = await reorderItems(orderedLinks.map((l) => l.id));
    if (!result.success) {
      toast.error(result.error.message);
      setOrderedLinks([...links].sort((a, b) => a.displayOrder - b.displayOrder));
    } else {
      onRefetch();
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const result = await deleteItem(id);
    if (!result.success) {
      toast.error(result.error.message);
    } else {
      toast.success("Link deleted.");
      onRefetch();
    }
  }

  return (
    <div className="space-y-3">
      {/* Link rows */}
      {orderedLinks.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No quick links yet. Add one below.
        </p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {orderedLinks.map((link, index) => (
            <div
              key={link.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              className="group flex items-center gap-3 bg-card/40 px-3 py-2.5 transition-colors hover:bg-card"
            >
              {/* Grip */}
              <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground" />

              {/* Title + URL */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${!link.isEnabled ? "opacity-40" : ""}`}>
                    {link.title}
                  </span>
                  {link.openNewTab && (
                    <ExternalLink className="size-3 text-muted-foreground" />
                  )}
                  {!link.isEnabled && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{link.url}</p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditingId(editingId === link.id ? null : link.id)}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Edit ${link.title}`}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id, link.title)}
                  disabled={deletingId === link.id}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${link.title}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Inline edit form */}
          {editingId && (
            <div className="bg-muted/30 p-4">
              <QuickLinkForm
                key={editingId}
                defaultValues={
                  orderedLinks.find((l) => l.id === editingId) ?? undefined
                }
                isSubmitting={isUpdating}
                onSubmit={async (values) => {
                  const result = await updateItem({ id: editingId, ...values });
                  if (!result.success) {
                    toast.error(result.error.message);
                  } else {
                    toast.success("Link updated.");
                    setEditingId(null);
                    onRefetch();
                  }
                }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      {showAddForm ? (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Add Quick Link</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <QuickLinkForm
            defaultValues={{ displayOrder: orderedLinks.length + 1 }}
            isSubmitting={isCreating}
            onSubmit={async (values) => {
              const result = await createItem({
                ...values,
                displayOrder: orderedLinks.length + 1,
              });
              if (!result.success) {
                toast.error(result.error.message);
              } else {
                toast.success("Link added.");
                setShowAddForm(false);
                onRefetch();
              }
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline-gold"
          onClick={() => setShowAddForm(true)}
          className="gap-2 w-full"
        >
          <Plus className="size-3.5" />
          Add Quick Link
        </Button>
      )}
    </div>
  );
}

// ── QuickLinkForm ─────────────────────────────────────────────────────────────

interface QuickLinkFormProps {
  defaultValues?: Partial<QuickLinkFormValues & { id?: string }>;
  isSubmitting: boolean;
  onSubmit: (values: QuickLinkFormValues) => Promise<void>;
  onCancel: () => void;
}

function QuickLinkForm({ defaultValues, isSubmitting, onSubmit, onCancel }: QuickLinkFormProps) {
  const form = useForm<QuickLinkFormValues>({
    resolver: zodResolver(quickLinkSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      url: defaultValues?.url ?? "",
      displayOrder: defaultValues?.displayOrder ?? 0,
      openNewTab: defaultValues?.openNewTab ?? false,
      isEnabled: defaultValues?.isEnabled ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Menu" className="h-8 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">URL *</FormLabel>
                <FormControl>
                  <Input placeholder="#menu or /about" className="h-8 text-sm" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-6">
          <FormField
            control={form.control}
            name="openNewTab"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="cursor-pointer text-xs font-normal">Open in new tab</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="cursor-pointer text-xs font-normal">Enabled</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline-gold" onClick={onCancel} className="h-8 px-3 text-xs">
            Cancel
          </Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="h-8 px-3 text-xs">
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
