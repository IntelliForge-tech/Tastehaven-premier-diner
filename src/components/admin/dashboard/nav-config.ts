import {
  BookOpen,
  CalendarCheck,
  ChefHat,
  HelpCircle,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Percent,
  PhoneCall,
  Quote,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
}

/**
 * Full admin sidebar navigation. `exact: true` on Dashboard only —
 * `/admin` is a path-prefix of every other admin route, so without it
 * the Dashboard row would stay highlighted on every admin page.
 *
 * Phase 12A adds the Hero Section entry under Content Management.
 */
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
  { label: "About Section", to: "/admin/content/about", icon: BookOpen },
  { label: "Contact & Social", to: "/admin/content/contact-social", icon: PhoneCall },
  { label: "Restaurant Settings", to: "/admin/settings", icon: Settings },
];
