# 🔗 FRONTEND-BACKEND CONNECTION GUIDE

## ✅ DATABASE SETUP COMPLETED

All database tables have been successfully created in Supabase:
- ✅ 10 session tables for AI tools
- ✅ Users table with authentication
- ✅ Subscription tables for Stripe
- ✅ Row Level Security (RLS) policies enabled
- ✅ Performance indexes created
- ✅ Automatic triggers for timestamp updates

## 🚀 NEXT: DEPLOY BACKEND TO RAILWAY

### Quick Deployment Steps:

**Option 1: Manual Railway Upload (Recommended)**
1. Go to [railway.app](https://railway.app/dashboard)
2. Sign up/Login
3. Click "New Project" → "Deploy from GitHub" OR "Empty Project"
4. Upload the `/workspace/ai-solutions-backend/server/` folder contents
5. Set environment variables (see below)
6. Deploy

**Option 2: GitHub Integration**
1. Push `/workspace/ai-solutions-backend/server/` to GitHub
2. Connect repository in Railway
3. Deploy automatically

### Environment Variables for Railway:

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

## 🔄 UPDATE FRONTEND CONNECTION

After Railway deployment, update Vercel environment:

1. **Get your Railway URL** from Railway dashboard (e.g., `https://your-app-production.up.railway.app`)

2. **Add to Vercel environment variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
   ```

3. **Redeploy Vercel project**

## 🧪 TESTING CONNECTION

Once both deployments are complete, test these endpoints:

### Backend Health Check:
```
GET https://your-railway-url.up.railway.app/
# Should return: {"status": "Server is running!"}
```

### Auth Endpoints:
```
POST https://your-railway-url.up.railway.app/api/auth/signup
POST https://your-railway-url.up.railway.app/api/auth/signin
GET  https://your-railway-url.up.railway.app/api/auth/profile
```

### AI Tools Endpoints:
```
POST https://your-railway-url.up.railway.app/api/ai/marketing
POST https://your-railway-url.up.railway.app/api/ai/legal
POST https://your-railway-url.up.railway.app/api/ai/inventory
POST https://your-railway-url.up.railway.app/api/ai/logistics
```

## 📋 EXPECTED WORKING STATE

After completing all steps:
- ✅ Frontend loads properly (no white page)
- ✅ User registration works
- ✅ Login/logout functions
- ✅ All 10 AI tools respond
- ✅ Payment flow functional
- ✅ Database operations working

## 🔧 TROUBLESHOOTING

**If connection fails:**
1. Check Railway deployment logs for errors
2. Verify all environment variables are set
3. Test backend URLs directly in browser
4. Check CORS configuration in Railway

**If database errors:**
1. Verify Supabase connection in backend
2. Check RLS policies in Supabase dashboard
3. Ensure service role key is correct

---

**🎯 COMPLETION STATUS:**
- ✅ Database schema deployed
- ✅ Backend files ready
- 🔄 Pending: Railway deployment
- 🔄 Pending: Frontend connection update

Once Railway deployment is complete, your AI platform will be fully functional!