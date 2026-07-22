import { z } from "zod";

/**
 * Client-side validation for the Add Gallery Image form (Phase 7B,
 * create only — Edit is Phase 7C).
 *
 * Mirrors the real `gallery_images` schema, not an invented one:
 * - `alt_text` is NOT NULL on the table — required here too.
 * - `caption` is nullable on the table — optional here, and is what the
 *   form/card call "Title" (there's no separate `title` column; see
 *   gallery.service.ts's `GalleryImageItem.caption` doc comment).
 * - `image_url` is NOT NULL on the table, unlike `menu_items.image_url`
 *   (nullable) — so on *create*, the image file is effectively
 *   required, unlike Menu's create form. But since this same schema
 *   also serves *edit* mode (Phase 7C), where keeping the existing
 *   image unchanged is valid, `imageFile` itself stays nullable/
 *   optional at the schema level — see its own doc comment below for
 *   where the "required on create" rule actually lives.
 * - `is_featured` defaults to false on the table; same default here.
 * - `category_id` and `display_order` are intentionally not form fields
 *   this phase — category selection wasn't in this phase's spec, and
 *   display_order is left at its database default (0), the same choice
 *   already made for Menu's create form (see createMenuItem's doc
 *   comment) for consistency.
 * - Image file-size (5MB) and MIME-type allowlist match
 *   menu-item-schema.ts's (and the `restaurant-media` bucket's own
 *   configured limits) exactly.
 */

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const galleryItemSchema = z.object({
  caption: z.string().max(200, "Title must be 200 characters or fewer.").optional().default(""),
  altText: z
    .string()
    .min(1, "Alt text is required.")
    .max(300, "Alt text must be 300 characters or fewer."),
  isFeatured: z.boolean().default(false),
  /**
   * Nullable, not required, at the schema level — the same field needs
   * different rules depending on mode: required on create (no existing
   * image to fall back to), optional on edit (a new file only replaces
   * the current one if picked, exactly like MenuForm's edit mode). Zod
   * schemas don't have access to that mode at validation time, so
   * "required on create" is enforced imperatively in GalleryForm's
   * onSubmit via `form.setError()` instead — see that file. This keeps
   * one schema/one type serving both modes, which is what lets
   * GalleryForm stay a single component the way MenuForm is.
   */
  imageFile: z
    .instanceof(File)
    .nullable()
    .refine((file) => !file || file.size <= MAX_IMAGE_BYTES, "Image must be 5MB or smaller.")
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Image must be a JPEG, PNG, WebP, or GIF file.",
    ),
});

export type GalleryItemFormValues = z.infer<typeof galleryItemSchema>;
/**
 * The schema's pre-parse input type — same reason this exists on
 * menu-item-schema.ts: `caption`/`isFeatured` use `.optional().default()`,
 * which only applies on the *output* side, so `useForm`'s field-values
 * generic needs the input type instead. See MenuForm.tsx's `useForm<...>`
 * call for the pattern this mirrors.
 */
export type GalleryItemFormInput = z.input<typeof galleryItemSchema>;
