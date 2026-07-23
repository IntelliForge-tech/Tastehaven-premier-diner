import { v4 as uuidv4 } from "uuid";
import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * About service — Phase 12B.
 *
 * Manages the about_settings singleton row. Follows the exact same
 * pattern as hero.service.ts: UI components never touch Supabase
 * directly — they call this service and receive UI-safe result types.
 *
 * The existing about_settings table has:
 *   id, headline, description, image_url, features (jsonb), updated_at
 *
 * Phase 12B extends it with additional columns via a safe migration
 * (ADD COLUMN IF NOT EXISTS). The singleton id is fixed so there is
 * always exactly one row, upserted on every save.
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

/** One feature card in the About section's 2×2 grid. */
export interface AboutFeature {
  /** FontAwesome icon class without the "fa-solid fa-" prefix — e.g. "seedling". */
  icon: string;
  title: string;
  description: string;
}

/**
 * The full set of manageable About section fields.
 * Matches the extended about_settings table (see migration SQL).
 */
export interface AboutContent {
  id: string;
  /** Small kicker label above the heading — e.g. "Our Story". */
  sectionTitle: string;
  /** Main heading — e.g. "A haven for the curious palate." */
  heading: string;
  /** Description paragraph beneath the heading. */
  description: string | null;
  /** Four feature cards shown in the 2×2 grid below the description. */
  features: AboutFeature[];
  /** Public URL of the main About image (right column). */
  imageUrl: string | null;
  /** Year shown in the decorative badge overlay — e.g. "2012". */
  badgeYear: string | null;
  /** Sub-text in the decorative badge overlay — e.g. "A decade of memorable evenings." */
  badgeText: string | null;
  /** When false the entire About section is hidden on the public site. */
  isVisible: boolean;
  updatedAt: string;
}

export type GetAboutResult =
  | { success: true; data: AboutContent }
  | { success: false; error: AboutServiceError };

/**
 * Fetches the single about_settings row.
 * Returns a structured "not_found" error when no row exists yet so the
 * caller can show defaults rather than crashing — same pattern as getHero().
 */
export async function getAbout(): Promise<GetAboutResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("about_settings")
      .select(
        "id, section_title, headline, description, image_url, features, " +
        "badge_year, badge_text, is_visible, updated_at",
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

    return { success: true, data: mapRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

export interface UpdateAboutInput {
  sectionTitle: string;
  heading: string;
  description: string | null;
  features: AboutFeature[];
  imageUrl: string | null;
  badgeYear: string | null;
  badgeText: string | null;
  isVisible: boolean;
}

export type UpdateAboutResult =
  | { success: true }
  | { success: false; error: AboutServiceError };

/**
 * Upserts the about_settings singleton row.
 * Uses a fixed well-known id — same singleton pattern as updateHero().
 */
export async function updateAbout(input: UpdateAboutInput): Promise<UpdateAboutResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("about_settings").upsert(
      {
        id: ABOUT_SINGLETON_ID,
        section_title: input.sectionTitle,
        headline: input.heading,
        description: input.description,
        image_url: input.imageUrl,
        features: input.features as unknown as object[],
        badge_year: input.badgeYear,
        badge_text: input.badgeText,
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
 * Uploads an About section image to the restaurant-media bucket under
 * the about/ folder — mirrors uploadHeroImage() and uploadChefImage()
 * from their respective services exactly.
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
 * Deletes an About image from Storage by its public URL.
 * Mirrors deleteHeroImage() / deleteGalleryImage().
 */
export async function deleteAboutImage(publicUrl: string): Promise<DeleteAboutImageResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const path = extractStoragePath(publicUrl, ABOUT_BUCKET);
    if (!path) return { success: true };

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
  section_title: string | null;
  headline: string;
  description: string | null;
  image_url: string | null;
  features: unknown;
  badge_year: string | null;
  badge_text: string | null;
  is_visible: boolean | null;
  updated_at: string;
};

function mapRow(row: AboutRow): AboutContent {
  return {
    id: row.id,
    sectionTitle: row.section_title ?? "Our Story",
    heading: row.headline,
    description: row.description,
    features: parseFeatures(row.features),
    imageUrl: row.image_url,
    badgeYear: row.badge_year,
    badgeText: row.badge_text,
    isVisible: row.is_visible ?? true,
    updatedAt: row.updated_at,
  };
}

/** Safely parses the features JSON column into AboutFeature[]. */
function parseFeatures(raw: unknown): AboutFeature[] {
  if (!Array.isArray(raw)) return DEFAULT_FEATURES;
  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      icon: typeof item["icon"] === "string" ? item["icon"] : "star",
      title: typeof item["title"] === "string" ? item["title"] : "",
      description: typeof item["description"] === "string" ? item["description"] : "",
    }));
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

/** Default features matching the current hardcoded ABOUT_FEATURES constant. */
export const DEFAULT_FEATURES: AboutFeature[] = [
  { icon: "seedling", title: "Fresh Ingredients", description: "Sourced daily from local farms." },
  { icon: "hat-chef", title: "Experienced Chefs", description: "A team with global training." },
  { icon: "fire", title: "Cozy Atmosphere", description: "Warm lighting, intimate seating." },
  { icon: "bolt", title: "Fast Service", description: "Attentive, never rushed." },
];
