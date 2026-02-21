"use client";

import { useState, useCallback, useEffect } from "react";
import { Zap, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

interface LoginModalProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => boolean;
  error: string | null;
  onClearError: () => void;
}

export default function LoginModal({ onLogin, error, onClearError }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onClearError();
      setIsSubmitting(true);

      // Small delay for UX feel
      setTimeout(() => {
        const success = onLogin(username, password, rememberMe);
        setIsSubmitting(false);

        if (!success) {
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }
      }, 400);
    },
    [username, password, rememberMe, onLogin, onClearError]
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto"
      style={{
        background: "rgba(4,4,6,0.92)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
      }}
    >
      {/* Ambient glow effects */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Login Card */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-2xl overflow-hidden transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        } ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
        style={{
          background: "rgba(12,12,16,0.85)",
          border: "1px solid rgba(255,107,0,0.12)",
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.04),
            0 0 40px rgba(255,107,0,0.08),
            0 0 80px rgba(255,107,0,0.04),
            0 8px 32px rgba(0,0,0,0.6),
            0 32px 80px rgba(0,0,0,0.4)
          `,
          backdropFilter: "blur(40px)",
        }}
      >
        {/* Top accent line */}
        <div
          className="h-[2px] w-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,107,0,0.5), transparent)",
            boxShadow: "0 0 15px rgba(255,107,0,0.3)",
          }}
        />

        <div className="p-8">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(255,107,0,0.08)",
                border: "1px solid rgba(255,107,0,0.18)",
                boxShadow: "0 0 20px rgba(255,107,0,0.1), 0 0 40px rgba(255,107,0,0.05)",
              }}
            >
              <Zap className="w-8 h-8 text-istk-accent drop-shadow-[0_0_12px_rgba(255,107,0,0.5)]" />
            </div>
            <h1
              className="text-2xl font-bold text-gradient mb-1"
              style={{ filter: "drop-shadow(0 0 15px rgba(255,107,0,0.2))" }}
            >
              ISTK Mission Control
            </h1>
            <p className="text-sm text-istk-textDim">Authenticate to access the dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 animate-fade-in"
              style={{
                background: "rgba(248,113,113,0.06)",
                border: "1px solid rgba(248,113,113,0.18)",
                boxShadow: "0 0 10px rgba(248,113,113,0.05)",
              }}
            >
              <AlertCircle className="w-4 h-4 text-istk-danger shrink-0" />
              <span className="text-sm text-istk-danger">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-istk-textDim pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  onClearError();
                }}
                className="glass-input pl-11"
                autoFocus
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-istk-textDim pointer-events-none z-10" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  onClearError();
                }}
                className="glass-input pl-11 pr-11"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-istk-textDim hover:text-istk-textMuted transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="w-5 h-5 rounded-md transition-all duration-300 peer-checked:border-istk-accent peer-focus-visible:ring-2 peer-focus-visible:ring-istk-accent/30"
                  style={{
                    background: rememberMe ? "rgba(255,107,0,0.12)" : "rgba(10,10,14,0.60)",
                    border: `1px solid ${rememberMe ? "rgba(255,107,0,0.40)" : "rgba(255,107,0,0.10)"}`,
                    boxShadow: rememberMe ? "0 0 8px rgba(255,107,0,0.15)" : "none",
                  }}
                >
                  {rememberMe && (
                    <svg className="w-5 h-5 text-istk-accent p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-istk-textMuted group-hover:text-istk-text transition-colors">
                Remember me
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="glass-button-accent w-full py-3 text-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 font-semibold">
                  <Lock className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-5 text-center" style={{ borderTop: "1px solid rgba(255,107,0,0.06)" }}>
            <p className="text-[11px] text-istk-textDim">
              <span className="text-neon-orange" style={{ textShadow: "0 0 6px rgba(255,107,0,0.15)" }}>
                ISTK
              </span>
              {" · "}Agentic Mission Control · Secure Access
            </p>
          </div>
        </div>
      </div>

      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
