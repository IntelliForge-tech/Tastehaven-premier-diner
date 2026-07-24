import { v4 as uuidv4 } from "uuid";
import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Site Settings service — Phase 12C.
 *
 * Manages the site_settings singleton row. Follows the exact same
 * pattern as hero.service.ts and about.service.ts: one fixed UUID,
 * upsert on every save, UI-safe result types, no direct Supabase
 * access outside this file.
 */

export type SiteSettingsErrorCode =
  | "network_error"
  | "upload_error"
  | "not_found"
  | "unexpected_error";

export interface SiteSettingsError {
  code: SiteSettingsErrorCode;
  message: string;
}

// ── Analytics integration ────────────────────────────────────────────────────

export interface AnalyticsIntegration {
  id: string;
  enabled: boolean;
}

// ── Main content type ────────────────────────────────────────────────────────

export interface SiteSettings {
  id: string;

  // General
  websiteName: string;
  websiteTagline: string | null;
  websiteDescription: string | null;
  websiteUrl: string | null;
  defaultLanguage: string;
  timezone: string;
  businessCurrency: string;
  themeColor: string | null;
  primaryBrandColor: string | null;
  secondaryBrandColor: string | null;
  accentColor: string | null;

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  author: string | null;
  publisher: string | null;
  robotsMeta: string;
  googleVerification: string | null;
  bingVerification: string | null;
  yandexVerification: string | null;
  facebookAppId: string | null;
  twitterUsername: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterCardType: string;
  ogSiteName: string | null;
  ogType: string;
  ogLocale: string;

  // Favicon & Branding
  faviconUrl: string | null;
  appleTouchIconUrl: string | null;
  browserThemeColor: string | null;
  backgroundColor: string | null;

  // Analytics
  googleAnalyticsId: string | null;
  googleAnalyticsEnabled: boolean;
  googleTagManagerId: string | null;
  googleTagManagerEnabled: boolean;
  metaPixelId: string | null;
  metaPixelEnabled: boolean;
  microsoftClarityId: string | null;
  microsoftClarityEnabled: boolean;
  hotjarId: string | null;
  hotjarEnabled: boolean;
  customHeaderScript: string | null;
  customBodyScript: string | null;
  customFooterScript: string | null;

  // Search Engine
  allowIndexing: boolean;
  generateRobotsTxt: boolean;
  generateSitemap: boolean;
  enableStructuredData: boolean;
  enableLocalBusinessSchema: boolean;
  enableFaqSchema: boolean;
  enableOrganizationSchema: boolean;

  // PWA
  enablePwa: boolean;
  pwaAppName: string | null;
  pwaShortName: string | null;
  pwaThemeColor: string | null;
  pwaBackgroundColor: string | null;
  pwaStartUrl: string;
  pwaDisplayMode: string;
  pwaOfflineSupport: boolean;

  // Global feature toggles
  enableAnimations: boolean;
  enableScrollToTop: boolean;
  enableCookieBanner: boolean;
  enableNewsletter: boolean;
  enableReservationSystem: boolean;
  enableContactForm: boolean;
  enableGallery: boolean;
  enableTestimonials: boolean;
  enableChefSection: boolean;
  enableOffers: boolean;

  // Maintenance
  maintenanceMode: boolean;
  maintenanceTitle: string | null;
  maintenanceMessage: string | null;
  maintenanceImageUrl: string | null;
  maintenanceExpectedReturn: string | null;
  allowSearchEnginesDuringMaintenance: boolean;

  updatedAt: string;
}

export type GetSiteSettingsResult =
  | { success: true; data: SiteSettings }
  | { success: false; error: SiteSettingsError };

