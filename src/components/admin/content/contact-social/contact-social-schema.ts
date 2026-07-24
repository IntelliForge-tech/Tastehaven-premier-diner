import { z } from "zod";

import { ALL_PLATFORMS } from "@/services/social-links.service";

// ── Contact Information schema ───────────────────────────────────────────────

const optionalUrl = z
  .string()
  .max(500)
  .refine((v) => !v || /^https?:\/\/.+/.test(v), "Enter a valid URL (starting with https://).")
  .optional()
  .default("");

export const contactInformationSchema = z.object({
  // Phone
  primaryPhone: z
    .string()
    .min(1, "Primary phone is required.")
    .max(30, "Primary phone must be 30 characters or fewer."),
  secondaryPhone: z.string().max(30).default(""),
  whatsappNumber: z.string().max(30).default(""),
  reservationPhone: z.string().max(30).default(""),
  // Email
  primaryEmail: z
    .string()
    .min(1, "Primary email is required.")
    .email("Enter a valid email address.")
    .max(120),
  secondaryEmail: z
    .string()
    .max(120)
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address.")
    .default(""),
  customerSupportEmail: z
    .string()
    .max(120)
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address.")
    .default(""),
  // Address
  streetAddress: z
    .string()
    .min(1, "Street address is required.")
    .max(200, "Street address must be 200 characters or fewer."),
  area: z.string().max(100).default(""),
  city: z
    .string()
    .min(1, "City is required.")
    .max(100, "City must be 100 characters or fewer."),
  state: z.string().max(100).default(""),
  country: z.string().max(100).default(""),
  postalCode: z.string().max(20).default(""),
  // Links
  googleMapsUrl: optionalUrl,
  websiteUrl: optionalUrl,
  // Messaging
  businessHoursNote: z.string().max(200).default(""),
  emergencyContact: z.string().max(100).default(""),
  customerServiceMessage: z.string().max(300).default(""),
  responseTimeMessage: z.string().max(200).default(""),
  // Toggles
  liveChatEnabled: z.boolean().default(false),
  reservationContactEnabled: z.boolean().default(true),
  whatsappButtonEnabled: z.boolean().default(false),
  callButtonEnabled: z.boolean().default(true),
  emailButtonEnabled: z.boolean().default(true),
});

export type ContactInformationFormValues = z.infer<typeof contactInformationSchema>;

// ── Social Links schema ──────────────────────────────────────────────────────

export const socialLinkItemSchema = z.object({
  platform: z.enum(ALL_PLATFORMS as [string, ...string[]]),
  label: z.string(),
  url: z
    .string()
    .max(500)
    .refine(
      (v) => !v || /^https?:\/\/.+/.test(v),
      "Enter a valid URL (starting with https://).",
    )
    .default(""),
  enabled: z.boolean().default(false),
  openInNewTab: z.boolean().default(true),
  displayOrder: z
    .number({ invalid_type_error: "Display order must be a number." })
    .int()
    .min(0)
    .default(0),
  icon: z.string().default(""),
  faIcon: z.string().default(""),
});

export const socialLinksFormSchema = z.object({
  links: z.array(socialLinkItemSchema),
});

export type SocialLinksFormValues = z.infer<typeof socialLinksFormSchema>;
export type SocialLinkItemFormValues = z.infer<typeof socialLinkItemSchema>;
