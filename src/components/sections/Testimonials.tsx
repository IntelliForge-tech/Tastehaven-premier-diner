import { useEffect, useState } from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { TESTIMONIALS } from "@/data/testimonials";

/** Auto-rotating testimonial carousel. Owns the `tIndex` state internally. */
export function Testimonials() {
  const [tIndex, setTIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTIndex((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="testimonials" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <SectionTitle>Guests Say</SectionTitle>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Loved by the city.</h2>

        <div className="relative mt-12 min-h-[240px]">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.name}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${i === tIndex ? "opacity-100" : "pointer-events-none opacity-0 translate-y-4"}`}
            >
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, k) => (
                  <i key={k} className={`fa-solid fa-star ${k < t.rating ? "" : "opacity-25"}`} />
                ))}
              </div>
              <p className="mt-6 font-display text-2xl leading-relaxed md:text-3xl">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/20 font-display text-primary">
                  {t.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                <div className="text-left">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </blockquote>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setTIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === tIndex ? "w-8 bg-primary" : "w-2 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
