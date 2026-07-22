import type { ContactDetail, IconFeature, StatConfig } from "@/types/restaurant";

/** Desktop nav + mobile-menu scroll-spy section ids, in page order. */
export const NAV_LINKS = ["home", "menu", "about", "gallery", "testimonials", "contact"] as const;

/** Mobile nav includes an extra "reserve" link not shown in the desktop nav. */
export const MOBILE_NAV_LINKS = [...NAV_LINKS, "reserve"] as const;

export const SOCIAL_LINKS = ["instagram", "facebook", "x-twitter", "tiktok"] as const;

export const CONTACT_DETAILS: ContactDetail[] = [
  { icon: "fa-location-dot", title: "42 Amber Street, Downtown District, CA 94103" },
  { icon: "fa-phone", title: "+1 (415) 555 0138" },
  { icon: "fa-envelope", title: "hello@tastehaven.co" },
];

export const ABOUT_FEATURES: IconFeature[] = [
  { i: "fa-seedling", t: "Fresh Ingredients", d: "Sourced daily from local farms." },
  { i: "fa-hat-chef", t: "Experienced Chefs", d: "A team with global training." },
  { i: "fa-fire", t: "Cozy Atmosphere", d: "Warm lighting, intimate seating." },
  { i: "fa-bolt", t: "Fast Service", d: "Attentive, never rushed." },
];

export const RESERVE_INFO: IconFeature[] = [
  { i: "fa-clock", t: "Opening Hours", d: "Mon–Sun, 5 PM – 12 AM" },
  { i: "fa-phone", t: "Direct Line", d: "+1 (415) 555 0138" },
  { i: "fa-location-dot", t: "Location", d: "42 Amber Street, Downtown District" },
];

export const STATS_CONFIG: StatConfig[] = [
  { target: 24500, suffix: "+", label: "Happy Guests" },
  { target: 120, suffix: "", label: "Signature Dishes" },
  { target: 15, suffix: "", label: "Expert Chefs" },
  { target: 32, suffix: "", label: "Awards Won" },
];

export const FOOTER_QUICK_LINKS = ["Menu", "About", "Gallery", "Reserve", "Contact"] as const;

export const OPENING_HOURS = ["Mon–Thu · 5 PM – 11 PM", "Fri–Sat · 5 PM – 1 AM", "Sunday · 4 PM – 11 PM"] as const;
