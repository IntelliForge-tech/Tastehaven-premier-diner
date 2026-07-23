import { useEffect, useRef, useState } from "react";

import {
  updateRestaurantInformation,
  type DayOfWeek,
  type RestaurantInfoServiceError,
  type UpdateRestaurantInformationInput,
} from "@/services/restaurant-information.service";

export interface UpdateRestaurantInformationFormValues {
  name: string;
  tagline: string;
  description: string;
  shortDescription: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  googleMapsUrl: string;
  primaryPhone: string;
  secondaryPhone: string;
  primaryEmail: string;
  secondaryEmail: string;
  whatsappNumber: string;
  reservationPhone: string;
  reservationEmail: string;
  websiteUrl: string;
  priceRange: string;
  cuisineType: string;
  establishedYear: string;
  holidayNotice: string;
  specialAnnouncement: string;
  reservationMessage: string;
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
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}

export type UpdateRestaurantInformationOutcome =
  | { success: true }
  | { success: false; error: RestaurantInfoServiceError };

export interface UseUpdateRestaurantInformationResult {
  isSubmitting: boolean;
  updateItem: (
    values: UpdateRestaurantInformationFormValues,
  ) => Promise<UpdateRestaurantInformationOutcome>;
}

/**
 * Orchestrates the restaurant information update flow.
 * Mirrors useUpdateAbout() / useUpdateHero(): wraps the service call,
 * manages submitting state, handles mount guard.
 */
export function useUpdateRestaurantInformation(): UseUpdateRestaurantInformationResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateItem(
    values: UpdateRestaurantInformationFormValues,
  ): Promise<UpdateRestaurantInformationOutcome> {
    setIsSubmitting(true);

    try {
      const input: UpdateRestaurantInformationInput = {
        name: values.name,
        tagline: values.tagline.trim() || null,
        description: values.description.trim() || null,
        shortDescription: values.shortDescription.trim() || null,
        streetAddress: values.streetAddress.trim() || null,
        city: values.city.trim() || null,
        state: values.state.trim() || null,
        country: values.country.trim() || null,
        postalCode: values.postalCode.trim() || null,
        googleMapsUrl: values.googleMapsUrl.trim() || null,
        primaryPhone: values.primaryPhone.trim() || null,
        secondaryPhone: values.secondaryPhone.trim() || null,
        primaryEmail: values.primaryEmail.trim() || null,
        secondaryEmail: values.secondaryEmail.trim() || null,
        whatsappNumber: values.whatsappNumber.trim() || null,
        reservationPhone: values.reservationPhone.trim() || null,
        reservationEmail: values.reservationEmail.trim() || null,
        websiteUrl: values.websiteUrl.trim() || null,
        priceRange: values.priceRange.trim() || null,
        cuisineType: values.cuisineType.trim() || null,
        establishedYear: values.establishedYear.trim() || null,
        holidayNotice: values.holidayNotice.trim() || null,
        specialAnnouncement: values.specialAnnouncement.trim() || null,
        reservationMessage: values.reservationMessage.trim() || null,
        deliveryAvailable: values.deliveryAvailable,
        takeawayAvailable: values.takeawayAvailable,
        outdoorSeating: values.outdoorSeating,
        privateDining: values.privateDining,
        parkingAvailable: values.parkingAvailable,
        wheelchairAccessible: values.wheelchairAccessible,
        petFriendly: values.petFriendly,
        hours: values.hours.map((h) => ({
          id: h.id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime || null,
          closeTime: h.closeTime || null,
          isClosed: h.isClosed,
        })),
      };

      const result = await updateRestaurantInformation(input);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }

  return { isSubmitting, updateItem };
}
