import {
  CalendarCheck,
  ChefHat,
  HelpCircle,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Percent,
  Quote,
  Settings,
  Settings2,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Menu", to: "/admin/menu", icon: UtensilsCrossed },
  { label: "Gallery", to: "/admin/gallery", icon: Image },
  { label: "Reservations", to: "/admin/reservations", icon: CalendarCheck },
  { label: "Testimonials", to: "/admin/testimonials", icon: Quote },
  { label: "Chefs", to: "/admin/chefs", icon: ChefHat },
  { label: "Offers", to: "/admin/offers", icon: Percent },
  { label: "FAQ", to: "/admin/faq", icon: HelpCircle },
  { label: "Contact Messages", to: "/admin/messages", icon: Mail },
  { label: "Hero Section", to: "/admin/content/hero", icon: LayoutTemplate },
  { label: "About Section", to: "/admin/content/about", icon: LayoutTemplate },
  { label: "Site Settings", to: "/admin/content/site-settings", icon: Settings2 },
  { label: "Restaurant Settings", to: "/admin/settings", icon: Settings },
];
