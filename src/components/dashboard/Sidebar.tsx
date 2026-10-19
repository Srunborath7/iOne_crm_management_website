"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import logo from "@/public/logo.png";
import {
  navItems,
  isActive,
  isGroup,
  isGroupActive,
  type NavGroup,
  type NavLink,
} from "./nav";
import { authApi } from "@/src/services/auth/auths.api";
import { useToast } from "@/src/components/ui/ToastProvider";

type Props = {
  collapsed: boolean;
  onNavigate?: () => void; // closes the mobile drawer
};

function NavLinkItem({
  item,
  collapsed,
  pathname,
  onNavigate,
  nested = false,
}: {
  item: NavLink;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
  nested?: boolean;
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        collapsed ? "justify-center" : ""
      } ${nested && !collapsed ? "py-2 pl-4" : ""} ${
        active
          ? "bg-white/15 text-white"
          : "text-blue-100/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon
        className={`shrink-0 ${nested && !collapsed ? "h-4 w-4" : "h-5 w-5"}`}
        aria-hidden="true"
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function NavGroupItem({
  group,
  collapsed,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const groupActive = isGroupActive(pathname, group);
  const [open, setOpen] = useState(groupActive);
  const Icon = group.icon;

  // Open automatically when navigating into one of the children
  useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive]);

  // Collapsed sidebar: show the children as icon-only links
  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.children.map((child) => (
          <NavLinkItem
            key={child.href}
            item={child}
            collapsed
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  const panelId = `nav-group-${group.label.toLowerCase()}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
          groupActive && !open
            ? "bg-white/15 text-white"
            : "text-blue-100/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-2"
        >
          {group.children.map((child) => (
            <NavLinkItem
              key={child.href}
              item={child}
              collapsed={false}
              pathname={pathname}
              onNavigate={onNavigate}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
        {navItems.map((item) =>
          isGroup(item) ? (
            <NavGroupItem
              key={item.label}
              group={item}
              collapsed={collapsed}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ) : (
            <NavLinkItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ),
        )}
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