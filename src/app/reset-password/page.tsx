"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "@/public/logo.png";
import { useToast } from "@/src/components/ui/ToastProvider";
import { authApi } from "@/src/services/auth/auths.api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      toast.error("This reset link is missing its token. Request a new one.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: password });
      toast.clear();
      toast.success("Password reset. You can now sign in with your new password.");
      router.replace("/auth/login");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not reset the password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (token === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#10294B]"
          role="status"
          aria-label="Loading reset link"
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/auth/login" className="mb-8 inline-flex items-center gap-3">
          <Image src={logo} alt="iOne logo" className="h-10 w-auto rounded-lg" priority />
          <span className="font-semibold tracking-tight text-slate-900">iOne CRM</span>
        </Link>

        {!token ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Invalid reset link
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This link is missing its reset token. Request a new password reset email to continue.
            </p>
            <Link
              href="/auth/forgot-password"
              className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-[#10294B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#183a69] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Choose a new password
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use at least 8 characters. Reset links expire and can only be used once.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="password123"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-16 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 px-3.5 text-sm font-medium text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:text-blue-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="password123"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-invalid={mismatch}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                    mismatch
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/30"
                  }`}
                />
                {mismatch && (
                  <p className="mt-1.5 text-xs text-red-600">Passwords do not match.</p>
                )}
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
                {loading ? "Updating password" : "Reset password"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
