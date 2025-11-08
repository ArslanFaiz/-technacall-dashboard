import type { User as BaseUser } from "../types";

interface AuthUser extends BaseUser {
  email?: string;
  password?: string;
}

const KEY = "my_dashboard_user";

export const auth = {
  login(user: AuthUser) {
    localStorage.setItem(KEY, JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem(KEY);
  },
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  isLoggedIn(): boolean {
    return !!auth.getUser();
  },
  loginWithCredentials(email: string, password: string): boolean {
    const stored = auth.getUser();
    if (!stored) return false;

    if (stored.email === email && stored.password === password) {
      return true;
    }
    return false;
  },
  register(user: AuthUser) {
    localStorage.setItem(KEY, JSON.stringify(user));
  },
};
