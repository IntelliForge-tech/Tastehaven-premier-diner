import { z } from "zod";

/**
 * Client-side validation for the Create Testimonial form. Mirrors the
 * real `testimonials` columns from database.types.ts — no invented
 * fields:
 *
 * - customer_name     NOT NULL → required here.
 * - role_or_location  nullable → optional here, normalised to null when
 *                     blank by useCreateTestimonial before calling the
 *                     service (same convention as Menu's description).
 * - rating            NOT NULL, int, db check 1–5 → coerced number with
 *                     min/max matching the check constraint.
 * - review_text       NOT NULL → required, with a short minimum so the
 *                     field isn't satisfied by a single character.
 * - is_featured       boolean, defaults false on table → same here.
 * - is_visible        boolean, defaults true on table → same here.
 * - display_order     int, defaults 0 on table → coerced int ≥ 0; the
 *                     admin can leave it at 0 and the listing's
 *                     display_order / customer_name ordering still gives
 *                     a consistent result.
 *
 * `rating` and `display_order` use `z.coerce.number()` because they
 * come from `<input type="number">` (a string before RHF sees it) but
 * must reach the service as a real number. This is the same reason
 * Menu's `price` uses coerce — see menu-item-schema.ts's comment on
 * that field for the full reasoning.
 */
export const testimonialSchema = z.object({
  customerName: z
    .string()
    .min(1, "Customer name is required.")
    .max(120, "Customer name must be 120 characters or fewer."),
  roleOrLocation: z
    .string()
    .max(120, "Role / location must be 120 characters or fewer.")
    .optional()
    .default(""),
  rating: z.coerce
    .number({ invalid_type_error: "Enter a valid rating." })
    .int("Rating must be a whole number.")
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating must be 5 or less."),
  reviewText: z
    .string()
    .min(10, "Review must be at least 10 characters.")
    .max(2000, "Review must be 2000 characters or fewer."),
  isFeatured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  displayOrder: z.coerce
    .number({ invalid_type_error: "Enter a valid display order." })
    .int("Display order must be a whole number.")
    .min(0, "Display order must be 0 or greater.")
    .default(0),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;
