# Railway Deployment Guide - AI Solutions Hub v1.7

## Overview
This guide will help you deploy the AI Solutions Hub backend to Railway for production hosting.

## Prerequisites
- GitHub repository: https://github.com/zgdsaid1/Database.git
- Railway account: https://railway.com/dashboard
- Supabase project ready (already deployed)

## Step 1: Connect to GitHub

1. Go to [Railway Dashboard](https://railway.com/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose repository: `zgdsaid1/Database`
5. Select the `main` or `master` branch

## Step 2: Configure Environment Variables

In Railway project settings, add these environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://zkmdfyfhekmbtumkxgsw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprbWRmeWZoZWttYnR1bWt4Z3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDg4MTIsImV4cCI6MjA3Nzc4NDgxMn0.uFCURn9e-n76Y1calSuNp1rj4SjuHJMDEHQPQ4mdp9M
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# AI API Keys (get from your API providers)
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_AI_API_KEY=your-google-ai-key-here

# Stripe Configuration (for subscription handling)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Application Configuration
NODE_ENV=production
PORT=3001
```

## Step 3: Build Configuration

Railway will automatically detect the Node.js configuration. Ensure you have:

**package.json** (if not already present):
```json
{
  "name": "ai-solutions-hub-backend",
  "version": "1.7.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "stripe": "^14.11.0"
  }
}
```

## Step 4: Deploy and Test

1. Railway will automatically deploy from your GitHub repository
2. Monitor the deployment logs for any errors
3. Get your Railway deployment URL (e.g., `https://your-app.railway.app`)

## Step 5: Update Supabase Edge Function URLs

After Railway deployment, update any hardcoded Supabase URLs in your frontend to use the Railway backend endpoint.

## Verification

Test these endpoints:
- Health check: `GET /health`
- AI Router: `POST /api/ai-router`
- Business tools: `POST /api/tool-*`

## Next Steps

1. Update frontend environment variables with Railway URL
2. Test end-to-end functionality
3. Configure custom domain (optional)
4. Set up monitoring and alerts

## Support

- Railway docs: https://docs.railway.app
- If deployment fails, check Railway logs for specific errors
- Ensure all environment variables are properly set
