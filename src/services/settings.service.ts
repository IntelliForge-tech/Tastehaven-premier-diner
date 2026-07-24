import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Restaurant Settings service.
 *
 * Manages three closely related tables that together form the "Settings"
 * page in the admin dashboard:
 *
 *   restaurant_info  — name, tagline, address, phone, email, logo_url
 *   opening_hours    — one row per day (0=Sun … 6=Sat) with open/close times
 *   social_links     — platform + URL pairs
 *
 * All three are singletons / small managed sets, so the Settings page is
 * one form rather than a CRUD list. Pattern mirrors about.service.ts and
 * hero.service.ts.
 */

export type SettingsServiceErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface SettingsServiceError {
  code: SettingsServiceErrorCode;
  message: string;
}

// ── Restaurant Info ──────────────────────────────────────────────────────────

export interface RestaurantInfo {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  updatedAt: string;
}

export type GetRestaurantInfoResult =
  | { success: true; data: RestaurantInfo }
  | { success: false; error: SettingsServiceError };

export async function getRestaurantInfo(): Promise<GetRestaurantInfoResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("restaurant_info")
      .select("id, name, tagline, description, address, phone, email, logo_url, updated_at")
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, error: mapPostgrestError(error, "load") };
    if (!data) return { success: false, error: { code: "not_found", message: "No restaurant info found." } };

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        address: data.address,
        phone: data.phone,
        email: data.email,
        logoUrl: data.logo_url,
        updatedAt: data.updated_at,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export interface UpdateRestaurantInfoInput {
  name: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export type UpdateRestaurantInfoResult =
  | { success: true }
  | { success: false; error: SettingsServiceError };

const RESTAURANT_INFO_ID = "00000000-0000-0000-0000-000000000010";

export async function updateRestaurantInfo(
  input: UpdateRestaurantInfoInput,
): Promise<UpdateRestaurantInfoResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("restaurant_info").upsert(
      {
        id: RESTAURANT_INFO_ID,
        name: input.name,
        tagline: input.tagline,
        description: input.description,
        address: input.address,
        phone: input.phone,
        email: input.email,
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

// ── Opening Hours ────────────────────────────────────────────────────────────

export interface OpeningHoursEntry {
  id: string;
  dayOfWeek: number; // 0=Sun … 6=Sat
  openTime: string | null;  // "HH:MM" 24-hour
  closeTime: string | null;
  isClosed: boolean;
}

export type GetOpeningHoursResult =
  | { success: true; data: OpeningHoursEntry[] }
  | { success: false; error: SettingsServiceError };

export async function getOpeningHours(): Promise<GetOpeningHoursResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("opening_hours")
      .select("id, day_of_week, open_time, close_time, is_closed")
      .order("day_of_week", { ascending: true });

    if (error) return { success: false, error: mapPostgrestError(error, "load") };

    return {
      success: true,
      data: data.map((row) => ({
        id: row.id,
        dayOfWeek: row.day_of_week,
        openTime: row.open_time,
        closeTime: row.close_time,
        isClosed: row.is_closed,
      })),
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export interface UpsertOpeningHoursInput {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export type UpsertOpeningHoursResult =
  | { success: true }
  | { success: false; error: SettingsServiceError };

export async function upsertOpeningHours(
  entries: UpsertOpeningHoursInput[],
): Promise<UpsertOpeningHoursResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const rows = entries.map((e) => ({
      day_of_week: e.dayOfWeek,
      open_time: e.isClosed ? null : e.openTime,
      close_time: e.isClosed ? null : e.closeTime,
      is_closed: e.isClosed,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("opening_hours")
      .upsert(rows, { onConflict: "day_of_week" });

    if (error) return { success: false, error: mapPostgrestError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

// ── Social Links ─────────────────────────────────────────────────────────────

export interface SocialLinkEntry {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
}

export type GetSocialLinksResult =
  | { success: true; data: SocialLinkEntry[] }
  | { success: false; error: SettingsServiceError };

export async function getSocialLinks(): Promise<GetSocialLinksResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("social_links")
      .select("id, platform, url, icon, display_order, is_active")
      .order("display_order", { ascending: true });

    if (error) return { success: false, error: mapPostgrestError(error, "load") };

    return {
      success: true,
      data: data.map((row) => ({
        id: row.id,
        platform: row.platform,
        url: row.url,
        icon: row.icon,
        displayOrder: row.display_order,
        isActive: row.is_active,
      })),
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export interface UpsertSocialLinkInput {
  id?: string;
  platform: string;
  url: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
}

export type UpsertSocialLinksResult =
  | { success: true }
  | { success: false; error: SettingsServiceError };

export async function upsertSocialLinks(
  links: UpsertSocialLinkInput[],
): Promise<UpsertSocialLinksResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const rows = links.map((l, i) => ({
      ...(l.id ? { id: l.id } : {}),
      platform: l.platform,
      url: l.url,
      icon: l.icon ?? `fa-${l.platform.toLowerCase()}`,
      display_order: i,
      is_active: l.isActive,
    }));

    const { error } = await supabase
      .from("social_links")
      .upsert(rows, { onConflict: "id" });

    if (error) return { success: false, error: mapPostgrestError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save",
): SettingsServiceError {
  console.error(`[settings.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save those settings. Please try again."
        : "We couldn't load settings right now. Please try again.",
  };
}

function mapUnexpectedError(err: unknown): SettingsServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  return { code: "unexpected_error", message: "Something went wrong. Please try again." };
}
