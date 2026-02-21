"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "./LoginModal";

interface AuthContextValue {
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({ logout: () => {} });

export function useAuthContext() {
  return useContext(AuthContext);
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, error, login, logout, clearError } = useAuth();

  // Prevent background scrolling when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthenticated]);

  // Show nothing while checking auth (prevents flash)
  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto"
        style={{
          background: "#0A0A0A",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse-neon"
            style={{
              background: "rgba(255,107,0,0.08)",
              border: "1px solid rgba(255,107,0,0.18)",
            }}
          >
            <svg
              className="w-6 h-6 text-istk-accent animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-xs text-istk-textDim">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return <LoginModal onLogin={login} error={error} onClearError={clearError} />;
  }

  // Authenticated — render app with logout context
  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
}
