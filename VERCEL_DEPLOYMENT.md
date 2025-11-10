# Vercel Deployment Guide - AI Solutions Hub v1.7

## Overview
This guide will help you deploy the AI Solutions Hub frontend to Vercel with your custom domain aisolutionshub.co.

## Prerequisites
- GitHub repository: https://github.com/zgdsaid1/Database.git
- Vercel account: https://vercel.com/new
- Domain DNS configured at GoDaddy
- Railway backend deployed (or backend hosted elsewhere)

## Step 1: Deploy to Vercel

### Option A: Import from GitHub
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Git Repository"
3. Connect your GitHub account
4. Select repository: `zgdsaid1/Database`
5. Select framework: **Next.js** (since frontend is built with Next.js)

### Option B: Upload Frontend Files
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Upload" and select your frontend build files
3. Choose framework: **Next.js**

## Step 2: Configure Build Settings

Vercel will auto-detect Next.js. Configure these settings:

**Build Command**: `npm run build`
**Output Directory**: `out` (or `dist` if using CRA)
**Install Command**: `npm install`

**Root Directory**: `/ai-solutions-hub` (if frontend is in subdirectory)

## Step 3: Environment Variables

In Vercel project settings, add these environment variables:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://zkmdfyfhekmbtumkxgsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprbWRmeWZoZWttYnR1bWt4Z3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDg4MTIsImV4cCI6MjA3Nzc4NDgxMn0.uFCURn9e-n76Y1calSuNp1rj4SjuHJMDEHQPQ4mdp9M

# Stripe Configuration (Client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# Application Configuration
NEXT_PUBLIC_APP_NAME="AI Solutions Hub"
NEXT_PUBLIC_APP_VERSION="1.7.0"
NEXT_PUBLIC_ENVIRONMENT=production
```

## Step 4: Custom Domain Setup

### Configure Custom Domain: aisolutionshub.co

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Click "Domains" tab
   - Click "Add Domain"
   - Enter: `aisolutionshub.co`
   - Add: `www.aisolutionshub.co` (optional)

2. **In GoDaddy DNS Settings:**
   - Go to GoDaddy control panel for aisolutionshub.co
   - Add DNS records pointing to Vercel:
   
   **For Root Domain (aisolutionshub.co)**:
   ```
   Type: CNAME
   Name: @ (root)
   Value: cname.vercel-dns.com
   TTL: 1 Hour
   ```

   **For WWW Subdomain (www.aisolutionshub.co)**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 1 Hour
   ```

3. **Wait for DNS Propagation:**
   - DNS changes take 15 minutes to 24 hours to propagate
   - Vercel will automatically verify your domain

## Step 5: SSL Certificate

Vercel automatically provisions SSL certificates for custom domains. No additional setup required.

## Step 6: Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for build and deployment to complete
3. Your site will be available at: `https://aisolutionshub.co`
4. Verify all pages load correctly

## Step 7: Configure Backend Connection

Update your frontend code to point to your Railway backend URL:

```javascript
// In your frontend config files
const API_BASE_URL = 'https://your-railway-app.railway.app/api';
```

## Step 8: Test End-to-End

1. **Frontend**: Visit https://aisolutionshub.co
2. **Backend**: Test API endpoints
3. **Database**: Verify data connectivity
4. **AI Functions**: Test AI routing and business tools
5. **Authentication**: Test user registration/login
6. **Subscriptions**: Test Stripe integration

## Step 9: Monitoring and Analytics

1. **Vercel Analytics**: Enable built-in analytics in Vercel dashboard
2. **Error Tracking**: Add error monitoring (e.g., Sentry)
3. **Performance**: Monitor Core Web Vitals
4. **Uptime**: Set up monitoring alerts

## Troubleshooting

### Common Issues:

**Build Failures:**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure package.json scripts are correct

**Domain Not Working:**
- Wait for DNS propagation (up to 24 hours)
- Verify GoDaddy DNS records match Vercel requirements
- Check domain ownership verification

**API Connection Issues:**
- Verify Railway backend is running
- Check environment variables in Vercel
- Test API endpoints directly

**SSL Certificate Issues:**
- Vercel handles SSL automatically
- Contact support if certificate fails to provision

## Performance Optimization

1. **Enable Vercel Analytics**
2. **Configure Edge Functions** for API routes
3. **Set up CDN caching** for static assets
4. **Optimize images** with Next.js Image component
5. **Use incremental static regeneration** for dynamic pages

## Support

- Vercel docs: https://vercel.com/docs
- GoDaddy DNS docs: https://www.godaddy.com/help/dns-management
- Domain verification issues: Check DNS propagation tools

## Post-Deployment Checklist

- [ ] Frontend loads at https://aisolutionshub.co
- [ ] Backend API responds correctly
- [ ] Database connectivity works
- [ ] AI routing engine functional
- [ ] All 8 business tools operational
- [ ] User authentication works
- [ ] Stripe subscriptions functional
- [ ] Mobile responsiveness verified
- [ ] SSL certificate active
- [ ] Analytics and monitoring configured
