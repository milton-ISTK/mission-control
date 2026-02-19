"use client";

import { Building2, Sparkles, Users, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";

export default function OfficeView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] py-16 px-4">
      {/* Animated Icon Container */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-istk-accent/10 flex items-center justify-center shadow-neu-lg animate-glow">
          <Building2 className="w-12 h-12 text-istk-accent" />
        </div>
        {/* Floating orbs */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-istk-purple/30 flex items-center justify-center animate-bounce">
          <Sparkles className="w-3 h-3 text-istk-purple" />
        </div>
        <div className="absolute -bottom-1 -left-3 w-5 h-5 rounded-full bg-istk-success/30 flex items-center justify-center animate-pulse-slow">
          <Users className="w-3 h-3 text-istk-success" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gradient mb-3 text-center">
        Office View
      </h2>
      <p className="text-istk-textMuted text-center max-w-md mb-2">
        An animated, interactive office scene is coming in Phase 2.
      </p>
      <p className="text-sm text-istk-textDim text-center max-w-lg mb-8">
        Watch your agents move around a virtual office — see who&apos;s working, what they&apos;re doing,
        and where they are in real time. Think &quot;The Sims&quot; meets mission control.
      </p>

      {/* Phase 2 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
        <div className="neu-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-istk-info/10 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg">🏢</span>
          </div>
          <h4 className="text-xs font-semibold text-istk-text mb-1">Interactive Floor Plan</h4>
          <p className="text-[10px] text-istk-textDim">
            Drag agents to desks, meeting rooms, or break areas
          </p>
        </div>
        <div className="neu-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-istk-success/10 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg">🤖</span>
          </div>
          <h4 className="text-xs font-semibold text-istk-text mb-1">Live Agent Activity</h4>
          <p className="text-[10px] text-istk-textDim">
            See real-time status: coding, researching, idle, meeting
          </p>
        </div>
        <div className="neu-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-istk-purple/10 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg">💬</span>
          </div>
          <h4 className="text-xs font-semibold text-istk-text mb-1">Chat Bubbles</h4>
          <p className="text-[10px] text-istk-textDim">
            Floating speech bubbles show recent agent messages
          </p>
        </div>
      </div>

      {/* Phase Badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-istk-accent/10 border border-istk-accent/20">
        <span className="text-xs font-semibold text-istk-accent">Phase 2</span>
        <ArrowRight className="w-3 h-3 text-istk-accent" />
        <span className="text-xs text-istk-textMuted">Coming Soon</span>
      </div>
    </div>
  );
}
