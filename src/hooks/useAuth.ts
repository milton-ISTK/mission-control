"use client";

import { useState, useEffect, useCallback } from "react";

const AUTH_TOKEN_KEY = "istk_auth_token";
const AUTH_TIMESTAMP_KEY = "istk_auth_ts";
const REMEMBER_ME_KEY = "istk_remember_me";

// Simple hash for credential verification (not storing plaintext)
// In production, this would be server-side auth
function hashCredentials(username: string, password: string): string {
  let hash = 0;
  const str = `${username}:${password}:istk_salt_v1`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `istk_${Math.abs(hash).toString(36)}`;
}

// Pre-computed valid token
const VALID_TOKEN = hashCredentials("admin", "2412");

// Token expires after 30 days
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);

    if (token && token === VALID_TOKEN) {
      // Check expiry if remember me was set
      if (rememberMe === "true") {
        const ts = parseInt(timestamp || "0", 10);
        if (Date.now() - ts < TOKEN_EXPIRY_MS) {
          setState({ isAuthenticated: true, isLoading: false, error: null });
          return;
        }
      } else {
        // Session-only auth — check if sessionStorage has the flag
        const sessionFlag = sessionStorage.getItem(AUTH_TOKEN_KEY);
        if (sessionFlag === token) {
          setState({ isAuthenticated: true, isLoading: false, error: null });
          return;
        }
      }
    }

    // Clear any stale tokens
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);

    setState({ isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const login = useCallback((username: string, password: string, rememberMe: boolean): boolean => {
    const token = hashCredentials(username, password);

    if (token === VALID_TOKEN) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());

      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, "true");
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      }

      setState({ isAuthenticated: true, isLoading: false, error: null });
      return true;
    }

    setState((prev) => ({ ...prev, error: "Invalid credentials" }));
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    setState({ isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return { ...state, login, logout, clearError };
}
