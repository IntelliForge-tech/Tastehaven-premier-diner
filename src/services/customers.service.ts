import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Customers service — Phase 13C.
 *
 * Manages the `customers` table. Follows the exact same pattern as
 * reservations.service.ts: UI components never touch Supabase directly,
 * all results are UI-safe typed objects, errors are friendly messages.
 */

export type CustomerServiceErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface CustomerServiceError {
  code: CustomerServiceErrorCode;
  message: string;
}

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";
export type CustomerStatus = "active" | "inactive" | "blacklisted";

export interface CustomerListItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  email: string | null;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpending: number;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends CustomerListItem {
  birthDate: string | null;
  anniversary: string | null;
  preferredLanguage: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  lifetimePoints: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  inactiveCustomers: number;
  vipCustomers: number;
  averageSpending: number;
  totalSpending: number;
  bronzeCount: number;
  silverCount: number;
  goldCount: number;
  platinumCount: number;
  diamondCount: number;
}

// ── Result types ─────────────────────────────────────────────────────────────

export type GetCustomersResult =
  | { success: true; data: CustomerListItem[] }
  | { success: false; error: CustomerServiceError };

export type GetCustomerByIdResult =
  | { success: true; data: CustomerDetail }
  | { success: false; error: CustomerServiceError };

export type CreateCustomerResult =
  | { success: true; data: CustomerDetail }
  | { success: false; error: CustomerServiceError };

export type UpdateCustomerResult =
  | { success: true }
  | { success: false; error: CustomerServiceError };

export type DeleteCustomerResult =
  | { success: true }
  | { success: false; error: CustomerServiceError };

export type GetAnalyticsResult =
  | { success: true; data: CustomerAnalytics }
  | { success: false; error: CustomerServiceError };

// ── Query options ─────────────────────────────────────────────────────────────

export type CustomerSortField =
  | "created_at"
  | "updated_at"
  | "first_name"
  | "total_visits"
  | "total_spending"
  | "loyalty_points";

export type CustomerSortOrder = "asc" | "desc";

export interface GetCustomersOptions {
  search?: string;
  loyaltyTier?: LoyaltyTier | null;
  status?: CustomerStatus | null;
  sortField?: CustomerSortField;
  sortOrder?: CustomerSortOrder;
  page?: number;
  pageSize?: number;
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function getCustomers(
  options: GetCustomersOptions = {},
): Promise<GetCustomersResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      search,
      loyaltyTier,
      status,
      sortField = "created_at",
      sortOrder = "desc",
      page = 1,
      pageSize = 50,
    } = options;

    let query = supabase
      .from("customers")
      .select(
        "id, first_name, last_name, avatar, phone, email, loyalty_tier, loyalty_points, total_visits, total_spending, status, created_at, updated_at",
      );

    if (search) {
      const s = `%${search}%`;
      query = query.or(
        `first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s},phone.ilike.${s}`,
      );
    }

    if (loyaltyTier) {
      query = query.eq("loyalty_tier", loyaltyTier);
    }

    if (status) {
      query = query.eq("status", status);
    }

    query = query
      .order(sortField, { ascending: sortOrder === "asc" })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error } = await query;

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    return {
      success: true,
      data: data.map(mapListRow),
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

export async function getCustomerById(id: string): Promise<GetCustomerByIdResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    if (!data) {
      return {
        success: false,
        error: { code: "not_found", message: "This customer no longer exists." },
      };
    }

    return { success: true, data: mapDetailRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  anniversary: string | null;
  preferredLanguage: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<CreateCustomerResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("customers")
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        email: input.email,
        birth_date: input.birthDate,
        anniversary: input.anniversary,
        preferred_language: input.preferredLanguage,
        address: input.address,
        city: input.city,
        country: input.country,
        loyalty_tier: "bronze",
        loyalty_points: 0,
        lifetime_points: 0,
        total_visits: 0,
        total_spending: 0,
        status: "active",
      })
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "save") };
    }

    return { success: true, data: mapDetailRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

export interface UpdateCustomerInput {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  anniversary: string | null;
  preferredLanguage: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: CustomerStatus;
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<UpdateCustomerResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("customers")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        email: input.email,
        birth_date: input.birthDate,
        anniversary: input.anniversary,
        preferred_language: input.preferredLanguage,
        address: input.address,
        city: input.city,
        country: input.country,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: mapPostgrestError(error, "save") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

export async function deleteCustomer(id: string): Promise<DeleteCustomerResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) {
      return { success: false, error: mapPostgrestError(error, "delete") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "delete") };
  }
}

export async function getCustomerAnalytics(): Promise<GetAnalyticsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("customers")
      .select(
        "status, loyalty_tier, total_spending, created_at",
      );

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const analytics: CustomerAnalytics = {
      totalCustomers: data.length,
      newThisMonth: data.filter((r) => r.created_at >= monthStart).length,
      activeCustomers: data.filter((r) => r.status === "active").length,
      inactiveCustomers: data.filter((r) => r.status === "inactive").length,
      vipCustomers: data.filter(
        (r) => r.loyalty_tier === "platinum" || r.loyalty_tier === "diamond",
      ).length,
      averageSpending:
        data.length > 0
          ? data.reduce((s, r) => s + (r.total_spending ?? 0), 0) / data.length
          : 0,
      totalSpending: data.reduce((s, r) => s + (r.total_spending ?? 0), 0),
      bronzeCount: data.filter((r) => r.loyalty_tier === "bronze").length,
      silverCount: data.filter((r) => r.loyalty_tier === "silver").length,
      goldCount: data.filter((r) => r.loyalty_tier === "gold").length,
      platinumCount: data.filter((r) => r.loyalty_tier === "platinum").length,
      diamondCount: data.filter((r) => r.loyalty_tier === "diamond").length,
    };

    return { success: true, data: analytics };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListRow(row: Record<string, any>): CustomerListItem {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    avatar: row.avatar,
    phone: row.phone,
    email: row.email,
    loyaltyTier: (row.loyalty_tier ?? "bronze") as LoyaltyTier,
    loyaltyPoints: row.loyalty_points ?? 0,
    totalVisits: row.total_visits ?? 0,
    totalSpending: row.total_spending ?? 0,
    status: (row.status ?? "active") as CustomerStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDetailRow(row: Record<string, any>): CustomerDetail {
  return {
    ...mapListRow(row),
    birthDate: row.birth_date,
    anniversary: row.anniversary,
    preferredLanguage: row.preferred_language,
    address: row.address,
    city: row.city,
    country: row.country,
    lifetimePoints: row.lifetime_points ?? 0,
  };
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete",
): CustomerServiceError {
  console.error(`[customers.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save that customer. Please try again."
        : context === "delete"
          ? "We couldn't delete that customer. Please try again."
          : "We couldn't load customers right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "delete",
): CustomerServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "Something went wrong saving that customer. Please try again."
        : context === "delete"
          ? "Something went wrong deleting that customer. Please try again."
          : "Something went wrong loading customers. Please try again.",
  };
}

/** Loyalty tier thresholds (lifetime points). */
export const LOYALTY_THRESHOLDS: Record<LoyaltyTier, number> = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
  diamond: 15000,
};

/** Resolve the tier for a given lifetime points total. */
export function resolveLoyaltyTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= LOYALTY_THRESHOLDS.diamond) return "diamond";
  if (lifetimePoints >= LOYALTY_THRESHOLDS.platinum) return "platinum";
  if (lifetimePoints >= LOYALTY_THRESHOLDS.gold) return "gold";
  if (lifetimePoints >= LOYALTY_THRESHOLDS.silver) return "silver";
  return "bronze";
}
