import { useEffect, useRef, useState } from "react";

import {
  createQuickLink,
  deleteQuickLink,
  reorderQuickLinks,
  updateQuickLink,
  type CreateQuickLinkInput,
  type FooterServiceError,
  type QuickLink,
  type UpdateQuickLinkInput,
} from "@/services/footer.service";

// ── Create ────────────────────────────────────────────────────────────────────

export type CreateQuickLinkOutcome =
  | { success: true; data: QuickLink }
  | { success: false; error: FooterServiceError };

export interface UseCreateQuickLinkResult {
  isCreating: boolean;
  createItem: (input: CreateQuickLinkInput) => Promise<CreateQuickLinkOutcome>;
}

export function useCreateQuickLink(): UseCreateQuickLinkResult {
  const [isCreating, setIsCreating] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function createItem(input: CreateQuickLinkInput): Promise<CreateQuickLinkOutcome> {
    setIsCreating(true);
    try {
      const result = await createQuickLink(input);
      if (!result.success) return { success: false, error: result.error };
      return { success: true, data: result.data };
    } finally {
      if (isMountedRef.current) setIsCreating(false);
    }
  }

  return { isCreating, createItem };
}

// ── Update ────────────────────────────────────────────────────────────────────

export type UpdateQuickLinkOutcome =
  | { success: true }
  | { success: false; error: FooterServiceError };

export interface UseUpdateQuickLinkResult {
  isUpdating: boolean;
  updateItem: (input: UpdateQuickLinkInput) => Promise<UpdateQuickLinkOutcome>;
}

export function useUpdateQuickLink(): UseUpdateQuickLinkResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function updateItem(input: UpdateQuickLinkInput): Promise<UpdateQuickLinkOutcome> {
    setIsUpdating(true);
    try {
      const result = await updateQuickLink(input);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setIsUpdating(false);
    }
  }

  return { isUpdating, updateItem };
}

// ── Delete ────────────────────────────────────────────────────────────────────

export type DeleteQuickLinkOutcome =
  | { success: true }
  | { success: false; error: FooterServiceError };

export interface UseDeleteQuickLinkResult {
  isDeleting: boolean;
  deletingId: string | null;
  deleteItem: (id: string) => Promise<DeleteQuickLinkOutcome>;
}

export function useDeleteQuickLink(): UseDeleteQuickLinkResult {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function deleteItem(id: string): Promise<DeleteQuickLinkOutcome> {
    setDeletingId(id);
    try {
      const result = await deleteQuickLink(id);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setDeletingId(null);
    }
  }

  return { isDeleting: deletingId !== null, deletingId, deleteItem };
}

// ── Reorder ───────────────────────────────────────────────────────────────────

export type ReorderQuickLinksOutcome =
  | { success: true }
  | { success: false; error: FooterServiceError };

export interface UseReorderQuickLinksResult {
  isReordering: boolean;
  reorderItems: (orderedIds: string[]) => Promise<ReorderQuickLinksOutcome>;
}

export function useReorderQuickLinks(): UseReorderQuickLinksResult {
  const [isReordering, setIsReordering] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function reorderItems(orderedIds: string[]): Promise<ReorderQuickLinksOutcome> {
    setIsReordering(true);
    try {
      const result = await reorderQuickLinks(orderedIds);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setIsReordering(false);
    }
  }

  return { isReordering, reorderItems };
}
