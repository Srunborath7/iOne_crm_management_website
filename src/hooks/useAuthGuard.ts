"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authApi } from "@/src/services/auth/auths.api";
import type { AuthUser } from "@/src/services/auth/type";
import { clearSession, getAccessToken, restoreSession } from "@/src/lib/session";
import { canAccess, getHomeRoute } from "@/src/lib/roles";
import { useAppStore } from "@/src/store/useAppStore";

export function useAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      restoreSession();
      if (!getAccessToken()) {
        router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      let currentUser = useAppStore.getState().currentUser;
      if (!currentUser) {
        try {
          currentUser = await authApi.me();
          useAppStore.getState().setCurrentUser(currentUser);
        } catch {
          clearSession();
          router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
      }

      if (!active) return;
      if (!canAccess(currentUser, pathname)) {
        router.replace(getHomeRoute(currentUser));
        return;
      }

      setUser(currentUser);
      setLoading(false);
    }

    void checkAccess();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  return { user, loading };
}
