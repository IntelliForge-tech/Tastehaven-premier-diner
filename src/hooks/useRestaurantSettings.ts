import { useCallback, useEffect, useState } from "react";

import {
  getOpeningHours,
  getRestaurantInfo,
  getSocialLinks,
  type OpeningHoursEntry,
  type RestaurantInfo,
  type SettingsServiceError,
  type SocialLinkEntry,
} from "@/services/settings.service";

export interface SettingsData {
  restaurantInfo: RestaurantInfo;
  openingHours: OpeningHoursEntry[];
  socialLinks: SocialLinkEntry[];
}

export interface UseRestaurantSettingsResult {
  data: SettingsData | null;
  isLoading: boolean;
  error: SettingsServiceError | null;
  refetch: () => void;
}

/**
 * Loads restaurant_info, opening_hours, and social_links in parallel.
 * If restaurant_info doesn't exist yet (not_found), data is null and the
 * settings page shows a first-time setup state.
 */
export function useRestaurantSettings(): UseRestaurantSettingsResult {
  const [data, setData] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SettingsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([getRestaurantInfo(), getOpeningHours(), getSocialLinks()]).then(
      ([infoResult, hoursResult, linksResult]) => {
        if (cancelled) return;

        if (!infoResult.success) {
          setError(infoResult.error);
          setData(null);
          setIsLoading(false);
          return;
        }

        setData({
          restaurantInfo: infoResult.data,
          openingHours: hoursResult.success ? hoursResult.data : [],
          socialLinks: linksResult.success ? linksResult.data : [],
        });
        setIsLoading(false);
      },
    );

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}
