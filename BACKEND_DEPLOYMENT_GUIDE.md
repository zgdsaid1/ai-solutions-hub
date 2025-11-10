# AI Solutions Hub v1.7 - Backend Deployment Guide

## Current Status
- **Frontend**: Deployed and updated with new Supabase credentials
- **Backend Database**: SQL script ready, needs manual deployment
- **Edge Functions**: Code complete, needs deployment via Supabase CLI

## New Supabase Credentials
```
SUPABASE_URL: https://zkmdfyfhekmbtumkxgsw.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprbWRmeWZoZWttYnR1bWt4Z3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDg4MTIsImV4cCI6MjA3Nzc4NDgxMn0.uFCURn9e-n76Y1calSuNp1rj4SjuHJMDEHQPQ4mdp9M
PROJECT_ID: zkmdfyfhekmbtumkxgsw
```

## Step 1: Deploy Database Schema

### Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/sql
2. Open the SQL Editor
3. Copy the contents of `/workspace/ai-solutions-backend/deploy-database.sql`
4. Paste and run the SQL script
5. Verify tables created in the Table Editor

### Option B: Via Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref zkmdfyfhekmbtumkxgsw

# Run migration
supabase db push
```

## Step 2: Deploy Edge Functions

You need to deploy 10 edge functions. Here are the deployment commands:

### Prerequisites
```bash
cd /workspace/ai-solutions-backend
supabase login
supabase link --project-ref zkmdfyfhekmbtumkxgsw
```

### Deploy Individual Functions
```bash
# 1. AI Router (Core Intelligence)
supabase functions deploy ai-router

# 2. Business Tools
supabase functions deploy tool-marketing
supabase functions deploy tool-legal
supabase functions deploy tool-inventory
supabase functions deploy tool-voice-sms
supabase functions deploy tool-email
supabase functions deploy tool-data
supabase functions deploy tool-logistics
supabase functions deploy tool-documents

# 3. Payment System
supabase functions deploy create-subscription
supabase functions deploy stripe-webhook
```

### Deploy All at Once
```bash
supabase functions deploy
```

## Step 3: Configure Edge Function Secrets

Set environment variables for edge functions:

```bash
# OpenAI API Key
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here

# Google AI API Key  
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Stripe Keys
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Supabase Service Role Key (for backend operations)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

To get your service role key:
1. Go to https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/settings/api
2. Copy the `service_role` key under "Project API keys"

## Step 4: Enable Authentication

### Configure Email Auth
1. Go to https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/auth/providers
2. Enable Email provider
3. Configure email templates if needed

### (Optional) Configure OAuth Providers
- Google OAuth
- GitHub OAuth
- Microsoft OAuth

## Step 5: Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://zkmdfyfhekmbtumkxgsw.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret
5. Set it as edge function secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

## Step 6: Create Stripe Products and Prices

Create subscription products in Stripe dashboard:

### Starter Plan - $9/month
- Product Name: "AI Solutions Hub - Starter"
- Price: $9 USD / month
- Metadata: `tier=starter`

### Pro Plan - $29/month
- Product Name: "AI Solutions Hub - Pro"
- Price: $29 USD / month
- Metadata: `tier=pro`

### Business Plan - $99/month
- Product Name: "AI Solutions Hub - Business"
- Price: $99 USD / month
- Metadata: `tier=business`

### Enterprise Plan - $299/month
- Product Name: "AI Solutions Hub - Enterprise"
- Price: $299 USD / month
- Metadata: `tier=enterprise`

Copy the Price IDs and update the frontend pricing configuration.

## Step 7: Update Frontend Environment Variables

The frontend `.env` file has been updated with new credentials:
```
VITE_SUPABASE_URL=https://zkmdfyfhekmbtumkxgsw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Add Stripe publishable key:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
```

## Step 8: Test the Deployment

### Test Database
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Test Edge Functions
```bash
# Test AI Router
curl -X POST https://zkmdfyfhekmbtumkxgsw.supabase.co/functions/v1/ai-router \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, test the AI routing", "requestType": "simple"}'

# Test Marketing Tool
curl -X POST https://zkmdfyfhekmbtumkxgsw.supabase.co/functions/v1/tool-marketing \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "generate_campaign", "productName": "Test Product"}'
```

### Test Authentication
1. Go to deployed frontend URL
2. Click "Sign Up"
3. Register with email
4. Check Supabase Auth dashboard for new user

## Step 9: Rebuild and Redeploy Frontend

```bash
cd /workspace/ai-solutions-hub
pnpm install
pnpm run build
# Deploy dist/ folder
```

## Verification Checklist

- [ ] Database tables created (6 tables)
- [ ] RLS policies enabled
- [ ] Indexes created for performance
- [ ] All 10 edge functions deployed
- [ ] Edge function secrets configured
- [ ] Email authentication enabled
- [ ] Stripe webhook configured
- [ ] Stripe products created
- [ ] Frontend environment variables updated
- [ ] Frontend rebuilt and redeployed
- [ ] End-to-end test completed

## Troubleshooting

### Common Issues

**Edge Function Deployment Fails**
- Ensure you're logged in: `supabase login`
- Verify project linked: `supabase projects list`
- Check function logs: `supabase functions logs ai-router`

**Database Connection Issues**
- Verify SUPABASE_URL in environment
- Check ANON_KEY is correct
- Ensure RLS policies allow access

**Authentication Not Working**
- Verify email provider is enabled
- Check email templates are configured
- Ensure frontend has correct Supabase URL

**Stripe Webhook Fails**
- Verify webhook URL is correct
- Check webhook secret matches
- Test webhook in Stripe dashboard

## Next Steps After Deployment

1. **Monitoring**: Set up logging and monitoring
2. **Analytics**: Configure usage tracking
3. **Performance**: Monitor API response times
4. **Security**: Review RLS policies and test access control
5. **Scaling**: Monitor database and edge function performance
6. **Domain**: Configure custom domain (aisolutionshub.co)

## Support

For deployment assistance, refer to:
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Project README: /workspace/README.md
