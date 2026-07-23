import { z } from "zod";

/**
 * Client-side validation for the Restaurant Information form (Phase 12C).
 * Mirrors the extended restaurant_info table schema exactly.
 */

const optionalUrl = z
  .string()
  .max(500, "URL must be 500 characters or fewer.")
  .refine(
    (val) => !val || /^https?:\/\/.+/.test(val),
    "Must be a valid URL starting with http:// or https://",
  )
  .optional()
  .default("");

const openingHourSchema = z
  .object({
    id: z.string(),
    dayOfWeek: z.number().min(0).max(6),
    openTime: z.string().default(""),
    closeTime: z.string().default(""),
    isClosed: z.boolean().default(false),
  })
  .refine(
    (h) => h.isClosed || (h.openTime.length > 0),
    { message: "Open time is required when not closed.", path: ["openTime"] },
  )
  .refine(
    (h) => h.isClosed || (h.closeTime.length > 0),
    { message: "Close time is required when not closed.", path: ["closeTime"] },
  );

export const restaurantInformationSchema = z.object({
  // Basic info
  name: z
    .string()
    .min(1, "Restaurant name is required.")
    .max(100, "Restaurant name must be 100 characters or fewer."),
  tagline: z.string().max(200, "Tagline must be 200 characters or fewer.").default(""),
  description: z.string().max(1000, "Description must be 1000 characters or fewer.").default(""),
  shortDescription: z
    .string()
    .max(300, "Short description must be 300 characters or fewer.")
    .default(""),

  // Address
  streetAddress: z.string().max(200, "Street address must be 200 characters or fewer.").default(""),
  city: z.string().max(100, "City must be 100 characters or fewer.").default(""),
  state: z.string().max(100, "State must be 100 characters or fewer.").default(""),
  country: z.string().max(100, "Country must be 100 characters or fewer.").default(""),
  postalCode: z.string().max(20, "Postal code must be 20 characters or fewer.").default(""),
  googleMapsUrl: optionalUrl,

  // Contact
  primaryPhone: z
    .string()
    .min(1, "Primary phone is required.")
    .max(30, "Phone must be 30 characters or fewer."),
  secondaryPhone: z.string().max(30, "Phone must be 30 characters or fewer.").default(""),
  primaryEmail: z
    .string()
    .min(1, "Primary email is required.")
    .email("Must be a valid email address.")
    .max(120, "Email must be 120 characters or fewer."),
  secondaryEmail: z
    .string()
    .max(120, "Email must be 120 characters or fewer.")
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Must be a valid email address.")
    .default(""),
  whatsappNumber: z.string().max(30, "WhatsApp number must be 30 characters or fewer.").default(""),
  reservationPhone: z.string().max(30, "Phone must be 30 characters or fewer.").default(""),
  reservationEmail: z
    .string()
    .max(120, "Email must be 120 characters or fewer.")
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Must be a valid email address.")
    .default(""),
  websiteUrl: optionalUrl,

  // Business info
  priceRange: z.string().max(10, "Price range must be 10 characters or fewer.").default(""),
  cuisineType: z.string().max(100, "Cuisine type must be 100 characters or fewer.").default(""),
  establishedYear: z
    .string()
    .max(4, "Year must be 4 characters or fewer.")
    .default(""),

  // Extra info
  holidayNotice: z.string().max(500, "Holiday notice must be 500 characters or fewer.").default(""),
  specialAnnouncement: z
    .string()
    .max(500, "Announcement must be 500 characters or fewer.")
    .default(""),
  reservationMessage: z
    .string()
    .max(500, "Reservation message must be 500 characters or fewer.")
    .default(""),

  // Amenities
  deliveryAvailable: z.boolean().default(false),
  takeawayAvailable: z.boolean().default(false),
  outdoorSeating: z.boolean().default(false),
  privateDining: z.boolean().default(false),
  parkingAvailable: z.boolean().default(false),
  wheelchairAccessible: z.boolean().default(false),
  petFriendly: z.boolean().default(false),

  // Opening hours
  hours: z.array(openingHourSchema).length(7, "All 7 days must be provided."),
});

export type RestaurantInformationFormValues = z.infer<typeof restaurantInformationSchema>;
export type RestaurantInformationFormInput = z.input<typeof restaurantInformationSchema>;
