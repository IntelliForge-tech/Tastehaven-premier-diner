import { SectionTitle } from "@/components/common/SectionTitle";
import { gallery1 } from "@/data/gallery";
import { ABOUT_FEATURES } from "@/utils/constants";

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2 lg:items-center">
        <div className="reveal">
          <SectionTitle>Our Story</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">A haven for the curious palate.</h2>
          <p className="mt-5 text-muted-foreground">
            Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings. Every plate is a small ceremony.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {ABOUT_FEATURES.map((f) => (
              <div key={f.t} className="rounded-xl border border-border bg-card/50 p-5 hover-lift">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
                  <i className={`fa-solid ${f.i}`} />
                </div>
                <h3 className="mt-3 font-display text-lg">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative reveal">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <img src={gallery1} alt="Restaurant interior" loading="lazy" width={900} height={900} className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-8 -left-6 hidden w-56 rounded-xl card-glass p-5 shadow-card md:block">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Since</div>
            <div className="font-display text-4xl text-gradient-gold">2012</div>
            <div className="mt-1 text-sm text-muted-foreground">A decade of memorable evenings.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
