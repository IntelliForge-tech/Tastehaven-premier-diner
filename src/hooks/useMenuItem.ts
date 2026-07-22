import { useCallback, useEffect, useState } from "react";

import {
  getMenuItemById,
  type MenuItemDetail,
  type MenuServiceError,
} from "@/services/menu/menu.service";

export interface UseMenuItemResult {
  item: MenuItemDetail | null;
  isLoading: boolean;
  error: MenuServiceError | null;
  /** Re-runs the fetch (e.g. from an error state's "Try again" action). */
  refetch: () => void;
}

/**
 * Loads a single menu item by id via menu.service.ts, for the Edit page's
 * default form values. Mirrors useMenuItems()'s loading/error/refetch
 * shape so the two hooks feel consistent to a caller.
 */
export function useMenuItem(menuId: string): UseMenuItemResult {
  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<MenuServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getMenuItemById(menuId).then((result) => {
      if (cancelled) return;

      if (result.success) {
        setItem(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [menuId, reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { item, isLoading, error, refetch };
}
