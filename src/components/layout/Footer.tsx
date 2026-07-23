import { toast } from "sonner";

import { useRestaurantInformation } from "@/hooks/useRestaurantInformation";
import {
  DAY_NAMES,
  ORDERED_DAYS,
  type DayOfWeek,
} from "@/services/restaurant-information.service";
import { FOOTER_QUICK_LINKS } from "@/utils/constants";

interface FooterProps {
  onNavigate: (id: string) => void;
}

/**
 * Site footer: brand blurb, quick links, opening hours, and a newsletter
 * signup form. All restaurant data (name, tagline, hours) is loaded from
 * Supabase via useRestaurantInformation (Phase 12C).
 */
export function Footer({ onNavigate }: FooterProps) {
  const { data } = useRestaurantInformation();
  const info = data?.info;
  const hours = data?.hours ?? [];

  const restaurantName = info?.name ?? "Taste Haven";
  const shortDescription =
    info?.shortDescription ??
    info?.tagline ??
    "Fresh ingredients, memorable experiences — since 2012.";
  const copyrightYear = new Date().getFullYear();
  const copyrightName = restaurantName;

  return (
    <footer className="border-t border-border bg-card/40 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-4 md:px-8">
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
                          : `${fmt(h.openTime)} – ${fmt(h.closeTime)}`}
                      </span>
                    </li>
                  );
                })
              : FALLBACK_HOURS.map((h) => (
                  <li key={h}>{h}</li>
                ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg">Newsletter</h4>
          <p className="mt-4 text-sm text-muted-foreground">
            Seasonal menus and private events, once a month.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(`Subscribed! Welcome to ${restaurantName}.`);
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
            <button className="px-4 btn-gold text-sm font-semibold" type="submit">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-5 md:px-8">
        <div className="divider-gold" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground md:flex-row">
          <div>© {copyrightYear} {copyrightName}. All rights reserved.</div>
          <div>Crafted with care in the Downtown District.</div>
        </div>
      </div>
    </footer>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(time: string | null): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr ?? "00"} ${suffix}`;
}

const FALLBACK_HOURS = [
  "Mon–Thu: 5 PM – 11 PM",
  "Fri–Sat: 5 PM – 1 AM",
  "Sun: 4 PM – 11 PM",
];
