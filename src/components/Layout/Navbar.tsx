"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Zap, LogOut, RefreshCw } from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthGuard";
import { fetchWeather, type WeatherData } from "@/lib/weather";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Task Board",
  "/calendar": "Calendar",
  "/memories": "Memories",
  "/team": "Team",
  "/subagents": "Subagents",
  "/content": "Content Pipeline",
};

function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Europe/London",
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <span
      className="font-mono text-sm text-istk-text tabular-nums"
      style={{ textShadow: "0 0 8px rgba(255,107,0,0.15)" }}
    >
      {time}
    </span>
  );
}

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWeather();
      setWeather(data);
    } catch {
      // silent fail — widget will show nothing
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    // Refresh every 30 minutes
    const id = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [loadWeather]);

  if (loading && !weather) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-istk-textDim">
        <RefreshCw className="w-3 h-3 animate-spin" />
      </div>
    );
  }

  if (!weather || weather.weatherCode === -1) return null;

  return (
    <button
      onClick={loadWeather}
      className="flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      title={`${weather.description} · Shropshire · Click to refresh`}
    >
      <span className="text-base leading-none">{weather.icon}</span>
      <span className="text-sm text-istk-text font-medium">{weather.temperature}°C</span>
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuthContext();
  const title = (pathname ? pageTitles[pathname] : undefined) || "Mission Control";

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-40"
      style={{
        background: "rgba(10,10,14,0.65)",
        borderBottom: "1px solid rgba(255,107,0,0.08)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "0 1px 20px rgba(0,0,0,0.3), 0 1px 0 rgba(255,107,0,0.04)",
      }}
    >
      {/* Left: Greeting + Page Title */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] text-istk-textDim font-medium tracking-wide uppercase">
            Hello Gregory
          </span>
          <h2
            className="text-lg font-bold text-istk-text -mt-0.5"
            style={{
              textShadow: "0 0 15px rgba(255,107,0,0.15)",
            }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Right: Weather + Time + Status + Logout */}
      <div className="flex items-center gap-4">
        {/* Weather */}
        <WeatherWidget />

        {/* Divider */}
        <div className="w-px h-6 bg-[rgba(255,107,0,0.08)]" />

        {/* Live Clock */}
        <LiveClock />

        {/* Divider */}
        <div className="w-px h-6 bg-[rgba(255,107,0,0.08)]" />

        {/* Live Status indicator */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(255,107,0,0.04)",
            border: "1px solid rgba(255,107,0,0.12)",
            boxShadow: "0 0 8px rgba(255,107,0,0.06)",
          }}
        >
          <span className="status-dot status-active" />
          <span className="text-xs text-istk-textMuted font-medium">Live</span>
        </div>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-istk-accent drop-shadow-[0_0_6px_rgba(255,107,0,0.4)]" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neon-orange">
            ISTK
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[rgba(255,107,0,0.08)]" />

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 group"
          style={{
            background: "rgba(248,113,113,0.04)",
            border: "1px solid rgba(248,113,113,0.10)",
          }}
          title="Sign out"
        >
          <LogOut className="w-4 h-4 text-istk-danger/70 group-hover:text-istk-danger transition-colors" />
          <span className="text-xs text-istk-textDim group-hover:text-istk-danger font-medium transition-colors">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}
