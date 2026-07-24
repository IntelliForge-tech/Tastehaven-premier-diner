import { z } from "zod";

/**
 * Client-side validation for the About Settings form (Phase 12B).
 *
 * Mirrors the extended about_settings table schema:
 * - `section_title` — nullable; optional here (defaults to "Our Story").
 * - `headline`      — NOT NULL; required here.
 * - `description`   — nullable; optional here.
 * - `features`      — jsonb array of up to 4 feature cards.
 * - `badge_year`    — nullable; optional here.
 * - `badge_text`    — nullable; optional here.
 * - `is_visible`    — boolean; defaults to true.
 * - `imageFile`     — File | null; optional (existing image kept when null).
 * - `imageCleared`  — boolean flag set by the Remove button.
 *
 * Image constraints match the restaurant-media bucket limits used by
 * hero-schema.ts, chef-schema.ts, gallery-item-schema.ts, and
 * menu-item-schema.ts throughout this project.
 */

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const aboutFeatureSchema = z.object({
  icon: z
    .string()
    .min(1, "Icon is required.")
    .max(60, "Icon name must be 60 characters or fewer."),
  title: z
    .string()
    .min(1, "Title is required.")
    .max(80, "Title must be 80 characters or fewer."),
  description: z
    .string()
    .max(200, "Description must be 200 characters or fewer.")
    .default(""),
});

export const aboutSchema = z.object({
  sectionTitle: z
    .string()
    .max(60, "Section title must be 60 characters or fewer.")
    .default("Our Story"),

  heading: z
    .string()
    .min(1, "Heading is required.")
    .max(150, "Heading must be 150 characters or fewer."),

  description: z
    .string()
    .max(600, "Description must be 600 characters or fewer.")
    .default(""),

  features: z
    .array(aboutFeatureSchema)
    .min(1, "At least one feature card is required.")
    .max(4, "Maximum 4 feature cards are supported."),

  badgeYear: z
    .string()
    .max(10, "Year must be 10 characters or fewer.")
    .default(""),

  badgeText: z
    .string()
    .max(80, "Badge text must be 80 characters or fewer.")
    .default(""),

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

export type AboutFormValues = z.infer<typeof aboutSchema>;
export type AboutFormInput = z.input<typeof aboutSchema>;
export type AboutFeatureFormValues = z.infer<typeof aboutFeatureSchema>;
