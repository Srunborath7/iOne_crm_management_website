import {
  LayoutDashboard,
  Users,
  Target,
  Briefcase,
  BarChart3,
  Settings,
  Package,
  Tag,
  Layers,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; icon: LucideIcon; children: NavLink[] };
export type NavItem = NavLink | NavGroup;

export function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

// Edit this list to match your real routes.
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  {
    label: "Products",
    icon: Package,
    children: [
      { href: "/products/brands", label: "Brands", icon: Tag },
      { href: "/products/categories", label: "Categories", icon: Layers },
    ],
  },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/deals", label: "Deals", icon: Briefcase },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isGroupActive(pathname: string, group: NavGroup): boolean {
  return group.children.some((c) => isActive(pathname, c.href));
}

export function findNavItem(pathname: string): NavLink | undefined {
  const links = navItems.flatMap((item) =>
    isGroup(item) ? item.children : [item],
  );
  return links.find((item) => isActive(pathname, item.href));
}