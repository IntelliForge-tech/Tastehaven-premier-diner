import { SectionTitle } from "@/components/common/SectionTitle";
import { CHEFS } from "@/data/chefs";

export function Chefs() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal">
          <SectionTitle>Meet the Team</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">The craft behind every plate.</h2>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {CHEFS.map((c) => (
            <div key={c.name} className="reveal group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <img src={c.image} alt={c.name} loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-xs uppercase tracking-widest text-primary">{c.role}</div>
                  <h3 className="font-display text-2xl">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
