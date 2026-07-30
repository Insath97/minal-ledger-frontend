import { create } from "zustand";
import type { User } from "@/lib/api/auth";
import * as authApi from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (login: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ login, password });
      if (response.status === "success") {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
        throw new Error(response.message || "Login failed");
      }
    } catch (error: unknown) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
      authApi.setAccessToken(null);
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      if (response.status === "success") {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  hasPermission: (permissionName: string) => {
    const user = get().user;
    if (!user) return false;
    return user.roles.some((role) =>
      role.permissions?.some((p) => p.name === permissionName)
    );
  },

  hasAnyPermission: (permissionNames: string[]) => {
    const user = get().user;
    if (!user) return false;
    return user.roles.some((role) =>
      role.permissions?.some((p) => permissionNames.includes(p.name))
    );
  },
}));
