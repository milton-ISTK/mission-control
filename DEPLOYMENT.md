# ISTK Mission Control — Deployment Guide

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│  Gregory's PC   │◀──────▶│   Vercel (CDN)   │◀──────▶│  Convex Cloud   │
│  (Windows)      │  HTTPS │   Next.js App    │  WSS   │  (Backend)      │
│  Browser        │        │   Static + Edge  │        │  Real-time DB   │
└─────────────────┘        └──────────────────┘        └────────┬────────┘
                                    ▲                           │
                                    │ git push                  │ HTTP API
                                    │ auto-deploy               │
                           ┌────────┴────────┐        ┌────────┴────────┐
                           │    GitHub        │        │  Mac Mini       │
                           │    Repository    │        │  (OpenClaw)     │
                           └─────────────────┘        │  Sync Script    │
                                                      └─────────────────┘
```

**How it works:**
- **Vercel** hosts the Next.js dashboard (auto-deploys on git push)
- **Convex** provides the real-time database (WebSocket updates)
- **Mac Mini** runs a sync script that pushes memory files, agent status, and cron jobs to Convex
- **Gregory** opens a URL in his browser and sees everything in real-time

---

## 🎯 For Gregory (Quick Start)

### Just bookmark this URL:
```
https://istk-mission-control.vercel.app
```

That's it. Open it on your Windows desktop browser. Everything updates in real-time.

### What you'll see:
- **Dashboard** — Overview stats (tasks, agents, memories)
- **Tasks** — Kanban board (drag tasks between To Do / In Progress / Done)
- **Calendar** — Cron jobs and scheduled events
- **Memories** — Daily logs and long-term memory from the Mac mini
- **Team** — Agent status (Milton active/idle/offline)

---

## 🔧 Setup Instructions (One-Time)

### Step 1: Create GitHub Repository

```bash
# On Mac mini, authenticate GitHub CLI
gh auth login
# Follow browser prompts, select HTTPS

# Create the repository
cd /Users/milton/.openclaw/workspace/mission-control
gh repo create gregory-intellistake/mission-control --public --source=. --push
```

### Step 2: Create Convex Project

```bash
cd /Users/milton/.openclaw/workspace/mission-control

# Login to Convex (opens browser)
npx convex login

# Create a new project
npx convex init
# When asked, name it: istk-mission-control

# Deploy schema + functions
npx convex deploy

# Note the deployment URL shown (looks like: https://XXX.convex.cloud)
```

Save the deployment URL. You'll need it in the next steps.

### Step 3: Set Up Environment

```bash
# Create .env.local in the project
cd /Users/milton/.openclaw/workspace/mission-control
cat > .env.local << 'EOF'
NEXT_PUBLIC_CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud
EOF
```

Replace `YOUR_DEPLOYMENT` with the actual URL from Step 2.

### Step 4: Deploy to Vercel

**Option A: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
# Follow prompts, connect to GitHub repo
```

**Option B: Via Vercel Dashboard (recommended)**
1. Go to https://vercel.com and sign up/login
2. Click "Import Project"
3. Connect your GitHub account
4. Select `gregory-intellistake/mission-control`
5. Configure:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add Environment Variable:
   - `NEXT_PUBLIC_CONVEX_URL` = `https://YOUR_DEPLOYMENT.convex.cloud`
7. Click Deploy

Your site will be live at: `https://mission-control-XXXX.vercel.app`

To customize the URL to `istk-mission-control.vercel.app`:
- Go to Vercel Dashboard → Settings → Domains
- Add `istk-mission-control.vercel.app`

### Step 5: Start the Sync Script

```bash
# Update the launchd plist with real Convex credentials
# Edit: ~/Library/LaunchAgents/com.milton.mission-control-sync.plist
# Replace PLACEHOLDER_CONVEX_URL with your real Convex URL
# Replace PLACEHOLDER_ADMIN_KEY with your Convex admin key

# Get admin key from Convex dashboard:
# https://dashboard.convex.dev → Your project → Settings → Admin Key

# Load and start the service
launchctl load ~/Library/LaunchAgents/com.milton.mission-control-sync.plist

# Verify it's running
launchctl list | grep mission-control

# Check logs
tail -f /tmp/mission-control-sync.log
```

### Step 6: Test the Full Flow

```bash
# Run a single sync manually to test
CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud \
CONVEX_ADMIN_KEY=your_admin_key \
python3 /Users/milton/scripts/mission-control-sync.py --once

# Check the dashboard in your browser — you should see memories and agent status
```

---

## 🔄 How Updates Work

### Code changes (Milton pushes)
```
Milton edits code → git push → GitHub → Vercel auto-deploys (30-60s)
```

### Data sync (automatic)
```
Memory files change on Mac mini → Sync script (every 60s) → Convex → Dashboard updates (real-time)
```

### Task management
- Create/update tasks in the dashboard → Convex stores them
- Sync script pulls tasks → Writes to `workspace/mission-control-tasks.json`
- OpenClaw agents can read this file to see current tasks

---

## 🔍 Monitoring & Troubleshooting

### Check sync status
```bash
tail -f /tmp/mission-control-sync.log
```

### Restart sync service
```bash
launchctl unload ~/Library/LaunchAgents/com.milton.mission-control-sync.plist
launchctl load ~/Library/LaunchAgents/com.milton.mission-control-sync.plist
```

### Common issues

**"Convex URL not set"**
- Check `.env.local` has `NEXT_PUBLIC_CONVEX_URL`
- Verify the URL ends with `.convex.cloud`
- Redeploy to Vercel if you changed it

**"Health check failed"**
- Run `npx convex deploy` to push latest schema
- Check Convex dashboard for errors: https://dashboard.convex.dev

**"Build failed on Vercel"**
- Check Vercel build logs
- Ensure `NEXT_PUBLIC_CONVEX_URL` env var is set in Vercel project settings
- Try `npm run build` locally first

**Dashboard shows no data**
- Check sync script is running: `launchctl list | grep mission-control`
- Run manual sync: `python3 ~/scripts/mission-control-sync.py --once`
- Check Convex dashboard for data: https://dashboard.convex.dev

---

## 📋 Environment Variables Reference

| Variable | Where | Value |
|----------|-------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | `.env.local` + Vercel | `https://XXX.convex.cloud` |
| `CONVEX_URL` | LaunchD plist | Same as above |
| `CONVEX_ADMIN_KEY` | LaunchD plist | From Convex dashboard |
| `WORKSPACE_DIR` | LaunchD plist | `/Users/milton/.openclaw/workspace` |
| `SYNC_INTERVAL` | LaunchD plist | `60` (seconds) |

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `/Users/milton/.openclaw/workspace/mission-control/` | Project source code |
| `/Users/milton/scripts/mission-control-sync.py` | Mac ↔ Convex sync script |
| `~/Library/LaunchAgents/com.milton.mission-control-sync.plist` | Auto-start service config |
| `/tmp/mission-control-sync.log` | Sync script logs |
| `/tmp/mission-control-sync-state.json` | Sync state (file hashes) |
| `workspace/mission-control-tasks.json` | Tasks pulled from Convex |
