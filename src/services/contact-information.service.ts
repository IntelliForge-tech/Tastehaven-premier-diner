import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type ContactInfoErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface ContactInfoError {
  code: ContactInfoErrorCode;
  message: string;
}

export interface ContactInformation {
  id: string;
  // Phone
  primaryPhone: string;
  secondaryPhone: string | null;
  whatsappNumber: string | null;
  reservationPhone: string | null;
  // Email
  primaryEmail: string;
  secondaryEmail: string | null;
  customerSupportEmail: string | null;
  // Address
  streetAddress: string;
  area: string | null;
  city: string;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  // Links
  googleMapsUrl: string | null;
  websiteUrl: string | null;
  // Messaging
  businessHoursNote: string | null;
  emergencyContact: string | null;
  customerServiceMessage: string | null;
  responseTimeMessage: string | null;
  // Feature toggles
  liveChatEnabled: boolean;
  reservationContactEnabled: boolean;
  whatsappButtonEnabled: boolean;
  callButtonEnabled: boolean;
  emailButtonEnabled: boolean;
  updatedAt: string;
}

export type GetContactInformationResult =
  | { success: true; data: ContactInformation }
  | { success: false; error: ContactInfoError };

export async function getContactInformation(): Promise<GetContactInformationResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("contact_information")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, error: mapPostgrestError(error, "load") };
    if (!data) return { success: false, error: { code: "not_found", message: "No contact information found." } };

    return { success: true, data: mapRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export type UpdateContactInformationInput = Omit<ContactInformation, "id" | "updatedAt">;

export type UpdateContactInformationResult =
  | { success: true }
  | { success: false; error: ContactInfoError };

const CONTACT_INFO_SINGLETON_ID = "00000000-0000-0000-0000-000000000020";

export async function updateContactInformation(
  input: UpdateContactInformationInput,
): Promise<UpdateContactInformationResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("contact_information").upsert(
      {
        id: CONTACT_INFO_SINGLETON_ID,
        primary_phone: input.primaryPhone,
        secondary_phone: input.secondaryPhone || null,
        whatsapp_number: input.whatsappNumber || null,
        reservation_phone: input.reservationPhone || null,
        primary_email: input.primaryEmail,
        secondary_email: input.secondaryEmail || null,
        customer_support_email: input.customerSupportEmail || null,
        street_address: input.streetAddress,
        area: input.area || null,
        city: input.city,
        state: input.state || null,
        country: input.country || null,
        postal_code: input.postalCode || null,
        google_maps_url: input.googleMapsUrl || null,
        website_url: input.websiteUrl || null,
        business_hours_note: input.businessHoursNote || null,
        emergency_contact: input.emergencyContact || null,
        customer_service_message: input.customerServiceMessage || null,
        response_time_message: input.responseTimeMessage || null,
        live_chat_enabled: input.liveChatEnabled,
        reservation_contact_enabled: input.reservationContactEnabled,
        whatsapp_button_enabled: input.whatsappButtonEnabled,
        call_button_enabled: input.callButtonEnabled,
        email_button_enabled: input.emailButtonEnabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) return { success: false, error: mapPostgrestError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

type ContactInfoRow = {
  id: string;
  primary_phone: string;
  secondary_phone: string | null;
  whatsapp_number: string | null;
  reservation_phone: string | null;
  primary_email: string;
  secondary_email: string | null;
  customer_support_email: string | null;
  street_address: string;
  area: string | null;
  city: string;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  google_maps_url: string | null;
  website_url: string | null;
  business_hours_note: string | null;
  emergency_contact: string | null;
  customer_service_message: string | null;
  response_time_message: string | null;
  live_chat_enabled: boolean;
  reservation_contact_enabled: boolean;
  whatsapp_button_enabled: boolean;
  call_button_enabled: boolean;
  email_button_enabled: boolean;
  updated_at: string;
};

function mapRow(row: ContactInfoRow): ContactInformation {
  return {
    id: row.id,
    primaryPhone: row.primary_phone,
    secondaryPhone: row.secondary_phone,
    whatsappNumber: row.whatsapp_number,
    reservationPhone: row.reservation_phone,
    primaryEmail: row.primary_email,
    secondaryEmail: row.secondary_email,
    customerSupportEmail: row.customer_support_email,
    streetAddress: row.street_address,
    area: row.area,
    city: row.city,
    state: row.state,
    country: row.country,
    postalCode: row.postal_code,
    googleMapsUrl: row.google_maps_url,
    websiteUrl: row.website_url,
    businessHoursNote: row.business_hours_note,
    emergencyContact: row.emergency_contact,
    customerServiceMessage: row.customer_service_message,
    responseTimeMessage: row.response_time_message,
    liveChatEnabled: row.live_chat_enabled ?? false,
    reservationContactEnabled: row.reservation_contact_enabled ?? true,
    whatsappButtonEnabled: row.whatsapp_button_enabled ?? false,
    callButtonEnabled: row.call_button_enabled ?? true,
    emailButtonEnabled: row.email_button_enabled ?? true,
    updatedAt: row.updated_at,
  };
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save",
): ContactInfoError {
  console.error(`[contact-information.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save the contact information. Please try again."
        : "We couldn't load contact information right now. Please try again.",
  };
}

function mapUnexpectedError(err: unknown): ContactInfoError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong. Please try again.",
  };
}
