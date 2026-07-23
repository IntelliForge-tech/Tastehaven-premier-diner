import { ContactRow } from "@/components/common/ContactRow";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SOCIAL_LINKS } from "@/utils/constants";
import { useRestaurantInformation } from "@/hooks/useRestaurantInformation";

export function Contact() {
  const { data } = useRestaurantInformation();
  const info = data?.info;

  const address = info
    ? [info.streetAddress, info.city, info.state, info.postalCode, info.country]
        .filter(Boolean)
        .join(", ")
    : "42 Amber Street, Downtown District, CA 94103";

  const phone = info?.primaryPhone ?? "+1 (415) 555 0138";
  const email = info?.primaryEmail ?? "hello@tastehaven.co";
  const mapsUrl = info?.googleMapsUrl ?? "https://www.google.com/maps?q=San+Francisco+downtown";

  // Build embed URL — if it already has output=embed keep it, otherwise append
  const embedUrl = mapsUrl.includes("output=embed")
    ? mapsUrl
    : mapsUrl.replace(/\?/, "?output=embed&").replace("output=embed&output=embed", "output=embed");

  const contactDetails = [
    { icon: "fa-location-dot", title: address },
    { icon: "fa-phone", title: phone },
    { icon: "fa-envelope", title: email },
  ];

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-2">
        <div className="reveal">
          <SectionTitle>Contact</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Come find us.</h2>
          <p className="mt-4 text-muted-foreground">Two blocks from the riverfront, tucked behind the old amber lamp post.</p>

          <div className="mt-8 space-y-3">
            {contactDetails.map((c) => (
              <ContactRow key={c.icon} icon={c.icon} title={c.title} />
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a key={s} href="#" aria-label={s} className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary hover:border-primary/60">
                <i className={`fa-brands fa-${s}`} />
              </a>
            ))}
          </div>
        </div>
        <div className="reveal overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Taste Haven location"
            src={embedUrl}
            className="h-[420px] w-full grayscale-[30%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
