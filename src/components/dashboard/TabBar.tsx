"use client";

import { useEffect, type DragEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";
import { findNavItem, isActive, navItems } from "./nav";

const TABS_STORAGE_KEY = "ione-crm-open-tabs";

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = useAppStore((s) => s.tabs);
  const hydrated = useAppStore((s) => s.tabsHydrated);
  const closeTab = useAppStore((s) => s.closeTab);
  const moveTab = useAppStore((s) => s.moveTab);

  // Restore open tabs after refresh, accepting only known application routes.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TABS_STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      const validTabs = Array.isArray(parsed)
        ? parsed.filter(
            (tab): tab is { href: string; label: string } =>
              typeof tab?.href === "string" &&
              typeof tab?.label === "string" &&
              navItems.some((item) => item.href === tab.href && item.label === tab.label),
          )
        : [];
      useAppStore.getState().restoreTabs(validTabs);
    } catch {
      // Ignore malformed or unavailable browser storage.
      useAppStore.getState().restoreTabs([]);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
    } catch {
      // Navigation still works if browser storage is unavailable.
    }
  }, [hydrated, tabs]);

  // Add the active page after restoration, including on a direct page load.
  useEffect(() => {
    if (!hydrated) return;
    const item = findNavItem(pathname);
    if (item) useAppStore.getState().openTab({ href: item.href, label: item.label });
  }, [hydrated, pathname]);

  function handleClose(href: string) {
    const remaining = tabs.filter((tab) => tab.href !== href);
    closeTab(href);
    if (isActive(pathname, href)) {
      router.push(remaining[remaining.length - 1]?.href ?? "/dashboard");
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, targetHref: string) {
    event.preventDefault();
    const sourceHref = event.dataTransfer.getData("text/plain");
    if (sourceHref) moveTab(sourceHref, targetHref);
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
          <div
            key={tab.href}
            role="tab"
            aria-selected={active}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", tab.href);
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, tab.href)}
            className={`group flex shrink-0 cursor-grab items-center gap-2 rounded-t-lg border border-b-0 px-3.5 py-2 text-sm transition active:cursor-grabbing ${
              active
                ? "border-slate-200 bg-slate-50 font-medium text-slate-900"
                : "border-transparent text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <Link href={tab.href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
              {tab.label}
            </Link>
            <button
              type="button"
              onClick={() => handleClose(tab.href)}
              aria-label={`Close ${tab.label}`}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-300/70 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
