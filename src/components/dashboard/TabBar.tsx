// components/dashboard/TabBar.tsx
"use client";

import { useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { findNavItem, isActive } from "./nav";

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = useAppStore((s) => s.tabs);
  const closeTab = useAppStore((s) => s.closeTab);

  // Open a tab for every page the user visits.
  useEffect(() => {
    const item = findNavItem(pathname);
    if (item) {
      useAppStore.getState().openTab({ href: item.href, label: item.label });
    }
  }, [pathname]);

  function handleClose(e: MouseEvent, href: string) {
    e.preventDefault();
    e.stopPropagation();
    const remaining = tabs.filter((t) => t.href !== href);
    closeTab(href);
    // Closing the page you are on moves you to the last open tab.
    if (isActive(pathname, href)) {
      router.push(remaining[remaining.length - 1]?.href ?? "/dashboard");
    }
  }

  if (tabs.length === 0) return null;

  return (
    <div
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-slate-100 px-4 pt-2 sm:px-6"
      role="tablist"
      aria-label="Open pages"
    >
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={`group flex shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-3.5 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              active
                ? "border-slate-200 bg-slate-50 font-medium text-slate-900"
                : "border-transparent text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            {tab.label}
            <button
              type="button"
              onClick={(e) => handleClose(e, tab.href)}
              aria-label={`Close ${tab.label}`}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-300/70 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Link>
        );
      })}
    </div>
  );
}
