import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { chefSchema, type ChefFormInput, type ChefFormValues } from "@/components/admin/chefs/chef-schema";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateChef } from "@/hooks/useCreateChef";
import { useUpdateChef } from "@/hooks/useUpdateChef";

interface ChefFormDefaultValues {
  name: string;
  position: string;
  bio: string;
  yearsExperience: number | null;
  displayOrder: number;
  isActive: boolean;
}

type ChefFormProps =
  | {
      mode: "create";
      onSuccess: () => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      /** The id of the chef being edited — passed to updateItem(). */
      chefId: string;
      /** Pre-fills the form with the chef's current data. */
      defaultValues: ChefFormDefaultValues;
      /** The chef's current stored image URL, shown as the preview until a replacement is picked. */
      existingImageUrl: string | null;
      onSuccess: () => void;
      onCancel: () => void;
    };

/**
 * Chef form — create mode (Phase 9B) and edit mode (Phase 9C) in one
 * component, same reasoning as GalleryForm and MenuForm: field markup,
 * validation, and layout are never duplicated between Create and Edit;
 * only which hook is called and what the form starts populated with
 * differ. Never imports Supabase or chefs.service.ts directly.
 */
export function ChefForm(props: ChefFormProps) {
  const { onSuccess, onCancel } = props;
  const { createItem, isSubmitting: isCreating } = useCreateChef();
  const { updateItem, isSubmitting: isUpdating } = useUpdateChef();
  const isSubmitting = isCreating || isUpdating;

  const editDefaults =
    props.mode === "edit" ? props.defaultValues : undefined;
  const existingImageUrl =
    props.mode === "edit" ? props.existingImageUrl : null;

  const form = useForm<ChefFormInput, unknown, ChefFormValues>({
    resolver: zodResolver(chefSchema),
    defaultValues: {
      name: editDefaults?.name ?? "",
      position: editDefaults?.position ?? "",
      bio: editDefaults?.bio ?? "",
      yearsExperience: editDefaults?.yearsExperience ?? null,
      displayOrder: editDefaults?.displayOrder ?? 0,
      isActive: editDefaults?.isActive ?? true,
      imageFile: null,
    },
    mode: "onTouched",
  });

  async function onSubmit(values: ChefFormValues) {
    if (props.mode === "edit") {
      const result = await updateItem(props.chefId, {
        name: values.name,
        position: values.position,
        bio: values.bio ?? "",
        yearsExperience: values.yearsExperience ?? null,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
        imageFile: values.imageFile ?? null,
      }, props.existingImageUrl);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Chef profile updated.");
      onSuccess();
      return;
    }

    // create mode
    const result = await createItem({
      name: values.name,
      position: values.position,
      bio: values.bio ?? "",
      yearsExperience: values.yearsExperience ?? null,
      displayOrder: values.displayOrder,
      isActive: values.isActive,
      imageFile: values.imageFile ?? null,
    });

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Chef profile created.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Name + Position */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="chef-name">Name</FormLabel>
                <FormControl>
                  <Input
                    id="chef-name"
                    placeholder="e.g. Marco Rossi"
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
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="chef-position">Position</FormLabel>
                <FormControl>
                  <Input
                    id="chef-position"
                    placeholder="e.g. Head Chef"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="chef-bio">Bio</FormLabel>
              <FormControl>
                <Textarea
                  id="chef-bio"
                  placeholder="Short biography shown to customers"
                  rows={4}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Years experience + Display order */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="yearsExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="chef-years">Years of Experience</FormLabel>
                <FormControl>
                  <Input
                    id="chef-years"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    placeholder="e.g. 12"
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : Number(e.target.value))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="chef-order">Display Order</FormLabel>
                <FormControl>
                  <Input
                    id="chef-order"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Active toggle */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0">
              <FormControl>
                <Switch
                  id="chef-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormLabel htmlFor="chef-active" className="cursor-pointer font-normal">
                Active (visible on the public site)
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Image upload */}
        <FormField
          control={form.control}
          name="imageFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel htmlFor="chef-image">Photo</FormLabel>
              <FormControl>
                <ImageFileInput
                  {...field}
                  id="chef-image"
                  value={value ?? null}
                  onChange={onChange}
                  disabled={isSubmitting}
                  existingImageUrl={existingImageUrl}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
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
            ) : props.mode === "edit" ? (
              "Save Changes"
            ) : (
              "Create Chef"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ============================================================================
// ImageFileInput — same pattern as GalleryForm and MenuForm
// ============================================================================

interface ImageFileInputProps {
  id: string;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  /** Edit mode: show the existing stored image until a replacement is picked. Phase 9C only. */
  existingImageUrl?: string | null;
}

/**
 * File input with a small preview — same design as GalleryForm's and
 * MenuForm's ImageFileInput (deliberately not shared as a common
 * component, matching this codebase's existing convention of each form
 * owning its own slightly-varying file input). Manages an object URL
 * for the preview and revokes it on change/unmount to avoid leaks.
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
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const displayUrl = newFilePreviewUrl ?? existingImageUrl ?? null;

  function handleRemove() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      {displayUrl ? (
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border">
          <img src={displayUrl} alt="" className="size-full object-cover" />
          {newFilePreviewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Remove selected photo"
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
        <span className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, or GIF. Max 5MB. Optional.
        </span>
      </div>
    </div>
  );
}
