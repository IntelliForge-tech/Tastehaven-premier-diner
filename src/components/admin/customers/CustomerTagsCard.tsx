import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/common/Card";
import {
  assignTagToCustomer,
  createTag,
  removeTagFromCustomer,
  PRESET_TAGS,
  TAG_COLORS,
} from "@/services/customer-tags.service";
import { useCustomerTags } from "@/hooks/useCustomerHooks";

interface CustomerTagsCardProps {
  customerId: string;
}

export function CustomerTagsCard({ customerId }: CustomerTagsCardProps) {
  const { assignments, allTags, isLoading, refetch } = useCustomerTags(customerId);
  const [showAdd, setShowAdd] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const assignedTagIds = new Set(assignments.map((a) => a.tagId));
  const unassignedTags = allTags.filter((t) => !assignedTagIds.has(t.id));

  async function handleAssign(tagId: string) {
    setIsSaving(true);
    const result = await assignTagToCustomer(customerId, tagId);
    setIsSaving(false);
    if (!result.success) { toast.error(result.error.message); return; }
    refetch();
  }

  async function handleRemove(tagId: string) {
    setRemovingId(tagId);
    const result = await removeTagFromCustomer(customerId, tagId);
    setRemovingId(null);
    if (!result.success) { toast.error(result.error.message); return; }
    refetch();
  }

  async function handleCreateAndAssign() {
    const name = newTagName.trim();
    if (!name) return;
    setIsSaving(true);

    // Check if a tag with this name already exists.
    const existing = allTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    let tagId: string;

    if (existing) {
      tagId = existing.id;
    } else {
      const result = await createTag(name, newTagColor);
      if (!result.success) {
        setIsSaving(false);
        toast.error(result.error.message);
        return;
      }
      tagId = result.data.id;
    }

    await assignTagToCustomer(customerId, tagId);
    setIsSaving(false);
    setNewTagName("");
    setShowAdd(false);
    refetch();
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Tags</h3>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="size-3" />
          Add Tag
        </button>
      </div>

      {/* Assigned tags */}
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        ) : assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags assigned.</p>
        ) : (
          assignments.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${a.tag.color}22`,
                borderColor: `${a.tag.color}55`,
                color: a.tag.color,
              }}
            >
              {a.tag.name}
              <button
                type="button"
                onClick={() => handleRemove(a.tagId)}
                disabled={removingId === a.tagId}
                aria-label={`Remove tag ${a.tag.name}`}
                className="ml-0.5 rounded-full hover:opacity-70"
              >
                {removingId === a.tagId ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <X className="size-3" />
                )}
              </button>
            </span>
          ))
        )}
      </div>

      {/* Add tag panel */}
      {showAdd && (
        <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/30 p-4">
          {/* Preset quick-add */}
          {PRESET_TAGS.filter((p) =>
            !assignments.some((a) => a.tag.name === p.name),
          ).length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Quick add</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.filter((p) =>
                  !assignments.some((a) => a.tag.name.toLowerCase() === p.name.toLowerCase()),
                ).map((p) => {
                  const existing = allTags.find(
                    (t) => t.name.toLowerCase() === p.name.toLowerCase(),
                  );
                  return (
                    <button
                      key={p.name}
                      type="button"
                      disabled={isSaving}
                      onClick={() =>
                        existing
                          ? handleAssign(existing.id)
                          : (setNewTagName(p.name), setNewTagColor(p.color))
                      }
                      className="rounded-full border px-2 py-0.5 text-xs transition-colors hover:opacity-80 disabled:opacity-50"
                      style={{
                        backgroundColor: `${p.color}22`,
                        borderColor: `${p.color}55`,
                        color: p.color,
                      }}
                    >
                      + {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Existing unassigned tags */}
          {unassignedTags.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Existing tags</p>
              <div className="flex flex-wrap gap-1.5">
                {unassignedTags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleAssign(t.id)}
                    className="rounded-full border px-2 py-0.5 text-xs hover:opacity-80 disabled:opacity-50"
                    style={{
                      backgroundColor: `${t.color}22`,
                      borderColor: `${t.color}55`,
                      color: t.color,
                    }}
                  >
                    + {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom tag */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Create new tag</p>
            <div className="flex gap-2">
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name…"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-1">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTagColor(c)}
                    className="size-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: newTagColor === c ? "#fff" : "transparent",
                    }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={isSaving || !newTagName.trim()}
                onClick={handleCreateAndAssign}
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
