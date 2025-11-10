# Complete Deployment Guide - AI Solutions Hub

## Overview

This guide will walk you through deploying the AI Solutions Hub platform to Railway (backend) and Vercel (frontend), including complete Stripe integration.

**Estimated Time:** 45-60 minutes  
**Difficulty:** Intermediate

---

## Prerequisites

Before you begin, ensure you have:

- [ ] Git installed
- [ ] Node.js 18+ installed
- [ ] A Stripe account (https://stripe.com)
- [ ] A Railway account (https://railway.app)
- [ ] A Vercel account (https://vercel.com)
- [ ] Supabase project already set up (URL: https://bqvcpbdwjkmbjsynhuqz.supabase.co)

---

## Part 1: Stripe Setup (15 minutes)

### Step 1: Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases

### Step 2: Create Stripe Products

Run the automated setup script:

```bash
cd /home/runner/work/ai-solutions-hub/ai-solutions-hub
./setup-stripe.sh
```

This will create 4 subscription products:
- Starter: $9/month
- Pro: $29/month
- Business: $99/month
- Enterprise: $299/month

**Copy the Price IDs** that are output - you'll need them later.

### Step 3: Configure Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://[YOUR-RAILWAY-APP].railway.app/api/stripe/webhook`
   (You'll get this URL after deploying to Railway in Part 2)
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Copy the **Webhook Secret** - you'll need it for Railway deployment

---

## Part 2: Railway Backend Deployment (20 minutes)

### Step 1: Prepare the Backend

The backend code is already extracted in `ai-solutions-backend/server/`

### Step 2: Push to GitHub (Optional but Recommended)

```bash
cd ai-solutions-backend/server
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ai-solutions-backend.git
git push -u origin main
```

### Step 3: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo" (if you pushed to GitHub)
   OR "Deploy from local directory"
4. Select your backend repository or upload the `ai-solutions-backend/server` folder

### Step 4: Configure Environment Variables

In Railway dashboard, add these environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://bqvcpbdwjkmbjsynhuqz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmNwYmR3amttYmpzeW5odXF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzODk3OSwiZXhwIjoyMDc3ODE0OTc5fQ.MNyTa90QsamO36z_DUdHYH5RPkbFzh5VA4VPG-4R5ks

# Stripe Configuration
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=[YOUR_WEBHOOK_SECRET_FROM_STEP_3]

# AI Services
OPENAI_API_KEY=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
GEMINI_API_KEY=AIzaSyBJkpXYMuv_7AtIkvumMvXHAeMFrtWAO9Q
DEEPSEEK_API_KEY=sk-e4522e1bea2f429cb6d1d0bf59621f01

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://aisolutionshub.co

# Security
JWT_SECRET=super-secret-jwt-key-for-ai-solutions-hub-production-2024

# Server
NODE_ENV=production
PORT=8080
```

### Step 5: Deploy and Get Railway URL

1. Railway will automatically deploy your app
2. Once deployed, go to Settings > Domains
3. Click "Generate Domain"
4. Copy your Railway URL (e.g., `https://your-app.railway.app`)
5. **Go back to Stripe** and update your webhook endpoint URL with this Railway URL

### Step 6: Test Backend

Visit: `https://your-app.railway.app/api/health`

You should see: `{"status":"ok"}`

---

## Part 3: Vercel Frontend Deployment (15 minutes)

### Step 1: Check Frontend Code

The frontend code should be in `ai-solutions-hub-v1.8-complete/` after extraction.

### Step 2: Deploy to Vercel

**Option A: Via Vercel CLI**

```bash
npm install -g vercel
cd ai-solutions-hub-v1.8-complete
vercel login
vercel --prod
```

**Option B: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your Git repository or upload the frontend folder
4. Select framework: Next.js
5. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bqvcpbdwjkmbjsynhuqz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmNwYmR3amttYmpzeW5odXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzg5NzksImV4cCI6MjA3NzgxNDk3OX0.1Ze3wURXgaZDC8bgLVBVq0UU8ZRMFtBJkm1Od2zTet0
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SFQiy5QCPSjAcYO2tOpHtcLZXCgmwwhp8ank4G7H2h2OWDeyD7J949ySOyAajvy4S3FzN4u1HJ2JHzvcNXl9Zmz00df8PVz2k
NEXT_PUBLIC_APP_URL=https://aisolutionshub.co
NEXT_PUBLIC_BACKEND_URL=[YOUR_RAILWAY_URL_FROM_PART_2]
```

### Step 4: Configure Custom Domain

1. In Vercel, go to Settings > Domains
2. Add your custom domain: `aisolutionshub.co`
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (5-10 minutes)

---

## Part 4: Final Configuration & Testing (10 minutes)

### Step 1: Update Backend FRONTEND_URL

Go back to Railway and update the `FRONTEND_URL` environment variable to your Vercel URL or custom domain.

### Step 2: Update Stripe Price IDs

Update the Price IDs in your code (if needed):

```javascript
// In your frontend code or backend
const STRIPE_PRICES = {
  starter: "price_[ID_FROM_STRIPE_SETUP]",
  pro: "price_[ID_FROM_STRIPE_SETUP]",
  business: "price_[ID_FROM_STRIPE_SETUP]",
  enterprise: "price_[ID_FROM_STRIPE_SETUP]"
};
```

### Step 3: Test the Complete Flow

1. **Homepage:** Visit https://aisolutionshub.co
2. **Sign Up:** Create a test account
3. **Pricing Page:** Navigate to pricing
4. **Checkout:** Click on a plan and test Stripe checkout
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
5. **Dashboard:** After successful payment, check dashboard access
6. **AI Tools:** Test one of the AI tools

### Step 4: Verify Webhook

1. Go to Stripe Dashboard > Webhooks
2. Click on your webhook endpoint
3. Check that events are being received
4. View event logs to ensure they're processing correctly

---

## Part 5: Supabase Edge Functions (Optional - 15 minutes)

If you want to use Supabase Edge Functions instead of Railway:

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
supabase login
```

### Step 2: Link Project

```bash
cd ai-solutions-backend
supabase link --project-ref bqvcpbdwjkmbjsynhuqz
```

### Step 3: Deploy Functions

```bash
supabase functions deploy
```

### Step 4: Set Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set GEMINI_API_KEY=AIza...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Troubleshooting

### Common Issues

**1. Stripe webhook not receiving events**
- Ensure webhook URL is correct
- Check that Railway app is deployed and running
- Verify webhook secret is set correctly

**2. CORS errors**
- Update CORS configuration in Railway backend
- Ensure frontend URL is whitelisted

**3. Authentication issues**
- Verify Supabase keys are correct
- Check JWT secret is set

**4. Payment not processing**
- Ensure Stripe keys are in live mode (not test mode)
- Check Price IDs are correct
- Verify webhook events are configured

---

## Environment Variables Checklist

### Railway Backend
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] OPENAI_API_KEY
- [ ] GEMINI_API_KEY
- [ ] DEEPSEEK_API_KEY
- [ ] FRONTEND_URL
- [ ] JWT_SECRET
- [ ] NODE_ENV
- [ ] PORT

### Vercel Frontend
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] NEXT_PUBLIC_APP_URL
- [ ] NEXT_PUBLIC_BACKEND_URL

### Supabase Edge Functions (if used)
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] OPENAI_API_KEY
- [ ] GEMINI_API_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY

---

## Success Criteria

Your deployment is successful when:

- [ ] Frontend loads at https://aisolutionshub.co
- [ ] Users can sign up and log in
- [ ] Pricing page shows all 4 plans
- [ ] Stripe checkout works
- [ ] Webhook events are received
- [ ] Subscriptions are created in database
- [ ] Dashboard is accessible after payment
- [ ] AI tools are functional
- [ ] No console errors in browser
- [ ] SSL certificate is active

---

## Next Steps After Deployment

1. **Monitor Stripe Dashboard** for subscriptions and payments
2. **Set up monitoring** (e.g., Sentry for error tracking)
3. **Configure email notifications** for new subscriptions
4. **Test all 8 AI tools** thoroughly
5. **Set up analytics** (Google Analytics, PostHog, etc.)
6. **Create documentation** for users
7. **Plan marketing launch**

---

## Support

If you encounter issues:

1. Check the deployment guides in the repository
2. Review Railway and Vercel logs
3. Check Stripe webhook event logs
4. Verify all environment variables are set correctly

---

## Summary

**Deployment Complete!** 🎉

Your AI Solutions Hub is now live with:
- ✅ Backend on Railway
- ✅ Frontend on Vercel  
- ✅ Stripe payments integrated
- ✅ 8 AI tools ready to use
- ✅ Custom domain configured

**Total Setup Time:** ~60 minutes  
**Monthly Cost:** Railway (~$5) + Vercel (Free for hobby) + Stripe fees

---

**Version:** 1.0  
**Last Updated:** November 10, 2025  
**Platform:** AI Solutions Hub v1.8
