// src/lib/session.ts
import { useAppStore } from '@/src/store/useAppStore';
import type { AuthUser } from '@/src/services/auth/type';

const ACCESS_TOKEN_KEY = 'inventory_access_token';
const USER_KEY = 'inventory_user_data';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const tokenInStore = useAppStore.getState().accessToken;
  if (tokenInStore) return tokenInStore;
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${ACCESS_TOKEN_KEY}=`));
  return cookie ? decodeURIComponent(cookie.slice(ACCESS_TOKEN_KEY.length + 1)) : null;
}

export function saveSession(accessToken: string, user?: AuthUser | null): void {
  if (typeof window === 'undefined') return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(accessToken)}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;

  if (user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore (private mode, quota)
    }
  }

  // Keep the in-memory store in sync so components update immediately.
  useAppStore.getState().setSession(accessToken, user ?? null);
}

export function getSavedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Call once on app start. After a page refresh the store is empty, but the
 * cookie and localStorage still hold the session, so copy them back in.
 */
export function restoreSession(): void {
  if (typeof window === 'undefined') return;
  const { accessToken, currentUser, setSession } = useAppStore.getState();
  if (accessToken && currentUser) return;

  const token = getAccessToken(); // falls back to the cookie
  if (!token) return;
  setSession(token, getSavedUser());
}

export function clearSession(): void {
  useAppStore.getState().clearSession();
  if (typeof window === 'undefined') return;

  document.cookie = `${ACCESS_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}