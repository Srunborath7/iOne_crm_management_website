"use client";

import Link from "next/link";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import { isCustomer } from "@/src/lib/roles";

export default function HomePageClient() {
  const { user, loading } = useAuthGuard();

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#10294B]"
          role="status"
          aria-label="Checking access"
        />
      </main>
    );
  }

  const customer = isCustomer(user);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <span className="text-lg font-bold tracking-tight text-[#10294B]">iOne CRM</span>
          <span className="text-sm font-medium capitalize text-slate-600">
            {user.role.name} home
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <section className="overflow-hidden rounded-3xl bg-[#10294B] text-white shadow-lg shadow-slate-900/10">
          <div className="p-7 sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              {customer ? "Customer portal" : "Workspace"}
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              Welcome, {user.username}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-blue-100">
              {customer
                ? "Your iOne customer home is ready. Account information and updates will be available here."
                : `You are signed in as ${user.role.name}. Open your workspace to manage CRM activity.`}
            </p>
            {!customer && (
              <Link
                href="/dashboard"
                className="mt-7 inline-flex rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#10294B] transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10294B]"
              >
                Switch to dashboard
              </Link>
            )}
          </div>
          <div className="h-1.5 bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300" />
        </section>

        {customer && (
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{user.username}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="mt-2 break-words text-lg font-semibold text-slate-900">{user.email}</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
