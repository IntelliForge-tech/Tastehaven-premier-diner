import chef1 from "@/assets/chef-1.jpg";
import chef2 from "@/assets/chef-2.jpg";
import chef3 from "@/assets/chef-3.jpg";
import type { Chef } from "@/types/restaurant";

export const CHEFS: Chef[] = [
  { name: "Chef Antonio Rossi", role: "Executive Chef", image: chef1, bio: "20 years across Milan, Tokyo and New York. Champion of seasonal, ingredient-first cooking." },
  { name: "Chef Elena Marín", role: "Head Pastry Chef", image: chef2, bio: "Trained in Paris. Her desserts blend classical French technique with playful modern twists." },
  { name: "Chef Liam O'Connor", role: "Sous Chef", image: chef3, bio: "A grill master with a passion for smoke, char and the perfect medium-rare." },
];
