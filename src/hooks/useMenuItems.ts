import { useCallback, useEffect, useState } from "react";

import {
  getMenuItems,
  type MenuItemWithCategory,
  type MenuServiceError,
} from "@/services/menu/menu.service";

export interface UseMenuItemsResult {
  items: MenuItemWithCategory[];
  isLoading: boolean;
  error: MenuServiceError | null;
  /** Re-runs the fetch (e.g. from an error state's "Try again" action). */
  refetch: () => void;
}

/**
 * Loads menu items via menu.service.ts and exposes loading/error/data
 * state plus a refetch trigger. Keeps all fetching logic out of the
 * Menu page component itself.
 */
export function useMenuItems(): UseMenuItemsResult {
  const [items, setItems] = useState<MenuItemWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<MenuServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getMenuItems().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setItems(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { items, isLoading, error, refetch };
}
