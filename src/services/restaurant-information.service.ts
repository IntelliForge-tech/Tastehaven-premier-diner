import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Restaurant Information service — Phase 12C.
 *
 * Manages the restaurant_info singleton row and the 7 opening_hours rows.
 * Follows the exact same pattern as hero.service.ts and about.service.ts:
 * UI components call this service and receive UI-safe result types.
 *
 * The singleton id is fixed so there is always exactly one row, upserted
 * on every save. Opening hours are updated individually by day_of_week.
 */

export type RestaurantInfoServiceErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface RestaurantInfoServiceError {
  code: RestaurantInfoServiceErrorCode;
  message: string;
}

// ── Restaurant Information ────────────────────────────────────────────────────

export interface RestaurantInformation {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  shortDescription: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  googleMapsUrl: string | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  primaryEmail: string | null;
  secondaryEmail: string | null;
  whatsappNumber: string | null;
  reservationPhone: string | null;
  reservationEmail: string | null;
  websiteUrl: string | null;
  priceRange: string | null;
  cuisineType: string | null;
  establishedYear: string | null;
  holidayNotice: string | null;
  specialAnnouncement: string | null;
  reservationMessage: string | null;
  deliveryAvailable: boolean;
  takeawayAvailable: boolean;
  outdoorSeating: boolean;
  privateDining: boolean;
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
  petFriendly: boolean;
  updatedAt: string;
}

// ── Opening Hours ─────────────────────────────────────────────────────────────

