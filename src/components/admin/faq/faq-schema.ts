import { z } from "zod";

export const faqSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required.")
    .max(200, "Question must be 200 characters or fewer."),
  answer: z
    .string()
    .min(1, "Answer is required.")
    .max(1000, "Answer must be 1000 characters or fewer."),
  displayOrder: z
    .number({ invalid_type_error: "Display order must be a number." })
    .int("Display order must be a whole number.")
    .min(0, "Display order must be 0 or greater.")
    .default(0),
  isActive: z.boolean().default(true),
});

export type FaqFormValues = z.infer<typeof faqSchema>;
export type FaqFormInput = z.input<typeof faqSchema>;