export async function getSiteSettings(): Promise<GetSiteSettingsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    if (!data) {
      return {
        success: false,
        error: { code: "not_found", message: "No site settings found." },
      };
    }

    return { success: true, data: mapRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

export type UpdateSiteSettingsInput = Omit<SiteSettings, "id" | "updatedAt">;

export type UpdateSiteSettingsResult =
  | { success: true }
  | { success: false; error: SiteSettingsError };

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput,
): Promise<UpdateSiteSettingsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("site_settings").upsert(
      {
        id: SITE_SETTINGS_SINGLETON_ID,

        website_name: input.websiteName,
        website_tagline: input.websiteTagline,
        website_description: input.websiteDescription,
        website_url: input.websiteUrl,
        default_language: input.defaultLanguage,
        timezone: input.timezone,
        business_currency: input.businessCurrency,
        theme_color: input.themeColor,
        primary_brand_color: input.primaryBrandColor,
        secondary_brand_color: input.secondaryBrandColor,
        accent_color: input.accentColor,

        meta_title: input.metaTitle,
        meta_description: input.metaDescription,
        meta_keywords: input.metaKeywords,
        canonical_url: input.canonicalUrl,
        author: input.author,
        publisher: input.publisher,
        robots_meta: input.robotsMeta,
        google_verification: input.googleVerification,
        bing_verification: input.bingVerification,
        yandex_verification: input.yandexVerification,
        facebook_app_id: input.facebookAppId,
        twitter_username: input.twitterUsername,
        og_title: input.ogTitle,
        og_description: input.ogDescription,
        og_image_url: input.ogImageUrl,
        twitter_card_type: input.twitterCardType,
        og_site_name: input.ogSiteName,
        og_type: input.ogType,
        og_locale: input.ogLocale,

        favicon_url: input.faviconUrl,
        apple_touch_icon_url: input.appleTouchIconUrl,
        browser_theme_color: input.browserThemeColor,
        background_color: input.backgroundColor,

        google_analytics_id: input.googleAnalyticsId,
        google_analytics_enabled: input.googleAnalyticsEnabled,
        google_tag_manager_id: input.googleTagManagerId,
        google_tag_manager_enabled: input.googleTagManagerEnabled,
        meta_pixel_id: input.metaPixelId,
        meta_pixel_enabled: input.metaPixelEnabled,
        microsoft_clarity_id: input.microsoftClarityId,
        microsoft_clarity_enabled: input.microsoftClarityEnabled,
        hotjar_id: input.hotjarId,
        hotjar_enabled: input.hotjarEnabled,
        custom_header_script: input.customHeaderScript,
        custom_body_script: input.customBodyScript,
        custom_footer_script: input.customFooterScript,

        allow_indexing: input.allowIndexing,
        generate_robots_txt: input.generateRobotsTxt,
        generate_sitemap: input.generateSitemap,
        enable_structured_data: input.enableStructuredData,
        enable_local_business_schema: input.enableLocalBusinessSchema,
        enable_faq_schema: input.enableFaqSchema,
        enable_organization_schema: input.enableOrganizationSchema,

        enable_pwa: input.enablePwa,
        pwa_app_name: input.pwaAppName,
        pwa_short_name: input.pwaShortName,
        pwa_theme_color: input.pwaThemeColor,
        pwa_background_color: input.pwaBackgroundColor,
        pwa_start_url: input.pwaStartUrl,
        pwa_display_mode: input.pwaDisplayMode,
        pwa_offline_support: input.pwaOfflineSupport,

        enable_animations: input.enableAnimations,
        enable_scroll_to_top: input.enableScrollToTop,
        enable_cookie_banner: input.enableCookieBanner,
        enable_newsletter: input.enableNewsletter,
        enable_reservation_system: input.enableReservationSystem,
        enable_contact_form: input.enableContactForm,
        enable_gallery: input.enableGallery,
        enable_testimonials: input.enableTestimonials,
        enable_chef_section: input.enableChefSection,
        enable_offers: input.enableOffers,

        maintenance_mode: input.maintenanceMode,
        maintenance_title: input.maintenanceTitle,
        maintenance_message: input.maintenanceMessage,
        maintenance_image_url: input.maintenanceImageUrl,
        maintenance_expected_return: input.maintenanceExpectedReturn,
        allow_search_engines_during_maintenance:
          input.allowSearchEnginesDuringMaintenance,

        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      return { success: false, error: mapPostgrestError(error, "save") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

// ── Asset upload/delete ──────────────────────────────────────────────────────

const SITE_BUCKET = "restaurant-media";
const SITE_ASSET_FOLDER = "site";

export type UploadSiteAssetResult =
  | { success: true; data: { publicUrl: string } }
  | { success: false; error: SiteSettingsError };

export async function uploadSiteAsset(file: File): Promise<UploadSiteAssetResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const path = `${SITE_ASSET_FOLDER}/${uuidv4()}-${slugify(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(SITE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("[site-settings.service] upload failed:", uploadError.message);
      return {
        success: false,
        error: {
          code: "upload_error",
          message: "We couldn't upload that file. Please try again.",
        },
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(SITE_BUCKET).getPublicUrl(path);

    return { success: true, data: { publicUrl } };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "upload") };
  }
}

export type DeleteSiteAssetResult =
  | { success: true }
  | { success: false; error: SiteSettingsError };

export async function deleteSiteAsset(publicUrl: string): Promise<DeleteSiteAssetResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const marker = `/storage/v1/object/public/${SITE_BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return { success: true };
    const path = publicUrl.slice(idx + marker.length);

    const { error } = await supabase.storage.from(SITE_BUCKET).remove([path]);
    if (error) {
      console.error("[site-settings.service] delete failed:", error.message);
      return {
        success: false,
        error: { code: "unexpected_error", message: "We couldn't remove the old file." },
      };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "delete") };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

const SITE_SETTINGS_SINGLETON_ID = "00000000-0000-0000-0000-000000000003";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): SiteSettings {
  return {
    id: row.id,

    websiteName: row.website_name ?? "Taste Haven",
    websiteTagline: row.website_tagline,
    websiteDescription: row.website_description,
    websiteUrl: row.website_url,
    defaultLanguage: row.default_language ?? "en",
    timezone: row.timezone ?? "America/Los_Angeles",
    businessCurrency: row.business_currency ?? "USD",
    themeColor: row.theme_color,
    primaryBrandColor: row.primary_brand_color,
    secondaryBrandColor: row.secondary_brand_color,
    accentColor: row.accent_color,

    metaTitle: row.meta_title ?? "Taste Haven",
    metaDescription: row.meta_description ?? "Fresh ingredients, memorable experiences.",
    metaKeywords: row.meta_keywords,
    canonicalUrl: row.canonical_url,
    author: row.author,
    publisher: row.publisher,
    robotsMeta: row.robots_meta ?? "index, follow",
    googleVerification: row.google_verification,
    bingVerification: row.bing_verification,
    yandexVerification: row.yandex_verification,
    facebookAppId: row.facebook_app_id,
    twitterUsername: row.twitter_username,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImageUrl: row.og_image_url,
    twitterCardType: row.twitter_card_type ?? "summary_large_image",
    ogSiteName: row.og_site_name,
    ogType: row.og_type ?? "website",
    ogLocale: row.og_locale ?? "en_US",

    faviconUrl: row.favicon_url,
    appleTouchIconUrl: row.apple_touch_icon_url,
    browserThemeColor: row.browser_theme_color,
    backgroundColor: row.background_color,

    googleAnalyticsId: row.google_analytics_id,
    googleAnalyticsEnabled: row.google_analytics_enabled ?? false,
    googleTagManagerId: row.google_tag_manager_id,
    googleTagManagerEnabled: row.google_tag_manager_enabled ?? false,
    metaPixelId: row.meta_pixel_id,
    metaPixelEnabled: row.meta_pixel_enabled ?? false,
    microsoftClarityId: row.microsoft_clarity_id,
    microsoftClarityEnabled: row.microsoft_clarity_enabled ?? false,
    hotjarId: row.hotjar_id,
    hotjarEnabled: row.hotjar_enabled ?? false,
    customHeaderScript: row.custom_header_script,
    customBodyScript: row.custom_body_script,
    customFooterScript: row.custom_footer_script,

    allowIndexing: row.allow_indexing ?? true,
    generateRobotsTxt: row.generate_robots_txt ?? true,
    generateSitemap: row.generate_sitemap ?? true,
    enableStructuredData: row.enable_structured_data ?? true,
    enableLocalBusinessSchema: row.enable_local_business_schema ?? true,
    enableFaqSchema: row.enable_faq_schema ?? true,
    enableOrganizationSchema: row.enable_organization_schema ?? true,

    enablePwa: row.enable_pwa ?? false,
    pwaAppName: row.pwa_app_name,
    pwaShortName: row.pwa_short_name,
    pwaThemeColor: row.pwa_theme_color,
    pwaBackgroundColor: row.pwa_background_color,
    pwaStartUrl: row.pwa_start_url ?? "/",
    pwaDisplayMode: row.pwa_display_mode ?? "standalone",
    pwaOfflineSupport: row.pwa_offline_support ?? false,

    enableAnimations: row.enable_animations ?? true,
    enableScrollToTop: row.enable_scroll_to_top ?? true,
    enableCookieBanner: row.enable_cookie_banner ?? false,
    enableNewsletter: row.enable_newsletter ?? true,
    enableReservationSystem: row.enable_reservation_system ?? true,
    enableContactForm: row.enable_contact_form ?? true,
    enableGallery: row.enable_gallery ?? true,
    enableTestimonials: row.enable_testimonials ?? true,
    enableChefSection: row.enable_chef_section ?? true,
    enableOffers: row.enable_offers ?? true,

    maintenanceMode: row.maintenance_mode ?? false,
    maintenanceTitle: row.maintenance_title,
    maintenanceMessage: row.maintenance_message,
    maintenanceImageUrl: row.maintenance_image_url,
    maintenanceExpectedReturn: row.maintenance_expected_return,
    allowSearchEnginesDuringMaintenance:
      row.allow_search_engines_during_maintenance ?? true,

    updatedAt: row.updated_at,
  };
}

function slugify(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-");
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete",
): SiteSettingsError {
  console.error(`[site-settings.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save the site settings. Please try again."
        : "We couldn't load site settings right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "delete" | "upload",
): SiteSettingsError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "Something went wrong saving site settings. Please try again."
        : context === "upload"
          ? "Something went wrong uploading that file. Please try again."
          : "Something went wrong loading site settings. Please try again.",
  };
}

export { SITE_SETTINGS_SINGLETON_ID };