/** 0 = Sunday, 1 = Monday … 6 = Saturday (matches JS Date.getDay()). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const ORDERED_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

export interface OpeningHour {
  id: string;
  dayOfWeek: DayOfWeek;
  dayName: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

// ── Combined result type ──────────────────────────────────────────────────────

export interface RestaurantInformationData {
  info: RestaurantInformation;
  hours: OpeningHour[];
}

export type GetRestaurantInformationResult =
  | { success: true; data: RestaurantInformationData }
  | { success: false; error: RestaurantInfoServiceError };

export async function getRestaurantInformation(): Promise<GetRestaurantInformationResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const [infoResult, hoursResult] = await Promise.all([
      supabase
        .from("restaurant_info")
        .select("*")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("opening_hours")
        .select("id, day_of_week, open_time, close_time, is_closed, updated_at")
        .order("day_of_week", { ascending: true }),
    ]);

    if (infoResult.error) {
      return { success: false, error: mapPostgrestError(infoResult.error, "load") };
    }

    if (!infoResult.data) {
      return {
        success: false,
        error: { code: "not_found", message: "No restaurant information found." },
      };
    }

    if (hoursResult.error) {
      return { success: false, error: mapPostgrestError(hoursResult.error, "load") };
    }

    return {
      success: true,
      data: {
        info: mapInfoRow(infoResult.data),
        hours: mapHoursRows(hoursResult.data ?? []),
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

// ── Update ────────────────────────────────────────────────────────────────────

export interface UpdateRestaurantInformationInput {
  name: string;
  tagline: string | null;
  description: string | null;
  shortDescription: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  googleMapsUrl: string | null;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  primaryEmail: string | null;
  secondaryEmail: string | null;
  whatsappNumber: string | null;
  reservationPhone: string | null;
  reservationEmail: string | null;
  websiteUrl: string | null;
  priceRange: string | null;
  cuisineType: string | null;
  establishedYear: string | null;
  holidayNotice: string | null;
  specialAnnouncement: string | null;
  reservationMessage: string | null;
  deliveryAvailable: boolean;
  takeawayAvailable: boolean;
  outdoorSeating: boolean;
  privateDining: boolean;
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
  petFriendly: boolean;
  hours: Array<{
    id: string;
    dayOfWeek: DayOfWeek;
    openTime: string | null;
    closeTime: string | null;
    isClosed: boolean;
  }>;
}

export type UpdateRestaurantInformationResult =
  | { success: true }
  | { success: false; error: RestaurantInfoServiceError };

export async function updateRestaurantInformation(
  input: UpdateRestaurantInformationInput,
): Promise<UpdateRestaurantInformationResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error: infoError } = await supabase.from("restaurant_info").upsert(
      {
        id: RESTAURANT_SINGLETON_ID,
        name: input.name,
        tagline: input.tagline,
        description: input.description,
        short_description: input.shortDescription,
        street_address: input.streetAddress,
        city: input.city,
        state: input.state,
        country: input.country,
        postal_code: input.postalCode,
        google_maps_url: input.googleMapsUrl,
        primary_phone: input.primaryPhone,
        secondary_phone: input.secondaryPhone,
        primary_email: input.primaryEmail,
        secondary_email: input.secondaryEmail,
        whatsapp_number: input.whatsappNumber,
        reservation_phone: input.reservationPhone,
        reservation_email: input.reservationEmail,
        website_url: input.websiteUrl,
        price_range: input.priceRange,
        cuisine_type: input.cuisineType,
        established_year: input.establishedYear,
        holiday_notice: input.holidayNotice,
        special_announcement: input.specialAnnouncement,
        reservation_message: input.reservationMessage,
        delivery_available: input.deliveryAvailable,
        takeaway_available: input.takeawayAvailable,
        outdoor_seating: input.outdoorSeating,
        private_dining: input.privateDining,
        parking_available: input.parkingAvailable,
        wheelchair_accessible: input.wheelchairAccessible,
        pet_friendly: input.petFriendly,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (infoError) {
      return { success: false, error: mapPostgrestError(infoError, "save") };
    }

    // Upsert all 7 opening hours rows
    const hoursRows = input.hours.map((h) => ({
      id: h.id,
      day_of_week: h.dayOfWeek,
      open_time: h.isClosed ? null : h.openTime,
      close_time: h.isClosed ? null : h.closeTime,
      is_closed: h.isClosed,
      updated_at: new Date().toISOString(),
    }));

    const { error: hoursError } = await supabase
      .from("opening_hours")
      .upsert(hoursRows, { onConflict: "id" });

    if (hoursError) {
      return { success: false, error: mapPostgrestError(hoursError, "save") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

export const RESTAURANT_SINGLETON_ID = "00000000-0000-0000-0000-000000000003";

type InfoRow = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  short_description: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  google_maps_url: string | null;
  primary_phone: string | null;
  secondary_phone: string | null;
  primary_email: string | null;
  secondary_email: string | null;
  whatsapp_number: string | null;
  reservation_phone: string | null;
  reservation_email: string | null;
  website_url: string | null;
  price_range: string | null;
  cuisine_type: string | null;
  established_year: string | null;
  holiday_notice: string | null;
  special_announcement: string | null;
  reservation_message: string | null;
  delivery_available: boolean;
  takeaway_available: boolean;
  outdoor_seating: boolean;
  private_dining: boolean;
  parking_available: boolean;
  wheelchair_accessible: boolean;
  pet_friendly: boolean;
  updated_at: string;
};

function mapInfoRow(row: InfoRow): RestaurantInformation {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    shortDescription: row.short_description,
    streetAddress: row.street_address,
    city: row.city,
    state: row.state,
    country: row.country,
    postalCode: row.postal_code,
    googleMapsUrl: row.google_maps_url,
    primaryPhone: row.primary_phone,
    secondaryPhone: row.secondary_phone,
    primaryEmail: row.primary_email,
    secondaryEmail: row.secondary_email,
    whatsappNumber: row.whatsapp_number,
    reservationPhone: row.reservation_phone,
    reservationEmail: row.reservation_email,
    websiteUrl: row.website_url,
    priceRange: row.price_range,
    cuisineType: row.cuisine_type,
    establishedYear: row.established_year,
    holidayNotice: row.holiday_notice,
    specialAnnouncement: row.special_announcement,
    reservationMessage: row.reservation_message,
    deliveryAvailable: row.delivery_available ?? false,
    takeawayAvailable: row.takeaway_available ?? false,
    outdoorSeating: row.outdoor_seating ?? false,
    privateDining: row.private_dining ?? false,
    parkingAvailable: row.parking_available ?? false,
    wheelchairAccessible: row.wheelchair_accessible ?? false,
    petFriendly: row.pet_friendly ?? false,
    updatedAt: row.updated_at,
  };
}

type HourRow = {
  id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  updated_at: string;
};

const HOUR_SINGLETON_IDS: Record<DayOfWeek, string> = {
  0: "00000000-0000-0000-0001-000000000000",
  1: "00000000-0000-0000-0001-000000000001",
  2: "00000000-0000-0000-0001-000000000002",
  3: "00000000-0000-0000-0001-000000000003",
  4: "00000000-0000-0000-0001-000000000004",
  5: "00000000-0000-0000-0001-000000000005",
  6: "00000000-0000-0000-0001-000000000006",
};

function mapHoursRows(rows: HourRow[]): OpeningHour[] {
  // Build a map of existing rows by day_of_week
  const byDay = new Map<number, HourRow>(rows.map((r) => [r.day_of_week, r]));

  // Return all 7 days, filling in defaults for missing rows
  return ([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => {
    const row = byDay.get(day);
    return {
      id: row?.id ?? HOUR_SINGLETON_IDS[day],
      dayOfWeek: day,
      dayName: DAY_NAMES[day],
      openTime: row?.open_time ?? "17:00",
      closeTime: row?.close_time ?? "23:00",
      isClosed: row?.is_closed ?? false,
    };
  });
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" = "load",
): RestaurantInfoServiceError {
  console.error(`[restaurant-information.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save the restaurant information. Please try again."
        : "We couldn't load restaurant information right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" = "load",
): RestaurantInfoServiceError {
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
        ? "Something went wrong saving restaurant information. Please try again."
        : "Something went wrong loading restaurant information. Please try again.",
  };
}

/** Default data matching existing hardcoded constants. */
export const DEFAULT_RESTAURANT_INFO: RestaurantInformation = {
  id: RESTAURANT_SINGLETON_ID,
  name: "Taste Haven",
  tagline: "Fresh ingredients, memorable experiences.",
  description:
    "Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings.",
  shortDescription: "Fresh ingredients, memorable experiences — since 2012.",
  streetAddress: "42 Amber Street",
  city: "San Francisco",
  state: "CA",
  country: "USA",
  postalCode: "94103",
  googleMapsUrl: "https://www.google.com/maps?q=San+Francisco+downtown",
  primaryPhone: "+1 (415) 555 0138",
  secondaryPhone: null,
  primaryEmail: "hello@tastehaven.co",
  secondaryEmail: null,
  whatsappNumber: null,
  reservationPhone: "+1 (415) 555 0138",
  reservationEmail: "reservations@tastehaven.co",
  websiteUrl: "https://tastehaven.co",
  priceRange: "$$",
  cuisineType: "Contemporary American",
  establishedYear: "2012",
  holidayNotice: null,
  specialAnnouncement: null,
  reservationMessage:
    "Reservations open daily from 5 PM. For groups of 8+, please call us directly.",
  deliveryAvailable: false,
  takeawayAvailable: true,
  outdoorSeating: true,
  privateDining: true,
  parkingAvailable: true,
  wheelchairAccessible: true,
  petFriendly: false,
  updatedAt: "",
};

