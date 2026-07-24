import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type SocialLinksErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface SocialLinksError {
  code: SocialLinksErrorCode;
  message: string;
}

export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "threads"
  | "snapchat"
  | "telegram"
  | "discord"
  | "tripadvisor"
  | "google_business"
  | "yelp"
  | "zomato"
  | "swiggy"
  | "ubereats"
  | "doordash"
  | "opentable";

export interface SocialLinkItem {
  platform: SocialPlatform;
  label: string;
  url: string;
  enabled: boolean;
  openInNewTab: boolean;
  displayOrder: number;
  icon: string;
  /** Font Awesome brand icon class suffix, e.g. "fa-instagram" */
  faIcon: string;
}

export interface SocialLinksData {
  id: string;
  links: SocialLinkItem[];
  updatedAt: string;
}

export type GetSocialLinksResult =
  | { success: true; data: SocialLinksData }
  | { success: false; error: SocialLinksError };

export async function getSocialLinks(): Promise<GetSocialLinksResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("contact_social_links")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, error: mapPostgrestError(error, "load") };
    if (!data) return { success: false, error: { code: "not_found", message: "No social links found." } };

    return { success: true, data: mapRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export type UpdateSocialLinksInput = {
  links: SocialLinkItem[];
};

export type UpdateSocialLinksResult =
  | { success: true }
  | { success: false; error: SocialLinksError };

const SOCIAL_LINKS_SINGLETON_ID = "00000000-0000-0000-0000-000000000021";

export async function updateSocialLinks(
  input: UpdateSocialLinksInput,
): Promise<UpdateSocialLinksResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("contact_social_links").upsert(
      {
        id: SOCIAL_LINKS_SINGLETON_ID,
        links: input.links as unknown as Record<string, unknown>[],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) return { success: false, error: mapPostgrestError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

// ── Platform metadata ────────────────────────────────────────────────────────

export const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; faIcon: string; icon: string }
> = {
  facebook:       { label: "Facebook",             faIcon: "fa-facebook",       icon: "facebook" },
  instagram:      { label: "Instagram",            faIcon: "fa-instagram",      icon: "instagram" },
  twitter:        { label: "Twitter / X",          faIcon: "fa-x-twitter",      icon: "x-twitter" },
  linkedin:       { label: "LinkedIn",             faIcon: "fa-linkedin",       icon: "linkedin" },
  youtube:        { label: "YouTube",              faIcon: "fa-youtube",        icon: "youtube" },
  tiktok:         { label: "TikTok",              faIcon: "fa-tiktok",         icon: "tiktok" },
  pinterest:      { label: "Pinterest",            faIcon: "fa-pinterest",      icon: "pinterest" },
  threads:        { label: "Threads",              faIcon: "fa-threads",        icon: "threads" },
  snapchat:       { label: "Snapchat",             faIcon: "fa-snapchat",       icon: "snapchat" },
  telegram:       { label: "Telegram",             faIcon: "fa-telegram",       icon: "telegram" },
  discord:        { label: "Discord",              faIcon: "fa-discord",        icon: "discord" },
  tripadvisor:    { label: "TripAdvisor",          faIcon: "fa-tripadvisor",    icon: "tripadvisor" },
  google_business:{ label: "Google Business",      faIcon: "fa-google",         icon: "google" },
  yelp:           { label: "Yelp",                 faIcon: "fa-yelp",           icon: "yelp" },
  zomato:         { label: "Zomato",               faIcon: "fa-utensils",       icon: "utensils" },
  swiggy:         { label: "Swiggy",               faIcon: "fa-bag-shopping",   icon: "bag-shopping" },
  ubereats:       { label: "Uber Eats",            faIcon: "fa-uber",           icon: "uber" },
  doordash:       { label: "DoorDash",             faIcon: "fa-door-open",      icon: "door-open" },
  opentable:      { label: "OpenTable",            faIcon: "fa-calendar-check", icon: "calendar-check" },
};

export const ALL_PLATFORMS: SocialPlatform[] = [
  "facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok",
  "pinterest", "threads", "snapchat", "telegram", "discord",
  "tripadvisor", "google_business", "yelp",
  "zomato", "swiggy", "ubereats", "doordash", "opentable",
];

/** Build default SocialLinkItem array with every platform disabled. */
export function buildDefaultSocialLinks(): SocialLinkItem[] {
  return ALL_PLATFORMS.map((platform, index) => {
    const meta = PLATFORM_META[platform];
    return {
      platform,
      label: meta.label,
      url: "",
      enabled: false,
      openInNewTab: true,
      displayOrder: index,
      icon: meta.icon,
      faIcon: meta.faIcon,
    };
  });
}

// ── Private helpers ──────────────────────────────────────────────────────────

type SocialLinksRow = {
  id: string;
  links: unknown;
  updated_at: string;
};

function mapRow(row: SocialLinksRow): SocialLinksData {
  const rawLinks = Array.isArray(row.links) ? (row.links as Record<string, unknown>[]) : [];

  // Merge saved links onto the full platform list so new platforms always appear
  const defaults = buildDefaultSocialLinks();
  const saved = new Map(rawLinks.map((l) => [String(l.platform), l]));

  const merged: SocialLinkItem[] = defaults.map((def) => {
    const s = saved.get(def.platform);
    if (!s) return def;
    return {
      platform: def.platform,
      label: def.label,
      url: String(s.url ?? ""),
      enabled: Boolean(s.enabled ?? false),
      openInNewTab: Boolean(s.open_in_new_tab ?? s.openInNewTab ?? true),
      displayOrder: Number(s.display_order ?? s.displayOrder ?? def.displayOrder),
      icon: def.icon,
      faIcon: def.faIcon,
    };
  });

  merged.sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: row.id,
    links: merged,
    updatedAt: row.updated_at,
  };
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save",
): SocialLinksError {
  console.error(`[social-links.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save the social links. Please try again."
        : "We couldn't load social links right now. Please try again.",
  };
}

function mapUnexpectedError(err: unknown): SocialLinksError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong. Please try again.",
  };
}
