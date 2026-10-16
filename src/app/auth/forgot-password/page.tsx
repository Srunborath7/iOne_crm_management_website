"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { authApi } from "@/src/services/auth/auths.api";
import { useToast } from "@/src/components/ui/ToastProvider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await authApi.requestPasswordReset({ email: email.trim() });
      setSubmitted(true);
      toast.success("If an account matches that email, reset instructions are on the way.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not request a password reset. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/auth/login" className="mb-8 inline-flex items-center gap-3">
          <Image src={logo} alt="iOne logo" className="h-10 w-auto rounded-lg" priority />
          <span className="font-semibold tracking-tight text-slate-900">iOne CRM</span>
        </Link>

        {submitted ? (
          <div aria-live="polite">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <span className="text-xl" aria-hidden="true">✓</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Check your email
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              If an account exists for <strong className="font-medium text-slate-800">{email}</strong>,
              you’ll receive instructions to reset your password.
            </p>
            <Link
              href="/auth/login"
              className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-[#10294B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183a69] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Reset your password
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the email address associated with your account. We’ll send reset instructions if it exists.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

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
                {loading ? "Sending instructions" : "Send reset instructions"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              Remembered your password?{" "}
              <Link href="/auth/login" className="font-semibold text-blue-700 hover:text-blue-800">
                Sign in
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
