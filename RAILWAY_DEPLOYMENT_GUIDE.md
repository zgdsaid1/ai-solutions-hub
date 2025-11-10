# 🚀 Railway Backend Deployment Guide

## Overview
This guide will help you deploy the AI Solutions Hub backend to Railway. The backend is a complete Express.js server with authentication, AI tools, and Stripe payment integration.

## 🏗️ Project Structure
```
ai-solutions-backend/server/
├── index.js                    # Main Express server
├── package.json                # Dependencies
├── .env.production            # Environment variables
├── railway.toml               # Railway configuration
├── deploy-railway.sh          # Deployment script
└── migrations/
    └── create_users_table.sql # Database schema
```

## 🔧 Prerequisites
- Railway CLI installed
- Node.js 18+ installed
- Git repository with the backend code

## 📋 Step-by-Step Deployment

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Initialize Railway Project
```bash
cd ai-solutions-backend/server
railway init
```

### Step 4: Set Environment Variables
```bash
# Core Supabase configuration
railway variables set SUPABASE_URL="https://bqvcpbdwjkmbjsynhuqz.supabase.co"
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Stripe configuration
railway variables set STRIPE_SECRET_KEY="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"
railway variables set STRIPE_WEBHOOK_SECRET="whsec_Vy3VXpOlRhKoPezTayCR1jH7k2xWfEis"

# AI Services API Keys
railway variables set OPENAI_API_KEY="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"
railway variables set GEMINI_API_KEY="AIzaSyBJkpXYMuv_7AtIkvumMvXHAeMFrtWAO9Q"
railway variables set DEEPSEEK_API_KEY="sk-e4522e1bea2f429cb6d1d0bf59621f01"

# Frontend and Security
railway variables set FRONTEND_URL="https://ai-solutions-database-32cq9yu9x-zaids-projects-a75be417.vercel.app"
railway variables set JWT_SECRET="super-secret-jwt-key-for-ai-solutions-hub-production-2024"
railway variables set NODE_ENV="production"
```

### Step 5: Deploy to Railway
```bash
railway up
```

### Step 6: Get Deployment URL
```bash
railway status
```

## 🔗 API Endpoints Available

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Subscription & Payments
- `POST /api/stripe/create-checkout-session` - Create Stripe checkout
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/subscription/status` - Get subscription status

### AI Tools
- `POST /api/ai/marketing` - Marketing strategy generator
- `POST /api/ai/legal` - Legal analysis assistant
- `POST /api/ai/inventory` - Inventory management optimizer
- `POST /api/ai/logistics` - Route and logistics optimizer
- `POST /api/ai/content` - Content creation assistant
- `POST /api/ai/data-analysis` - Data analysis and insights
- `POST /api/ai/sales` - Sales strategy assistant
- `POST /api/ai/customer-support` - Customer support responses
- `POST /api/ai/email` - Email content generator
- `POST /api/ai/document` - Document automation

### System
- `GET /api/health` - Health check endpoint

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'free',
  subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Security Features
- JWT authentication for all protected routes
- Rate limiting (100 requests per 15 minutes)
- CORS configuration for frontend domains
- Helmet security headers
- Password hashing with bcrypt
- Input validation and sanitization

## 🌐 CORS Configuration
The server allows requests from:
- Vercel deployment: `https://ai-solutions-database-32cq9yu9x-zaids-projects-a75be417.vercel.app`
- Custom domain: `https://aisolutionshub.co`
- Local development: `http://localhost:3000`

## 🔧 Environment Variables Required

### Required Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `OPENAI_API_KEY` - OpenAI API key
- `FRONTEND_URL` - Your frontend deployment URL
- `JWT_SECRET` - Secret for JWT token signing

### Optional Variables
- `GEMINI_API_KEY` - Google Gemini API key
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (development/production)

## 📱 Frontend Integration

### Update Vercel Environment Variables
Add to your Vercel project settings:
```
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
```

### Use the API Client
Import the helper functions in your Next.js components:
```typescript
import { 
  signup, 
  signin, 
  generateMarketingStrategy,
  createCheckoutSession 
} from '@/lib/api-client';
```

## 🚨 Troubleshooting

### Common Issues

1. **Deployment fails**
   - Check all environment variables are set
   - Ensure Node.js version is 18+
   - Verify the build logs in Railway dashboard

2. **CORS errors**
   - Check FRONTEND_URL is correct in environment variables
   - Verify the domain is added to CORS configuration

3. **Database connection issues**
   - Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   - Check if the users table exists in Supabase

4. **Authentication fails**
   - Verify JWT_SECRET is set and consistent
   - Check if Supabase RLS policies are configured

### Debugging Commands
```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables

# Test API endpoint
curl https://your-railway-app.up.railway.app/api/health
```

## ✅ Post-Deployment Checklist
- [ ] Server health check passes: `/api/health`
- [ ] All environment variables set correctly
- [ ] Database tables created in Supabase
- [ ] Frontend can connect to backend API
- [ ] CORS is working for your domains
- [ ] Stripe webhooks are configured
- [ ] AI tools endpoints are responding

## 📞 Support
If you encounter issues during deployment:
1. Check Railway dashboard for build logs
2. Verify all environment variables
3. Test API endpoints manually
4. Check Supabase dashboard for database status

Your AI Solutions Hub backend should now be live and ready to power your frontend application! 🎉