import { z } from "zod";

/**
 * Client-side validation for the Hero Settings form (Phase 12A).
 *
 * Mirrors the extended hero_settings table schema:
 * - `headline`           — NOT NULL on the table; required here.
 * - `headline_highlight` — nullable; optional here.
 * - `headline_suffix`    — nullable; optional here.
 * - `badge_text`         — nullable; optional here.
 * - `description`        — nullable; optional here.
 * - `primary_button_*`   — nullable; optional here.
 * - `secondary_button_*` — nullable; optional here.
 * - `overlay_opacity`    — integer 0–100; defaults to 70.
 * - `is_visible`         — boolean; defaults to true.
 * - `imageFile`          — File | null; optional (existing image kept when null).
 * - `imageCleared`       — boolean flag set by the Remove button.
 *
 * Button link fields accept either an anchor id (e.g. "reserve") or a
 * full URL. We validate full-URL values as URLs; short anchor ids
 * (no "/" or ".") are accepted as-is.
 *
 * Image constraints match the restaurant-media bucket limits used by
 * chef-schema.ts, gallery-item-schema.ts, and menu-item-schema.ts.
 */

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function isValidLinkValue(val: string): boolean {
  if (!val) return true;
  // Looks like a URL — must be valid.
  if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/")) {
    try {
      // Relative paths: prepend a base so URL() can parse them.
      new URL(val.startsWith("/") ? `https://example.com${val}` : val);
      return true;
    } catch {
      return false;
    }
  }
  // Short anchor id (no slashes, dots, or spaces) — always valid.
  return /^[a-z0-9-_]+$/i.test(val);
}

export const heroSchema = z.object({
  headline: z
    .string()
    .min(1, "Main heading is required.")
    .max(120, "Main heading must be 120 characters or fewer."),

  headlineHighlight: z
    .string()
    .max(80, "Highlighted text must be 80 characters or fewer.")
    .default(""),

  headlineSuffix: z
    .string()
    .max(120, "Heading suffix must be 120 characters or fewer.")
    .default(""),

  badgeText: z
    .string()
    .max(80, "Badge text must be 80 characters or fewer.")
    .default(""),

  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .default(""),

  primaryButtonText: z
    .string()
    .max(60, "Button label must be 60 characters or fewer.")
    .default(""),

  primaryButtonLink: z
    .string()
    .max(200, "Button link must be 200 characters or fewer.")
    .refine(isValidLinkValue, "Enter a valid URL or anchor id (e.g. reserve).")
    .default(""),

  secondaryButtonText: z
    .string()
    .max(60, "Button label must be 60 characters or fewer.")
    .default(""),

  secondaryButtonLink: z
    .string()
    .max(200, "Button link must be 200 characters or fewer.")
    .refine(isValidLinkValue, "Enter a valid URL or anchor id (e.g. menu).")
    .default(""),

  overlayOpacity: z.coerce
    .number({ invalid_type_error: "Enter a number between 0 and 100." })
    .int("Overlay opacity must be a whole number.")
    .min(0, "Overlay opacity can't be negative.")
    .max(100, "Overlay opacity can't exceed 100.")
    .default(70),

  isVisible: z.boolean().default(true),

  imageFile: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine((file) => !file || file.size <= MAX_IMAGE_BYTES, "Image must be 5 MB or smaller.")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Image must be a JPEG, PNG, WebP, or GIF file.",
    ),

  imageCleared: z.boolean().default(false),
});

export type HeroFormValues = z.infer<typeof heroSchema>;
export type HeroFormInput = z.input<typeof heroSchema>;
