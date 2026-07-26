import {
  BarChart2,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChefHat,
  Clock,
  FileText,
  HelpCircle,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Map,
  PanelBottom,
  Percent,
  Quote,
  Settings,
  Settings2,
  Shield,
  Star,
  Store,
  TableProperties,
  TrendingUp,
  Users,
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
  // Core
  { label: "Dashboard",           to: "/admin",                                   icon: LayoutDashboard, exact: true },
  { label: "Menu",                to: "/admin/menu",                              icon: UtensilsCrossed },
  { label: "Gallery",             to: "/admin/gallery",                           icon: Image },
  { label: "Reservations",        to: "/admin/reservations",                      icon: CalendarCheck },

  // Floor & Tables (Phase 13B)
  { label: "Floor Plans",         to: "/admin/floors",                            icon: Map },
  { label: "Tables",              to: "/admin/tables",                            icon: TableProperties },
  { label: "Live Floor",          to: "/admin/tables/live",                       icon: LayoutDashboard },

  // CRM (Phase 13C)
  { label: "Customers",           to: "/admin/customers",                         icon: Users },

  // Content
  { label: "Testimonials",        to: "/admin/testimonials",                      icon: Quote },
  { label: "Chefs",               to: "/admin/chefs",                             icon: ChefHat },
  { label: "Offers",              to: "/admin/offers",                            icon: Percent },
  { label: "FAQ",                 to: "/admin/faq",                               icon: HelpCircle },
  { label: "Contact Messages",    to: "/admin/messages",                          icon: Mail },

  // CMS (Phase 12)
  { label: "Hero Section",        to: "/admin/content/hero",                      icon: LayoutTemplate },
  { label: "About Section",       to: "/admin/content/about",                     icon: LayoutTemplate },
  { label: "Restaurant Information", to: "/admin/content/restaurant-information", icon: Store },
  // { label: "Footer",              to: "/admin/content/footer",                    icon: PanelBottom },
  { label: "Site Settings",       to: "/admin/content/site-settings",             icon: Settings2 },

  // Staff (Phase 13D)
  { label: "Staff",               to: "/admin/staff",                             icon: Users },
  { label: "Departments",         to: "/admin/staff/departments",                 icon: Building2 },
  { label: "Shifts",              to: "/admin/staff/shifts",                      icon: Clock },
  { label: "Attendance",          to: "/admin/staff/attendance",                  icon: CalendarDays },
  { label: "Leave",               to: "/admin/staff/leave",                       icon: FileText },
  { label: "Performance",         to: "/admin/staff/performance",                 icon: Star },
  { label: "Staff Analytics",     to: "/admin/staff/analytics",                   icon: TrendingUp },

  // Settings & Access
  // { label: "Restaurant Settings", to: "/admin/settings",                          icon: Settings },

  // RBAC (Phase 13E)
  { label: "Roles & Permissions", to: "/admin/access",                            icon: Shield },
  { label: "Permission Matrix",   to: "/admin/access/matrix",                     icon: Shield },
  { label: "Staff Roles",         to: "/admin/access/staff",                      icon: Shield },
  { label: "Audit Log",           to: "/admin/access/audit",                      icon: BarChart2 },
];
