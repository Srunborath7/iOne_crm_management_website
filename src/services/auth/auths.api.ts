// services/auth/auth.api.ts
import { httpClient } from '@/src/services/http/client'; // adjust to where your httpClient lives
import { saveSession, clearSession } from '@/src/lib/session';
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from './type';

// BASE_URL already ends in /api/v1, so these paths are relative to it.
export const authApi = {
  /** Log in, store the session, then return the current user. */
  async login(data: LoginRequest): Promise<AuthUser> {
    const { access_token } = await httpClient.post<TokenResponse>('/auth/login', data);
    // httpClient reads the token from the session cookie on every request,
    // so save it before calling /auth/me.
    saveSession(access_token);
    const user = await httpClient.get<AuthUser>('/auth/me');
    saveSession(access_token, user); // now also caches the user in localStorage
    return user;
  },

  /** Create an account. Does not log the user in. */
  register(data: RegisterRequest): Promise<AuthUser> {
    return httpClient.post<AuthUser>('/auth/register', data);
  },

  /** Current user, based on the stored token. */
  me(): Promise<AuthUser> {
    return httpClient.get<AuthUser>('/auth/me');
  },

  logout(): void {
    clearSession();
  },
};