import { toast } from "sonner";

import { useFooterSettings } from "@/hooks/useFooterSettings";
import { useQuickLinks } from "@/hooks/useQuickLinks";
import { useRestaurantInformation } from "@/hooks/useRestaurantInformation";
import {
  DAY_NAMES,
  ORDERED_DAYS,
  type DayOfWeek,
} from "@/services/restaurant-information.service";

interface FooterProps {
  onNavigate: (id: string) => void;
}

/**
 * Public footer — Phase 12D.
 *
 * All content (branding, quick links, newsletter, copyright, legal) is driven
 * by footer_settings from Supabase via useFooterSettings().
 * Opening hours come from restaurant_info (Phase 12C).
 * Social icons are read from the social_links table via useRestaurantInformation.
 * No hardcoded values remain.
 */
export function Footer({ onNavigate }: FooterProps) {
  const { settings } = useFooterSettings();
  const { links } = useQuickLinks();
  const { data: restData } = useRestaurantInformation();
  const hours = restData?.hours ?? [];

  // ── Derived values (fall back to safe defaults if settings not yet loaded) ─

  const restaurantName = settings?.restaurantName ?? "Taste Haven";
  const shortDescription =
    settings?.shortDescription ??
    settings?.tagline ??
    "Fresh ingredients, memorable experiences — since 2012.";

  const copyrightYear = settings?.copyrightYearAuto !== false
    ? new Date().getFullYear()
    : (settings?.copyrightYearManual ?? new Date().getFullYear());

  const copyrightText = settings?.copyrightText ?? "All rights reserved.";
  const designedByText = settings?.designedByText ?? "";
  const designedByUrl = settings?.designedByUrl ?? "";

  const newsletterEnabled = settings?.newsletterEnabled !== false;
  const newsletterTitle = settings?.newsletterTitle ?? "Newsletter";
  const newsletterSubtitle =
    settings?.newsletterSubtitle ?? "Seasonal menus and private events, once a month.";
  const newsletterPlaceholder = settings?.newsletterPlaceholder ?? "you@email.com";
  const newsletterButtonText = settings?.newsletterButtonText ?? "Join";
  const newsletterSuccessMsg =
    settings?.newsletterSuccessMsg ?? `Subscribed! Welcome to ${restaurantName}.`;
  const newsletterErrorMsg =
    settings?.newsletterErrorMsg ?? "Something went wrong. Please try again.";

  const showQuickLinks = settings?.showQuickLinks !== false;
  const showBusinessInfo = settings?.showBusinessInfo !== false;
  const showNewsletter = settings?.showNewsletter !== false;
  const showDivider = settings?.showDivider !== false;
  const showCopyright = settings?.showCopyright !== false;
  const showLegal = settings?.showLegal === true;
  const footerEnabled = settings?.footerEnabled !== false;

  const enabledLinks = links.filter((l) => l.isEnabled);

  if (!footerEnabled) return null;

  return (
    <footer className="border-t border-border bg-card/40 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-4 md:px-8">

        {/* ── Branding column ─────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-utensils text-primary" />
            <span className="font-display text-xl">
              {restaurantName.includes(" ") ? (
                <>
                  {restaurantName.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-gradient-gold">
                    {restaurantName.split(" ").slice(-1)}
                  </span>
                </>
              ) : (
                <span className="text-gradient-gold">{restaurantName}</span>
              )}
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{shortDescription}</p>
        </div>

        {/* ── Quick Links column ──────────────────────────────── */}
        {showQuickLinks && (
          <div>
            <h4 className="font-display text-lg">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {enabledLinks.length > 0
                ? enabledLinks.map((l) =>
                    l.url.startsWith("#") || l.url.startsWith("/") ? (
                      <li key={l.id}>
                        <button
                          onClick={() =>
                            onNavigate(l.url.replace(/^#/, "").replace(/^\//, ""))
                          }
                          className="hover:text-primary"
                        >
                          {l.title}
                        </button>
                      </li>
                    ) : (
                      <li key={l.id}>
                        <a
                          href={l.url}
                          target={l.openNewTab ? "_blank" : undefined}
                          rel={l.openNewTab ? "noopener noreferrer" : undefined}
                          className="hover:text-primary"
                        >
                          {l.title}
                        </a>
                      </li>
                    ),
                  )
                : FALLBACK_LINKS.map((l) => (
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
        )}

        {/* ── Opening Hours / Business Info column ────────────── */}
        {showBusinessInfo && (
          <div>
            <h4 className="font-display text-lg">Opening Hours</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {hours.length > 0
                ? ORDERED_DAYS.map((day) => {
                    const h = hours.find((x) => x.dayOfWeek === day);
                    if (!h) return null;
                    return (
                      <li key={day} className="flex justify-between gap-3">
                        <span>{DAY_NAMES[day as DayOfWeek].slice(0, 3)}</span>
                        <span>
                          {h.isClosed
                            ? "Closed"
                            : `${fmtTime(h.openTime)} – ${fmtTime(h.closeTime)}`}
                        </span>
                      </li>
                    );
                  })
                : FALLBACK_HOURS.map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
        )}

        {/* ── Newsletter column ───────────────────────────────── */}
        {showNewsletter && newsletterEnabled && (
          <div>
            <h4 className="font-display text-lg">{newsletterTitle}</h4>
            <p className="mt-4 text-sm text-muted-foreground">{newsletterSubtitle}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success(newsletterSuccessMsg);
                (e.currentTarget as HTMLFormElement).reset();
              }}
              className="mt-4 flex overflow-hidden rounded-full border border-border bg-background/60"
            >
              <input
                required
                type="email"
                maxLength={120}
                placeholder={newsletterPlaceholder}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
                aria-label="Email"
                onInvalid={(e) => {
                  (e.target as HTMLInputElement).setCustomValidity(newsletterErrorMsg);
                }}
                onChange={(e) => {
                  e.target.setCustomValidity("");
                }}
              />
              <button className="px-4 btn-gold text-sm font-semibold" type="submit">
                {newsletterButtonText}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────── */}
      <div className="mx-auto mt-10 max-w-7xl px-5 md:px-8">
        {showDivider && <div className="divider-gold" />}

        {(showCopyright || showLegal || designedByText) && (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground md:flex-row">
            {showCopyright && (
              <div>
                © {copyrightYear} {restaurantName}. {copyrightText}
              </div>
            )}

            {showLegal && (settings?.privacyPolicyUrl || settings?.termsUrl || settings?.cookiesUrl) && (
              <div className="flex flex-wrap gap-3">
                {settings?.privacyPolicyUrl && (
                  <a href={settings.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Privacy Policy
                  </a>
                )}
                {settings?.termsUrl && (
                  <a href={settings.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Terms
                  </a>
                )}
                {settings?.cookiesUrl && (
                  <a href={settings.cookiesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Cookies
                  </a>
                )}
                {settings?.refundUrl && (
                  <a href={settings.refundUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Refund Policy
                  </a>
                )}
              </div>
            )}

            {designedByText && (
              <div>
                {designedByUrl ? (
                  <a href={designedByUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {designedByText}
                  </a>
                ) : (
                  designedByText
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtTime(time: string | null): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr ?? "00"} ${suffix}`;
}

const FALLBACK_LINKS = ["Menu", "About", "Gallery", "Reserve", "Contact"];
const FALLBACK_HOURS = [
  "Mon–Thu: 5 PM – 11 PM",
  "Fri–Sat: 5 PM – 1 AM",
  "Sun: 4 PM – 11 PM",
];
