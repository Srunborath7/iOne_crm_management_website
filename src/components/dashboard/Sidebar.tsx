// components/dashboard/Sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/public/logo.png";
import { navItems, isActive } from "./nav";
import { LogOut } from "lucide-react";
import { authApi } from "@/src/services/auth/auths.api";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/ui/ToastProvider";

type Props = {
  collapsed: boolean;
  onNavigate?: () => void; // closes the mobile drawer
};

export default function SidebarContent({ collapsed, onNavigate }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  async function handleLogout() {
    if (!(await toast.confirm("Are you sure you want to log out?"))) return;
    authApi.logout(); // clears cookie, localStorage and the store
    router.replace("/auth/login");
  }
  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";
  return (
    <div className="flex h-full flex-col bg-[#10294B] text-white">
      <div
        className={`flex h-16 items-center gap-3 border-b border-white/10 ${
          collapsed ? "justify-center px-2" : "px-5"
        }`}
      >
        <Image
          src={logo}
          alt="iOne logo"
          className="h-9 w-auto rounded-lg"
          priority
        />
        {!collapsed && (
          <span className="truncate text-base font-semibold tracking-tight">
            iOne CRM
          </span>
        )}
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Main"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-white/15 text-white"
                  : "text-blue-100/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center">
        <div>
          {!collapsed && (
            <p className="border-t border-white/10 px-5 py-4 text-xs text-blue-100/50">
              &copy; iOne CRM Management
            </p>
          )}
        </div>
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
    </div>
  );
}
