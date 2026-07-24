import { toast } from "sonner";

import { useContactInformation } from "@/hooks/useContactInformation";
import { useContactSocialLinks } from "@/hooks/useContactSocialLinks";
import { FOOTER_QUICK_LINKS, OPENING_HOURS } from "@/utils/constants";

interface FooterProps {
  onNavigate: (id: string) => void;
}

/**
 * Site footer — Phase 12C.
 *
 * Contact details and social icons are now CMS-driven via
 * useContactInformation() and useContactSocialLinks(). Falls back to
 * hardcoded OPENING_HOURS constant (managed in Restaurant Settings).
 * Newsletter submit is self-contained (shows a toast, no real API call).
 */
export function Footer({ onNavigate }: FooterProps) {
  const { contactInfo } = useContactInformation();
  const { socialLinks } = useContactSocialLinks();

  const activeSocials = socialLinks?.links.filter((l) => l.enabled && l.url) ?? [];

  const addressLine = contactInfo
    ? [
        contactInfo.streetAddress,
        contactInfo.area,
        contactInfo.city,
        contactInfo.state,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <footer className="border-t border-border bg-card/40 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-4 md:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-utensils text-primary" />
            <span className="font-display text-xl">
              Taste <span className="text-gradient-gold">Haven</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Fresh ingredients, memorable experiences — since 2012.
          </p>
          {/* Footer social icons */}
          {activeSocials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeSocials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target={s.openInNewTab ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                >
                  <i className={`fa-brands ${s.faIcon} text-sm`} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display text-lg">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {FOOTER_QUICK_LINKS.map((l) => (
              <li key={l}>
                <button
                  onClick={() => onNavigate(l.toLowerCase())}
                  className="hover:text-primary"
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact details */}
        <div>
          <h4 className="font-display text-lg">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {addressLine && (
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot mt-0.5 shrink-0 text-primary/70" />
                <span>{addressLine}</span>
              </li>
            )}
            {(contactInfo?.primaryPhone ?? null) && (
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-phone shrink-0 text-primary/70" />
                <a
                  href={`tel:${contactInfo!.primaryPhone}`}
                  className="hover:text-primary"
                >
                  {contactInfo!.primaryPhone}
                </a>
              </li>
            )}
            {(contactInfo?.primaryEmail ?? null) && (
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-envelope shrink-0 text-primary/70" />
                <a
                  href={`mailto:${contactInfo!.primaryEmail}`}
                  className="hover:text-primary"
                >
                  {contactInfo!.primaryEmail}
                </a>
              </li>
            )}
            {/* Fallback when no DB data yet */}
            {!contactInfo && (
              <>
                <li>42 Amber Street, Downtown District, CA 94103</li>
                <li>+1 (415) 555 0138</li>
                <li>hello@tastehaven.co</li>
              </>
            )}
            {(contactInfo?.businessHoursNote ?? null) && (
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-clock shrink-0 text-primary/70" />
                <span>{contactInfo!.businessHoursNote}</span>
              </li>
            )}
            {!contactInfo?.businessHoursNote &&
              OPENING_HOURS.map((h) => <li key={h}>{h}</li>)}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-display text-lg">Newsletter</h4>
          <p className="mt-4 text-sm text-muted-foreground">
            Seasonal menus and private events, once a month.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Subscribed! Welcome to Taste Haven.");
              (e.currentTarget as HTMLFormElement).reset();
            }}
            className="mt-4 flex overflow-hidden rounded-full border border-border bg-background/60"
          >
            <input
              required
              type="email"
              maxLength={120}
              placeholder="you@email.com"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
              aria-label="Email"
            />
            <button className="btn-gold px-4 text-sm font-semibold" type="submit">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-5 md:px-8">
        <div className="divider-gold" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Taste Haven. All rights reserved.</div>
          <div>Crafted with care in the Downtown District.</div>
        </div>
      </div>
    </footer>
  );
}
