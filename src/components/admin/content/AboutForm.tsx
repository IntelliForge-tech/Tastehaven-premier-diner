import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, ImagePlus, Loader2, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  aboutSchema,
  type AboutFormInput,
  type AboutFormValues,
} from "@/components/admin/content/about-schema";
import { Button } from "@/components/common/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateAbout } from "@/hooks/useUpdateAbout";
import { DEFAULT_FEATURES } from "@/services/about.service";
import type { AboutContent, AboutFeature } from "@/services/about.service";

interface AboutFormProps {
  about: AboutContent;
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * About Settings form — Phase 12B.
 *
 * Single form component for the About singleton. Follows the exact same
 * structure as HeroForm (Phase 12A): React Hook Form + Zod resolver,
 * image upload sub-component, feature cards array editor, Sonner toasts,
 * and useUpdateAbout() for save orchestration.
 *
 * `onDirtyChange` mirrors HeroForm's pattern so the parent page can
 * drive the TanStack Router navigation blocker without lifting form state.
 */
export function AboutForm({ about, onSuccess, onDirtyChange }: AboutFormProps) {
  const { updateItem, isSubmitting } = useUpdateAbout();

  const defaultValues: AboutFormInput = {
    sectionTitle: about.sectionTitle,
    heading: about.heading,
    description: about.description ?? "",
    features: about.features.length > 0 ? about.features : DEFAULT_FEATURES,
    badgeYear: about.badgeYear ?? "",
    badgeText: about.badgeText ?? "",
    isVisible: about.isVisible,
    imageFile: null,
    imageCleared: false,
  };

  const form = useForm<AboutFormInput, unknown, AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  // Re-sync when parent refetches after a successful save.
  useEffect(() => {
    form.reset({
      sectionTitle: about.sectionTitle,
      heading: about.heading,
      description: about.description ?? "",
      features: about.features.length > 0 ? about.features : DEFAULT_FEATURES,
      badgeYear: about.badgeYear ?? "",
      badgeText: about.badgeText ?? "",
      isVisible: about.isVisible,
      imageFile: null,
      imageCleared: false,
    });
  }, [about, form]);

  const isDirty = form.formState.isDirty;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  async function onSubmit(values: AboutFormValues) {
    const result = await updateItem(
      {
        sectionTitle: values.sectionTitle ?? "Our Story",
        heading: values.heading,
        description: values.description ?? "",
        features: values.features as AboutFeature[],
        badgeYear: values.badgeYear ?? "",
        badgeText: values.badgeText ?? "",
        isVisible: values.isVisible,
        imageFile: values.imageFile ?? null,
        imageCleared: values.imageCleared ?? false,
      },
      about.imageUrl,
    );

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("About section updated.");
    onSuccess();
  }

  function handleReset() {
    form.reset();
  }

  function handleAddFeature() {
    if (fields.length >= 4) return;
    append({ icon: "star", title: "", description: "" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">

        {/* ── Visibility ───────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="isVisible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-border bg-muted/30 p-4">
              <FormControl>
                <Switch
                  id="about-visible"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel htmlFor="about-visible" className="cursor-pointer text-sm font-medium">
                  About Section Visible
                </FormLabel>
                <FormDescription className="text-xs">
                  When off, the About section is hidden entirely on the public homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* ── Headings ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Section Heading
          </h3>

          <FormField
            control={form.control}
            name="sectionTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="about-section-title">Section Label</FormLabel>
                <FormControl>
                  <Input
                    id="about-section-title"
                    placeholder="e.g. Our Story"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Small uppercase kicker text shown above the main heading.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heading"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="about-heading">
                  Main Heading <span aria-hidden="true" className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="about-heading"
                    placeholder="e.g. A haven for the curious palate."
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
                <FormLabel htmlFor="about-description">Description</FormLabel>
                <FormControl>
                  <Textarea
                    id="about-description"
                    placeholder="A paragraph describing the restaurant's story and philosophy."
                    rows={4}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Feature Cards ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Feature Cards
            </h3>
            {fields.length < 4 && (
              <button
                type="button"
                onClick={handleAddFeature}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-3" aria-hidden="true" />
                Add Card
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Up to 4 cards shown in a 2×2 grid below the description. Use{" "}
            <a
              href="https://fontawesome.com/icons?s=solid&o=r"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              FontAwesome solid icon names
            </a>{" "}
            without the "fa-" prefix — e.g. <code className="rounded bg-muted px-1 text-[11px]">seedling</code>.
          </p>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <FeatureCardEditor
                key={field.id}
                index={index}
                isSubmitting={isSubmitting}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
                form={form}
              />
            ))}
          </div>

          {form.formState.errors.features?.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.features.root.message}
            </p>
          )}
        </div>

        {/* ── About Image ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About Image
          </h3>

          <FormField
            control={form.control}
            name="imageFile"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel htmlFor="about-image">Section Image</FormLabel>
                <FormControl>
                  <AboutImageInput
                    {...field}
                    id="about-image"
                    value={value ?? null}
                    onChange={onChange}
                    disabled={isSubmitting}
                    existingImageUrl={about.imageUrl}
                    isCleared={form.watch("imageCleared")}
                    onClear={() => {
                      onChange(null);
                      form.setValue("imageCleared", true, { shouldDirty: true });
                    }}
                    onRestore={() => {
                      onChange(null);
                      form.setValue("imageCleared", false, { shouldDirty: true });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Decorative Badge ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Decorative Badge
          </h3>
          <p className="text-xs text-muted-foreground">
            The glass card overlaid on the bottom-left of the image. Leave both fields blank to hide it.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="badgeYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="about-badge-year">Year</FormLabel>
                  <FormControl>
                    <Input
                      id="about-badge-year"
                      placeholder="e.g. 2012"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Large gold number in the badge overlay.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="badgeText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="about-badge-text">Badge Description</FormLabel>
                  <FormControl>
                    <Input
                      id="about-badge-text"
                      placeholder="e.g. A decade of memorable evenings."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Subtitle text beneath the year.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Form Actions ─────────────────────────────────────────────── */}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || !isDirty}
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset Changes
          </Button>

          <Button
            type="submit"
            variant="gold"
            disabled={isSubmitting || !isDirty}
            aria-busy={isSubmitting}
            aria-live="polite"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden="true" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── FeatureCardEditor ─────────────────────────────────────────────────────

import type { UseFormReturn } from "react-hook-form";

interface FeatureCardEditorProps {
  index: number;
  isSubmitting: boolean;
  canRemove: boolean;
  onRemove: () => void;
  form: UseFormReturn<AboutFormInput, unknown, AboutFormValues>;
}

/**
 * Single feature card editor row. Renders three fields (icon, title,
 * description) in a compact card with a drag handle indicator and a
 * remove button. Mirrors the pattern used for array fields in the
 * offers and menu admin forms throughout this project.
 */
function FeatureCardEditor({
  index,
  isSubmitting,
  canRemove,
  onRemove,
  form,
}: FeatureCardEditorProps) {
  const iconValue = form.watch(`features.${index}.icon`);

  return (
    <div className="group rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <GripVertical
          className="size-4 shrink-0 text-muted-foreground/40"
          aria-hidden="true"
        />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Card {index + 1}
        </span>

        {/* Live icon preview */}
        {iconValue && (
          <div className="ml-1 grid size-6 place-items-center rounded-full bg-primary/15 text-primary text-xs">
            <i className={`fa-solid fa-${iconValue}`} aria-hidden="true" />
          </div>
        )}

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={isSubmitting}
            aria-label={`Remove card ${index + 1}`}
            className="ml-auto grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField
          control={form.control}
          name={`features.${index}.icon`}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                htmlFor={`feature-${index}-icon`}
                className="text-xs"
              >
                Icon <span aria-hidden="true" className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id={`feature-${index}-icon`}
                  placeholder="seedling"
                  disabled={isSubmitting}
                  className="text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`features.${index}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                htmlFor={`feature-${index}-title`}
                className="text-xs"
              >
                Title <span aria-hidden="true" className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id={`feature-${index}-title`}
                  placeholder="Fresh Ingredients"
                  disabled={isSubmitting}
                  className="text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`features.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel
                htmlFor={`feature-${index}-description`}
                className="text-xs"
              >
                Description
              </FormLabel>
              <FormControl>
                <Input
                  id={`feature-${index}-description`}
                  placeholder="Sourced daily from local farms."
                  disabled={isSubmitting}
                  className="text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// ── AboutImageInput ───────────────────────────────────────────────────────

interface AboutImageInputProps {
  id: string;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  existingImageUrl: string | null;
  isCleared: boolean;
  onClear: () => void;
  onRestore: () => void;
}

/**
 * About-specific image input with a portrait-ratio preview to match
 * the About section's 4/5 aspect-ratio image column. Mirrors
 * HeroImageInput from HeroForm — same state machine, same controls.
 */
function AboutImageInput({
  id,
  value,
  onChange,
  disabled,
  existingImageUrl,
  isCleared,
  onClear,
  onRestore,
}: AboutImageInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const displayUrl = previewUrl ?? (isCleared ? null : existingImageUrl);
  const hasNewFile = value !== null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  }

  function handleRemoveNewFile() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {/* Preview — portrait ratio to match the About section layout */}
      {displayUrl ? (
        <div
          className="relative overflow-hidden rounded-xl border border-border"
          style={{ aspectRatio: "4/5", maxWidth: "280px" }}
        >
          <img
            src={displayUrl}
            alt="About section image preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-xs font-medium text-white/90 drop-shadow">
            {hasNewFile ? "New image preview" : "Current image"}
          </div>
          {hasNewFile && (
            <button
              type="button"
              onClick={handleRemoveNewFile}
              disabled={disabled}
              aria-label="Remove selected image"
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground"
          style={{ aspectRatio: "4/5", maxWidth: "280px" }}
          aria-hidden="true"
        >
          <ImagePlus className="size-8" />
          <span className="text-sm">No image set</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={id}
          className={[
            "inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors",
            "hover:bg-secondary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
            disabled ? "cursor-not-allowed opacity-50" : "",
          ].join(" ")}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {displayUrl ? "Replace Image" : "Upload Image"}
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={disabled}
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        {existingImageUrl && !hasNewFile && !isCleared && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" />
            Remove Image
          </button>
        )}

        {isCleared && !hasNewFile && (
          <button
            type="button"
            onClick={onRestore}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Restore Image
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP, or GIF · Max 5 MB · Recommended: portrait ratio (4:5)
      </p>
    </div>
  );
}
