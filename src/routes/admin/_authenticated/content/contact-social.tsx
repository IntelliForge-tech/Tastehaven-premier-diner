import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useRef } from "react";

import { ContactInformationForm } from "@/components/admin/content/contact-social/ContactInformationForm";
import { ContactPreviewCard } from "@/components/admin/content/contact-social/ContactPreviewCard";
import { SocialLinksForm } from "@/components/admin/content/contact-social/SocialLinksForm";
import { SocialPreviewCard } from "@/components/admin/content/contact-social/SocialPreviewCard";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useContactInformation } from "@/hooks/useContactInformation";
import { useContactSocialLinks } from "@/hooks/useContactSocialLinks";
import type { ContactInformation } from "@/services/contact-information.service";

export const Route = createFileRoute(
  "/admin/_authenticated/content/contact-social",
)({
  component: AdminContactSocialPage,
  head: () => ({
    meta: [{ title: "Contact & Social — Admin — Taste Haven" }],
  }),
});

const DEFAULT_CONTACT: ContactInformation = {
  id: "",
  primaryPhone: "+1 (415) 555 0138",
  secondaryPhone: null,
  whatsappNumber: null,
  reservationPhone: null,
  primaryEmail: "hello@tastehaven.co",
  secondaryEmail: null,
  customerSupportEmail: null,
  streetAddress: "42 Amber Street",
  area: "Downtown District",
  city: "San Francisco",
  state: "CA",
  country: "United States",
  postalCode: "94103",
  googleMapsUrl: null,
  websiteUrl: null,
  businessHoursNote: null,
  emergencyContact: null,
  customerServiceMessage: null,
  responseTimeMessage: null,
  liveChatEnabled: false,
  reservationContactEnabled: true,
  whatsappButtonEnabled: false,
  callButtonEnabled: true,
  emailButtonEnabled: true,
  updatedAt: "",
};

function AdminContactSocialPage() {
  const {
    contactInfo,
    isLoading: contactLoading,
    error: contactError,
    refetch: refetchContact,
  } = useContactInformation();

  const {
    socialLinks,
    isLoading: socialLoading,
    error: socialError,
    refetch: refetchSocial,
  } = useContactSocialLinks();

  const isDirtyRef = useRef(false);

  useBlocker({
    blockerFn: () =>
      window.confirm(
        "You have unsaved changes. Leave anyway and discard them?",
      ),
    condition: isDirtyRef.current,
  });

  const isLoading = contactLoading || socialLoading;
  const hasError =
    (contactError && contactError.code !== "not_found") ||
    (socialError && socialError.code !== "not_found");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Contact & Social" />
        <PageHeader
          title="Contact & Social"
          description="Manage contact details and social media links shown across the site."
        />
        <ContactSocialSkeleton />
      </div>
    );
  }

  if (hasError) {
    const msg = contactError?.message ?? socialError?.message ?? "Unknown error.";
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Contact & Social" />
        <PageHeader
          title="Contact & Social"
          description="Manage contact details and social media links shown across the site."
        />
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn&apos;t load settings
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">{msg}</p>
            <Button
              type="button"
              variant="outline-gold"
              onClick={() => { refetchContact(); refetchSocial(); }}
              className="mt-1 px-4 py-2"
            >
              Try again
            </Button>
          </div>
        </SectionContainer>
      </div>
    );
  }

  const contactData = contactInfo ?? DEFAULT_CONTACT;

  return (
    <div className="space-y-10">
      <Breadcrumbs page="Contact & Social" />
      <PageHeader
        title="Contact & Social"
        description="Manage contact details and social media links shown across the site."
      />

      {/* ── Contact Information ──────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Contact Information
          </h2>
          <p className="text-sm text-muted-foreground">
            Displayed in the footer, contact section, and CTA areas.
          </p>
        </div>

        <ContactPreviewCard data={contactData} />

        <SectionContainer>
          <ContactInformationForm
            data={contactData}
            onSuccess={refetchContact}
            onDirtyChange={(d) => { isDirtyRef.current = d; }}
          />
        </SectionContainer>
      </section>

      {/* ── Social Links ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Social Media Links
          </h2>
          <p className="text-sm text-muted-foreground">
            Enable platforms to display them in the footer and contact section.
          </p>
        </div>

        <SocialPreviewCard data={socialLinks ?? { id: "", links: [], updatedAt: "" }} />

        <SectionContainer>
          <SocialLinksForm
            data={socialLinks}
            onSuccess={refetchSocial}
            onDirtyChange={(d) => { isDirtyRef.current = isDirtyRef.current || d; }}
          />
        </SectionContainer>
      </section>
    </div>
  );
}

function ContactSocialSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl border border-border bg-muted" />
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-28 rounded bg-muted" />
            <div className="h-10 rounded-lg bg-muted" />
          </div>
        ))}
      </div>
      <div className="h-20 rounded-2xl border border-border bg-muted" />
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
