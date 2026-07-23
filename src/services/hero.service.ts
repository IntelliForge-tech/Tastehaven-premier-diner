import { v4 as uuidv4 } from "uuid";
import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Hero service — Phase 12A.
 *
 * Manages the hero_settings singleton row (there is exactly one row,
 * identified by a fixed id). UI components never import the Supabase
 * client or database.types.ts directly — they call this service and
 * get back small, UI-safe result types, following the same pattern as
 * chefs.service.ts, gallery.service.ts, and the rest of the project.
 *
 * hero_settings in database.types.ts has:
 *   id, headline, subheadline, cta_text, cta_link, background_image_url, updated_at
 *
 * Phase 12A extends this with additional fields stored in the same row
 * via an upsert. The migration adds the missing columns (see SQL note).
 */

export type HeroServiceErrorCode =
  | "network_error"
  | "upload_error"
  | "not_found"
  | "unexpected_error";

export interface HeroServiceError {
  code: HeroServiceErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase/Postgres error. */
  message: string;
}

/**
 * The full set of manageable Hero fields.
 * Matches the extended hero_settings table (see migration SQL below).
 */
export interface HeroContent {
  id: string;
  /** Main heading — e.g. "Fresh Ingredients." */
  headline: string;
  /** Highlighted span within the heading — e.g. "Memorable" */
  headlineHighlight: string | null;
  /** Text after the highlight — e.g. "Experiences." */
  headlineSuffix: string | null;
  /** Badge text above the heading — e.g. "Now taking reservations" */
  badgeText: string | null;
  /** Description paragraph beneath the heading. */
  description: string | null;
  /** Primary CTA button label — e.g. "Reserve Table" */
  primaryButtonText: string | null;
  /** Anchor id the primary button scrolls to — e.g. "reserve" */
  primaryButtonLink: string | null;
  /** Secondary CTA button label — e.g. "View Menu" */
  secondaryButtonText: string | null;
  /** Anchor id the secondary button scrolls to — e.g. "menu" */
  secondaryButtonLink: string | null;
  /** Public URL of the stored background image. */
  backgroundImageUrl: string | null;
  /**
   * Overlay darkness: 0 (no overlay) – 100 (fully opaque).
   * Stored as an integer; applied as CSS opacity on the gradient overlay.
   */
  overlayOpacity: number;
  /** When false the entire Hero section is hidden on the public site. */
  isVisible: boolean;
  updatedAt: string;
}

export type GetHeroResult =
  | { success: true; data: HeroContent }
  | { success: false; error: HeroServiceError };

/**
 * Fetches the single hero_settings row.
 * If no row exists yet, returns a structured "not_found" error so the
 * caller can display defaults rather than crashing.
 */
