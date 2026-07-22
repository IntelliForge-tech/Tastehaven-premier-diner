import { toast } from "sonner";

import { FOOTER_QUICK_LINKS, OPENING_HOURS } from "@/utils/constants";

interface FooterProps {
  onNavigate: (id: string) => void;
}

/**
 * Site footer: brand blurb, quick links, opening hours, and a newsletter
 * signup form. The newsletter submit handler is self-contained (matches
 * the original inline behavior — it only shows a success toast and resets
 * the form, no request is actually sent).
 */
export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-border bg-card/40 py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-4 md:px-8">
          <div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-utensils text-primary" />
              <span className="font-display text-xl">Taste <span className="text-gradient-gold">Haven</span></span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Fresh ingredients, memorable experiences — since 2012.</p>
          </div>
          <div>
            <h4 className="font-display text-lg">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {FOOTER_QUICK_LINKS.map((l) => (
                <li key={l}><button onClick={() => onNavigate(l.toLowerCase())} className="hover:text-primary">{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg">Opening Hours</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {OPENING_HOURS.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg">Newsletter</h4>
            <p className="mt-4 text-sm text-muted-foreground">Seasonal menus and private events, once a month.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Subscribed! Welcome to Taste Haven.");
                (e.currentTarget as HTMLFormElement).reset();
              }}
              className="mt-4 flex overflow-hidden rounded-full border border-border bg-background/60"
            >
              <input required type="email" maxLength={120} placeholder="you@email.com" className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none" aria-label="Email" />
              <button className="px-4 btn-gold text-sm font-semibold" type="submit">Join</button>
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
