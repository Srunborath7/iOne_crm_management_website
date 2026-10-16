"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ChartNoAxesCombined, Target, Users } from "lucide-react";
import { useAppStore } from "@/src/store/useAppStore";

const shortcuts = [
  {
    title: "Customers",
    description: "View and manage customer records.",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Leads",
    description: "Review your sales leads.",
    href: "/leads",
    icon: Target,
  },
  {
    title: "Deals",
    description: "Keep track of active deals.",
    href: "/deals",
    icon: BriefcaseBusiness,
  },
  {
    title: "Reports",
    description: "Explore your CRM reports.",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
];

export default function DashboardPage() {
  const user = useAppStore((s) => s.currentUser);
  const initial = user?.username?.charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          Workspace
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Dashboard
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Your customer relationships and sales activity, all in one place.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl bg-[#10294B] text-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-blue-100">Your workspace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {user ? `Welcome back, ${user.username}` : "Welcome to iOne CRM"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              {user?.role?.name
                ? `Signed in as ${user.role.name}. Pick up where you left off.`
                : "Manage customers, leads, and deals from your dashboard."}
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold ring-1 ring-inset ring-white/15">
            {initial ?? "i"}
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300" />
      </section>

      <section aria-labelledby="shortcuts-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="shortcuts-heading" className="text-lg font-semibold text-slate-900">
              Quick access
            </h2>
            <p className="mt-1 text-sm text-slate-500">Go straight to a section of your CRM.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#10294B] transition group-hover:bg-blue-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
