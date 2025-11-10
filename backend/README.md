# AI Solutions Hub - Backend

Complete backend infrastructure for AI Solutions Hub platform with Express.js server and Supabase Edge Functions.

## 📁 Project Structure

```
ai-solutions-backend/
├── server/                          # Railway/Express Backend
│   ├── index.js                     # Main Express server (1000+ lines)
│   ├── package.json                 # Dependencies
│   ├── railway.toml                 # Railway configuration
│   ├── deploy-railway.sh            # Deployment script
│   ├── .env.production              # Environment variables
│   └── migrations/                  # Database schemas
│       ├── complete_database_schema.sql
│       └── create_users_table.sql
│
├── supabase/                        # Supabase Edge Functions
│   └── functions/
│       ├── ai-router/               # AI routing engine
│       ├── create-subscription/     # Stripe subscription creation
│       ├── stripe-webhook/          # Stripe webhook handler
│       ├── tool-data/               # Data analysis tool
│       ├── tool-documents/          # Document automation tool
│       ├── tool-email/              # Email assistant tool
│       ├── tool-inventory/          # Inventory management tool
│       ├── tool-legal/              # Legal advisor tool
│       ├── tool-logistics/          # Logistics optimizer tool
│       ├── tool-marketing/          # Marketing strategist tool
│       └── tool-voice-sms/          # Voice/SMS support tool
│
└── deploy-database.sql              # Complete database schema
```

## 🚀 Quick Start

### Option 1: Deploy to Railway

```bash
cd server/
railway login
railway init
railway up
```

See [RAILWAY_DEPLOYMENT_GUIDE.md](../RAILWAY_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Option 2: Deploy to Supabase

```bash
supabase login
supabase link --project-ref bqvcpbdwjkmbjsynhuqz
supabase functions deploy
```

See [BACKEND_DEPLOYMENT_GUIDE.md](../BACKEND_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🔧 Server Features (Express.js)

The main server (`server/index.js`) includes:

### Authentication
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Token refresh mechanisms

### Stripe Integration
- `/api/stripe/create-checkout-session` - Create payment sessions
- `/api/stripe/webhook` - Handle Stripe events
- Subscription management (create, update, cancel)
- Invoice handling

### AI Tools (8 Routes)
1. Marketing Strategist
2. Legal Advisor
3. Inventory Tracker
4. Voice/SMS Agent
5. Email Assistant
6. Data Analyzer
7. Logistics Optimizer
8. Document Automation

### Security Features
- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Request logging with Morgan

### Database Integration
- Supabase client for PostgreSQL
- Row Level Security (RLS) policies
- Real-time subscriptions support

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "@supabase/supabase-js": "^2.45.4",
  "stripe": "^14.9.0",
  "openai": "^4.24.1",
  "google-ai-generativelanguage": "^0.2.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5",
  "morgan": "^1.10.0"
}
```

## 🗄️ Database Schema

### Tables
1. **users** - User accounts and authentication
2. **organizations** - Multi-tenant organizations
3. **subscriptions** - Stripe subscription tracking
4. **usage_logs** - AI usage and billing
5. **tool_configs** - Tool-specific configurations
6. **routing_analytics** - Performance metrics

All tables include Row Level Security (RLS) policies for data isolation.

## 🌐 Environment Variables

### Required for Railway Server

```bash
# Supabase
SUPABASE_URL=https://bqvcpbdwjkmbjsynhuqz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Services
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
DEEPSEEK_API_KEY=sk-...

# Frontend
FRONTEND_URL=https://aisolutionshub.co

# Security
JWT_SECRET=super-secret-jwt-key-for-ai-solutions-hub-production-2024

# Server
NODE_ENV=production
PORT=8080
```

### Required for Supabase Edge Functions

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/profile` - Get user profile

### Stripe
- `POST /api/stripe/create-checkout-session` - Create payment session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### AI Tools
- `POST /api/ai/marketing` - Marketing strategist
- `POST /api/ai/legal` - Legal advisor
- `POST /api/ai/inventory` - Inventory management
- `POST /api/ai/voice-sms` - Voice/SMS support
- `POST /api/ai/email` - Email assistant
- `POST /api/ai/data` - Data analysis
- `POST /api/ai/logistics` - Logistics optimization
- `POST /api/ai/documents` - Document automation

### Health Check
- `GET /api/health` - Server health status

## 🔐 Security

- **JWT Authentication** - All protected routes require valid tokens
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS** - Whitelist of allowed origins
- **Helmet.js** - Security headers
- **Input Validation** - All inputs validated
- **SQL Injection Prevention** - Parameterized queries
- **Password Hashing** - bcrypt with salt rounds

## 📊 Monitoring

The server includes:
- Request logging with Morgan
- Error logging to console
- Stripe webhook event logging
- Performance tracking

## 🧪 Testing

Test the server:

```bash
# Health check
curl https://your-app.railway.app/api/health

# Test authentication
curl -X POST https://your-app.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📝 Deployment Steps

1. **Choose Deployment Method:**
   - Railway: Simple, auto-scaling, $5/month
   - Supabase Edge: Serverless, pay-per-use

2. **Set Environment Variables**
   - See environment variables section above

3. **Deploy Database Schema:**
   ```bash
   # Run deploy-database.sql in Supabase SQL Editor
   ```

4. **Deploy Backend:**
   - Railway: `railway up`
   - Supabase: `supabase functions deploy`

5. **Configure Stripe Webhook:**
   - Add webhook endpoint in Stripe Dashboard
   - Point to: `https://your-app.railway.app/api/stripe/webhook`
   - Select events: subscription.*, invoice.payment_*

6. **Test All Endpoints**

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**
- Add frontend URL to CORS whitelist in `server/index.js`

**Stripe Webhook Fails:**
- Verify webhook secret is correct
- Check event types are subscribed
- Review Stripe webhook logs

**Database Connection Issues:**
- Verify Supabase credentials
- Check RLS policies
- Ensure service role key is used (not anon key)

**Authentication Errors:**
- Verify JWT_SECRET is set
- Check token expiry
- Ensure bcrypt is installed

## 📖 Additional Documentation

- [Complete Setup Guide](../COMPLETE_SETUP_GUIDE.md)
- [Railway Deployment Guide](../RAILWAY_DEPLOYMENT_GUIDE.md)
- [Backend Deployment Guide](../BACKEND_DEPLOYMENT_GUIDE.md)
- [Stripe Integration](../stripe-config.json)

## 🔄 Version

**Backend Version:** 1.0  
**Server Framework:** Express.js 4.18  
**Runtime:** Node.js 18+  
**Last Updated:** November 10, 2025

## 📄 License

Proprietary - AI Solutions Hub

---

**Ready to Deploy?** Follow [COMPLETE_SETUP_GUIDE.md](../COMPLETE_SETUP_GUIDE.md) for step-by-step instructions!
