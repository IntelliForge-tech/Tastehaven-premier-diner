import { SectionTitle } from "@/components/common/SectionTitle";
import { gallery1 } from "@/data/gallery";
import { useAbout } from "@/hooks/useAbout";
import { ABOUT_FEATURES } from "@/utils/constants";

/**
 * About section — Phase 12B.
 *
 * Content is now driven by the about_settings Supabase row via useAbout().
 * Falls back to the original hardcoded values when the row is loading,
 * doesn't exist yet, or has missing fields — the UI never crashes on a
 * null/undefined field. Styling and layout are unchanged from the pre-CMS
 * version.
 *
 * If `isVisible` is false the entire section is omitted from the DOM
 * while the rest of the homepage continues to function normally.
 */
export function About() {
  const { about, isLoading } = useAbout();

  // ── Resolve content: DB row → fallback defaults ───────────────────────
  const sectionTitle = about?.sectionTitle ?? "Our Story";
  const headline = about?.headline ?? "A haven for the curious palate.";
  const description =
    about?.description ??
    "Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings. Every plate is a small ceremony.";
  const badgeLabel = about?.badgeLabel ?? "Since";
  const badgeYear = about?.badgeYear ?? "2012";
  const badgeSubtext = about?.badgeSubtext ?? "A decade of memorable evenings.";
  const imageUrl = about?.imageUrl ?? null;
  const features =
    about?.features?.length
      ? about.features
      : ABOUT_FEATURES.map((f) => ({ icon: f.i, title: f.t, description: f.d }));

  // While loading or when the DB row says hidden, skip the section.
  // During loading we still show the section with defaults so the page
  // doesn't jump — if the row explicitly says isVisible=false we hide it.
  if (!isLoading && about !== null && about.isVisible === false) {
    return null;
  }

  const showBadge = !!(badgeLabel || badgeYear);

  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2 lg:items-center">
        <div className="reveal">
          <SectionTitle>{sectionTitle}</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">{headline}</h2>
          {description && (
            <p className="mt-5 text-muted-foreground">{description}</p>
          )}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card/50 p-5 hover-lift">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
                  <i className={`fa-solid ${f.icon}`} />
                </div>
                <h3 className="mt-3 font-display text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative reveal">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <img
              src={imageUrl ?? gallery1}
              alt="Restaurant interior"
              loading="lazy"
              width={900}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
          {showBadge && (
            <div className="absolute -bottom-8 -left-6 hidden w-56 rounded-xl card-glass p-5 shadow-card md:block">
              {badgeLabel && (
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {badgeLabel}
                </div>
              )}
              {badgeYear && (
                <div className="font-display text-4xl text-gradient-gold">{badgeYear}</div>
              )}
              {badgeSubtext && (
                <div className="mt-1 text-sm text-muted-foreground">{badgeSubtext}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
