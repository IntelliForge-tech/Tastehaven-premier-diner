import { useEffect, useRef, useState } from "react";

import heroFood from "@/assets/hero-food.jpg";
import { useCounter } from "@/hooks/useCounter";
import { STATS_CONFIG } from "@/utils/constants";

interface HeroProps {
  onNavigate: (id: string) => void;
}

/**
 * Full-viewport hero with headline, CTAs, and the four animated stat
 * counters. Owns the IntersectionObserver + counter state internally since
 * nothing outside Hero needs it.
 */
export function Hero({ onNavigate }: HeroProps) {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [statsIn, setStatsIn] = useState(false);

  useEffect(() => {
    if (!statsRef.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setStatsIn(true), { threshold: 0.3 });
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

  return (
    <section id="home" className="relative isolate flex min-h-screen items-center overflow-hidden">
      <img src={heroFood} alt="" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1280} fetchPriority="high" decoding="async" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
      <div className="absolute inset-0 bg-radial-hero" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 pt-32 pb-20 md:px-8 md:pt-40">
        <div className="max-w-3xl reveal">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now taking reservations
          </div>
          <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl">
            Fresh Ingredients.
            <br />
            <span className="text-gradient-gold">Memorable</span> Experiences.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A modern dining haven where seasonal produce, wood-fire craftsmanship, and warm hospitality meet — night after night.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={() => onNavigate("reserve")} className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold btn-gold">
              <i className="fa-solid fa-calendar-check" /> Reserve Table
            </button>
            <button onClick={() => onNavigate("menu")} className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold btn-outline-gold">
              <i className="fa-solid fa-book-open" /> View Menu
            </button>
          </div>

          <div ref={statsRef} className="mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl text-primary">{s.n.toLocaleString()}{s.s}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground animate-float" aria-hidden>
        <i className="fa-solid fa-angle-down text-xl" />
      </div>
    </section>
  );
}
