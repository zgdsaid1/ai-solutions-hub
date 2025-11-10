#!/bin/bash

# Railway Deployment Script for AI Solutions Backend
echo "🚀 Starting Railway deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Initialize Railway project
echo "🏗️ Initializing Railway project..."
railway init

# Set environment variables
echo "⚙️ Setting environment variables..."

railway variables set SUPABASE_URL="https://bqvcpbdwjkmbjsynhuqz.supabase.co"
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmNwYmR3amttYmpzeW5odXF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzODk3OSwiZXhwIjoyMDc3ODE0OTc5fQ.MNyTa90QsamO36z_DUdHYH5RPkbFzh5VA4VPG-4R5ks"
railway variables set STRIPE_SECRET_KEY="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"
railway variables set STRIPE_WEBHOOK_SECRET="whsec_Vy3VXpOlRhKoPezTayCR1jH7k2xWfEis"
railway variables set OPENAI_API_KEY="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"
railway variables set GEMINI_API_KEY="AIzaSyBJkpXYMuv_7AtIkvumMvXHAeMFrtWAO9Q"
railway variables set DEEPSEEK_API_KEY="sk-e4522e1bea2f429cb6d1d0bf59621f01"
railway variables set FRONTEND_URL="https://ai-solutions-database-32cq9yu9x-zaids-projects-a75be417.vercel.app"
railway variables set JWT_SECRET="super-secret-jwt-key-for-ai-solutions-hub-production-2024"
railway variables set NODE_ENV="production"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Get the deployment URL
echo "📋 Getting deployment information..."
railway status

echo "✅ Deployment completed!"
echo "🔗 Check your Railway dashboard for the deployment URL"