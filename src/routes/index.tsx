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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
 *  - cartItems/flyKey (Menu increments it, Header displays badge + opens sheet)
 *  - isCartOpen (Header bag button opens it, Sheet onOpenChange closes it)
 *  - scrollTo (used by Header, Hero, Footer, and the section anchors)
 * Every other piece of state (menu filters, gallery lightbox, testimonial
 * index, FAQ accordion, reservation form, mobile nav, scroll thresholds)
 * lives inside the component that actually needs it.
 */
function TasteHaven() {
  const { theme, setTheme } = useTheme("dark");
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [flyKey, setFlyKey] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useReveal();

  const addToCart = (name: string) => {
    setCartItems((prev) => [...prev, name]);
    setFlyKey((k) => k + 1);
    toast.success(`${name} added to cart`);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Aggregate duplicate item names into counts for the sheet display
  const cartSummary = cartItems.reduce<Record<string, number>>((acc, name) => {
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme={theme} richColors position="top-right" offset="72px" />

      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        cartCount={cartItems.length}
        flyKey={flyKey}
        onNavigate={scrollTo}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* Cart sheet — opened by the header bag icon */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Your Order</SheetTitle>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Your cart is empty.
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
              <ul className="space-y-3">
                {Object.entries(cartSummary).map(([name, qty]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">× {qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-border pt-4 text-sm text-muted-foreground">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your order
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

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
