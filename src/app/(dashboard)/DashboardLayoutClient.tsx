"use client";

import { useState, type ReactNode } from "react";
import { useAppStore } from "@/src/store/useAppStore";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import SidebarContent from "@/src/components/dashboard/Sidebar";
import Header from "@/src/components/dashboard/Header";
import TabBar from "@/src/components/dashboard/TabBar";

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading } = useAuthGuard();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <span
          className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#10294B]"
          role="status"
          aria-label="Checking access"
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-50">
      <aside
        className={`hidden shrink-0 transition-[width] duration-200 md:block ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          mobileOpen={mobileOpen}
          onToggleMobile={() => setMobileOpen((open) => !open)}
        />
        <TabBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
