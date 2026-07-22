import { ContactRow } from "@/components/common/ContactRow";
import { SectionTitle } from "@/components/common/SectionTitle";
import { CONTACT_DETAILS, SOCIAL_LINKS } from "@/utils/constants";

export function Contact() {
  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-2">
        <div className="reveal">
          <SectionTitle>Contact</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Come find us.</h2>
          <p className="mt-4 text-muted-foreground">Two blocks from the riverfront, tucked behind the old amber lamp post.</p>

          <div className="mt-8 space-y-3">
            {CONTACT_DETAILS.map((c) => (
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
            src="https://www.google.com/maps?q=San+Francisco+downtown&output=embed"
            className="h-[420px] w-full grayscale-[30%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
