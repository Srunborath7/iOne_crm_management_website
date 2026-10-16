// components/dashboard/Header.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { authApi } from "@/src/services/auth/auths.api"; // adjust to where auth.api.ts lives
import { findNavItem } from "./nav";
import { useToast } from "@/src/components/ui/ToastProvider";

export default function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore((s) => s.currentUser);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const setCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const toast = useToast();

  const title = findNavItem(pathname)?.label ?? "iOne CRM";
  const initial = user?.username?.charAt(0).toUpperCase() ?? "";

  async function handleLogout() {
    if (!(await toast.confirm("Are you sure you want to log out?"))) return;
    authApi.logout(); // clears cookie, localStorage and the store
    router.replace("/auth/login");
  }

  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Mobile: open drawer */}
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Open menu"
        className={`${iconBtn} md:hidden`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop: collapse / expand sidebar */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        className={`${iconBtn} hidden md:inline-flex`}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>

      <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-3">
        {/* Placeholder until the user is restored from the session */}
        {user ? (
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10294B] text-sm font-semibold text-white"
              aria-hidden="true"
            >
              {initial}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-slate-900 lowercase first-letter:uppercase">{user.username}</p>
              <p className="text-xs text-slate-500">{user.role?.name.toUpperCase()}</p>
            </div>
          </div>
        ) : (
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className={iconBtn}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
