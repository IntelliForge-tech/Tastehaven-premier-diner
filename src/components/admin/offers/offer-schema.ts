import { z } from "zod";

/**
 * Client-side validation for the Create/Edit Offer form. Mirrors the
 * real `special_offers` columns from database.types.ts — no invented
 * fields:
 *
 * - title         NOT NULL → required here.
 * - description   nullable → optional, empty string normalised to null
 *                 before reaching the service.
 * - tag           nullable → optional, e.g. "Limited Time", "Weekend Only".
 * - icon          nullable → optional, intended as an emoji or icon
 *                 identifier (not a Storage image — no image_url column
 *                 exists on this table).
 * - valid_from    nullable ISO date string → optional date input. Stored
 *                 as-is; the DB column is text, not a date type, so no
 *                 coercion needed beyond the optional string check.
 * - valid_until   nullable ISO date string → same.
 * - is_active     boolean, defaults true → admin controls visibility.
 * - display_order int, defaults 0 → coerced so an empty input gives 0
 *                 rather than NaN, matching the testimonial/chef pattern.
 */
export const offerSchema = z
  .object({
  title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or fewer."),

  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer.")
    .optional()
    .default(""),

  tag: z.string().max(60, "Tag must be 60 characters or fewer.").optional().default(""),

  icon: z.string().max(20, "Icon must be 20 characters or fewer.").optional().default(""),

  validFrom: z.string().optional().default(""),

  validUntil: z.string().optional().default(""),

  isActive: z.boolean().default(true),

  displayOrder: z.coerce
    .number({ invalid_type_error: "Enter a valid display order." })
    .int("Display order must be a whole number.")
    .min(0, "Display order must be 0 or greater.")
    .default(0),
})
.superRefine((data, ctx) => {
  const from = data.validFrom?.trim();
  const until = data.validUntil?.trim();
  if (from && until && until < from) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "\"Valid Until\" must be on or after \"Valid From\".",
      path: ["validUntil"],
    });
  }
});

export type OfferFormValues = z.infer<typeof offerSchema>;
/**
 * The schema's pre-parse input type — needed because fields that use
 * `.optional().default()` are optional on the input side but required
 * on the output side. `useForm`'s field-values generic should use the
 * input type so `defaultValues` typing lines up correctly with what RHF
 * holds in form state before the resolver runs. Same pattern as
 * gallery-item-schema.ts and testimonial-schema.ts.
 */
export type OfferFormInput = z.input<typeof offerSchema>;
