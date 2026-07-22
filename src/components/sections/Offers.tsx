import { SectionTitle } from "@/components/common/SectionTitle";
import { OFFERS } from "@/data/offers";

export function Offers() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal">
          <SectionTitle>This Season</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Special offers, made for sharing.</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {OFFERS.map((o) => (
            <div
              key={o.title}
              className="reveal relative overflow-hidden rounded-2xl border border-primary/25 p-8 hover-lift"
              style={{ background: "linear-gradient(160deg, color-mix(in oklab, var(--gold) 10%, var(--card)), var(--card))" }}
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
                  <i className={`fa-solid ${o.icon}`} />
                </div>
                <span className="rounded-full border border-primary/40 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">{o.tag}</span>
              </div>
              <h3 className="relative mt-6 font-display text-2xl">{o.title}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground">{o.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
