import { v4 as uuidv4 } from "uuid";
import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * About service — Phase 12B.
 *
 * Manages the about_settings singleton row (there is exactly one row,
 * identified by a fixed id). UI components never import the Supabase
 * client or database.types.ts directly — they call this service and
 * get back small, UI-safe result types, following the same pattern as
 * hero.service.ts and the rest of the project.
 *
 * about_settings in database.types.ts has:
 *   id, headline, description, image_url, features, updated_at
 *
 * Phase 12B extends this table with additional columns via a migration.
 * The features column stores feature cards as JSON.
 */

export type AboutServiceErrorCode =
  | "network_error"
  | "upload_error"
  | "not_found"
  | "unexpected_error";

export interface AboutServiceError {
  code: AboutServiceErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase/Postgres error. */
  message: string;
}

/** A single feature card in the About section grid. */
export interface AboutFeature {
  /** Font Awesome icon class suffix, e.g. "fa-seedling". */
  icon: string;
  /** Card title, e.g. "Fresh Ingredients". */
  title: string;
  /** Card description, e.g. "Sourced daily from local farms." */
  description: string;
}

/** The full set of manageable About fields. */
export interface AboutContent {
  id: string;
  /** Section label above the heading — e.g. "Our Story" */
  sectionTitle: string;
  /** Main heading — e.g. "A haven for the curious palate." */
  headline: string;
  /** Primary description paragraph. */
  description: string | null;
  /** Decorative badge label — e.g. "Since" */
  badgeLabel: string | null;
  /** Year or short text displayed large inside the badge — e.g. "2012" */
  badgeYear: string | null;
  /** Smaller text below the badge year — e.g. "A decade of memorable evenings." */
  badgeSubtext: string | null;
  /** Public URL of the main about image. */
  imageUrl: string | null;
  /** Feature cards array (up to 4). */
  features: AboutFeature[];
  /** When false the entire About section is hidden on the public site. */
  isVisible: boolean;
  updatedAt: string;
}

export type GetAboutResult =
  | { success: true; data: AboutContent }
  | { success: false; error: AboutServiceError };

/**
 * Fetches the single about_settings row.
 * If no row exists yet, returns a structured "not_found" error so the
 * caller can display defaults rather than crashing.
 */
export async function getAbout(): Promise<GetAboutResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("about_settings")
      .select(
        "id, headline, description, image_url, features, " +
        "section_title, badge_label, badge_year, badge_subtext, is_visible, updated_at",
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    if (!data) {
      return {
        success: false,
        error: { code: "not_found", message: "No about settings found." },
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

export interface UpdateAboutInput {
  sectionTitle: string;
  headline: string;
  description: string | null;
  badgeLabel: string | null;
  badgeYear: string | null;
  badgeSubtext: string | null;
  imageUrl: string | null;
  features: AboutFeature[];
  isVisible: boolean;
}

export type UpdateAboutResult =
  | { success: true }
  | { success: false; error: AboutServiceError };

/**
 * Upserts the about_settings row.
 * Uses a fixed well-known id so there is always exactly one row.
 */
export async function updateAbout(input: UpdateAboutInput): Promise<UpdateAboutResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("about_settings").upsert(
      {
        id: ABOUT_SINGLETON_ID,
        headline: input.headline,
        description: input.description,
        image_url: input.imageUrl,
        features: input.features as unknown as Record<string, unknown>[],
        section_title: input.sectionTitle,
        badge_label: input.badgeLabel,
        badge_year: input.badgeYear,
        badge_subtext: input.badgeSubtext,
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

export type UploadAboutImageResult =
  | { success: true; data: { publicUrl: string } }
  | { success: false; error: AboutServiceError };

const ABOUT_BUCKET = "restaurant-media";
const ABOUT_IMAGE_FOLDER = "about";

/**
 * Uploads an about image to the restaurant-media bucket under its
 * about/ folder, exactly mirroring uploadHeroImage().
 */
export async function uploadAboutImage(file: File): Promise<UploadAboutImageResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const path = `${ABOUT_IMAGE_FOLDER}/${uuidv4()}-${slugifyFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(ABOUT_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("[about.service] uploadAboutImage failed:", uploadError.message);
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
    } = supabase.storage.from(ABOUT_BUCKET).getPublicUrl(path);

    return { success: true, data: { publicUrl } };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "upload") };
  }
}

export type DeleteAboutImageResult =
  | { success: true }
  | { success: false; error: AboutServiceError };

/**
 * Deletes an about image from Storage by its public URL.
 * Mirrors deleteHeroImage().
 */
export async function deleteAboutImage(publicUrl: string): Promise<DeleteAboutImageResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const path = extractStoragePath(publicUrl, ABOUT_BUCKET);
    if (!path) return { success: true }; // nothing to delete

    const { error } = await supabase.storage.from(ABOUT_BUCKET).remove([path]);

    if (error) {
      console.error("[about.service] deleteAboutImage failed:", error.message);
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

/** Fixed singleton id for the about_settings row. */
const ABOUT_SINGLETON_ID = "00000000-0000-0000-0000-000000000002";

type AboutRow = {
  id: string;
  headline: string;
  description: string | null;
  image_url: string | null;
  features: unknown;
  section_title: string | null;
  badge_label: string | null;
  badge_year: string | null;
  badge_subtext: string | null;
  is_visible: boolean | null;
  updated_at: string;
};

function mapRow(row: AboutRow): AboutContent {
  let features: AboutFeature[] = DEFAULT_FEATURES;
  if (Array.isArray(row.features) && row.features.length > 0) {
    features = (row.features as Record<string, unknown>[]).map((f) => ({
      icon: String(f.icon ?? "fa-star"),
      title: String(f.title ?? ""),
      description: String(f.description ?? ""),
    }));
  }

  return {
    id: row.id,
    sectionTitle: row.section_title ?? "Our Story",
    headline: row.headline,
    description: row.description,
    badgeLabel: row.badge_label,
    badgeYear: row.badge_year,
    badgeSubtext: row.badge_subtext,
    imageUrl: row.image_url,
    features,
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
): AboutServiceError {
  console.error(`[about.service] ${context} failed:`, error.message);

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save the about settings. Please try again."
        : context === "delete"
          ? "We couldn't delete the about image. Please try again."
          : "We couldn't load about settings right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "delete" | "upload" = "load",
): AboutServiceError {
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
        ? "Something went wrong saving about settings. Please try again."
        : context === "delete"
          ? "Something went wrong removing the image. Please try again."
          : context === "upload"
            ? "Something went wrong uploading that image. Please try again."
            : "Something went wrong loading about settings. Please try again.",
  };
}

/** Fallback feature cards — mirror ABOUT_FEATURES from constants.ts. */
const DEFAULT_FEATURES: AboutFeature[] = [
  { icon: "fa-seedling", title: "Fresh Ingredients", description: "Sourced daily from local farms." },
  { icon: "fa-hat-chef", title: "Experienced Chefs", description: "A team with global training." },
  { icon: "fa-fire", title: "Cozy Atmosphere", description: "Warm lighting, intimate seating." },
  { icon: "fa-bolt", title: "Fast Service", description: "Attentive, never rushed." },
];
