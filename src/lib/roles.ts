import type { AuthUser } from "@/src/services/auth/type";

const CUSTOMER_ROUTES = ["/"] as const;

function roleName(user: AuthUser): string {
  return user.role?.name?.trim().toLowerCase() ?? "";
}

export function isCustomer(user: AuthUser): boolean {
  return roleName(user) === "customer";
}

export function isAdmin(user: AuthUser): boolean {
  return roleName(user) === "admin";
}

export function canAccess(user: AuthUser, pathname: string): boolean {
  if (!isCustomer(user)) return true;

  return CUSTOMER_ROUTES.some((route) =>
    route === "/"
      ? pathname === "/"
      : pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function getHomeRoute(user: AuthUser): string {
  return isCustomer(user) ? "/" : "/dashboard";
}
