import dishPizza from "@/assets/dish-pizza.jpg";
import dishBurger from "@/assets/dish-burger.jpg";
import dishPasta from "@/assets/dish-pasta.jpg";
import dishIndian from "@/assets/dish-indian.jpg";
import dishChinese from "@/assets/dish-chinese.jpg";
import dishDessert from "@/assets/dish-dessert.jpg";
import dishDrinks from "@/assets/dish-drinks.jpg";
import type { Category, Dish } from "@/types/restaurant";

export const CATEGORIES: Category[] = [
  "All",
  "Pizza",
  "Burgers",
  "Pasta",
  "Indian",
  "Chinese",
  "Desserts",
  "Drinks",
];

export const DISHES: Dish[] = [
  { name: "Margherita Regina", category: "Pizza", desc: "San Marzano tomato, buffalo mozzarella, fresh basil.", price: 18, rating: 4.9, image: dishPizza },
  { name: "Truffle Smash Burger", category: "Burgers", desc: "Double patty, aged cheddar, black truffle aioli.", price: 22, rating: 4.8, image: dishBurger },
  { name: "Tagliatelle al Tartufo", category: "Pasta", desc: "Hand-rolled pasta, parmesan cream, black truffle.", price: 26, rating: 4.9, image: dishPasta },
  { name: "Butter Chicken Royale", category: "Indian", desc: "Tandoor chicken, tomato-cashew gravy, saffron rice.", price: 24, rating: 4.7, image: dishIndian },
  { name: "Kung Pao Chicken", category: "Chinese", desc: "Wok-fired chicken, chili, cashews, Sichuan pepper.", price: 21, rating: 4.6, image: dishChinese },
  { name: "Molten Gold Cake", category: "Desserts", desc: "Warm chocolate lava, vanilla bean, 24k gold leaf.", price: 14, rating: 5.0, image: dishDessert },
  { name: "Smoked Old Fashioned", category: "Drinks", desc: "Bourbon, bitters, applewood smoke, orange oil.", price: 16, rating: 4.8, image: dishDrinks },
  { name: "Diavola Fuoco", category: "Pizza", desc: "Spicy salami, chili honey, smoked mozzarella.", price: 20, rating: 4.7, image: dishPizza },
];
