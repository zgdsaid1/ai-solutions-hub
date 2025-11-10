#!/bin/bash

# AI Solutions Hub - Quick Local Test Script
# Run this in GitHub Codespaces to test the backend locally

echo "=============================================="
echo "AI Solutions Hub - Local Backend Test"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to backend
cd ai-solutions-backend/server || {
    echo -e "${RED}Error: ai-solutions-backend/server directory not found${NC}"
    echo "Make sure you're in the repository root"
    exit 1
}

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install || {
    echo -e "${RED}Error: npm install failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Creating local environment file...${NC}"
if [ ! -f .env.local ]; then
    cp .env.production .env.local
    echo -e "${GREEN}✓ Created .env.local from .env.production${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Starting server...${NC}"
echo "Server will start on http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "=============================================="
echo "Available endpoints to test:"
echo "  - GET  http://localhost:8080/api/health"
echo "  - POST http://localhost:8080/api/auth/signup"
echo "  - POST http://localhost:8080/api/auth/signin"
echo "=============================================="
echo ""

# Start server
npm start
