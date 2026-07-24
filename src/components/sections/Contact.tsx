import { ContactRow } from "@/components/common/ContactRow";
import { SectionTitle } from "@/components/common/SectionTitle";
import { useContactInformation } from "@/hooks/useContactInformation";
import { useContactSocialLinks } from "@/hooks/useContactSocialLinks";
import { CONTACT_DETAILS, SOCIAL_LINKS } from "@/utils/constants";

/**
 * Contact section — Phase 12C.
 *
 * Content is now driven by contact_information and contact_social_links
 * tables via their respective hooks. Falls back to hardcoded constants
 * while loading or when no DB rows exist yet so the page never shows
 * blank content.
 *
 * The Google Maps embed uses the googleMapsUrl from the DB when present;
 * falls back to the original San Francisco downtown query.
 */
export function Contact() {
  const { contactInfo } = useContactInformation();
  const { socialLinks } = useContactSocialLinks();

  // ── Build contact rows from DB or constants fallback ─────────────
  const contactRows = contactInfo
    ? [
        contactInfo.streetAddress
          ? {
              icon: "fa-location-dot",
              title: [
                contactInfo.streetAddress,
                contactInfo.area,
                contactInfo.city,
                contactInfo.state,
                contactInfo.postalCode,
              ]
                .filter(Boolean)
                .join(", "),
            }
          : null,
        contactInfo.primaryPhone
          ? { icon: "fa-phone", title: contactInfo.primaryPhone }
          : null,
        contactInfo.secondaryPhone
          ? { icon: "fa-phone", title: contactInfo.secondaryPhone }
          : null,
        contactInfo.primaryEmail
          ? { icon: "fa-envelope", title: contactInfo.primaryEmail }
          : null,
        contactInfo.businessHoursNote
          ? { icon: "fa-clock", title: contactInfo.businessHoursNote }
          : null,
      ].filter((r): r is { icon: string; title: string } => r !== null)
    : CONTACT_DETAILS.map((c) => ({ icon: c.icon, title: c.title }));

  // ── Build social links from DB or constants fallback ─────────────
  const activeSocials = socialLinks
    ? socialLinks.links.filter((l) => l.enabled && l.url)
    : SOCIAL_LINKS.map((s) => ({
        platform: s,
        label: s,
        url: "#",
        faIcon: `fa-${s}`,
        openInNewTab: false,
      }));

  // ── Maps embed URL ────────────────────────────────────────────────
  const mapsEmbedSrc = contactInfo?.googleMapsUrl
    ? contactInfo.googleMapsUrl.replace("/maps?", "/maps/embed?").replace("/place/", "/maps/embed/v1/place?key=&q=")
    : "https://www.google.com/maps?q=San+Francisco+downtown&output=embed";

  // ── WhatsApp link ─────────────────────────────────────────────────
  const whatsappHref = contactInfo?.whatsappNumber && contactInfo.whatsappButtonEnabled
    ? `https://wa.me/${contactInfo.whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-2">
        <div className="reveal">
          <SectionTitle>Contact</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Come find us.</h2>
          <p className="mt-4 text-muted-foreground">
            {contactInfo?.customerServiceMessage ??
              "Two blocks from the riverfront, tucked behind the old amber lamp post."}
          </p>

          <div className="mt-8 space-y-3">
            {contactRows.map((c) => (
              <ContactRow key={`${c.icon}-${c.title}`} icon={c.icon} title={c.title} />
            ))}
          </div>

          {/* WhatsApp CTA */}
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              <i className="fa-brands fa-whatsapp text-base" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          )}

          {/* Social icons */}
          {activeSocials.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {activeSocials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target={s.openInNewTab ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                >
                  <i className={`fa-brands ${s.faIcon}`} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="reveal overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Taste Haven location"
            src={mapsEmbedSrc}
            className="h-[420px] w-full grayscale-[30%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
