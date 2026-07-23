import {
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Utensils,
} from "lucide-react";

import type { OpeningHour, RestaurantInformation } from "@/services/restaurant-information.service";
import { ORDERED_DAYS, DAY_NAMES } from "@/services/restaurant-information.service";
import type { DayOfWeek } from "@/services/restaurant-information.service";

interface RestaurantInformationPreviewCardProps {
  info: RestaurantInformation;
  hours: OpeningHour[];
}

/**
 * Preview card for Restaurant Information CMS (Phase 12C).
 * Mirrors HeroPreviewCard / AboutPreviewCard: read-only snapshot of the
 * currently published data shown above the edit form.
 */
export function RestaurantInformationPreviewCard({
  info,
  hours,
}: RestaurantInformationPreviewCardProps) {
  const fullAddress = [
    info.streetAddress,
    info.city,
    info.state,
    info.postalCode,
    info.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <Utensils className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-tight">
              {info.name || "—"}
            </p>
            {info.tagline && (
              <p className="text-xs text-muted-foreground">{info.tagline}</p>
            )}
          </div>
          <div className="ml-auto flex gap-2 text-xs text-muted-foreground">
            {info.cuisineType && (
              <span className="rounded-full border border-border bg-background px-2 py-0.5">
                {info.cuisineType}
              </span>
            )}
            {info.priceRange && (
              <span className="rounded-full border border-border bg-background px-2 py-0.5">
                {info.priceRange}
              </span>
            )}
            {info.establishedYear && (
              <span className="rounded-full border border-border bg-background px-2 py-0.5">
                Est. {info.establishedYear}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="divide-y divide-border">
        {fullAddress && (
          <PreviewRow icon={<MapPin className="size-3.5" />} label="Address" value={fullAddress} />
        )}
        {info.primaryPhone && (
          <PreviewRow icon={<Phone className="size-3.5" />} label="Primary Phone" value={info.primaryPhone} />
        )}
        {info.primaryEmail && (
          <PreviewRow icon={<Mail className="size-3.5" />} label="Primary Email" value={info.primaryEmail} />
        )}
        {info.websiteUrl && (
          <PreviewRow icon={<Globe className="size-3.5" />} label="Website" value={info.websiteUrl} />
        )}
      </div>

      {/* Opening hours preview */}
      {hours.length > 0 && (
        <div className="border-t border-border px-5 py-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Opening Hours
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
            {ORDERED_DAYS.map((day) => {
              const h = hours.find((x) => x.dayOfWeek === day);
              if (!h) return null;
              return (
                <div key={day} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{DAY_NAMES[day as DayOfWeek].slice(0, 3)}</span>
                  <span className="text-muted-foreground">
                    {h.isClosed
                      ? "Closed"
                      : `${formatTime(h.openTime)} – ${formatTime(h.closeTime)}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Amenities */}
      <div className="border-t border-border px-5 py-3">
        <div className="flex flex-wrap gap-1.5">
          {info.deliveryAvailable && <AmenityBadge label="Delivery" />}
          {info.takeawayAvailable && <AmenityBadge label="Takeaway" />}
          {info.outdoorSeating && <AmenityBadge label="Outdoor Seating" />}
          {info.privateDining && <AmenityBadge label="Private Dining" />}
          {info.parkingAvailable && <AmenityBadge label="Parking" />}
          {info.wheelchairAccessible && <AmenityBadge label="Accessible" />}
          {info.petFriendly && <AmenityBadge label="Pet Friendly" />}
        </div>
      </div>
    </div>
  );
}

function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-2.5">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <span className="mr-2 text-xs text-muted-foreground">{label}</span>
        <span className="break-all text-xs font-medium">{value}</span>
      </div>
    </div>
  );
}

function AmenityBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {label}
    </span>
  );
}

function formatTime(time: string | null): string {
  if (!time) return "—";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${suffix}`;
}
