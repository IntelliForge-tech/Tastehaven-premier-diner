import { useEffect, useRef, useState } from "react";

import heroFood from "@/assets/hero-food.jpg";
import { useCounter } from "@/hooks/useCounter";
import { useHero } from "@/hooks/useHero";
import { STATS_CONFIG } from "@/utils/constants";

interface HeroProps {
  onNavigate: (id: string) => void;
}

/**
 * Full-viewport hero with headline, CTAs, and animated stat counters.
 *
 * Phase 12A: content is now driven by the hero_settings Supabase row
 * via useHero(). Falls back to the original hardcoded values when the
 * row is loading, doesn't exist yet, or has missing fields — the UI
 * never crashes on a null/undefined field. Styling and layout are
 * unchanged from the pre-CMS version.
 *
 * If `isVisible` is false the entire section is omitted from the DOM
 * while the rest of the homepage continues to function normally.
 */
export function Hero({ onNavigate }: HeroProps) {
  const { hero, isLoading } = useHero();
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [statsIn, setStatsIn] = useState(false);

  useEffect(() => {
    if (!statsRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setStatsIn(true),
      { threshold: 0.3 },
    );
    io.observe(statsRef.current);
    return () => io.disconnect();
  }, []);

  const guests = useCounter(STATS_CONFIG[0].target, statsIn);
  const dishesCount = useCounter(STATS_CONFIG[1].target, statsIn);
  const chefsCount = useCounter(STATS_CONFIG[2].target, statsIn);
  const awards = useCounter(STATS_CONFIG[3].target, statsIn);

  const stats = [
    { n: guests, s: STATS_CONFIG[0].suffix, l: STATS_CONFIG[0].label },
    { n: dishesCount, s: STATS_CONFIG[1].suffix, l: STATS_CONFIG[1].label },
    { n: chefsCount, s: STATS_CONFIG[2].suffix, l: STATS_CONFIG[2].label },
    { n: awards, s: STATS_CONFIG[3].suffix, l: STATS_CONFIG[3].label },
  ];

  // ── Resolve content: DB row → fallback defaults ───────────────────────
  const headline = hero?.headline ?? "Fresh Ingredients.";
  const headlineHighlight = hero?.headlineHighlight ?? "Memorable";
  const headlineSuffix = hero?.headlineSuffix ?? "Experiences.";
  const badgeText = hero?.badgeText ?? "Now taking reservations";
  const description =
    hero?.description ??
    "A modern dining haven where seasonal produce, wood-fire craftsmanship, and warm hospitality meet — night after night.";
  const primaryButtonText = hero?.primaryButtonText ?? "Reserve Table";
  const primaryButtonLink = hero?.primaryButtonLink ?? "reserve";
  const secondaryButtonText = hero?.secondaryButtonText ?? "View Menu";
  const secondaryButtonLink = hero?.secondaryButtonLink ?? "menu";
  const backgroundImageUrl = hero?.backgroundImageUrl ?? null;
  const overlayOpacity = hero?.overlayOpacity ?? 70;

  // While loading we still render the section with defaults so there's
  // no layout shift — the fallback values match the old hardcoded ones.

  // Hidden by admin toggle — omit from DOM entirely.
  if (!isLoading && hero && !hero.isVisible) {
    return null;
  }

  // Resolve the background image source.
  const bgSrc = backgroundImageUrl ?? heroFood;

  // Handle CTA navigation — anchor ids scroll the page, full URLs navigate.
  function handleCta(linkValue: string) {
    if (!linkValue) return;
    if (linkValue.startsWith("http://") || linkValue.startsWith("https://")) {
      window.location.href = linkValue;
    } else {
      onNavigate(linkValue);
    }
  }

  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-center overflow-hidden"
    >
      <img
        src={bgSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1280}
        fetchPriority="high"
        decoding="async"
      />
      {/* Gradient overlay — opacity driven by the DB value */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background"
        style={{ opacity: overlayOpacity / 100 }}
      />
      <div className="absolute inset-0 bg-radial-hero" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 pt-32 pb-20 md:px-8 md:pt-40">
        <div className="max-w-3xl reveal">
          {/* Badge */}
          {badgeText && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {badgeText}
            </div>
          )}

          {/* Heading */}
          <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl">
            {headline}
            {(headlineHighlight || headlineSuffix) && (
              <>
                <br />
                {headlineHighlight && (
                  <span className="text-gradient-gold">{headlineHighlight}</span>
                )}
                {headlineSuffix && ` ${headlineSuffix}`}
              </>
            )}
          </h1>

          {/* Description */}
          {description && (
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{description}</p>
          )}

          {/* CTAs */}
          {(primaryButtonText || secondaryButtonText) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {primaryButtonText && (
                <button
                  onClick={() => handleCta(primaryButtonLink)}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold btn-gold"
                >
                  <i className="fa-solid fa-calendar-check" />
                  {primaryButtonText}
                </button>
              )}
              {secondaryButtonText && (
                <button
                  onClick={() => handleCta(secondaryButtonLink)}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold btn-outline-gold"
                >
                  <i className="fa-solid fa-book-open" />
                  {secondaryButtonText}
                </button>
              )}
            </div>
          )}

          {/* Stats */}
          <div ref={statsRef} className="mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl text-primary">
                  {s.n.toLocaleString()}
                  {s.s}
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground animate-float"
        aria-hidden
      >
        <i className="fa-solid fa-angle-down text-xl" />
      </div>
    </section>
  );
}
