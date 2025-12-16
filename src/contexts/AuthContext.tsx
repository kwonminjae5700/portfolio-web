"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { ADMIN_EMAIL } from "@/lib/constants";
import type { User } from "@/types/api";

const TOKEN_KEY = "token";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  canWrite: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("프로필 조회 실패:", error);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const canWrite = useMemo(() => {
    return !!user && user.email === ADMIN_EMAIL;
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    canWrite,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
