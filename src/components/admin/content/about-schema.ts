import { z } from "zod";

/**
 * Client-side validation for the About Settings form (Phase 12B).
 *
 * Mirrors the extended about_settings table schema:
 * - `sectionTitle`   — required; small label above the heading.
 * - `headline`       — NOT NULL on the table; required here.
 * - `description`    — nullable; optional here.
 * - `badgeLabel`     — nullable; optional ("Since").
 * - `badgeYear`      — nullable; optional ("2012").
 * - `badgeSubtext`   — nullable; optional.
 * - `features`       — array of up to 4 feature cards.
 * - `isVisible`      — boolean; defaults to true.
 * - `imageFile`      — File | null; optional (existing image kept when null).
 * - `imageCleared`   — boolean flag set by the Remove button.
 *
 * Image constraints match the restaurant-media bucket limits used by
 * hero-schema.ts, chef-schema.ts, and gallery-item-schema.ts.
 */

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export const aboutFeatureSchema = z.object({
  icon: z
    .string()
    .min(1, "Icon class is required.")
    .max(50, "Icon class must be 50 characters or fewer."),
  title: z
    .string()
    .min(1, "Feature title is required.")
    .max(80, "Feature title must be 80 characters or fewer."),
  description: z
    .string()
    .max(200, "Feature description must be 200 characters or fewer.")
    .default(""),
});

export const aboutSchema = z.object({
  sectionTitle: z
    .string()
    .min(1, "Section title is required.")
    .max(60, "Section title must be 60 characters or fewer."),

  headline: z
    .string()
    .min(1, "Main heading is required.")
    .max(150, "Main heading must be 150 characters or fewer."),

  description: z
    .string()
    .max(600, "Description must be 600 characters or fewer.")
    .default(""),

  badgeLabel: z
    .string()
    .max(40, "Badge label must be 40 characters or fewer.")
    .default(""),

  badgeYear: z
    .string()
    .max(20, "Badge year must be 20 characters or fewer.")
    .default(""),

  badgeSubtext: z
    .string()
    .max(80, "Badge subtext must be 80 characters or fewer.")
    .default(""),

  features: z
    .array(aboutFeatureSchema)
    .min(1, "At least one feature card is required.")
    .max(4, "A maximum of 4 feature cards is allowed."),

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
