# ISTK: Agentic Mission Control 🚀

A real-time dashboard for managing AI agents, tasks, memories, and scheduled operations — built for the IntelliStake (ISTK) platform.

---

## Overview

Mission Control is the operational frontend for ISTK's agentic infrastructure. It provides a single pane of glass to:

1. **📋 Tasks** — Kanban board with drag-and-drop, priority levels, and dual-assignee support (Gregory & Milton)
2. **📅 Calendar** — Month/week/day views with cron job visualisation, deadlines, and one-shot events
3. **🧠 Memories** — Full-text searchable knowledge base synced from workspace files, with category & tag filtering
4. **👥 Team** — Agent roster showing status, model, recent activity, and performance metrics
5. **🤖 Subagents** — Create and manage specialised AI agents with custom LLM models, API keys, and system prompts
6. **📊 Dashboard** — Unified stats overview with quick links and recent activity feed

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌──────────────────────────────────────────┐   │
│  │         Next.js 14 (App Router)          │   │
│  │    ┌─────────┬──────────┬──────────┐     │   │
│  │    │ Sidebar │  Navbar  │  Footer  │     │   │
│  │    ├─────────┴──────────┴──────────┤     │   │
│  │    │      Page Routes (6 pages)     │     │   │
│  │    │   ┌──────────────────────┐     │     │   │
│  │    │   │  Feature Components  │     │     │   │
│  │    │   │  (Tasks, Calendar,   │     │     │   │
│  │    │   │   Memory, Team, etc) │     │     │   │
│  │    │   └──────────────────────┘     │     │   │
│  │    │          │ hooks │             │     │   │
│  │    │  useQuery │ useMutation        │     │   │
│  │    └──────────┼─────────────────────┘     │   │
│  └───────────────┼──────────────────────────┘   │
│                  │  WebSocket (real-time)        │
│  ┌───────────────▼──────────────────────────┐   │
│  │          Convex Backend                   │   │
│  │  ┌──────┬───────┬─────────┬───────────┐  │   │
│  │  │tasks │events │memories │agents     │  │   │
│  │  │      │       │         │subagents  │  │   │
│  │  └──────┴───────┴─────────┴───────────┘  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Styling: Tailwind CSS + Custom Neumorphic       │
│  Design System (dark theme, #0D0D14 base)        │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Backend    | Convex (real-time database + API) |
| Styling    | Tailwind CSS 3.4 + custom design  |
| Language   | TypeScript (strict mode)          |
| DnD        | @dnd-kit (kanban drag-and-drop)   |
| Dates      | date-fns                          |
| Icons      | lucide-react                      |
| Markdown   | react-markdown                    |

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18.x (recommended: 22.x)
- **npm** ≥ 9.x
- A **Convex** account ([convex.dev](https://convex.dev))

### 1. Clone & Install

```bash
cd mission-control
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Convex deployment URL (get from Convex dashboard)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional: workspace path for memory file sync
MEMORY_DIR=/Users/your-name/.openclaw/workspace
```

### 3. Set Up Convex

```bash
# Login to Convex (first time)
npx convex login

# Start Convex dev server (pushes schema + functions)
npx convex dev
```

This will:
- Create the `_generated/` directory with typed API bindings
- Deploy your schema (tasks, events, memories, agents, subagents tables)
- Deploy all mutations and queries
- Start real-time sync

### 4. Run Dev Server

In a second terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Mission Control.

---

## Local Development

```bash
# Terminal 1: Convex backend (watches for changes)
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

Both need to run simultaneously. Convex watches `convex/` for schema/function changes; Next.js watches `src/` for UI changes.

---

## Deployment

### Convex Backend

```bash
# Set environment variables in production
npx convex env set MEMORY_DIR /path/to/workspace

# Deploy backend
npx convex deploy
```

### Next.js Frontend

Deploy to Vercel, Netlify, or any platform supporting Next.js:

```bash
# Build
npm run build

# Start production server
npm start
```

**Vercel (recommended):**
1. Connect your Git repo to Vercel
2. Set `NEXT_PUBLIC_CONVEX_URL` in Vercel environment variables
3. Deploy — done!

---

## Feature Documentation

### 📋 Tasks (Kanban Board)

- **Three columns:** To Do → In Progress → Done
- **Drag and drop** cards between columns (powered by @dnd-kit)
- **Priority levels:** Critical (red), High (orange), Medium (yellow), Low (blue)
- **Assignees:** Gregory & Milton
- **Create/Edit modal** with title, description, priority, assignee, due date, tags

**Route:** `/tasks`

### 📅 Calendar

- **Three views:** Month, Week, Day
- **Event types:** Cron Jobs (blue), Deadlines (red), One-shot Events (green)
- **Quick create** button for fast event creation
- **Cron expression** support for recurring jobs
- **Event detail panel** on click

**Route:** `/calendar`

### 🧠 Memories

- **Full-text search** powered by Convex search indexes
- **Category sidebar** for filtering
- **Tag chips** for multi-tag filtering
- **Memory cards** with title, content preview, source, date
- **Detail view** with full markdown content
- **File sync** from workspace (auto-syncs `.md` files)

**Route:** `/memories`

### 👥 Team

- **Agent grid** showing all registered agents (main + subagents)
- **Agent detail panel** with assigned tasks, status history, edit/delete
- **Quick status switcher** (Active / Idle / Offline)
- **Subagent tab** for viewing configured subagents
- **Create Subagent** button in header

**Route:** `/team`

### 🤖 Subagents

- **Subagent configuration cards** with model, role, status
- **Create modal** with:
  - Agent name
  - LLM model selector (Claude Opus, Claude Haiku, GPT-4o, Llama, Minimax, etc.)
  - API key input (hashed storage, never plaintext)
  - System prompt textarea
  - Role selector
- **Toggle active/inactive**, edit, and delete
- **Stats summary** (total, active, unique models)

**Route:** `/subagents`

### 📊 Dashboard

- **Stats cards** with live counts: tasks, memories, cron jobs, team members
- **Critical tasks alert** panel
- **Recent activity feed** (latest task & memory updates)
- **Quick links** to all features
- **Getting started** guide

**Route:** `/` (root)

---

## Project Structure

```
mission-control/
├── convex/                    # Convex backend
│   ├── schema.ts              # Database schema (5 tables)
│   ├── tasks.ts               # Task mutations & queries
│   ├── events.ts              # Calendar event mutations & queries
│   ├── memories.ts            # Memory mutations & queries
│   ├── agents.ts              # Agent CRUD
│   ├── subagents.ts           # Subagent configuration CRUD
│   └── dashboard.ts           # Aggregate stats queries
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout (ConvexProvider + shell)
│   │   ├── page.tsx           # Dashboard (/)
│   │   ├── tasks/page.tsx     # Tasks board
│   │   ├── calendar/page.tsx  # Calendar view
│   │   ├── memories/page.tsx  # Memory browser
│   │   ├── team/page.tsx      # Team management
│   │   ├── subagents/page.tsx # Subagent management
│   │   └── dashboard/page.tsx # Redirect to /
│   ├── components/
│   │   ├── common/            # Shared UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx      # Input, Textarea, Select
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── Layout/            # App shell
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── tasks/             # Task feature
│   │   │   ├── TasksBoard.tsx
│   │   │   ├── TaskColumn.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskModal.tsx
│   │   ├── calendar/          # Calendar feature
│   │   │   ├── CalendarView.tsx
│   │   │   ├── EventDetails.tsx
│   │   │   └── CronPoller.tsx
│   │   ├── memory/            # Memory feature
│   │   │   ├── MemoryScreen.tsx
│   │   │   ├── MemoryCard.tsx
│   │   │   ├── MemoryDetails.tsx
│   │   │   ├── MemorySearch.tsx
│   │   │   └── MemorySidebar.tsx
│   │   ├── team/              # Team feature
│   │   │   ├── TeamGrid.tsx
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentDetails.tsx
│   │   │   ├── SubagentList.tsx
│   │   │   └── CreateSubagentModal.tsx
│   │   └── Office/            # Phase 2 placeholder
│   │       └── OfficeView.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useTasks.ts
│   │   ├── useEvents.ts
│   │   ├── useMemories.ts
│   │   ├── useAgents.ts       # Agents + Subagents hooks
│   │   └── useFileWatcher.ts
│   ├── lib/                   # Utilities
│   │   ├── convex.tsx         # ConvexClientProvider
│   │   ├── convex-client.ts   # Re-exports
│   │   └── utils.ts           # cn(), formatters, color maps
│   └── styles/
│       └── globals.css        # Tailwind + neumorphic design system
├── tailwind.config.ts         # Design tokens & custom shadows
├── tsconfig.json              # TypeScript strict mode
├── next.config.js
├── package.json
└── README.md                  # ← You are here
```

---

## Design System

The UI follows a **dark neumorphic** design language:

| Token              | Value     | Usage                  |
|--------------------|-----------|------------------------|
| `istk-bg`          | `#0D0D14` | Page background        |
| `istk-surface`     | `#151521` | Card/panel background  |
| `istk-surfaceLight`| `#1C1C2E` | Hover/light surfaces   |
| `istk-accent`      | `#F97316` | Primary CTA (orange)   |
| `istk-text`        | `#E2E8F0` | Primary text           |
| `istk-textMuted`   | `#94A3B8` | Secondary text         |
| `istk-textDim`     | `#64748B` | Tertiary/dim text      |
| `istk-success`     | `#22C55E` | Success states         |
| `istk-warning`     | `#EAB308` | Warning states         |
| `istk-danger`      | `#EF4444` | Error/critical states  |
| `istk-info`        | `#3B82F6` | Info/cron indicators   |
| `istk-purple`      | `#A855F7` | Special/subagent       |

**Neumorphic shadows** create depth via dual light/dark shadow casting:
- `shadow-neu` — Standard card elevation
- `shadow-neu-sm` — Subtle elevation
- `shadow-neu-inset` — Pressed/input states
- `shadow-neu-glow` — Accent glow (CTAs)

---

## Troubleshooting

### Common Issues

**"Module not found: convex/_generated/api"**
- Run `npx convex dev` to generate typed bindings
- Make sure Convex dev server is running

**"NEXT_PUBLIC_CONVEX_URL is not defined"**
- Create `.env.local` with your Convex deployment URL
- Restart the dev server after adding env vars

**"hydration mismatch" errors**
- All interactive components use `"use client"` directive
- If persists, try clearing `.next/` cache: `rm -rf .next && npm run dev`

**Tailwind styles not applying**
- Ensure `globals.css` is imported in `layout.tsx`
- Check `tailwind.config.ts` content paths include your component directories
- Run `npm run dev` to trigger recompilation

**Drag-and-drop not working**
- Requires `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- Check all are installed: `npm ls @dnd-kit/core`

### Reset & Clean Build

```bash
# Clean everything
rm -rf .next node_modules
npm install
npx convex dev &   # Terminal 1
npm run dev         # Terminal 2
```

---

## Phase 2 Roadmap

### 🏢 Office View (Interactive Scene)
- Animated virtual office with agent avatars
- Real-time activity indicators (coding, meeting, idle)
- Drag agents between rooms/desks
- Chat bubbles showing recent agent messages

### 📡 Content Pipeline
- Research workflow automation
- Source ingestion → summarisation → publishing
- Multi-agent content review chain
- Scheduled content generation via cron

### 📱 Mobile App
- React Native companion app
- Push notifications for critical tasks
- Quick task creation and status updates
- Agent status monitoring on the go

### 🔐 Enhanced Security
- Role-based access control (RBAC)
- Audit logging for all mutations
- API key rotation management
- Two-factor authentication

---

## Contributing

This is an internal IntelliStake project. For issues or feature requests:

📧 **gregory@intellistake.ai**

---

## License

Proprietary — IntelliStake Ltd. All rights reserved.
