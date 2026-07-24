import { useState } from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { FAQS } from "@/data/faqs";

/** Accordion-style FAQ list. Owns the `openFaq` state internally. */
export function Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="reveal text-center">
          <SectionTitle>FAQ</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Things guests ask.</h2>
        </div>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card/40">
          {FAQS.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className="reveal">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="font-display text-lg">{f.q}</span>
                  <i className={`fa-solid fa-plus text-primary transition-transform ${open ? "rotate-45" : ""}`} />
                </button>
                <div className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="min-h-0 overflow-hidden px-6 pb-5 text-sm text-muted-foreground">{f.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
