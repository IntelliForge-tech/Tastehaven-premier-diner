import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
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
import type { AboutContent } from "@/services/about.service";

interface AboutFormProps {
  /** Current saved about data — used to pre-fill the form and as baseline for reset. */
  about: AboutContent;
  /** Called after a successful save so the parent can refetch and update the preview. */
  onSuccess: () => void;
  /**
   * Optional callback invoked on every render with the current `isDirty`
   * state. Used by the parent page to drive the navigation blocker without
   * lifting the form state out of this component.
   */
  onDirtyChange?: (isDirty: boolean) => void;
}

function buildDefaultValues(about: AboutContent): AboutFormInput {
  return {
    sectionTitle: about.sectionTitle,
    headline: about.headline,
    description: about.description ?? "",
    badgeLabel: about.badgeLabel ?? "",
    badgeYear: about.badgeYear ?? "",
    badgeSubtext: about.badgeSubtext ?? "",
    features: about.features,
    isVisible: about.isVisible,
    imageFile: null,
    imageCleared: false,
  };
}

/**
 * About Settings form — Phase 12B.
 *
 * Single form component (no create/edit split — there is always exactly
 * one about row). Follows the same structure as HeroForm:
 * React Hook Form + Zod resolver, custom ImageFileInput sub-component,
 * Sonner toasts, and useUpdateAbout() for the save orchestration.
 *
 * Unsaved-changes guard: `form.formState.isDirty` is used by the parent
 * page to warn before navigation.
 */
export function AboutForm({ about, onSuccess, onDirtyChange }: AboutFormProps) {
  const { updateItem, isSubmitting } = useUpdateAbout();

  const form = useForm<AboutFormInput, unknown, AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: buildDefaultValues(about),
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  // Keep form in sync when the parent refetches after a successful save.
  useEffect(() => {
    form.reset(buildDefaultValues(about));
  }, [about, form]);

  async function onSubmit(values: AboutFormValues) {
    const result = await updateItem(
      {
        sectionTitle: values.sectionTitle,
        headline: values.headline,
        description: values.description ?? "",
        badgeLabel: values.badgeLabel ?? "",
        badgeYear: values.badgeYear ?? "",
        badgeSubtext: values.badgeSubtext ?? "",
        features: values.features,
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

  const isDirty = form.formState.isDirty;

  // Sync isDirty upward to the parent page for the navigation blocker.
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

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

        {/* ── Heading fields ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Heading
          </h3>

          <FormField
            control={form.control}
            name="sectionTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="about-section-title">
                  Section Label <span aria-hidden="true" className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="about-section-title"
                    placeholder="e.g. Our Story"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Small label displayed above the main heading.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="about-headline">
                  Main Heading <span aria-hidden="true" className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="about-headline"
                    placeholder="e.g. A haven for the curious palate."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  The primary heading displayed in the About section.
                </FormDescription>
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
                    placeholder="Born from a love of the neighborhood market…"
                    rows={4}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  The paragraph displayed beneath the heading.
                </FormDescription>
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
            The small floating card that appears over the image (e.g. "Since · 2012").
            Leave all fields empty to hide the badge.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="badgeLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="about-badge-label">Label</FormLabel>
                  <FormControl>
                    <Input
                      id="about-badge-label"
                      placeholder="e.g. Since"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">Small uppercase label.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="badgeYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="about-badge-year">Year / Value</FormLabel>
                  <FormControl>
                    <Input
                      id="about-badge-year"
                      placeholder="e.g. 2012"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">Displayed large in gold.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="badgeSubtext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="about-badge-subtext">Subtext</FormLabel>
                  <FormControl>
                    <Input
                      id="about-badge-subtext"
                      placeholder="e.g. A decade of memorable evenings."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">Small text beneath the year.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Feature Cards ────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Feature Cards
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Up to 4 cards displayed in the 2×2 grid. Use Font Awesome icon classes (e.g.{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">fa-seedling</code>).
              </p>
            </div>
            {fields.length < 4 && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() =>
                  append({ icon: "fa-star", title: "", description: "" })
                }
                className="inline-flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add Card
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative rounded-lg border border-border bg-muted/20 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Card {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={isSubmitting}
                      aria-label={`Remove feature card ${index + 1}`}
                      className="grid size-7 place-items-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`features.${index}.icon`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel htmlFor={`feature-icon-${index}`} className="text-xs">
                          Icon Class <span aria-hidden="true" className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id={`feature-icon-${index}`}
                            placeholder="fa-seedling"
                            disabled={isSubmitting}
                            className="text-sm"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`features.${index}.title`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel htmlFor={`feature-title-${index}`} className="text-xs">
                          Title <span aria-hidden="true" className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id={`feature-title-${index}`}
                            placeholder="Fresh Ingredients"
                            disabled={isSubmitting}
                            className="text-sm"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`features.${index}.description`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel htmlFor={`feature-desc-${index}`} className="text-xs">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            id={`feature-desc-${index}`}
                            placeholder="Sourced daily from local farms."
                            disabled={isSubmitting}
                            className="text-sm"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── About Image ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About Image
          </h3>
          <FormField
            control={form.control}
            name="imageFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">About Image</FormLabel>
                <FormControl>
                  <AboutImageInput
                    id="about-image"
                    value={field.value ?? null}
                    onChange={(file) => {
                      field.onChange(file);
                      if (file) {
                        form.setValue("imageCleared", false);
                      }
                    }}
                    disabled={isSubmitting}
                    existingImageUrl={about.imageUrl}
                    isCleared={form.watch("imageCleared")}
                    onClear={() => {
                      form.setValue("imageCleared", true, { shouldDirty: true });
                      field.onChange(null);
                    }}
                    onRestore={() => {
                      form.setValue("imageCleared", false, { shouldDirty: true });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Form actions ─────────────────────────────────────────────── */}
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

// ── AboutImageInput ──────────────────────────────────────────────────────────

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
 * About-specific image file input with a portrait-ish 4:5 preview to
 * match the About section's usage. Mirrors HeroImageInput from HeroForm
 * but with an aspect ratio appropriate for the about section image.
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

  const displayUrl = newFilePreviewUrl ?? (isCleared ? null : existingImageUrl);
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
      {/* Preview */}
      {displayUrl ? (
        <div
          className="relative overflow-hidden rounded-xl border border-border"
          style={{ aspectRatio: "4/3", maxWidth: "480px" }}
        >
          <img
            src={displayUrl}
            alt="About section image preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur">
            {hasNewFile ? "New image preview" : "Current about image"}
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
          style={{ aspectRatio: "4/3", maxWidth: "480px" }}
          aria-hidden="true"
        >
          <ImagePlus className="size-8" />
          <span className="text-sm">No about image</span>
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
        JPEG, PNG, WebP, or GIF · Max 5 MB · Recommended: 900 × 1100 px (portrait)
      </p>
    </div>
  );
}
