export type Role = {
  id: string; // UUID
  name: string;
  note: string | null;
};
 
// Backend: LoginRequest
export type LoginRequest = {
  email: string;
  password: string;
};
 
// Backend: AuthCreate
// user_role is optional here: a public register form should not pick its own
// role. Let the backend assign a default role (see notes) and only send
// user_role from an admin screen.
export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  user_role?: string; // UUID
};

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetConfirmRequest = {
  token: string;
  new_password: string;
};
 
// Backend: AuthResponse (no password, no timestamps)
export type AuthUser = {
  id: string; // UUID
  username: string;
  email: string;
  role: Role;
};
 
// Backend: TokenResponse
export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};
