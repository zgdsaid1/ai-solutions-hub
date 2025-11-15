#!/bin/bash

# AI Solutions Hub - Quick Deployment Script for Railway
# This script automates the Railway deployment process

set -e  # Exit on error

echo "================================================"
echo "AI Solutions Hub - Railway Deployment Script"
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}Railway CLI installed successfully!${NC}"
fi

# Check if logged in to Railway
echo -e "${YELLOW}Checking Railway authentication...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Railway. Please login:${NC}"
    railway login
else
    echo -e "${GREEN}Already logged in to Railway${NC}"
fi

# Navigate to project directory
cd "$(dirname "$0")/.."

# Check if project is linked
if [ ! -f ".railway" ]; then
    echo ""
    echo -e "${YELLOW}Project not linked to Railway. Linking now...${NC}"
    railway link
fi

# Set environment variables
echo ""
echo -e "${YELLOW}Do you want to set environment variables? (y/n)${NC}"
read -p "Choice: " set_env

if [ "$set_env" = "y" ] || [ "$set_env" = "Y" ]; then
    echo ""
    echo "Setting environment variables..."
    echo "Enter Supabase URL:"
    read supabase_url
    railway variables set SUPABASE_URL="$supabase_url"
    
    echo "Enter Supabase Service Role Key:"
    read -s service_key
    railway variables set SUPABASE_SERVICE_ROLE_KEY="$service_key"
    
    railway variables set NODE_ENV="production"
    
    echo -e "${GREEN}Environment variables set successfully!${NC}"
fi

# Deploy to Railway
echo ""
echo -e "${YELLOW}Deploying to Railway...${NC}"
railway up

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Check deployment status: railway status"
echo "2. View logs: railway logs"
echo "3. Open dashboard: railway open"
echo ""
