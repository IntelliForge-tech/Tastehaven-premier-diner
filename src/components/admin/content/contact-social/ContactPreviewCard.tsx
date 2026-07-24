import { Mail, MapPin, Phone } from "lucide-react";

import { Card } from "@/components/common/Card";
import type { ContactInformation } from "@/services/contact-information.service";

interface ContactPreviewCardProps {
  data: ContactInformation;
}

export function ContactPreviewCard({ data }: ContactPreviewCardProps) {
  const fullAddress = [
    data.streetAddress,
    data.area,
    data.city,
    data.state,
    data.postalCode,
    data.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Currently Published
        </p>
      </div>
      <div className="divide-y divide-border">
        <PreviewRow
          icon={<Phone className="size-3.5" />}
          label="Primary Phone"
          value={data.primaryPhone}
        />
        <PreviewRow
          icon={<Mail className="size-3.5" />}
          label="Primary Email"
          value={data.primaryEmail}
        />
        <PreviewRow
          icon={<MapPin className="size-3.5" />}
          label="Address"
          value={fullAddress || null}
        />
        {data.whatsappNumber && (
          <PreviewRow
            icon={<span className="text-[11px]"><i className="fa-brands fa-whatsapp" /></span>}
            label="WhatsApp"
            value={data.whatsappNumber}
          />
        )}
        {data.googleMapsUrl && (
          <PreviewRow
            icon={<span className="text-[11px]"><i className="fa-solid fa-map" /></span>}
            label="Google Maps"
            value={
              <a
                href={data.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-primary hover:underline"
              >
                View map
              </a>
            }
          />
        )}
        {data.businessHoursNote && (
          <PreviewRow
            icon={<span className="text-[11px]"><i className="fa-solid fa-clock" /></span>}
            label="Hours Note"
            value={data.businessHoursNote}
          />
        )}
      </div>

      {/* Feature toggle summary */}
      <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
        {[
          { label: "Call Button", on: data.callButtonEnabled },
          { label: "Email Button", on: data.emailButtonEnabled },
          { label: "WhatsApp Button", on: data.whatsappButtonEnabled },
          { label: "Reservations", on: data.reservationContactEnabled },
          { label: "Live Chat", on: data.liveChatEnabled },
        ].map(({ label, on }) => (
          <span
            key={label}
            className={[
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              on
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {label}: {on ? "On" : "Off"}
          </span>
        ))}
      </div>
    </Card>
  );
}

interface PreviewRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode | null;
}

function PreviewRow({ icon, label, value }: PreviewRowProps) {
  return (
    <div className="flex items-start gap-4 px-5 py-2.5 text-sm">
      <span className="mt-0.5 flex w-4 shrink-0 items-center text-muted-foreground">{icon}</span>
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words text-foreground">
        {value ?? <span className="italic text-muted-foreground/60">Not set</span>}
      </span>
    </div>
  );
}
