import { useState } from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { FAQS as FALLBACK_FAQS } from "@/data/faqs";
import { useFaqs } from "@/hooks/useFaqs";

/**
 * FAQ section — now CMS-driven via useFaqs().
 * Falls back to hardcoded FAQS when loading or when no active rows exist.
 * Only active FAQs (is_active = true) are shown on the public site.
 */
export function Faq() {
  const { items, isLoading } = useFaqs();
  const [openFaq, setOpenFaq] = useState<string | number | null>(0);

  const displayItems =
    !isLoading && items.length > 0
      ? items.filter((f) => f.isActive).map((f) => ({ key: f.id, q: f.question, a: f.answer }))
      : FALLBACK_FAQS.map((f, i) => ({ key: i, q: f.q, a: f.a }));

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="reveal text-center">
          <SectionTitle>FAQ</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Things guests ask.</h2>
        </div>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card/40">
          {displayItems.map((f, i) => {
            const open = openFaq === f.key;
            return (
              <div key={f.key} className="reveal">
                <button
                  onClick={() => setOpenFaq(open ? null : f.key)}
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
