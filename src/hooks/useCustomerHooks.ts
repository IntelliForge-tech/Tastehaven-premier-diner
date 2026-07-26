import { useCallback, useEffect, useState } from "react";

import {
  getCustomerById,
  getCustomerAnalytics,
  type CustomerAnalytics,
  type CustomerDetail,
  type CustomerServiceError,
} from "@/services/customers.service";
import {
  getCustomerNotes,
  type CustomerNote,
} from "@/services/customer-notes.service";
import {
  getCustomerTags,
  getAllTags,
  type CustomerTag,
  type CustomerTagAssignment,
} from "@/services/customer-tags.service";
import {
  getLoyaltyHistory,
  type LoyaltyHistoryEntry,
} from "@/services/customer-loyalty.service";

// ── useCustomer ───────────────────────────────────────────────────────────────

export interface UseCustomerResult {
  customer: CustomerDetail | null;
  isLoading: boolean;
  error: CustomerServiceError | null;
  refetch: () => void;
}

export function useCustomer(customerId: string): UseCustomerResult {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CustomerServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getCustomerById(customerId).then((result) => {
      if (cancelled) return;
      if (result.success) setCustomer(result.data);
      else setError(result.error);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [customerId, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { customer, isLoading, error, refetch };
}

// ── useCustomerNotes ──────────────────────────────────────────────────────────

export interface UseCustomerNotesResult {
  notes: CustomerNote[];
  isLoading: boolean;
  error: CustomerServiceError | null;
  refetch: () => void;
}

export function useCustomerNotes(customerId: string): UseCustomerNotesResult {
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CustomerServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getCustomerNotes(customerId).then((result) => {
      if (cancelled) return;
      if (result.success) setNotes(result.data);
      else setError(result.error);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [customerId, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { notes, isLoading, error, refetch };
}

// ── useCustomerTags ───────────────────────────────────────────────────────────

export interface UseCustomerTagsResult {
  assignments: CustomerTagAssignment[];
  allTags: CustomerTag[];
  isLoading: boolean;
  error: CustomerServiceError | null;
  refetch: () => void;
}

export function useCustomerTags(customerId: string): UseCustomerTagsResult {
  const [assignments, setAssignments] = useState<CustomerTagAssignment[]>([]);
  const [allTags, setAllTags] = useState<CustomerTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CustomerServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([getCustomerTags(customerId), getAllTags()]).then(
      ([assignResult, allResult]) => {
        if (cancelled) return;
        if (assignResult.success) setAssignments(assignResult.data);
        else setError(assignResult.error);
        if (allResult.success) setAllTags(allResult.data);
        setIsLoading(false);
      },
    );

    return () => { cancelled = true; };
  }, [customerId, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { assignments, allTags, isLoading, error, refetch };
}

// ── useCustomerLoyalty ────────────────────────────────────────────────────────

export interface UseCustomerLoyaltyResult {
  history: LoyaltyHistoryEntry[];
  isLoading: boolean;
  error: CustomerServiceError | null;
  refetch: () => void;
}

export function useCustomerLoyalty(customerId: string): UseCustomerLoyaltyResult {
  const [history, setHistory] = useState<LoyaltyHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CustomerServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getLoyaltyHistory(customerId).then((result) => {
      if (cancelled) return;
      if (result.success) setHistory(result.data);
      else setError(result.error);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [customerId, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { history, isLoading, error, refetch };
}

// ── useCustomerAnalytics ──────────────────────────────────────────────────────

export interface UseCustomerAnalyticsResult {
  analytics: CustomerAnalytics | null;
  isLoading: boolean;
  error: CustomerServiceError | null;
  refetch: () => void;
}

export function useCustomerAnalytics(): UseCustomerAnalyticsResult {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CustomerServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getCustomerAnalytics().then((result) => {
      if (cancelled) return;
      if (result.success) setAnalytics(result.data);
      else setError(result.error);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { analytics, isLoading, error, refetch };
}
