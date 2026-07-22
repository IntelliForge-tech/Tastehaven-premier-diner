/**
 * Domain types shared across data files and section components.
 * Extracted verbatim from the original inline definitions in routes/index.tsx.
 */

export type Category =
  | "All"
  | "Pizza"
  | "Burgers"
  | "Pasta"
  | "Indian"
  | "Chinese"
  | "Desserts"
  | "Drinks";

export interface Dish {
  name: string;
  category: Exclude<Category, "All">;
  desc: string;
  price: number;
  rating: number;
  image: string;
}

export interface Offer {
  title: string;
  desc: string;
  tag: string;
  icon: string;
}

export interface Testimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
}

export interface Chef {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Faq {
  q: string;
  a: string;
}

/** Small icon/title/description tuple used by the About "features" grid and the Reservation info list. */
export interface IconFeature {
  i: string;
  t: string;
  d: string;
}

/** Config for an animated hero stat counter (target value, suffix, label). */
export interface StatConfig {
  target: number;
  suffix: string;
  label: string;
}

/** Icon + label pair used by the Contact section's address/phone/email rows. */
export interface ContactDetail {
  icon: string;
  title: string;
}
