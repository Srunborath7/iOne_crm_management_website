"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import logo from "@/public/logo.png"; // default import, not { logo }
import Link from "next/link";

const pipeline = [
  { stage: "Leads", count: 128, width: "w-full" },
  { stage: "Qualified", count: 74, width: "w-4/5" },
  { stage: "Proposal", count: 31, width: "w-3/5" },
  { stage: "Won", count: 12, width: "w-2/5" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // TODO: replace with your auth call (NextAuth signIn, fetch("/api/login"), etc.)
      await new Promise((r) => setTimeout(r, 800));
      if (!email || !password) throw new Error("Enter your email and password.");
      // router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Email or password is incorrect."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen w-full bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop only) */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#10294B] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="iOne logo" className="h-18 rounded-2xl w-auto" priority />
          <span className="text-lg font-semibold tracking-tight">
            iOne CRM
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Every customer and every deal, in one place.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-blue-100/80">
            Track leads, follow up on time, and see what is closing this month.
          </p>

          {/* Mini pipeline: the one memorable element */}
          <div
            className="mt-10 space-y-3"
            aria-hidden="true"
          >
            {pipeline.map((p, i) => (
              <div key={p.stage} className="flex items-center gap-4">
                <span className="w-20 text-sm text-blue-100/70">{p.stage}</span>
                <div className="flex-1">
                  <div
                    className={`${p.width} flex h-9 items-center justify-end rounded-md px-3 text-sm font-medium ${
                      i === pipeline.length - 1
                        ? "bg-emerald-400 text-[#10294B]"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    {p.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-blue-100/60">
          &copy; iOne. All rights reserved.
        </p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-slate-50 px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Logo shows here on mobile */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Image src={logo} alt="iOne logo" className="h-18 rounded-2xl w-auto" priority />
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              iOne CRM
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to iOne CRM
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use your work email to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus-visible:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3.5 pr-16 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 px-3.5 text-sm font-medium text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:text-blue-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#10294B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183a69] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
              )}
              {loading ? "Signing in" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
             Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-blue-700 hover:text-blue-800 focus:outline-none focus-visible:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}