import { z } from "zod";

/**
 * Client-side validation for the Add Menu Item form.
 *
 * Mirrors the real schema, not an invented one:
 * - name/category_id/price are NOT NULL on menu_items; price also has a
 *   `price > 0` check constraint in the database, matched here.
 * - description is nullable on menu_items — an empty string here is
 *   normalized to null before it reaches the service (see
 *   useCreateMenuItem).
 * - is_featured/is_available default to false/true on the table; the
 *   same defaults are used for the form.
 * - The image file-size (5MB) and MIME-type allowlist match the
 *   `restaurant-media` Storage bucket's own configured limits exactly,
 *   so an obviously-invalid file is caught here instead of round-tripping
 *   to Storage first.
 */

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer.")
    .optional()
    .default(""),
  categoryId: z.string().min(1, "Please select a category."),
  price: z.coerce
    .number({ invalid_type_error: "Enter a valid price." })
    .positive("Price must be greater than 0."),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  imageFile: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine((file) => !file || file.size <= MAX_IMAGE_BYTES, "Image must be 5MB or smaller.")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Image must be a JPEG, PNG, WebP, or GIF file.",
    ),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
