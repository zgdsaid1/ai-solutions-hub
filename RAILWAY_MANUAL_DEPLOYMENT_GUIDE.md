# 🚀 RAILWAY DEPLOYMENT MANUAL GUIDE

## STEP 1: Deploy Backend Manually on Railway

### Option A: Using Railway Web Dashboard (Recommended)

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Sign up/Login with your account

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo" OR "Empty Project"
   - If empty: select "Deploy Node.js"

3. **Upload Your Code:**
   - Upload the `/workspace/ai-solutions-backend/server/` folder contents
   - Or connect GitHub repository if pushed there

4. **Configure Environment Variables:**
   In Railway project settings, add these environment variables:

   ```
   SUPABASE_URL=https://bqvcpbdwjkmbjsynhuqz.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmNwYmR3amttYmpzeW5odXF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzODk3OSwiZXhwIjoyMDc3ODE0OTc5fQ.MNyTa90QsamO36z_DUdHYH5RPkbFzh5VA4VPG-4R5ks
   OPENAI_API_KEY=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
   GEMINI_API_KEY=AIzaSyBJkpXYMuv_7AtIkvumMvXHAeMFrtWAO9Q
   DEEPSEEK_API_KEY=sk-e4522e1bea2f429cb6d1d0bf59621f01
   STRIPE_SECRET_KEY=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
   STRIPE_WEBHOOK_SECRET=whsec_Vy3VXpOlRhKoPezTayCR1jH7k2xWfEis
   FRONTEND_URL=https://ai-solutions-database-32cq9yu9x-zaids-projects-a75be417.vercel.app
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=8080
   ```

5. **Deploy:**
   - Railway will automatically build and deploy
   - Wait for deployment to complete (2-5 minutes)
   - You'll get a deployment URL like: `https://your-app-name-production.up.railway.app`

### Option B: Using Railway CLI (If you have access)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from your project directory
cd /workspace/ai-solutions-backend/server
railway init
railway up
```

## STEP 2: Update Frontend Environment Variables

Once you get your Railway deployment URL, update your Vercel environment variables:

1. Go to Vercel Dashboard
2. Go to your project → Settings → Environment Variables
3. Add this variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
   ```
   (Replace with your actual Railway URL)

4. Redeploy the Vercel project

## STEP 3: Execute Database Schema

Run the database schema in Supabase SQL Editor:

1. Go to Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the content from:
   `/workspace/ai-solutions-backend/server/migrations/complete_database_schema.sql`
4. Execute the SQL to create all tables

## VERIFICATION

After deployment, test these endpoints:
- `GET /` - Health check
- `GET /api/auth/health` - Auth endpoint check
- `POST /api/auth/signup` - User registration
- `POST /api/stripe/create-checkout` - Payment flow

## EXPECTED RESULT

Your AI platform will be fully connected:
- Frontend (Vercel) → Backend (Railway) → Database (Supabase)
- All authentication flows working
- All 10 AI tools functional
- Payment system operational