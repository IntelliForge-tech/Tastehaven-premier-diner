import { z } from "zod";

export const restaurantInfoSchema = z.object({
  name: z
    .string()
    .min(1, "Restaurant name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  tagline: z.string().max(150, "Tagline must be 150 characters or fewer.").default(""),
  description: z.string().max(800, "Description must be 800 characters or fewer.").default(""),
  address: z.string().max(200, "Address must be 200 characters or fewer.").default(""),
  phone: z.string().max(30, "Phone must be 30 characters or fewer.").default(""),
  email: z
    .string()
    .max(100, "Email must be 100 characters or fewer.")
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address.")
    .default(""),
});

export const openingHoursDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().nullable().default(null),
  closeTime: z.string().nullable().default(null),
  isClosed: z.boolean().default(false),
});

export const openingHoursSchema = z.object({
  hours: z.array(openingHoursDaySchema).length(7),
});

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, "Platform name is required.").max(40),
  url: z
    .string()
    .min(1, "URL is required.")
    .url("Enter a valid URL (including https://).")
    .max(300),
  icon: z.string().max(60).nullable().default(null),
  isActive: z.boolean().default(true),
});

export const socialLinksSchema = z.object({
  links: z.array(socialLinkSchema).max(10, "Maximum 10 social links."),
});

export type RestaurantInfoFormValues = z.infer<typeof restaurantInfoSchema>;
export type OpeningHoursFormValues = z.infer<typeof openingHoursSchema>;
export type SocialLinksFormValues = z.infer<typeof socialLinksSchema>;
export type SocialLinkFormValues = z.infer<typeof socialLinkSchema>;
