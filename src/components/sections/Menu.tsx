import { useMemo, useState } from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { CATEGORIES, DISHES } from "@/data/menu";
import type { Category } from "@/types/restaurant";

interface MenuProps {
  onAddToCart: (dishName: string) => void;
}

/**
 * Menu section: category filter chips + search box + dish grid. Owns its
 * own `cat`/`search`/`filtered` state since nothing outside Menu needs it;
 * only the "add to cart" action is lifted (Header's cart badge needs it).
 */
export function Menu({ onAddToCart }: MenuProps) {
  const [cat, setCat] = useState<Category>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DISHES.filter(
      (d) => (cat === "All" || d.category === cat) && (q === "" || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)),
    );
  }, [cat, search]);

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

        <div className="mt-8 flex flex-wrap gap-2 reveal">
          {CATEGORIES.map((c) => (
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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d) => (
            <article key={d.name} className="group reveal overflow-hidden rounded-2xl border border-border bg-card hover-lift">
              <div className="relative aspect-square overflow-hidden">
                <img src={d.image} alt={d.name} loading="lazy" width={800} height={800} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute right-3 top-3 rounded-full bg-background/70 px-3 py-1 text-xs backdrop-blur">
                  <i className="fa-solid fa-star text-primary" /> {d.rating}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg">{d.name}</h3>
                  <span className="font-display text-primary">${d.price}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.desc}</p>
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
      </div>
    </section>
  );
}
