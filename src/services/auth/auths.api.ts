// services/auth/auth.api.ts
import { httpClient } from '@/src/services/http/client'; // adjust to where your httpClient lives
import { saveSession, clearSession } from '@/src/lib/session';
import type { AuthUser, LoginRequest, PasswordResetConfirmRequest, PasswordResetRequest, RegisterRequest } from '@/src/services/auth/type';

// Your API may return the object directly or wrapped as { data: ... }
// (your old code read response.data.access_token). Handle both.
function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as Record<string, unknown>).data as T;
  }
  return res as T;
}

type LoginPayload = { access_token: string; user?: AuthUser };

export const authApi = {
  /** Log in, store the session, then return the current user. */
  async login(data: LoginRequest): Promise<AuthUser> {
    const raw = await httpClient.post<unknown>('/auths/login', data);
    const payload = unwrap<LoginPayload>(raw);

    if (process.env.NODE_ENV === 'development') {
      console.log('[login] raw response:', raw);
    }

    const token = payload?.access_token;
    if (!token) {
      throw new Error('Login response did not include an access_token.');
    }

    // httpClient reads the token from the session on every request.
    saveSession(token);

    let user = payload.user ?? null;
    if (!user) {
      try {
        user = unwrap<AuthUser>(await httpClient.get<unknown>('/auths/me'));
      } catch (err) {
        clearSession(); // don't leave a half-logged-in session behind
        throw err;
      }
    }

    saveSession(token, user); // cookie + localStorage + store
    return user;
  },

  register(data: RegisterRequest): Promise<AuthUser> {
    return httpClient.post<unknown>('/auths/register', data).then((r) => unwrap<AuthUser>(r));
  },

  requestPasswordReset(data: PasswordResetRequest): Promise<unknown> {
    return httpClient.post<unknown>('/auths/forgot-password', data);
  },

  resetPassword(data: PasswordResetConfirmRequest): Promise<unknown> {
    return httpClient.post<unknown>('/auths/reset-password', data);
  },

  async me(): Promise<AuthUser> {
    return unwrap<AuthUser>(await httpClient.get<unknown>('/auths/me'));
  },

  logout(): void {
    clearSession();
  },
};
