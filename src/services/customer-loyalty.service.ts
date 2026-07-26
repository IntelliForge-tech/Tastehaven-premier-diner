import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { resolveLoyaltyTier } from "@/services/customers.service";
import type { CustomerServiceError } from "@/services/customers.service";

export type LoyaltyAction = "earned" | "redeemed" | "adjusted" | "expired";

export interface LoyaltyHistoryEntry {
  id: string;
  customerId: string;
  points: number;
  action: LoyaltyAction;
  description: string | null;
  createdAt: string;
}

export type GetLoyaltyHistoryResult =
  | { success: true; data: LoyaltyHistoryEntry[] }
  | { success: false; error: CustomerServiceError };

export type AdjustPointsResult =
  | { success: true; newPoints: number; newTier: string }
  | { success: false; error: CustomerServiceError };

export async function getLoyaltyHistory(
  customerId: string,
): Promise<GetLoyaltyHistoryResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("customer_loyalty_history")
      .select("id, customer_id, points, action, description, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return { success: false, error: mapErr(error, "load") };

    return {
      success: true,
      data: data.map((r) => ({
        id: r.id,
        customerId: r.customer_id,
        points: r.points,
        action: r.action as LoyaltyAction,
        description: r.description,
        createdAt: r.created_at,
      })),
    };
  } catch (err) {
    return { success: false, error: unexpectedErr(err) };
  }
}

export async function adjustLoyaltyPoints(
  customerId: string,
  pointsDelta: number,
  action: LoyaltyAction,
  description: string | null,
): Promise<AdjustPointsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    // Fetch current points and lifetime_points.
    const { data: customer, error: fetchErr } = await supabase
      .from("customers")
      .select("loyalty_points, lifetime_points")
      .eq("id", customerId)
      .single();

    if (fetchErr || !customer) {
      return {
        success: false,
        error: { code: "not_found", message: "Customer not found." },
      };
    }

    const newPoints = Math.max(0, (customer.loyalty_points ?? 0) + pointsDelta);
    const newLifetimePoints =
      action === "earned"
        ? (customer.lifetime_points ?? 0) + pointsDelta
        : customer.lifetime_points ?? 0;
    const newTier = resolveLoyaltyTier(newLifetimePoints);

    // Update customer row.
    const { error: updateErr } = await supabase
      .from("customers")
      .update({
        loyalty_points: newPoints,
        lifetime_points: newLifetimePoints,
        loyalty_tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    if (updateErr) return { success: false, error: mapErr(updateErr, "save") };

    // Insert history entry.
    const { error: histErr } = await supabase
      .from("customer_loyalty_history")
      .insert({
        customer_id: customerId,
        points: pointsDelta,
        action,
        description,
      });

    if (histErr) {
      console.error("[customer-loyalty.service] history insert failed:", histErr.message);
    }

    return { success: true, newPoints, newTier };
  } catch (err) {
    return { success: false, error: unexpectedErr(err) };
  }
}

function mapErr(err: PostgrestError, ctx: string): CustomerServiceError {
  console.error(`[customer-loyalty.service] ${ctx}:`, err.message);
  return {
    code: "unexpected_error",
    message:
      ctx === "save"
        ? "We couldn't update loyalty points. Please try again."
        : "We couldn't load loyalty history. Please try again.",
  };
}

function unexpectedErr(err: unknown): CustomerServiceError {
  if (err instanceof TypeError)
    return { code: "network_error", message: "Network error. Please try again." };
  return { code: "unexpected_error", message: "Something went wrong. Please try again." };
}

/** Points earned per 100 units of currency (configurable via DB later). */
export const POINTS_PER_100 = 10;