export async function getHero(): Promise<GetHeroResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("hero_settings")
      .select(
        "id, headline, headline_highlight, headline_suffix, badge_text, description, " +
        "primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, " +
        "background_image_url, overlay_opacity, is_visible, updated_at",
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    if (!data) {
      return {
        success: false,
        error: { code: "not_found", message: "No hero settings found." },
      };
    }

    return {
      success: true,
      data: mapRow(data),
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

export interface UpdateHeroInput {
  headline: string;
  headlineHighlight: string | null;
  headlineSuffix: string | null;
  badgeText: string | null;
  description: string | null;
  primaryButtonText: string | null;
  primaryButtonLink: string | null;
  secondaryButtonText: string | null;
  secondaryButtonLink: string | null;
  backgroundImageUrl: string | null;
  overlayOpacity: number;
  isVisible: boolean;
}

export type UpdateHeroResult =
  | { success: true }
  | { success: false; error: HeroServiceError };

/**
 * Upserts the hero_settings row.
 * Uses a fixed well-known id so there is always exactly one row.
 * The id is intentionally constant — the hero settings are a singleton.
 */
export async function updateHero(input: UpdateHeroInput): Promise<UpdateHeroResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("hero_settings").upsert(
      {
        id: HERO_SINGLETON_ID,
        headline: input.headline,
        headline_highlight: input.headlineHighlight,
        headline_suffix: input.headlineSuffix,
        badge_text: input.badgeText,
        description: input.description,
        primary_button_text: input.primaryButtonText,
        primary_button_link: input.primaryButtonLink,
        secondary_button_text: input.secondaryButtonText,
        secondary_button_link: input.secondaryButtonLink,
        background_image_url: input.backgroundImageUrl,
        overlay_opacity: input.overlayOpacity,
        is_visible: input.isVisible,
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

// ── Image Upload / Delete ────────────────────────────────────────────────────

export type UploadHeroImageResult =
  | { success: true; data: { publicUrl: string } }
  | { success: false; error: HeroServiceError };

const HERO_BUCKET = "restaurant-media";
const HERO_IMAGE_FOLDER = "hero";

/**
 * Uploads a hero background image to the restaurant-media bucket
 * under its hero/ folder, exactly mirroring uploadGalleryImage() and
 * uploadChefImage() from their respective services.
 */
export async function uploadHeroImage(file: File): Promise<UploadHeroImageResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const path = `${HERO_IMAGE_FOLDER}/${uuidv4()}-${slugifyFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(HERO_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("[hero.service] uploadHeroImage failed:", uploadError.message);
      return {
        success: false,
        error: {
          code: "upload_error",
          message: "We couldn't upload that image. Please try a different file or try again.",
        },
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(HERO_BUCKET).getPublicUrl(path);

    return { success: true, data: { publicUrl } };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "upload") };
  }
}

export type DeleteHeroImageResult =
  | { success: true }
  | { success: false; error: HeroServiceError };

/**
 * Deletes a hero background image from Storage by its public URL.
 * Mirrors deleteGalleryImage() / deleteChefImage().
 */
export async function deleteHeroImage(publicUrl: string): Promise<DeleteHeroImageResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const path = extractStoragePath(publicUrl, HERO_BUCKET);
    if (!path) return { success: true }; // nothing to delete

    const { error } = await supabase.storage.from(HERO_BUCKET).remove([path]);

    if (error) {
      console.error("[hero.service] deleteHeroImage failed:", error.message);
      return {
        success: false,
        error: { code: "unexpected_error", message: "We couldn't remove the old image." },
      };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "delete") };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

/** Fixed singleton id for the hero_settings row. */
const HERO_SINGLETON_ID = "00000000-0000-0000-0000-000000000001";

type HeroRow = {
  id: string;
  headline: string;
  headline_highlight: string | null;
  headline_suffix: string | null;
  badge_text: string | null;
  description: string | null;
  primary_button_text: string | null;
  primary_button_link: string | null;
  secondary_button_text: string | null;
  secondary_button_link: string | null;
  background_image_url: string | null;
  overlay_opacity: number;
  is_visible: boolean;
  updated_at: string;
};

function mapRow(row: HeroRow): HeroContent {
  return {
    id: row.id,
    headline: row.headline,
    headlineHighlight: row.headline_highlight,
    headlineSuffix: row.headline_suffix,
    badgeText: row.badge_text,
    description: row.description,
    primaryButtonText: row.primary_button_text,
    primaryButtonLink: row.primary_button_link,
    secondaryButtonText: row.secondary_button_text,
    secondaryButtonLink: row.secondary_button_link,
    backgroundImageUrl: row.background_image_url,
    overlayOpacity: row.overlay_opacity ?? 70,
    isVisible: row.is_visible ?? true,
    updatedAt: row.updated_at,
  };
}

function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

function slugifyFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete" = "load",
): HeroServiceError {
  console.error(`[hero.service] ${context} failed:`, error.message);

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save the hero settings. Please try again."
        : context === "delete"
          ? "We couldn't delete the hero image. Please try again."
          : "We couldn't load hero settings right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "delete" | "upload" = "load",
): HeroServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "Something went wrong saving hero settings. Please try again."
        : context === "delete"
          ? "Something went wrong removing the image. Please try again."
          : context === "upload"
            ? "Something went wrong uploading that image. Please try again."
            : "Something went wrong loading hero settings. Please try again.",
  };
}
