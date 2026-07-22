import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  galleryItemSchema,
  type GalleryItemFormInput,
  type GalleryItemFormValues,
} from "@/components/admin/gallery/gallery-item-schema";
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
import { useCreateGalleryItem } from "@/hooks/useCreateGalleryItem";
import { useUpdateGalleryItem } from "@/hooks/useUpdateGalleryItem";

interface GalleryFormDefaultValues {
  caption: string;
  altText: string;
  isFeatured: boolean;
}

interface GalleryFormProps {
  /**
   * "create" (default) inserts a new item via useCreateGalleryItem().
   * "edit" updates an existing one via useUpdateGalleryItem() — requires
   * `galleryItemId` and typically `defaultValues`/`existingImageUrl` too.
   */
  mode?: "create" | "edit";
  /** Required when mode is "edit". */
  galleryItemId?: string;
  /** Pre-fills the form — used by the Edit page once the item has loaded. */
  defaultValues?: GalleryFormDefaultValues;
  /** The item's current image URL, shown as the preview until a replacement is picked. Edit mode only. */
  existingImageUrl?: string | null;
  /** Called after a successful save — the page decides where "back" goes. */
  onSuccess: () => void;
  /** Called when the admin cancels — no save is attempted. */
  onCancel: () => void;
}

/**
 * Add/Edit Gallery Image form. One component for both modes, same
 * reasoning as MenuForm: the field markup, validation, and layout never
 * has to be duplicated between Create and Edit — only which hook gets
 * called, and what the form starts out populated with, differ. Only
 * talks to useCreateGalleryItem() or useUpdateGalleryItem() — never
 * Supabase, never gallery.service.ts directly.
 */
export function GalleryForm({
  mode = "create",
  galleryItemId,
  defaultValues,
  existingImageUrl = null,
  onSuccess,
  onCancel,
}: GalleryFormProps) {
  const { createItem, isSubmitting: isCreating } = useCreateGalleryItem();
  const { updateItem, isSubmitting: isUpdating } = useUpdateGalleryItem();
  const isSubmitting = mode === "edit" ? isUpdating : isCreating;

  const form = useForm<GalleryItemFormInput, unknown, GalleryItemFormValues>({
    resolver: zodResolver(galleryItemSchema),
    defaultValues: {
      caption: defaultValues?.caption ?? "",
      altText: defaultValues?.altText ?? "",
      isFeatured: defaultValues?.isFeatured ?? false,
      imageFile: null,
    },
    mode: "onTouched",
  });

  async function onSubmit(values: GalleryItemFormValues) {
    if (mode === "create" && !values.imageFile) {
      // gallery_images.image_url is NOT NULL — there's no existing
      // image to fall back to on create the way edit mode has. Enforced
      // here rather than in the schema, since the schema also serves
      // edit mode, where this same field is genuinely optional — see
      // gallery-item-schema.ts's imageFile doc comment.
      form.setError("imageFile", { message: "Please choose an image to upload." });
      return;
    }

    if (mode === "edit") {
      // galleryItemId/existingImageUrl are guaranteed by the Edit page
      // whenever mode="edit" — see the interface comment above.
      const result = await updateItem(
        galleryItemId!,
        {
          caption: values.caption ?? "",
          altText: values.altText,
          isFeatured: values.isFeatured,
          imageFile: values.imageFile,
        },
        existingImageUrl!,
      );

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Gallery image updated.");
      onSuccess();
      return;
    }

    const result = await createItem({
      caption: values.caption ?? "",
      altText: values.altText,
      isFeatured: values.isFeatured,
      imageFile: values.imageFile,
    });

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Gallery image created.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormField
          control={form.control}
          name="imageFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel htmlFor="gallery-item-image">Image</FormLabel>
              <FormControl>
                <ImageFileInput
                  {...field}
                  id="gallery-item-image"
                  value={value ?? null}
                  onChange={onChange}
                  disabled={isSubmitting}
                  existingImageUrl={existingImageUrl}
                />
              </FormControl>
              {mode === "edit" && (
                <p className="text-xs text-muted-foreground">
                  Leave unchanged to keep the current image.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="gallery-item-caption">Title</FormLabel>
              <FormControl>
                <Input
                  id="gallery-item-caption"
                  placeholder="e.g. Dining room at sunset"
                  autoFocus
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="altText"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="gallery-item-alt-text">Alt text</FormLabel>
              <FormControl>
                <Input
                  id="gallery-item-alt-text"
                  placeholder="Briefly describe the image for screen readers"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0">
              <FormControl>
                <Switch
                  id="gallery-item-featured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormLabel htmlFor="gallery-item-featured" className="cursor-pointer font-normal">
                Featured
              </FormLabel>
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-5 py-2.5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            aria-live="polite"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : mode === "edit" ? (
              "Save Changes"
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface ImageFileInputProps {
  id: string;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  /**
   * Shown as the preview whenever no new file has been picked (`value`
   * is null) — the item's current image in edit mode. Undefined/null in
   * create mode, where there's nothing to fall back to.
   */
  existingImageUrl?: string | null;
}

/**
 * File input with a small preview — native <input type="file"> wired
 * into React Hook Form via onChange, plus a locally-managed object URL
 * for the thumbnail (revoked on change/unmount so it doesn't leak).
 *
 * In edit mode, `existingImageUrl` is shown until the admin picks a
 * replacement; removing a freshly-picked file (the X button) reverts to
 * that existing image rather than clearing it — same keep-or-replace
 * behavior as MenuForm's edit mode, not a removal.
 *
 * Deliberately a near-duplicate of MenuForm.tsx's private ImageFileInput
 * rather than an extracted shared component: extracting one would mean
 * touching MenuForm.tsx (already-shipped, working code), which this
 * phase's scope doesn't call for. Worth doing as its own small
 * follow-up if a third form ever needs this.
 */
function ImageFileInput({ id, value, onChange, disabled, existingImageUrl }: ImageFileInputProps) {
  const [newFilePreviewUrl, setNewFilePreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setNewFilePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setNewFilePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [value]);

  const displayUrl = newFilePreviewUrl ?? existingImageUrl ?? null;

  function handleRemove() {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      {displayUrl ? (
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border">
          {/* Plain <img>, not a router-aware Image component in this stack — object URLs need a real <img> anyway. */}
          <img src={displayUrl} alt="" className="size-full object-cover" />
          {newFilePreviewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Remove selected image"
              className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-background/90 text-foreground shadow"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <div
          className="grid size-16 shrink-0 place-items-center rounded-lg border border-dashed border-border text-muted-foreground"
          aria-hidden="true"
        >
          <ImagePlus className="size-5" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={disabled}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
        />
        <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF. Max 5MB.</span>
      </div>
    </div>
  );
}
