"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Brain,
  Users,
  Bot,
  TrendingUp,
  Activity,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { cn, formatRelative } from "@/lib/utils";

export default function DashboardPage() {
  const stats = useQuery(api.dashboard.getStats);
  const recentActivity = useQuery(api.dashboard.getRecentActivity);

  if (stats === undefined) {
    return <PageLoader label="Loading dashboard..." />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Welcome to Mission Control</h1>
        <p className="text-istk-textMuted">
          Your ISTK Agentic Dashboard — real-time overview of all operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks */}
        <Link href="/tasks" className="glass-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,107,0,0.08)] flex items-center justify-center border border-[rgba(255,107,0,0.12)]">
              <KanbanSquare className="w-5 h-5 text-istk-accent" />
            </div>
            <ArrowRight className="w-4 h-4 text-istk-textDim group-hover:text-istk-accent transition-colors" />
          </div>
          <p className="text-3xl font-bold text-istk-accent">{stats?.tasks.total ?? 0}</p>
          <p className="text-xs text-istk-textMuted mt-1">Total Tasks</p>
          <div className="flex items-center gap-3 mt-3 text-[10px]">
            <span className="text-istk-info">{stats?.tasks.todo ?? 0} to do</span>
            <span className="text-istk-warning">{stats?.tasks.inProgress ?? 0} active</span>
            <span className="text-istk-success">{stats?.tasks.done ?? 0} done</span>
          </div>
        </Link>

        {/* Memories */}
        <Link href="/memories" className="glass-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(52,211,153,0.08)] flex items-center justify-center border border-[rgba(52,211,153,0.12)]">
              <Brain className="w-5 h-5 text-istk-success" />
            </div>
            <ArrowRight className="w-4 h-4 text-istk-textDim group-hover:text-istk-success transition-colors" />
          </div>
          <p className="text-3xl font-bold text-istk-success">{stats?.memories.total ?? 0}</p>
          <p className="text-xs text-istk-textMuted mt-1">Memory Entries</p>
          <div className="flex items-center gap-3 mt-3 text-[10px]">
            <span className="text-istk-success">{stats?.memories.today ?? 0} today</span>
          </div>
        </Link>

        {/* Events & Crons */}
        <Link href="/calendar" className="glass-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(96,165,250,0.08)] flex items-center justify-center border border-[rgba(96,165,250,0.12)]">
              <Calendar className="w-5 h-5 text-istk-info" />
            </div>
            <ArrowRight className="w-4 h-4 text-istk-textDim group-hover:text-istk-info transition-colors" />
          </div>
          <p className="text-3xl font-bold text-istk-info">{stats?.events.crons ?? 0}</p>
          <p className="text-xs text-istk-textMuted mt-1">Cron Jobs</p>
          <div className="flex items-center gap-3 mt-3 text-[10px]">
            <span className="text-istk-info">{stats?.events.active ?? 0} active</span>
            <span className="text-istk-danger">{stats?.events.deadlines ?? 0} deadlines</span>
          </div>
        </Link>

        {/* Team */}
        <Link href="/team" className="glass-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(167,139,250,0.08)] flex items-center justify-center border border-[rgba(167,139,250,0.12)]">
              <Users className="w-5 h-5 text-istk-purple" />
            </div>
            <ArrowRight className="w-4 h-4 text-istk-textDim group-hover:text-istk-purple transition-colors" />
          </div>
          <p className="text-3xl font-bold text-istk-purple">{stats?.agents.total ?? 0}</p>
          <p className="text-xs text-istk-textMuted mt-1">Team Members</p>
          <div className="flex items-center gap-3 mt-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="status-dot status-active" />
              <span className="text-istk-success">{stats?.agents.active ?? 0} online</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Two Column: Critical + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Tasks */}
        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-istk-text flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-istk-danger" />
              Attention Needed
            </h3>
            <Link href="/tasks">
              <Badge variant="default" className="hover:bg-[rgba(255,255,255,0.08)] cursor-pointer transition-colors">
                View All
              </Badge>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {(stats?.tasks.critical ?? 0) > 0 ? (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.1)]">
                <div className="w-2 h-2 rounded-full bg-istk-danger animate-pulse" />
                <span className="text-sm text-istk-text">
                  {stats?.tasks.critical} critical task{(stats?.tasks.critical ?? 0) > 1 ? "s" : ""} pending
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.1)]">
                <CheckCircle2 className="w-4 h-4 text-istk-success" />
                <span className="text-sm text-istk-textMuted">No critical tasks — all clear!</span>
              </div>
            )}
            {(stats?.tasks.todo ?? 0) > 0 && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(96,165,250,0.05)] border border-[rgba(96,165,250,0.1)]">
                <Clock className="w-4 h-4 text-istk-info" />
                <span className="text-sm text-istk-textMuted">
                  {stats?.tasks.todo} task{(stats?.tasks.todo ?? 0) > 1 ? "s" : ""} in backlog
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-istk-text flex items-center gap-2">
              <Activity className="w-5 h-5 text-istk-accent" />
              Recent Activity
            </h3>
          </div>
          {recentActivity === undefined ? (
            <p className="text-sm text-istk-textDim animate-pulse">Loading...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-istk-textDim">No recent activity yet.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {recentActivity.slice(0, 8).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                      item.type === "task" ? "bg-[rgba(255,107,0,0.08)]" : "bg-[rgba(52,211,153,0.08)]"
                    )}
                  >
                    {item.type === "task" ? (
                      <KanbanSquare className="w-3 h-3 text-istk-accent" />
                    ) : (
                      <Brain className="w-3 h-3 text-istk-success" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-istk-text truncate">{item.title}</p>
                    <p className="text-[10px] text-istk-textDim">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-istk-textDim shrink-0">
                    {formatRelative(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel">
        <h3 className="font-semibold text-istk-text mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-istk-accent" />
          Quick Links
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: "/tasks", icon: KanbanSquare, label: "Tasks", color: "text-istk-accent" },
            { href: "/calendar", icon: Calendar, label: "Calendar", color: "text-istk-info" },
            { href: "/memories", icon: Brain, label: "Memories", color: "text-istk-success" },
            { href: "/team", icon: Users, label: "Team", color: "text-istk-purple" },
            { href: "/subagents", icon: Bot, label: "Subagents", color: "text-istk-warning" },
            { href: "/", icon: LayoutDashboard, label: "Dashboard", color: "text-istk-textMuted" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,107,0,0.15)] hover:bg-[rgba(255,255,255,0.04)] transition-all group"
            >
              <link.icon className={cn("w-5 h-5 group-hover:scale-110 transition-transform", link.color)} />
              <span className="text-xs text-istk-textMuted group-hover:text-istk-text transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="glass-panel">
        <div className="flex items-start gap-4">
          <LayoutDashboard className="w-6 h-6 text-istk-accent shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-istk-text mb-2">Getting Started</h3>
            <ul className="text-sm text-istk-textMuted space-y-2">
              <li>• Visit <strong>Tasks</strong> to manage your kanban board with drag-and-drop</li>
              <li>• Check <strong>Calendar</strong> for scheduled cron jobs and deadlines</li>
              <li>• Search <strong>Memories</strong> to access your knowledge base</li>
              <li>• Manage your <strong>Team</strong> of agents and view their activity</li>
              <li>• Create new <strong>Subagents</strong> with custom LLM models and system prompts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
