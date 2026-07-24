import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Footer service — Phase 12D.
 *
 * Manages the footer_settings singleton row and the quick_links CRUD table.
 * Social links are read directly from the social_links table (no duplication).
 * Follows the exact same pattern as hero/about/restaurant-information services.
 */

// ── Error types ───────────────────────────────────────────────────────────────

export type FooterServiceErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface FooterServiceError {
  code: FooterServiceErrorCode;
  message: string;
}

// ── Footer Settings ───────────────────────────────────────────────────────────

export interface FooterSettings {
  id: string;
  restaurantName: string | null;
  tagline: string | null;
  shortDescription: string | null;
  copyrightText: string | null;
  copyrightYearAuto: boolean;
  copyrightYearManual: string | null;
  designedByText: string | null;
  designedByUrl: string | null;
  showLogo: boolean;
  showDescription: boolean;
  showQuickLinks: boolean;
  showBusinessInfo: boolean;
  showNewsletter: boolean;
  showSocialIcons: boolean;
  showLegal: boolean;
  showCopyright: boolean;
  newsletterEnabled: boolean;
  newsletterTitle: string | null;
  newsletterSubtitle: string | null;
  newsletterPlaceholder: string | null;
  newsletterButtonText: string | null;
  newsletterSuccessMsg: string | null;
  newsletterErrorMsg: string | null;
  newsletterConsentText: string | null;
  socialIconSize: string;
  socialIconShape: string;
  socialIconStyle: string;
  socialIconAlignment: string;
  socialMaxIcons: number;
  privacyPolicyUrl: string | null;
  termsUrl: string | null;
  cookiesUrl: string | null;
  refundUrl: string | null;
  accessibilityStatement: string | null;
  disclaimer: string | null;
  licenseText: string | null;
  footerLayout: string;
  backgroundColor: string | null;
  textColor: string | null;
  accentColor: string | null;
  borderStyle: string;
  showTopBorder: boolean;
  showDivider: boolean;
  containerWidth: string;
  footerEnabled: boolean;
  updatedAt: string;
}

export type GetFooterSettingsResult =
  | { success: true; data: FooterSettings }
  | { success: false; error: FooterServiceError };

