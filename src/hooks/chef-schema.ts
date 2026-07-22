import { z } from "zod";

/**
 * Client-side validation for the Chef form (create mode Phase 9B,
 * edit mode Phase 9C).
 *
 * Mirrors the real `chefs` table schema, not an invented one:
 * - `name` / `position` — NOT NULL on the table, required here.
 * - `bio` — nullable on the table, optional here.
 * - `years_experience` — nullable integer; coerced from the input's
 *   string/empty-string, then treated as null when blank.
 * - `display_order` — has a DB default of 0; defaults to 0 here too.
 * - `is_active` — defaults to true on the table; same here.
 * - `image_url` — nullable on the table, so the image file is optional
 *   (unlike gallery_images.image_url which is NOT NULL). No
 *   "required on create" imperative check needed for chefs.
 * - `social_links` — jsonb, not a form field in 9A/9B; set by the
 *   service to its column default `{}`.
 *
 * Image constraints match the `restaurant-media` bucket's configured
 * limits and the convention used by menu-item-schema.ts and
 * gallery-item-schema.ts exactly.
 */

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const chefSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  position: z
    .string()
    .min(1, "Position is required.")
    .max(120, "Position must be 120 characters or fewer."),
  bio: z
    .string()
    .max(2000, "Bio must be 2000 characters or fewer.")
    .optional()
    .default(""),
  yearsExperience: z.coerce
    .number({ invalid_type_error: "Enter a whole number." })
    .int("Enter a whole number.")
    .min(0, "Years experience can't be negative.")
    .max(80, "Years experience seems too high.")
    .nullable()
    .optional()
    .default(null),
  displayOrder: z.coerce
    .number({ invalid_type_error: "Enter a valid display order." })
    .int("Display order must be a whole number.")
    .min(0, "Display order can't be negative.")
    .default(0),
  isActive: z.boolean().default(true),
  imageFile: z
    .instanceof(File)
    .nullable()
    .optional()
    .refine((file) => !file || file.size <= MAX_IMAGE_BYTES, "Image must be 5MB or smaller.")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Image must be a JPEG, PNG, WebP, or GIF file.",
    ),
});

export type ChefFormValues = z.infer<typeof chefSchema>;
export type ChefFormInput = z.input<typeof chefSchema>;
