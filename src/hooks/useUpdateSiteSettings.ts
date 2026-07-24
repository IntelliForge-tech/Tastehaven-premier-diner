import { useEffect, useRef, useState } from "react";

import {
  deleteSiteAsset,
  updateSiteSettings,
  uploadSiteAsset,
  type SiteSettings,
  type SiteSettingsError,
  type UpdateSiteSettingsInput,
} from "@/services/site-settings.service";

export type UpdateSiteSettingsOutcome =
  | { success: true }
  | { success: false; error: SiteSettingsError };

export interface UseUpdateSiteSettingsResult {
  isSubmitting: boolean;
  updateItem: (
    input: UpdateSiteSettingsInput,
    assetReplacements: AssetReplacements,
    existing: SiteSettings,
  ) => Promise<UpdateSiteSettingsOutcome>;
}

/**
 * Which asset fields the admin may replace in a single save.
 * Each entry: null = keep existing; File = replace with this.
 * imageCleared: field key → true if the Remove button was clicked.
 */
export interface AssetReplacements {
  faviconFile: File | null;
  faviconCleared: boolean;
  appleTouchIconFile: File | null;
  appleTouchIconCleared: boolean;
  ogImageFile: File | null;
  ogImageCleared: boolean;
  maintenanceImageFile: File | null;
  maintenanceImageCleared: boolean;
}

/**
 * Orchestrates the Site Settings save flow, mirroring useUpdateHero():
 * upload new assets → save record → rollback orphans on failure →
 * clean up replaced assets on success.
 */
export function useUpdateSiteSettings(): UseUpdateSiteSettingsResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateItem(
    input: UpdateSiteSettingsInput,
    assets: AssetReplacements,
    existing: SiteSettings,
  ): Promise<UpdateSiteSettingsOutcome> {
    setIsSubmitting(true);

    const newlyUploaded: string[] = [];

    try {
      // Resolve each asset URL.
      const resolvedInput = { ...input };

      const uploadOrKeep = async (
        file: File | null,
        cleared: boolean,
        existingUrl: string | null,
        field: keyof UpdateSiteSettingsInput,
      ) => {
        if (file) {
          const r = await uploadSiteAsset(file);
          if (!r.success) throw r.error;
          (resolvedInput as Record<string, unknown>)[field] = r.data.publicUrl;
          newlyUploaded.push(r.data.publicUrl);
        } else if (cleared) {
          (resolvedInput as Record<string, unknown>)[field] = null;
        } else {
          (resolvedInput as Record<string, unknown>)[field] = existingUrl;
        }
      };

      await uploadOrKeep(
        assets.faviconFile,
        assets.faviconCleared,
        existing.faviconUrl,
        "faviconUrl",
      );
      await uploadOrKeep(
        assets.appleTouchIconFile,
        assets.appleTouchIconCleared,
        existing.appleTouchIconUrl,
        "appleTouchIconUrl",
      );
      await uploadOrKeep(
        assets.ogImageFile,
        assets.ogImageCleared,
        existing.ogImageUrl,
        "ogImageUrl",
      );
      await uploadOrKeep(
        assets.maintenanceImageFile,
        assets.maintenanceImageCleared,
        existing.maintenanceImageUrl,
        "maintenanceImageUrl",
      );

      const result = await updateSiteSettings(resolvedInput);

      if (!result.success) {
        // Rollback: delete orphaned uploads.
        for (const url of newlyUploaded) void deleteSiteAsset(url);
        return { success: false, error: result.error };
      }

      // Clean up replaced/cleared assets.
      if (assets.faviconFile && existing.faviconUrl)
        void deleteSiteAsset(existing.faviconUrl);
      if (assets.faviconCleared && existing.faviconUrl)
        void deleteSiteAsset(existing.faviconUrl);
      if (assets.appleTouchIconFile && existing.appleTouchIconUrl)
        void deleteSiteAsset(existing.appleTouchIconUrl);
      if (assets.appleTouchIconCleared && existing.appleTouchIconUrl)
        void deleteSiteAsset(existing.appleTouchIconUrl);
      if (assets.ogImageFile && existing.ogImageUrl)
        void deleteSiteAsset(existing.ogImageUrl);
      if (assets.ogImageCleared && existing.ogImageUrl)
        void deleteSiteAsset(existing.ogImageUrl);
      if (assets.maintenanceImageFile && existing.maintenanceImageUrl)
        void deleteSiteAsset(existing.maintenanceImageUrl);
      if (assets.maintenanceImageCleared && existing.maintenanceImageUrl)
        void deleteSiteAsset(existing.maintenanceImageUrl);

      return { success: true };
    } catch (err) {
      // An upload threw a SiteSettingsError.
      for (const url of newlyUploaded) void deleteSiteAsset(url);
      return {
        success: false,
        error: err as SiteSettingsError,
      };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return { isSubmitting, updateItem };
}
