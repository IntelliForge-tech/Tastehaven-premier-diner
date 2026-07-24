import { z } from "zod";

const optionalUrl = z
  .string()
  .max(500)
  .refine((v) => !v || /^https?:\/\/.+/.test(v), "Must be a valid URL starting with http:// or https://")
  .optional()
  .default("");

export const quickLinkSchema = z.object({
  title: z.string().min(1, "Title is required.").max(80, "Title must be 80 characters or fewer."),
  url: z
    .string()
    .min(1, "URL is required.")
    .max(500, "URL must be 500 characters or fewer.")
    .refine(
      (v) => v.startsWith("#") || v.startsWith("/") || /^https?:\/\/.+/.test(v),
      "Must be a valid URL, internal route (e.g. /about), or anchor (e.g. #menu).",
    ),
  displayOrder: z.number().int().min(0).default(0),
  openNewTab: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
});

export type QuickLinkFormValues = z.infer<typeof quickLinkSchema>;

export const footerSettingsSchema = z.object({
  // Branding
  restaurantName: z
    .string()
    .min(1, "Restaurant name is required.")
    .max(100, "Restaurant name must be 100 characters or fewer."),
  tagline: z.string().max(200).default(""),
  shortDescription: z.string().max(500, "Description must be 500 characters or fewer.").default(""),
  copyrightText: z.string().min(1, "Copyright text is required.").max(200),
  copyrightYearAuto: z.boolean().default(true),
  copyrightYearManual: z.string().max(4).default(""),
  designedByText: z.string().max(200).default(""),
  designedByUrl: optionalUrl,

  // Visibility toggles
  showLogo: z.boolean().default(true),
  showDescription: z.boolean().default(true),
  showQuickLinks: z.boolean().default(true),
  showBusinessInfo: z.boolean().default(true),
  showNewsletter: z.boolean().default(true),
  showSocialIcons: z.boolean().default(true),
  showLegal: z.boolean().default(false),
  showCopyright: z.boolean().default(true),
  footerEnabled: z.boolean().default(true),

  // Newsletter
  newsletterEnabled: z.boolean().default(true),
  newsletterTitle: z.string().max(100).default(""),
  newsletterSubtitle: z.string().max(300).default(""),
  newsletterPlaceholder: z.string().max(100).default(""),
  newsletterButtonText: z.string().max(50).default(""),
  newsletterSuccessMsg: z.string().max(300).default(""),
  newsletterErrorMsg: z.string().max(300).default(""),
  newsletterConsentText: z.string().max(300).default(""),

  // Social
  socialIconSize: z.enum(["sm", "md", "lg"]).default("md"),
  socialIconShape: z.enum(["circle", "rounded", "square"]).default("circle"),
  socialIconStyle: z.enum(["outline", "filled", "ghost"]).default("outline"),
  socialIconAlignment: z.enum(["left", "center", "right"]).default("left"),
  socialMaxIcons: z.number().int().min(1).max(10).default(4),

  // Legal
  privacyPolicyUrl: optionalUrl,
  termsUrl: optionalUrl,
  cookiesUrl: optionalUrl,
  refundUrl: optionalUrl,
  accessibilityStatement: z.string().max(300).default(""),
  disclaimer: z.string().max(500).default(""),
  licenseText: z.string().max(300).default(""),

  // Appearance
  footerLayout: z.enum(["classic", "modern", "minimal"]).default("classic"),
  backgroundColor: z.string().max(30).default(""),
  textColor: z.string().max(30).default(""),
  accentColor: z.string().max(30).default(""),
  borderStyle: z.enum(["solid", "dashed", "none"]).default("solid"),
  showTopBorder: z.boolean().default(true),
  showDivider: z.boolean().default(true),
  containerWidth: z.enum(["xl", "2xl", "4xl", "6xl", "7xl", "full"]).default("7xl"),
});

export type FooterSettingsFormValues = z.infer<typeof footerSettingsSchema>;
