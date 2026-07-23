import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  restaurantInformationSchema,
  type RestaurantInformationFormInput,
  type RestaurantInformationFormValues,
} from "@/components/admin/content/restaurant-information-schema";
import { OpeningHoursEditor } from "@/components/admin/content/OpeningHoursEditor";
import { Button } from "@/components/common/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useUpdateRestaurantInformation } from "@/hooks/useUpdateRestaurantInformation";
import type { OpeningHour, RestaurantInformation } from "@/services/restaurant-information.service";
import { ORDERED_DAYS } from "@/services/restaurant-information.service";

interface RestaurantInformationFormProps {
  info: RestaurantInformation;
  hours: OpeningHour[];
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * Restaurant Information form — Phase 12C.
 *
 * Tabbed into sections: Restaurant Info, Contact, Opening Hours, Extras.
 * Uses React Hook Form + Zod resolver, reuses every existing UI component,
 * and follows the HeroForm / AboutForm pattern exactly.
 */
export function RestaurantInformationForm({
  info,
  hours,
  onSuccess,
  onDirtyChange,
}: RestaurantInformationFormProps) {
  const { updateItem, isSubmitting } = useUpdateRestaurantInformation();

  // Build sorted hours array (Mon–Sun order)
  const sortedHours = ORDERED_DAYS.map((day) => {
    const h = hours.find((x) => x.dayOfWeek === day);
    return {
      id: h?.id ?? `00000000-0000-0000-0001-00000000000${day}`,
      dayOfWeek: day as RestaurantInformationFormValues["hours"][number]["dayOfWeek"],
      openTime: h?.openTime ?? "17:00",
      closeTime: h?.closeTime ?? "23:00",
      isClosed: h?.isClosed ?? false,
    };
  });

  const defaultValues: RestaurantInformationFormInput = {
    name: info.name,
    tagline: info.tagline ?? "",
    description: info.description ?? "",
    shortDescription: info.shortDescription ?? "",
    streetAddress: info.streetAddress ?? "",
    city: info.city ?? "",
    state: info.state ?? "",
    country: info.country ?? "",
    postalCode: info.postalCode ?? "",
    googleMapsUrl: info.googleMapsUrl ?? "",
    primaryPhone: info.primaryPhone ?? "",
    secondaryPhone: info.secondaryPhone ?? "",
    primaryEmail: info.primaryEmail ?? "",
    secondaryEmail: info.secondaryEmail ?? "",
    whatsappNumber: info.whatsappNumber ?? "",
    reservationPhone: info.reservationPhone ?? "",
    reservationEmail: info.reservationEmail ?? "",
    websiteUrl: info.websiteUrl ?? "",
    priceRange: info.priceRange ?? "",
    cuisineType: info.cuisineType ?? "",
    establishedYear: info.establishedYear ?? "",
    holidayNotice: info.holidayNotice ?? "",
    specialAnnouncement: info.specialAnnouncement ?? "",
    reservationMessage: info.reservationMessage ?? "",
    deliveryAvailable: info.deliveryAvailable,
    takeawayAvailable: info.takeawayAvailable,
    outdoorSeating: info.outdoorSeating,
    privateDining: info.privateDining,
    parkingAvailable: info.parkingAvailable,
    wheelchairAccessible: info.wheelchairAccessible,
    petFriendly: info.petFriendly,
    hours: sortedHours,
  };

  const form = useForm<RestaurantInformationFormInput, unknown, RestaurantInformationFormValues>({
    resolver: zodResolver(restaurantInformationSchema),
    defaultValues,
    mode: "onTouched",
  });

  // Re-sync form when parent refetches after a successful save
  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info, hours]);

  // Notify parent about dirty state for nav blocker
  const isDirty = form.formState.isDirty;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  async function onSubmit(values: RestaurantInformationFormValues) {
    const result = await updateItem(values);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Restaurant information saved successfully.");
    form.reset(values as unknown as RestaurantInformationFormInput);
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
        {/* ── Section: Restaurant Information ─────────────────────── */}
        <section>
          <FormSectionHeading>Restaurant Information</FormSectionHeading>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Restaurant Name <Required />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Taste Haven" maxLength={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Fresh ingredients, memorable experiences."
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormDescription>
                      Shown in the footer and compact layouts.
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="Fresh ingredients, memorable experiences — since 2012." maxLength={300} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Born from a love of the neighborhood market…"
                        rows={4}
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cuisineType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisine Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Contemporary American" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Range</FormLabel>
                  <FormDescription>e.g. $, $$, $$$, $$$$</FormDescription>
                  <FormControl>
                    <Input placeholder="$$" maxLength={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="establishedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Established Year</FormLabel>
                  <FormControl>
                    <Input placeholder="2012" maxLength={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://tastehaven.co" maxLength={500} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        {/* ── Section: Address ────────────────────────────────────── */}
        <section>
          <FormSectionHeading>Address</FormSectionHeading>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="42 Amber Street" maxLength={200} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="San Francisco" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="CA" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="USA" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="94103" maxLength={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="googleMapsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Maps URL</FormLabel>
                    <FormDescription>
                      Paste the embed URL from Google Maps. Used for the map on the Contact section.
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="https://www.google.com/maps?q=..."
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Section: Contact ────────────────────────────────────── */}
        <section>
          <FormSectionHeading>Contact Information</FormSectionHeading>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Primary Phone <Required />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (415) 555 0138" maxLength={30} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (415) 555 0139" maxLength={30} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Primary Email <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="hello@tastehaven.co"
                      maxLength={120}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondaryEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="info@tastehaven.co"
                      maxLength={120}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (415) 555 0138" maxLength={30} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2">
              <Separator className="my-1" />
              <p className="mt-4 mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Reservations
              </p>
            </div>

            <FormField
              control={form.control}
              name="reservationPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reservation Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (415) 555 0138" maxLength={30} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reservationEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reservation Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="reservations@tastehaven.co"
                      maxLength={120}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="reservationMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reservation Message</FormLabel>
                    <FormDescription>
                      Displayed on the public reservation section.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Reservations open daily from 5 PM. For groups of 8+, please call us directly."
                        rows={2}
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Section: Opening Hours ──────────────────────────────── */}
        <section>
          <FormSectionHeading>Opening Hours</FormSectionHeading>
          <p className="mt-1 text-sm text-muted-foreground">
            Times use 24-hour format. Check &quot;Closed&quot; to mark a day as closed.
          </p>
          <div className="mt-4">
            <OpeningHoursEditor />
          </div>
        </section>

        <Separator />

        {/* ── Section: Extra Information ──────────────────────────── */}
        <section>
          <FormSectionHeading>Extra Information</FormSectionHeading>
          <div className="mt-4 space-y-5">
            <FormField
              control={form.control}
              name="holidayNotice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holiday Notice</FormLabel>
                  <FormDescription>
                    Temporary notice shown during holiday periods.
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="We will be closed Dec 24–26 for the holidays."
                      rows={2}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialAnnouncement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Announcement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Now accepting reservations for New Year's Eve dinner."
                      rows={2}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amenities toggles */}
            <div>
              <p className="mb-3 text-sm font-medium">Amenities &amp; Features</p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <AmenityToggle
                  control={form.control}
                  name="deliveryAvailable"
                  label="Delivery Available"
                />
                <AmenityToggle
                  control={form.control}
                  name="takeawayAvailable"
                  label="Takeaway Available"
                />
                <AmenityToggle
                  control={form.control}
                  name="outdoorSeating"
                  label="Outdoor Seating"
                />
                <AmenityToggle
                  control={form.control}
                  name="privateDining"
                  label="Private Dining"
                />
                <AmenityToggle
                  control={form.control}
                  name="parkingAvailable"
                  label="Parking Available"
                />
                <AmenityToggle
                  control={form.control}
                  name="wheelchairAccessible"
                  label="Wheelchair Accessible"
                />
                <AmenityToggle
                  control={form.control}
                  name="petFriendly"
                  label="Pet Friendly"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Button
            type="button"
            variant="outline-gold"
            onClick={() => form.reset(defaultValues)}
            disabled={isSubmitting || !form.formState.isDirty}
            className="gap-2"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset
          </Button>

          <Button
            type="submit"
            variant="gold"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-3.5" aria-hidden="true" />
            )}
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function FormSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
      {children}
    </h3>
  );
}

function Required() {
  return (
    <span className="ml-0.5 text-destructive" aria-hidden="true">
      *
    </span>
  );
}

type AmenityToggleProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  name: keyof RestaurantInformationFormValues;
  label: string;
};

type RestaurantInformationFormValues = import("./restaurant-information-schema").RestaurantInformationFormValues;

function AmenityToggle({ control, name, label }: AmenityToggleProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
          <FormLabel className="cursor-pointer text-sm font-normal">{label}</FormLabel>
          <FormControl>
            <Switch
              checked={field.value as boolean}
              onCheckedChange={field.onChange}
              aria-label={label}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
