import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { menuItemSchema, type MenuItemFormValues } from "@/components/admin/menu/menu-item-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMenuItem } from "@/hooks/useCreateMenuItem";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { useUpdateMenuItem } from "@/hooks/useUpdateMenuItem";

interface MenuFormDefaultValues {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  isFeatured: boolean;
  isAvailable: boolean;
}

interface MenuFormProps {
  /**
   * "create" (default) inserts a new item via useCreateMenuItem().
   * "edit" updates an existing one via useUpdateMenuItem() — requires
   * `menuId` and typically `defaultValues`/`existingImageUrl` too.
   */
  mode?: "create" | "edit";
  /** Required when mode is "edit". */
  menuId?: string;
  /** Pre-fills the form — used by the Edit page once the item has loaded. */
  defaultValues?: MenuFormDefaultValues;
  /** The item's current image URL, shown as the preview until a replacement is picked. Edit mode only. */
  existingImageUrl?: string | null;
  /** Called after a successful save — the page decides where "back" goes. */
  onSuccess: () => void;
  /** Called when the admin cancels — no save is attempted. */
  onCancel: () => void;
}

/**
 * Add/Edit Menu Item form. Only talks to `useMenuCategories()` plus
 * `useCreateMenuItem()` or `useUpdateMenuItem()` — never Supabase, never
 * menu.service.ts directly. One component for both modes so the field
 * markup, validation, and layout never has to be duplicated between
 * Create and Edit — only which hook gets called, and what the form
 * starts out populated with, differ.
 */
export function MenuForm({
  mode = "create",
  menuId,
  defaultValues,
  existingImageUrl = null,
  onSuccess,
  onCancel,
}: MenuFormProps) {
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useMenuCategories();
  const { createItem, isSubmitting: isCreating } = useCreateMenuItem();
  const { updateItem, isSubmitting: isUpdating } = useUpdateMenuItem();
  const isSubmitting = mode === "edit" ? isUpdating : isCreating;

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      categoryId: defaultValues?.categoryId ?? "",
      price: defaultValues?.price ?? 0,
      isFeatured: defaultValues?.isFeatured ?? false,
      isAvailable: defaultValues?.isAvailable ?? true,
      imageFile: null,
    },
    mode: "onTouched",
  });

  async function onSubmit(values: MenuItemFormValues) {
    if (mode === "edit") {
      // menuId is guaranteed by the Edit page whenever mode="edit" — see
      // the interface comment above.
      const result = await updateItem(
        menuId!,
        {
          name: values.name,
          description: values.description ?? "",
          categoryId: values.categoryId,
          price: values.price,
          isFeatured: values.isFeatured,
          isAvailable: values.isAvailable,
          imageFile: values.imageFile ?? null,
        },
        existingImageUrl,
      );

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Menu item updated.");
      onSuccess();
      return;
    }

    const result = await createItem({
      name: values.name,
      description: values.description ?? "",
      categoryId: values.categoryId,
      price: values.price,
      isFeatured: values.isFeatured,
      isAvailable: values.isAvailable,
      imageFile: values.imageFile ?? null,
    });

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Menu item created.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="menu-item-name">Name</FormLabel>
              <FormControl>
                <Input
                  id="menu-item-name"
                  placeholder="e.g. Margherita Pizza"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="menu-item-description">Description</FormLabel>
              <FormControl>
                <Textarea
                  id="menu-item-description"
                  placeholder="Short description shown to customers"
                  rows={3}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="menu-item-category">Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || categoriesLoading || Boolean(categoriesError)}
                >
                  <FormControl>
                    <SelectTrigger id="menu-item-category">
                      <SelectValue
                        placeholder={categoriesLoading ? "Loading categories…" : "Select a category"}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriesError && (
                  <p className="text-sm text-destructive">
                    Couldn't load categories. Refresh the page to try again.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="menu-item-price">Price ($)</FormLabel>
                <FormControl>
                  <Input
                    id="menu-item-price"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0">
                <FormControl>
                  <Switch
                    id="menu-item-available"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormLabel htmlFor="menu-item-available" className="cursor-pointer font-normal">
                  Available
                </FormLabel>
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
                    id="menu-item-featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormLabel htmlFor="menu-item-featured" className="cursor-pointer font-normal">
                  Featured
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel htmlFor="menu-item-image">Image</FormLabel>
              <FormControl>
                <ImageFileInput
                  {...field}
                  id="menu-item-image"
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
              "Create Menu Item"
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
 * that existing image rather than clearing it — this phase only supports
 * keep-or-replace, not removing an image outright.
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
