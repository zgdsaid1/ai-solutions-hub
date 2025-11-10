# Local Testing Guide - GitHub Codespaces

## Quick Start - Test Backend Locally

Yes! You can test the backend server locally in GitHub Codespaces right now. Here's how:

### Prerequisites (Already Available in Codespaces)
- ✅ Node.js v20.19.5 installed
- ✅ Backend code extracted in `ai-solutions-backend/server/`
- ✅ Environment variables in `.env.production`

---

## Option 1: Quick Test (5 minutes)

### Step 1: Navigate to Backend
```bash
cd ai-solutions-backend/server
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Local Environment File
```bash
# Copy production env to local for testing
cp .env.production .env.local
```

### Step 4: Start the Server
```bash
npm start
```

The server will start on port 8080. You should see:
```
Server running on port 8080
Environment: production
```

### Step 5: Test the Health Endpoint
Open a new terminal and run:
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-10T..."}
```

---

## Option 2: Development Mode with Auto-Reload (Recommended)

### Step 1: Install Dependencies (if not done)
```bash
cd ai-solutions-backend/server
npm install
```

### Step 2: Start in Dev Mode
```bash
npm run dev
```

This uses `nodemon` which will auto-reload when you make changes to the code.

---

## Testing Endpoints

### 1. Health Check
```bash
curl http://localhost:8080/api/health
```

### 2. Test Authentication - Sign Up
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### 3. Test Authentication - Sign In
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response for authenticated requests.

### 4. Test Protected Endpoint (Get Profile)
```bash
curl http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing Stripe Integration Locally

### Test Stripe Checkout Session Creation
```bash
curl -X POST http://localhost:8080/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "priceId": "price_starter_monthly_9",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

### Test Stripe Webhook (Local)
For local webhook testing, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8080/api/stripe/webhook
```

---

## Environment Variables for Local Testing

The backend needs these environment variables (already in `.env.production`):

```bash
# Supabase
SUPABASE_URL=https://bqvcpbdwjkmbjsynhuqz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=******

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Services
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
DEEPSEEK_API_KEY=sk-...

# Frontend
FRONTEND_URL=http://localhost:3000  # Change for local testing

# Security
JWT_SECRET=super-secret-jwt-key-for-ai-solutions-hub-production-2024

# Server
NODE_ENV=development  # Change for local testing
PORT=8080
```

**For local testing**, you may want to:
1. Use Stripe test keys instead of live keys
2. Set `NODE_ENV=development`
3. Set `FRONTEND_URL=http://localhost:3000`

---

## Testing AI Tools Locally

Each AI tool has an endpoint. Here's how to test them:

### Test Marketing Tool
```bash
curl -X POST http://localhost:8080/api/ai/marketing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "prompt": "Create a marketing strategy for a new AI product",
    "context": "Tech startup targeting small businesses"
  }'
```

### Test Legal Tool
```bash
curl -X POST http://localhost:8080/api/ai/legal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "prompt": "Review this contract clause",
    "document": "The parties agree to..."
  }'
```

Similar endpoints exist for:
- `/api/ai/inventory`
- `/api/ai/voice-sms`
- `/api/ai/email`
- `/api/ai/data`
- `/api/ai/logistics`
- `/api/ai/documents`

---

## Port Forwarding in GitHub Codespaces

When you start the server, GitHub Codespaces will automatically detect port 8080 and offer to forward it.

1. Click on the **PORTS** tab in the terminal panel
2. Port 8080 should be listed
3. You can make it public or keep it private
4. Use the forwarded URL to test from outside Codespaces

---

## Debugging

### View Server Logs
When running in dev mode, logs appear in the terminal:
```
[timestamp] GET /api/health 200 5ms
[timestamp] POST /api/auth/signup 201 250ms
```

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or use a different port
PORT=8081 npm start
```

**Missing Dependencies:**
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment Variables Not Loading:**
```bash
# Make sure .env.local exists
ls -la .env.local

# Or set inline
SUPABASE_URL=https://... npm start
```

---

## Testing Database Connection

The server connects to Supabase PostgreSQL. To verify:

```bash
# Check if server can connect
npm start

# Look for this in logs:
# "Supabase client initialized"
# "Connected to database"
```

If you see database errors, verify:
1. `SUPABASE_URL` is correct
2. `SUPABASE_SERVICE_ROLE_KEY` is valid
3. Your IP is not blocked by Supabase

---

## VS Code Integration

In GitHub Codespaces (which uses VS Code), you can:

1. **Run in Debug Mode:**
   - Press F5
   - Select "Node.js"
   - Set breakpoints in `index.js`

2. **Use REST Client Extension:**
   - Install "REST Client" extension
   - Create `.http` file with requests
   - Click "Send Request" to test endpoints

3. **View Logs:**
   - Use the integrated terminal
   - Open Output panel for detailed logs

---

## Load Testing (Optional)

Test server performance:

```bash
# Install Apache Bench
sudo apt-get update && sudo apt-get install -y apache2-utils

# Test health endpoint
ab -n 1000 -c 10 http://localhost:8080/api/health

# Results show requests/second and response times
```

---

## Next Steps After Local Testing

1. **Verify All Endpoints Work:**
   - Test authentication
   - Test Stripe integration
   - Test AI tools
   - Check error handling

2. **Check Performance:**
   - Response times
   - Memory usage
   - CPU usage

3. **Deploy to Railway:**
   - Once local testing is successful
   - Follow COMPLETE_SETUP_GUIDE.md
   - Deploy to production

---

## Quick Test Script

Save this as `test-local.sh`:

```bash
#!/bin/bash

echo "Testing AI Solutions Hub Backend Locally"
echo "========================================"

# Start server in background
cd ai-solutions-backend/server
npm install
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo "Testing health endpoint..."
curl http://localhost:8080/api/health

echo ""
echo "Server running on PID: $SERVER_PID"
echo "Press Ctrl+C to stop"

# Wait for user to stop
wait $SERVER_PID
```

Run with:
```bash
chmod +x test-local.sh
./test-local.sh
```

---

## Summary

✅ **Yes, you can test locally in GitHub Codespaces!**

**Quick commands:**
```bash
cd ai-solutions-backend/server
npm install
npm run dev
```

Then test endpoints using `curl` or a REST client.

The backend is fully functional locally and includes:
- Authentication endpoints
- Stripe integration
- 8 AI tool endpoints
- Database connectivity
- Security middleware
- Rate limiting

**Ready to test!** 🚀
