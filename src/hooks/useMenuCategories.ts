import { useEffect, useState } from "react";

import {
  getMenuCategories,
  type MenuCategory,
  type MenuServiceError,
} from "@/services/menu/menu.service";

export interface UseMenuCategoriesResult {
  categories: MenuCategory[];
  isLoading: boolean;
  error: MenuServiceError | null;
}

/**
 * Loads menu categories via menu.service.ts for the create form's
 * category Select — categories are never hardcoded in the form itself.
 */
export function useMenuCategories(): UseMenuCategoriesResult {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<MenuServiceError | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMenuCategories().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setCategories(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, isLoading, error };
}