export const DEFAULT_OPENING_HOURS: OpeningHour[] = [
  { id: "00000000-0000-0000-0001-000000000001", dayOfWeek: 1, dayName: "Monday", openTime: "17:00", closeTime: "23:00", isClosed: false },
  { id: "00000000-0000-0000-0001-000000000002", dayOfWeek: 2, dayName: "Tuesday", openTime: "17:00", closeTime: "23:00", isClosed: false },
  { id: "00000000-0000-0000-0001-000000000003", dayOfWeek: 3, dayName: "Wednesday", openTime: "17:00", closeTime: "23:00", isClosed: false },
  { id: "00000000-0000-0000-0001-000000000004", dayOfWeek: 4, dayName: "Thursday", openTime: "17:00", closeTime: "23:00", isClosed: false },
  { id: "00000000-0000-0000-0001-000000000005", dayOfWeek: 5, dayName: "Friday", openTime: "17:00", closeTime: "01:00", isClosed: false },
  { id: "00000000-0000-0000-0001-000000000006", dayOfWeek: 6, dayName: "Saturday", openTime: "17:00", closeTime: "01:00", isClosed: false },
  { id: "00000000-0000-0000-0001-000000000000", dayOfWeek: 0, dayName: "Sunday", openTime: "16:00", closeTime: "23:00", isClosed: false },
];
