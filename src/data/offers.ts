import type { Offer } from "@/types/restaurant";

export const OFFERS: Offer[] = [
  { title: "20% Off Weekdays", desc: "Every Monday to Thursday, 5–7 PM. Enjoy the full menu at a warm discount.", tag: "Weekly", icon: "fa-percent" },
  { title: "Buy One, Get One Pizza", desc: "Order any signature pizza and the second is on the house. Fridays only.", tag: "Friday", icon: "fa-pizza-slice" },
  { title: "Free Dessert Over $50", desc: "A complimentary Molten Gold Cake with every order above $50.", tag: "Always", icon: "fa-cake-candles" },
];
