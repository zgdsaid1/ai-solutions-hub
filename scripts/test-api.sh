#!/bin/bash

# AI Solutions Hub - API Test Suite
# Test all endpoints locally

BASE_URL="http://localhost:8080"
TOKEN=""

echo "=============================================="
echo "AI Solutions Hub - API Test Suite"
echo "=============================================="
echo ""
echo "Make sure the server is running on $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local headers=$5
    
    echo -e "${YELLOW}Testing: $name${NC}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" $headers)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            $headers \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
        echo "$body"
    fi
    echo ""
}

# Test 1: Health Check
test_endpoint "Health Check" "GET" "/api/health"

# Test 2: Sign Up
echo "Creating test user..."
signup_data='{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}'
test_endpoint "User Sign Up" "POST" "/api/auth/signup" "$signup_data"

# Test 3: Sign In
echo "Signing in..."
signin_data='{
  "email": "test@example.com",
  "password": "password123"
}'
signin_response=$(curl -s -X POST "$BASE_URL/api/auth/signin" \
    -H "Content-Type: application/json" \
    -d "$signin_data")

TOKEN=$(echo "$signin_response" | jq -r '.data.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful, got token${NC}"
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}✗ Login failed, no token received${NC}"
    echo "$signin_response"
fi
echo ""

# Test 4: Get Profile (Protected Route)
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    test_endpoint "Get User Profile" "GET" "/api/auth/profile" "" "-H 'Authorization: Bearer $TOKEN'"
else
    echo -e "${YELLOW}Skipping profile test - no token available${NC}"
    echo ""
fi

# Test 5: Stripe Checkout Session (will fail without valid Stripe keys)
if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${YELLOW}Testing Stripe Integration (may fail without valid Stripe keys)${NC}"
    stripe_data='{
      "priceId": "price_starter_monthly_9",
      "successUrl": "http://localhost:3000/success",
      "cancelUrl": "http://localhost:3000/cancel"
    }'
    test_endpoint "Create Stripe Checkout" "POST" "/api/stripe/create-checkout-session" "$stripe_data" "-H 'Authorization: Bearer $TOKEN'"
fi

echo "=============================================="
echo "Test Summary"
echo "=============================================="
echo ""
echo "Core tests completed!"
echo ""
echo "To test AI tools, use endpoints:"
echo "  - POST /api/ai/marketing"
echo "  - POST /api/ai/legal"
echo "  - POST /api/ai/inventory"
echo "  - POST /api/ai/voice-sms"
echo "  - POST /api/ai/email"
echo "  - POST /api/ai/data"
echo "  - POST /api/ai/logistics"
echo "  - POST /api/ai/documents"
echo ""
echo "All require Authorization header with Bearer token"
echo ""
