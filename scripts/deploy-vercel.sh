#!/bin/bash

# AI Solutions Hub - Quick Deployment Script for Vercel
# This script automates the Vercel deployment process

set -e  # Exit on error

echo "================================================"
echo "AI Solutions Hub - Vercel Deployment Script"
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}Vercel CLI installed successfully!${NC}"
fi

# Check if logged in to Vercel
echo -e "${YELLOW}Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Vercel. Please login:${NC}"
    vercel login
else
    echo -e "${GREEN}Already logged in to Vercel${NC}"
fi

# Navigate to project directory
cd "$(dirname "$0")"

# Install dependencies
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install

# Build the project
echo ""
echo -e "${YELLOW}Building project...${NC}"
pnpm build:prod

# Ask for deployment type
echo ""
echo -e "${YELLOW}Select deployment type:${NC}"
echo "1. Production deployment"
echo "2. Preview deployment"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Deploying to production...${NC}"
        vercel --prod
        ;;
    2)
        echo ""
        echo -e "${YELLOW}Creating preview deployment...${NC}"
        vercel
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Verify deployment in Vercel dashboard"
echo "2. Test authentication and API connectivity"
echo "3. Check performance metrics"
echo "4. Configure custom domain (if needed)"
echo ""
