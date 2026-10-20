"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { authApi } from "@/src/services/auth/auths.api";
import { findNavItem } from "./nav";
import { useToast } from "@/src/components/ui/ToastProvider";

export default function Header({
  mobileOpen,
  onToggleMobile,
}: {
  mobileOpen: boolean;
  onToggleMobile: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore((state) => state.currentUser);
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const setCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const toast = useToast();

  const title = findNavItem(pathname)?.label ?? "iOne CRM";
  const username = user?.username || "Account";
  const initial = username.charAt(0).toUpperCase();
  const role = user?.role?.name;
  const iconButton =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

  async function handleLogout() {
    if (!(await toast.confirm("Are you sure you want to log out?"))) return;
    authApi.logout();
    router.replace("/auth/login");
  }

  return (
    <header className={`${mobileOpen ? "z-50" : "z-20"} relative flex h-[68px] shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur sm:px-6`}>
      <button
        type="button"
        onClick={onToggleMobile}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
        className={`${iconButton} md:hidden`}
      >
        {mobileOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <div className="hidden md:block">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className={iconButton}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="min-w-0 border-l border-slate-200 pl-3 sm:pl-5">
        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
          Workspace
        </p>
        <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:px-3"
        >
          <Home size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <span className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden="true" />

        {user ? (
          <div className="flex items-center gap-2.5 rounded-xl py-1 pl-1 sm:pr-1.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#173b68] to-[#10294B] text-sm font-semibold text-white shadow-sm ring-1 ring-[#10294B]/10"
              aria-hidden="true"
            >
              {initial}
            </span>
            <div className="hidden min-w-0 leading-tight sm:block">
              <p className="max-w-36 truncate text-sm font-semibold text-slate-800">
                {username}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                {role || "Team member"}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className={`${iconButton} h-9 w-9 text-slate-500 hover:bg-red-50 hover:text-red-700`}
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