export async function getFooterSettings(): Promise<GetFooterSettingsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("footer_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, error: mapPostgrestError(error, "load") };
    if (!data) return { success: false, error: { code: "not_found", message: "No footer settings found." } };

    return { success: true, data: mapSettingsRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export type UpdateFooterSettingsInput = Omit<FooterSettings, "id" | "updatedAt">;

export type UpdateFooterSettingsResult =
  | { success: true }
  | { success: false; error: FooterServiceError };

export async function updateFooterSettings(
  input: UpdateFooterSettingsInput,
): Promise<UpdateFooterSettingsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("footer_settings").upsert(
      {
        id: FOOTER_SINGLETON_ID,
        restaurant_name: input.restaurantName,
        tagline: input.tagline,
        short_description: input.shortDescription,
        copyright_text: input.copyrightText,
        copyright_year_auto: input.copyrightYearAuto,
        copyright_year_manual: input.copyrightYearManual,
        designed_by_text: input.designedByText,
        designed_by_url: input.designedByUrl,
        show_logo: input.showLogo,
        show_description: input.showDescription,
        show_quick_links: input.showQuickLinks,
        show_business_info: input.showBusinessInfo,
        show_newsletter: input.showNewsletter,
        show_social_icons: input.showSocialIcons,
        show_legal: input.showLegal,
        show_copyright: input.showCopyright,
        newsletter_enabled: input.newsletterEnabled,
        newsletter_title: input.newsletterTitle,
        newsletter_subtitle: input.newsletterSubtitle,
        newsletter_placeholder: input.newsletterPlaceholder,
        newsletter_button_text: input.newsletterButtonText,
        newsletter_success_msg: input.newsletterSuccessMsg,
        newsletter_error_msg: input.newsletterErrorMsg,
        newsletter_consent_text: input.newsletterConsentText,
        social_icon_size: input.socialIconSize,
        social_icon_shape: input.socialIconShape,
        social_icon_style: input.socialIconStyle,
        social_icon_alignment: input.socialIconAlignment,
        social_max_icons: input.socialMaxIcons,
        privacy_policy_url: input.privacyPolicyUrl,
        terms_url: input.termsUrl,
        cookies_url: input.cookiesUrl,
        refund_url: input.refundUrl,
        accessibility_statement: input.accessibilityStatement,
        disclaimer: input.disclaimer,
        license_text: input.licenseText,
        footer_layout: input.footerLayout,
        background_color: input.backgroundColor,
        text_color: input.textColor,
        accent_color: input.accentColor,
        border_style: input.borderStyle,
        show_top_border: input.showTopBorder,
        show_divider: input.showDivider,
        container_width: input.containerWidth,
        footer_enabled: input.footerEnabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) return { success: false, error: mapPostgrestError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

// ── Quick Links ───────────────────────────────────────────────────────────────

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  displayOrder: number;
  openNewTab: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GetQuickLinksResult =
  | { success: true; data: QuickLink[] }
  | { success: false; error: FooterServiceError };

export async function getQuickLinks(): Promise<GetQuickLinksResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("quick_links")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) return { success: false, error: mapPostgrestError(error, "load") };
    return { success: true, data: (data ?? []).map(mapLinkRow) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export interface CreateQuickLinkInput {
  title: string;
  url: string;
  displayOrder: number;
  openNewTab: boolean;
  isEnabled: boolean;
}

export type CreateQuickLinkResult =
  | { success: true; data: QuickLink }
  | { success: false; error: FooterServiceError };

export async function createQuickLink(
  input: CreateQuickLinkInput,
): Promise<CreateQuickLinkResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("quick_links")
      .insert({
        title: input.title,
        url: input.url,
        display_order: input.displayOrder,
        open_new_tab: input.openNewTab,
        is_enabled: input.isEnabled,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { success: false, error: mapPostgrestError(error, "save") };
    return { success: true, data: mapLinkRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

export interface UpdateQuickLinkInput extends CreateQuickLinkInput {
  id: string;
}

export type UpdateQuickLinkResult =
  | { success: true }
  | { success: false; error: FooterServiceError };

export async function updateQuickLink(
  input: UpdateQuickLinkInput,
): Promise<UpdateQuickLinkResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("quick_links")
      .update({
        title: input.title,
        url: input.url,
        display_order: input.displayOrder,
        open_new_tab: input.openNewTab,
        is_enabled: input.isEnabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id);

    if (error) return { success: false, error: mapPostgrestError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

export type DeleteQuickLinkResult =
  | { success: true }
  | { success: false; error: FooterServiceError };

export async function deleteQuickLink(id: string): Promise<DeleteQuickLinkResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("quick_links").delete().eq("id", id);

    if (error) return { success: false, error: mapPostgrestError(error, "delete") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "delete") };
  }
}

/** Batch-updates display_order for a list of link ids. */
export type ReorderQuickLinksResult =
  | { success: true }
  | { success: false; error: FooterServiceError };

export async function reorderQuickLinks(
  orderedIds: string[],
): Promise<ReorderQuickLinksResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const now = new Date().toISOString();

    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index + 1,
      updated_at: now,
      // required non-null columns for upsert
      title: "",  // will be patched below
      url: "",
      open_new_tab: false,
      is_enabled: true,
    }));

    // Use individual updates so we don't clobber other columns
    const results = await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from("quick_links")
          .update({ display_order: index + 1, updated_at: now })
          .eq("id", id),
      ),
    );

    const firstError = results.find((r) => r.error)?.error;
    if (firstError) return { success: false, error: mapPostgrestError(firstError, "save") };

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

export const FOOTER_SINGLETON_ID = "00000000-0000-0000-0000-000000000004";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSettingsRow(row: any): FooterSettings {
  return {
    id: row.id,
    restaurantName: row.restaurant_name,
    tagline: row.tagline,
    shortDescription: row.short_description,
    copyrightText: row.copyright_text,
    copyrightYearAuto: row.copyright_year_auto ?? true,
    copyrightYearManual: row.copyright_year_manual,
    designedByText: row.designed_by_text,
    designedByUrl: row.designed_by_url,
    showLogo: row.show_logo ?? true,
    showDescription: row.show_description ?? true,
    showQuickLinks: row.show_quick_links ?? true,
    showBusinessInfo: row.show_business_info ?? true,
    showNewsletter: row.show_newsletter ?? true,
    showSocialIcons: row.show_social_icons ?? true,
    showLegal: row.show_legal ?? false,
    showCopyright: row.show_copyright ?? true,
    newsletterEnabled: row.newsletter_enabled ?? true,
    newsletterTitle: row.newsletter_title,
    newsletterSubtitle: row.newsletter_subtitle,
    newsletterPlaceholder: row.newsletter_placeholder,
    newsletterButtonText: row.newsletter_button_text,
    newsletterSuccessMsg: row.newsletter_success_msg,
    newsletterErrorMsg: row.newsletter_error_msg,
    newsletterConsentText: row.newsletter_consent_text,
    socialIconSize: row.social_icon_size ?? "md",
    socialIconShape: row.social_icon_shape ?? "circle",
    socialIconStyle: row.social_icon_style ?? "outline",
    socialIconAlignment: row.social_icon_alignment ?? "left",
    socialMaxIcons: row.social_max_icons ?? 4,
    privacyPolicyUrl: row.privacy_policy_url,
    termsUrl: row.terms_url,
    cookiesUrl: row.cookies_url,
    refundUrl: row.refund_url,
    accessibilityStatement: row.accessibility_statement,
    disclaimer: row.disclaimer,
    licenseText: row.license_text,
    footerLayout: row.footer_layout ?? "classic",
    backgroundColor: row.background_color,
    textColor: row.text_color,
    accentColor: row.accent_color,
    borderStyle: row.border_style ?? "solid",
    showTopBorder: row.show_top_border ?? true,
    showDivider: row.show_divider ?? true,
    containerWidth: row.container_width ?? "7xl",
    footerEnabled: row.footer_enabled ?? true,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLinkRow(row: any): QuickLink {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    displayOrder: row.display_order,
    openNewTab: row.open_new_tab,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete" = "load",
): FooterServiceError {
  console.error(`[footer.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save footer settings. Please try again."
        : context === "delete"
          ? "We couldn't delete that link. Please try again."
          : "We couldn't load footer settings. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "delete" = "load",
): FooterServiceError {
  if (err instanceof TypeError) {
    return { code: "network_error", message: "Check your internet connection and try again." };
  }
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "Something went wrong saving footer settings."
        : context === "delete"
          ? "Something went wrong deleting that link."
          : "Something went wrong loading footer settings.",
  };
}

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  id: FOOTER_SINGLETON_ID,
  restaurantName: "Taste Haven",
  tagline: "Fresh ingredients, memorable experiences.",
  shortDescription: "Fresh ingredients, memorable experiences — since 2012.",
  copyrightText: "All rights reserved.",
  copyrightYearAuto: true,
  copyrightYearManual: null,
  designedByText: "Crafted with care in the Downtown District.",
  designedByUrl: null,
  showLogo: true,
  showDescription: true,
  showQuickLinks: true,
  showBusinessInfo: true,
  showNewsletter: true,
  showSocialIcons: true,
  showLegal: false,
  showCopyright: true,
  newsletterEnabled: true,
  newsletterTitle: "Newsletter",
  newsletterSubtitle: "Seasonal menus and private events, once a month.",
  newsletterPlaceholder: "you@email.com",
  newsletterButtonText: "Join",
  newsletterSuccessMsg: "Subscribed! Welcome to Taste Haven.",
  newsletterErrorMsg: "Something went wrong. Please try again.",
  newsletterConsentText: null,
  socialIconSize: "md",
  socialIconShape: "circle",
  socialIconStyle: "outline",
  socialIconAlignment: "left",
  socialMaxIcons: 4,
  privacyPolicyUrl: null,
  termsUrl: null,
  cookiesUrl: null,
  refundUrl: null,
  accessibilityStatement: null,
  disclaimer: null,
  licenseText: null,
  footerLayout: "classic",
  backgroundColor: null,
  textColor: null,
  accentColor: null,
  borderStyle: "solid",
  showTopBorder: true,
  showDivider: true,
  containerWidth: "7xl",
  footerEnabled: true,
  updatedAt: "",
};

export const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { id: "1", title: "Menu",    url: "#menu",    displayOrder: 1, openNewTab: false, isEnabled: true, createdAt: "", updatedAt: "" },
  { id: "2", title: "About",   url: "#about",   displayOrder: 2, openNewTab: false, isEnabled: true, createdAt: "", updatedAt: "" },
  { id: "3", title: "Gallery", url: "#gallery", displayOrder: 3, openNewTab: false, isEnabled: true, createdAt: "", updatedAt: "" },
  { id: "4", title: "Reserve", url: "#reserve", displayOrder: 4, openNewTab: false, isEnabled: true, createdAt: "", updatedAt: "" },
  { id: "5", title: "Contact", url: "#contact", displayOrder: 5, openNewTab: false, isEnabled: true, createdAt: "", updatedAt: "" },
];
