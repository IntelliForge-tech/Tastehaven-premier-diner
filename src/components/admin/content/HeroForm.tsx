import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  heroSchema,
  type HeroFormInput,
  type HeroFormValues,
} from "@/components/admin/content/hero-schema";
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
import { useUpdateHero } from "@/hooks/useUpdateHero";
import type { HeroContent } from "@/services/hero.service";

interface HeroFormProps {
  /** Current saved hero data — used to pre-fill the form and as baseline for reset. */
  hero: HeroContent;
  /** Called after a successful save so the parent can refetch and update the preview. */
  onSuccess: () => void;
  /**
   * Optional callback invoked on every render with the current `isDirty`
   * state. Used by the parent page to drive the navigation blocker without
   * lifting the form state out of this component.
   */
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * Hero Settings form — Phase 12A.
 *
 * Single form component (no create/edit split — there is always exactly
 * one hero row). Follows the same structure as ChefForm and GalleryForm:
 * React Hook Form + Zod resolver, custom ImageFileInput sub-component,
 * Sonner toasts, and useUpdateHero() for the save orchestration.
 *
 * Unsaved-changes guard: `form.formState.isDirty` is used by the parent
 * page to warn before navigation.
 */
export function HeroForm({ hero, onSuccess, onDirtyChange }: HeroFormProps) {
  const { updateItem, isSubmitting } = useUpdateHero();

  const defaultValues: HeroFormInput = {
    headline: hero.headline,
    headlineHighlight: hero.headlineHighlight ?? "",
    headlineSuffix: hero.headlineSuffix ?? "",
    badgeText: hero.badgeText ?? "",
    description: hero.description ?? "",
    primaryButtonText: hero.primaryButtonText ?? "",
    primaryButtonLink: hero.primaryButtonLink ?? "",
    secondaryButtonText: hero.secondaryButtonText ?? "",
    secondaryButtonLink: hero.secondaryButtonLink ?? "",
    overlayOpacity: hero.overlayOpacity,
    isVisible: hero.isVisible,
    imageFile: null,
    imageCleared: false,
  };

  const form = useForm<HeroFormInput, unknown, HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues,
    mode: "onTouched",
  });

  // Keep form in sync when the parent refetches after a successful save.
  useEffect(() => {
    form.reset({
      headline: hero.headline,
      headlineHighlight: hero.headlineHighlight ?? "",
      headlineSuffix: hero.headlineSuffix ?? "",
      badgeText: hero.badgeText ?? "",
      description: hero.description ?? "",
      primaryButtonText: hero.primaryButtonText ?? "",
      primaryButtonLink: hero.primaryButtonLink ?? "",
      secondaryButtonText: hero.secondaryButtonText ?? "",
      secondaryButtonLink: hero.secondaryButtonLink ?? "",
      overlayOpacity: hero.overlayOpacity,
      isVisible: hero.isVisible,
      imageFile: null,
      imageCleared: false,
    });
  }, [hero, form]);

  async function onSubmit(values: HeroFormValues) {
    const result = await updateItem(
      {
        headline: values.headline,
        headlineHighlight: values.headlineHighlight ?? "",
        headlineSuffix: values.headlineSuffix ?? "",
        badgeText: values.badgeText ?? "",
        description: values.description ?? "",
        primaryButtonText: values.primaryButtonText ?? "",
        primaryButtonLink: values.primaryButtonLink ?? "",
        secondaryButtonText: values.secondaryButtonText ?? "",
        secondaryButtonLink: values.secondaryButtonLink ?? "",
        overlayOpacity: values.overlayOpacity,
        isVisible: values.isVisible,
        imageFile: values.imageFile ?? null,
        imageCleared: values.imageCleared ?? false,
      },
      hero.backgroundImageUrl,
    );

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Hero section updated.");
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

        {/* ── Visibility ─────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="isVisible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-border bg-muted/30 p-4">
              <FormControl>
                <Switch
                  id="hero-visible"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel htmlFor="hero-visible" className="cursor-pointer text-sm font-medium">
                  Hero Section Visible
                </FormLabel>
                <FormDescription className="text-xs">
                  When off, the Hero section is hidden entirely on the public homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* ── Heading fields ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Heading
          </h3>

          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="hero-headline">Main Heading <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    id="hero-headline"
                    placeholder="e.g. Fresh Ingredients."
                    autoFocus
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  The first line of the hero heading.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="headlineHighlight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="hero-highlight">Highlighted Word</FormLabel>
                  <FormControl>
                    <Input
                      id="hero-highlight"
                      placeholder="e.g. Memorable"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Rendered in gold on the second line.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headlineSuffix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="hero-suffix">Heading Suffix</FormLabel>
                  <FormControl>
                    <Input
                      id="hero-suffix"
                      placeholder="e.g. Experiences."
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Text after the highlighted word on the second line.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="badgeText"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="hero-badge">Badge Text</FormLabel>
                <FormControl>
                  <Input
                    id="hero-badge"
                    placeholder="e.g. Now taking reservations"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Small pill above the heading. Leave blank to hide it.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Description ─────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="hero-description">Description</FormLabel>
              <FormControl>
                <Textarea
                  id="hero-description"
                  placeholder="A short paragraph shown beneath the heading."
                  rows={3}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── CTA Buttons ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Call-to-Action Buttons
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryButtonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="hero-primary-text">Primary Button Label</FormLabel>
                  <FormControl>
                    <Input
                      id="hero-primary-text"
                      placeholder="e.g. Reserve Table"
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
              name="primaryButtonLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="hero-primary-link">Primary Button Link</FormLabel>
                  <FormControl>
                    <Input
                      id="hero-primary-link"
                      placeholder="e.g. reserve"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Section anchor id or full URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="secondaryButtonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="hero-secondary-text">Secondary Button Label</FormLabel>
                  <FormControl>
                    <Input
                      id="hero-secondary-text"
                      placeholder="e.g. View Menu"
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
              name="secondaryButtonLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="hero-secondary-link">Secondary Button Link</FormLabel>
                  <FormControl>
                    <Input
                      id="hero-secondary-link"
                      placeholder="e.g. menu"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Section anchor id or full URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Background Image ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Background Image
          </h3>

          <FormField
            control={form.control}
            name="imageFile"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel htmlFor="hero-image">Background Image</FormLabel>
                <FormControl>
                  <HeroImageInput
                    {...field}
                    id="hero-image"
                    value={value ?? null}
                    onChange={onChange}
                    disabled={isSubmitting}
                    existingImageUrl={hero.backgroundImageUrl}
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

          <FormField
            control={form.control}
            name="overlayOpacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="hero-opacity">
                  Overlay Opacity — {form.watch("overlayOpacity")}%
                </FormLabel>
                <FormControl>
                  <input
                    id="hero-opacity"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    disabled={isSubmitting}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full accent-primary"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={field.value}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Controls how dark the gradient overlay on the background image is. 0 = fully transparent, 100 = fully opaque.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Form Actions ──────────────────────────────────────────────── */}
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

// ── HeroImageInput ──────────────────────────────────────────────────────────

interface HeroImageInputProps {
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
 * Hero-specific image file input with a wider preview (full-width
 * landscape) to match the Hero section's background usage. Mirrors the
 * ImageFileInput pattern from ChefForm / GalleryForm but with a larger
 * preview area appropriate for a background image.
 *
 * States:
 * - No existing image + no file picked → upload placeholder.
 * - Existing image + no file picked + not cleared → shows existing with Replace/Remove actions.
 * - File picked → shows new file preview with Remove action (reverts to existing on remove).
 * - Cleared → shows placeholder with Restore action.
 */
function HeroImageInput({
  id,
  value,
  onChange,
  disabled,
  existingImageUrl,
  isCleared,
  onClear,
  onRestore,
}: HeroImageInputProps) {
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

  // What to display in the preview area:
  // 1. A newly picked file always wins.
  // 2. If cleared, show nothing (placeholder).
  // 3. Otherwise show the existing stored image.
  const displayUrl = newFilePreviewUrl ?? (isCleared ? null : existingImageUrl);
  const hasNewFile = value !== null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    // Picking a new file implicitly un-clears any previous "remove" action.
    // The parent sets imageCleared=false via the form via useEffect in the form.
  }

  function handleRemoveNewFile() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
    // Don't set imageCleared — the existing image should be restored.
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {displayUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border" style={{ aspectRatio: "16/6" }}>
          <img
            src={displayUrl}
            alt="Hero background preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute bottom-3 left-3 text-xs font-medium text-white/90">
            {hasNewFile ? "New image preview" : "Current background image"}
          </div>
          {/* Remove new file (revert to existing) */}
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
          style={{ aspectRatio: "16/6" }}
          aria-hidden="true"
        >
          <ImagePlus className="size-8" />
          <span className="text-sm">No background image</span>
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

        {/* Remove existing (only shown when existing image is displayed and no new file picked) */}
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

        {/* Restore (only shown when image was cleared) */}
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
        JPEG, PNG, WebP, or GIF · Max 5 MB · Recommended: 1920 × 1080 px or wider
      </p>
    </div>
  );
}
