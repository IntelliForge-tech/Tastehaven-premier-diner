import { z } from "zod";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/svg+xml"];

const optionalUrl = z
  .string()
  .max(500)
  .refine((v) => !v || isValidUrl(v), "Enter a valid URL.")
  .default("");

const optionalString = (max: number) =>
  z.string().max(max).default("");

const fileField = z
  .instanceof(File)
  .nullable()
  .optional()
  .refine((f) => !f || f.size <= MAX_IMAGE_BYTES, "File must be 5 MB or smaller.")
  .refine((f) => !f || ACCEPTED_TYPES.includes(f.type), "File must be an image.");

function isValidUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

export const siteSettingsSchema = z.object({
  // General
  websiteName: z.string().min(1, "Website name is required.").max(100),
  websiteTagline: optionalString(200),
  websiteDescription: optionalString(500),
  websiteUrl: optionalUrl,
  defaultLanguage: optionalString(10),
  timezone: optionalString(60),
  businessCurrency: optionalString(10),
  themeColor: optionalString(20),
  primaryBrandColor: optionalString(20),
  secondaryBrandColor: optionalString(20),
  accentColor: optionalString(20),

  // SEO
  metaTitle: z.string().min(1, "Meta title is required.").max(60, "Meta title must be 60 characters or fewer."),
  metaDescription: z.string().min(1, "Meta description is required.").max(160, "Meta description must be 160 characters or fewer."),
  metaKeywords: optionalString(300),
  canonicalUrl: optionalUrl,
  author: optionalString(100),
  publisher: optionalString(100),
  robotsMeta: optionalString(60),
  googleVerification: optionalString(200),
  bingVerification: optionalString(200),
  yandexVerification: optionalString(200),
  facebookAppId: optionalString(60),
  twitterUsername: optionalString(60),
  ogTitle: optionalString(100),
  ogDescription: optionalString(300),
  ogImageUrl: optionalUrl,
  twitterCardType: optionalString(40),
  ogSiteName: optionalString(100),
  ogType: optionalString(40),
  ogLocale: optionalString(20),

  // Favicon & Branding
  faviconUrl: optionalUrl,
  appleTouchIconUrl: optionalUrl,
  browserThemeColor: optionalString(20),
  backgroundColor: optionalString(20),

  // Analytics
  googleAnalyticsId: optionalString(30),
  googleAnalyticsEnabled: z.boolean().default(false),
  googleTagManagerId: optionalString(30),
  googleTagManagerEnabled: z.boolean().default(false),
  metaPixelId: optionalString(30),
  metaPixelEnabled: z.boolean().default(false),
  microsoftClarityId: optionalString(30),
  microsoftClarityEnabled: z.boolean().default(false),
  hotjarId: optionalString(30),
  hotjarEnabled: z.boolean().default(false),
  customHeaderScript: optionalString(5000),
  customBodyScript: optionalString(5000),
  customFooterScript: optionalString(5000),

  // Search Engine
  allowIndexing: z.boolean().default(true),
  generateRobotsTxt: z.boolean().default(true),
  generateSitemap: z.boolean().default(true),
  enableStructuredData: z.boolean().default(true),
  enableLocalBusinessSchema: z.boolean().default(true),
  enableFaqSchema: z.boolean().default(true),
  enableOrganizationSchema: z.boolean().default(true),

  // PWA
  enablePwa: z.boolean().default(false),
  pwaAppName: optionalString(100),
  pwaShortName: optionalString(40),
  pwaThemeColor: optionalString(20),
  pwaBackgroundColor: optionalString(20),
  pwaStartUrl: optionalString(100),
  pwaDisplayMode: optionalString(20),
  pwaOfflineSupport: z.boolean().default(false),

  // Global feature toggles
  enableAnimations: z.boolean().default(true),
  enableScrollToTop: z.boolean().default(true),
  enableCookieBanner: z.boolean().default(false),
  enableNewsletter: z.boolean().default(true),
  enableReservationSystem: z.boolean().default(true),
  enableContactForm: z.boolean().default(true),
  enableGallery: z.boolean().default(true),
  enableTestimonials: z.boolean().default(true),
  enableChefSection: z.boolean().default(true),
  enableOffers: z.boolean().default(true),

  // Maintenance
  maintenanceMode: z.boolean().default(false),
  maintenanceTitle: optionalString(200),
  maintenanceMessage: optionalString(1000),
  maintenanceImageUrl: optionalUrl,
  maintenanceExpectedReturn: optionalString(100),
  allowSearchEnginesDuringMaintenance: z.boolean().default(true),

  // Asset file inputs (not stored in DB — resolved to URLs before save)
  faviconFile: fileField,
  faviconCleared: z.boolean().default(false),
  appleTouchIconFile: fileField,
  appleTouchIconCleared: z.boolean().default(false),
  ogImageFile: fileField,
  ogImageCleared: z.boolean().default(false),
  maintenanceImageFile: fileField,
  maintenanceImageCleared: z.boolean().default(false),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;
export type SiteSettingsFormInput = z.input<typeof siteSettingsSchema>;
