import { Suspense } from "react";
import HomePageClient from "./HomePageClient";

// The page waits for the browser session and role check before rendering.
export const instant = false;

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#10294B] motion-reduce:animate-none"
            role="status"
            aria-label="Loading iOne home"
          />
        </main>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}
