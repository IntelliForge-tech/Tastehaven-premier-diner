import { useState } from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { usePublicGallery } from "@/hooks/usePublicGallery";

/** Gallery grid + lightbox modal. Owns the `lightbox` state internally. */
export function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { images, isLoading, error, refetch } = usePublicGallery();

  return (
    <section id="gallery" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal">
          <SectionTitle>Gallery</SectionTitle>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">A glimpse inside the haven.</h2>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-2xl bg-card/60 ${i === 0 ? "lg:row-span-2 lg:col-span-2 aspect-square lg:aspect-auto min-h-[320px]" : "aspect-square"}`}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <p>{error.message}</p>
            <button
              onClick={refetch}
              className="rounded-full border border-border px-5 py-2 text-sm transition-colors hover:btn-gold hover:border-transparent"
            >
              Try again
            </button>
          </div>
        ) : images.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No gallery images available.
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setLightbox(img.imageUrl)}
                className={`reveal group relative overflow-hidden rounded-2xl ${i === 0 ? "lg:row-span-2 lg:col-span-2 aspect-square lg:aspect-auto" : "aspect-square"}`}
              >
                <img src={img.imageUrl} alt={img.altText} loading="lazy" width={900} height={900} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-background/0 transition-colors group-hover:bg-background/40" />
                <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                    <i className="fa-solid fa-expand" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] grid place-items-center bg-background/90 p-4 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <button aria-label="Close" className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full border border-border text-foreground">
            <i className="fa-solid fa-xmark" />
          </button>
          <img src={lightbox} alt="Preview" className="max-h-[85vh] max-w-[95vw] rounded-2xl object-contain" />
        </div>
      )}
    </section>
  );
}
