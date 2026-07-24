import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SectionTitle } from "@/components/common/SectionTitle";
import {
  getPublicMenuItems,
  getPublicMenuCategories,
} from "@/services/menu/menu.service";

interface MenuProps {
  onAddToCart: (dishName: string) => void;
}

/**
 * Public Menu section — now powered by Supabase instead of static data.
 *
 * Two React Query calls (items + categories) run in parallel, both
 * cached for 60 s (stale) / 5 min (garbage-collected). The "All"
 * chip is synthetic — it's prepended to whatever categories come back
 * from the DB, never hardcoded. Filter/search logic is identical to
 * the previous static implementation so every existing UX behaviour
 * (category chips, search, empty state) is preserved.
 *
 * Nothing about the admin dashboard, CRUD hooks, or service functions
 * for admin use is modified.
 */
export function Menu({ onAddToCart }: MenuProps) {
  const [cat, setCat] = useState<string>("All");
  const [search, setSearch] = useState("");

  const {
    data: itemsData,
    isLoading: itemsLoading,
    isError: itemsError,
    refetch: refetchItems,
  } = useQuery({
    queryKey: ["public-menu-items"],
    queryFn: async () => {
      const result = await getPublicMenuItems();
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["public-menu-categories"],
    queryFn: async () => {
      const result = await getPublicMenuCategories();
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  // useReveal() (called once in routes/index.tsx) queries .reveal elements at
  // mount time. Async items aren't in the DOM yet at that point, so their cards
  // are never observed and .in is never added — leaving them at opacity:0.
  // Re-observe after itemsData settles so newly rendered cards get .in added
  // once they scroll into view (or are already in view).
  useEffect(() => {
    if (!itemsData || itemsData.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) e.target.classList.add("in");
      },
      { threshold: 0.12 },
    );

    // Small rAF delay so React has committed the new cards to the DOM
    const raf = requestAnimationFrame(() => {
      const els = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");
      els.forEach((el) => io.observe(el));
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [itemsData]);

  const isLoading = itemsLoading || categoriesLoading;

  // "All" is always first; real categories come from the DB.
  const allChips = useMemo(() => {
    const names = (categoriesData ?? []).map((c) => c.name);
    return ["All", ...names];
  }, [categoriesData]);

  // Reset to "All" when categories reload and the current chip no longer exists.
  useMemo(() => {
    if (cat !== "All" && allChips.length > 1 && !allChips.includes(cat)) {
      setCat("All");
    }
  }, [allChips, cat]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (itemsData ?? []).filter(
      (d) =>
        (cat === "All" || d.categoryName === cat) &&
        (q === "" ||
          d.name.toLowerCase().includes(q) ||
          (d.description ?? "").toLowerCase().includes(q)),
    );
  }, [itemsData, cat, search]);

  return (
    <section id="menu" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="reveal">
            <SectionTitle>Featured Menu</SectionTitle>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Signatures from the kitchen.</h2>
          </div>
          <div className="w-full max-w-sm reveal">
            <label className="flex items-center gap-3 rounded-full border border-border bg-card/50 px-4 py-2.5">
              <i className="fa-solid fa-magnifying-glass text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value.slice(0, 60))}
                placeholder="Search dishes..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search menu"
              />
            </label>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-8 flex flex-wrap gap-2 reveal">
          {isLoading
            ? // Skeleton chips while loading
              Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 animate-pulse rounded-full bg-muted"
                  aria-hidden="true"
                />
              ))
            : allChips.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                    cat === c
                      ? "border-transparent btn-gold"
                      : "border-border text-muted-foreground hover:text-primary hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              ))}
        </div>

        {/* Error state */}
        {itemsError && (
          <div className="mt-10 rounded-2xl border border-dashed border-destructive/40 p-12 text-center text-muted-foreground">
            <p className="mb-3">Couldn't load menu items right now.</p>
            <button
              onClick={() => refetchItems()}
              className="rounded-full border border-border px-4 py-1.5 text-sm hover:text-primary hover:border-primary/50 transition-all"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton grid */}
        {isLoading && !itemsError && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card animate-pulse"
                aria-hidden="true"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-32 rounded bg-muted" />
                    <div className="h-5 w-12 rounded bg-muted" />
                  </div>
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-9 w-full rounded-full bg-muted mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dish grid */}
        {!isLoading && !itemsError && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => (
              <article
                key={d.id}
                className="group reveal overflow-hidden rounded-2xl border border-border bg-card hover-lift"
              >
                <div className="relative aspect-square overflow-hidden">
                  {d.imageUrl ? (
                    <img
                      src={d.imageUrl}
                      alt={d.name}
                      loading="lazy"
                      width={800}
                      height={800}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted grid place-items-center text-muted-foreground/30">
                      <i className="fa-solid fa-utensils text-4xl" aria-hidden="true" />
                    </div>
                  )}
                  {d.rating !== null && (
                    <div className="absolute right-3 top-3 rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur">
                      <i className="fa-solid fa-star text-primary" /> {d.rating}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg">{d.name}</h3>
                    <span className="font-display text-primary">${d.price}</span>
                  </div>
                  {d.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {d.description}
                    </p>
                  )}
                  <button
                    onClick={() => onAddToCart(d.name)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border py-2 text-sm font-medium text-foreground transition-all hover:btn-gold hover:border-transparent"
                  >
                    <i className="fa-solid fa-plus" /> Order Now
                  </button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No dishes match your search.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}