# Vercel Environment Variables Setup

The DraftEngine upgrades require the following environment variables to be set in Vercel:

## Required Variables

### `ANTHROPIC_API_KEY`
- **Purpose**: Claude Haiku calls for smart topic suggestions and image scene generation
- **Where to get it**: https://console.anthropic.com/account/keys
- **Format**: `sk-ant-...` (begins with `sk-ant-`)

## How to Add to Vercel

### Option 1: Via Vercel Dashboard
1. Go to https://vercel.com/milton-istks-projects/mission-control-alpha-rust
2. Click **Settings** (left sidebar)
3. Click **Environment Variables**
4. Add new variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key from console.anthropic.com
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** the project to apply the new environment variable

### Option 2: Via Vercel CLI
```bash
cd /Users/milton/.openclaw/workspace/mission-control
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted
# Answer "Yes" for Production, Preview, Development
vercel --prod
```

## After Setting the Variable

The following features will work:

✅ **Upgrade 2: Smart Topic Suggestions**
- Type a sector (e.g., "fintech") on the landing page
- Wait 500ms → see 6 topic suggestion chips
- Click a chip to populate the topic field

✅ **Upgrade 3: Image Scene Suggestions**
- Screen 5 auto-loads 4 image scene suggestions
- Based on the selected headline
- Click a chip to populate the scene description

## Testing Locally

To test locally before deploying to Vercel:
1. Get your API key from https://console.anthropic.com/account/keys
2. Add it to `.env.local` in the project root:
   ```
   ANTHROPIC_API_KEY=sk-ant-...your-key...
   ```
3. Run `npm run dev` and test on http://localhost:3000/draftengine
4. Type a sector → should see suggestions after 500ms

## Troubleshooting

**"Error fetching suggestions: Failed to get suggestions"**
- Check that ANTHROPIC_API_KEY is set in Vercel environment variables
- Verify the API key is valid (not expired or revoked)
- Check Vercel function logs: Dashboard → Deployments → Logs tab

**"ANTHROPIC_API_KEY not configured"**
- The environment variable is not set in Vercel
- Follow "How to Add to Vercel" above
- Redeploy after setting the variable

**"Anthropic API error: 401 Unauthorized"**
- The API key is invalid or expired
- Get a fresh key from console.anthropic.com
- Update the variable in Vercel
