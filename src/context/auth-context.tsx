"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { auth } from "@/lib/api";
import type { AppUser } from "@/lib/types";

interface AuthContextType {
  isAuthenticated: boolean;
  justLoggedIn: boolean;
  user: AppUser | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  clearJustLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    auth.check()
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // No session
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const data = await auth.login(pin);
      setUser(data.user);
      setIsAuthenticated(true);
      setJustLoggedIn(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    auth.logout().catch(() => {});
    setIsAuthenticated(false);
    setJustLoggedIn(false);
    setUser(null);
  }, []);

  const clearJustLoggedIn = useCallback(() => setJustLoggedIn(false), []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, justLoggedIn, user, login, logout, clearJustLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
