"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  justLoggedIn: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  clearJustLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_PIN = "1234";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem("tc_auth");
    if (session === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (pin: string): boolean => {
    if (pin === VALID_PIN) {
      setIsAuthenticated(true);
      setJustLoggedIn(true);
      sessionStorage.setItem("tc_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setJustLoggedIn(false);
    sessionStorage.removeItem("tc_auth");
  };

  const clearJustLoggedIn = () => setJustLoggedIn(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, justLoggedIn, login, logout, clearJustLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
