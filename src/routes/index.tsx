import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast, Toaster } from "sonner";

import heroFood from "@/assets/hero-food.jpg";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { About } from "@/components/sections/About";
import { Chefs } from "@/components/sections/Chefs";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Menu } from "@/components/sections/Menu";
import { Offers } from "@/components/sections/Offers";
import { Reservation } from "@/components/sections/Reservation";
import { Testimonials } from "@/components/sections/Testimonials";
import { useReveal } from "@/hooks/useReveal";
import { useTheme } from "@/hooks/useTheme";

export const Route = createFileRoute("/")({
  component: TasteHaven,
  head: () => ({
    meta: [
      { property: "og:image", content: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200" },
    ],
    links: [
      { rel: "preload", as: "image", href: heroFood, fetchpriority: "high" },
    ],
  }),
});

/**
 * Page orchestrator: composes the layout and section components, and owns
 * the small slice of state that is genuinely shared between them:
 *  - theme (Header toggles it, Toaster reads it)
 *  - cart/flyKey (Menu increments it, Header displays it)
 *  - scrollTo (used by Header, Hero, Footer, and the section anchors)
 * Every other piece of state (menu filters, gallery lightbox, testimonial
 * index, FAQ accordion, reservation form, mobile nav, scroll thresholds)
 * lives inside the component that actually needs it.
 */
function TasteHaven() {
  const { theme, setTheme } = useTheme("dark");
  const [cart, setCart] = useState(0);
  const [flyKey, setFlyKey] = useState(0);

  useReveal();

  const addToCart = (name: string) => {
    setCart((c) => c + 1);
    setFlyKey((k) => k + 1);
    toast.success(`${name} added to cart`);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme={theme} richColors position="top-right" />

      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        cartCount={cart}
        flyKey={flyKey}
        onNavigate={scrollTo}
      />

      <Hero onNavigate={scrollTo} />
      <About />
      <Menu onAddToCart={addToCart} />
      <Offers />
      <Gallery />
      <Chefs />
      <Testimonials />
      <Reservation />
      <Faq />
      <Contact />

      <Footer onNavigate={scrollTo} />

      <ScrollToTopButton />
    </div>
  );
}
