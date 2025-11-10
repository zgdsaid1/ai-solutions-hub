# Vercel Deployment Checklist

## Quick Manual Deployment Steps

### Step 1: Upload Your Code
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the main branch (main or master)

### Step 2: Configure Project Settings
1. **Framework Preset**: Select "Next.js"
2. **Root Directory**: Leave as default (./)
3. **Build Command**: Leave as default (next build)
4. **Output Directory**: Leave as default (out or .next)

### Step 3: Set Environment Variables
Add these in the Environment Variables section:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://bqvcpbdwjkmbjsynhuqz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmNwYmR3amttYmpzeW5odXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzg5NzksImV4cCI6MjA3NzgxNDk3OX0.1Ze3wURXgaZDC8bgLVBVq0UU8ZRMFtBJkm1Od2zTet0`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_51SFQiy5QCPSjAcYO2tOpHtcLZXCgmwwhp8ank4G7H2h2OWDeyD7J949ySOyAajvy4S3FzN4u1HJ2JHzvcNXl9Zmz00df8PVz2k`
- `NEXT_PUBLIC_APP_URL` = `https://aisolutionshub.co`

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (usually 2-5 minutes)
3. Vercel will provide a deployment URL (e.g., your-app.vercel.app)

### Step 5: Configure Custom Domain
1. In your Vercel project, go to "Settings" > "Domains"
2. Add your custom domain: `aisolutionshub.co`
3. Follow the DNS configuration instructions provided by Vercel

### Step 6: Verify Deployment
Test these URLs after deployment:
- Homepage: `https://aisolutionshub.co`
- Dashboard: `https://aisolutionshub.co/dashboard`
- All AI tools should be accessible and functional

## Expected Deployment Time
- Build time: 2-5 minutes
- Custom domain propagation: 10-60 minutes

## If You Need Help
Check the build logs in Vercel dashboard for any errors.
Ensure all environment variables are set correctly.
Verify your GitHub repository has all the latest code.

Once deployment is complete, let me know so we can proceed to Task 20 (Railway deployment)!