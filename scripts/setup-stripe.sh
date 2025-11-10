#!/bin/bash

# AI Solutions Hub - Stripe Setup Script
# This script helps you set up Stripe products and prices for the platform

echo "=================================="
echo "AI Solutions Hub - Stripe Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}Error: Stripe CLI is not installed${NC}"
    echo "Please install it from: https://stripe.com/docs/stripe-cli"
    echo "Run: brew install stripe/stripe-cli/stripe (on macOS)"
    echo "Or visit: https://github.com/stripe/stripe-cli#installation"
    exit 1
fi

echo -e "${GREEN}✓ Stripe CLI found${NC}"
echo ""

# Login to Stripe
echo "Logging in to Stripe..."
stripe login

echo ""
echo "=================================="
echo "Creating Stripe Products & Prices"
echo "=================================="
echo ""

# Create Starter Plan
echo "Creating Starter Plan ($9/month)..."
STARTER_PRODUCT=$(stripe products create \
  --name="AI Solutions Hub - Starter Plan" \
  --description="Perfect for individuals getting started with AI - 3 Tools, 175K Tokens/month" \
  --format=json 2>/dev/null)

STARTER_PRODUCT_ID=$(echo $STARTER_PRODUCT | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

if [ -n "$STARTER_PRODUCT_ID" ]; then
    echo -e "${GREEN}✓ Starter Product created: $STARTER_PRODUCT_ID${NC}"
    
    STARTER_PRICE=$(stripe prices create \
      --product=$STARTER_PRODUCT_ID \
      --currency=usd \
      --unit-amount=900 \
      --recurring[interval]=month \
      --nickname="Starter Monthly" \
      --format=json 2>/dev/null)
    
    STARTER_PRICE_ID=$(echo $STARTER_PRICE | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)
    echo -e "${GREEN}✓ Starter Price created: $STARTER_PRICE_ID${NC}"
fi

echo ""

# Create Pro Plan
echo "Creating Pro Plan ($29/month)..."
PRO_PRODUCT=$(stripe products create \
  --name="AI Solutions Hub - Pro Plan" \
  --description="Best for professionals - 6 Tools, 500K Tokens/month, Priority Support" \
  --format=json 2>/dev/null)

PRO_PRODUCT_ID=$(echo $PRO_PRODUCT | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

if [ -n "$PRO_PRODUCT_ID" ]; then
    echo -e "${GREEN}✓ Pro Product created: $PRO_PRODUCT_ID${NC}"
    
    PRO_PRICE=$(stripe prices create \
      --product=$PRO_PRODUCT_ID \
      --currency=usd \
      --unit-amount=2900 \
      --recurring[interval]=month \
      --nickname="Pro Monthly" \
      --format=json 2>/dev/null)
    
    PRO_PRICE_ID=$(echo $PRO_PRICE | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)
    echo -e "${GREEN}✓ Pro Price created: $PRO_PRICE_ID${NC}"
fi

echo ""

# Create Business Plan
echo "Creating Business Plan ($99/month)..."
BUSINESS_PRODUCT=$(stripe products create \
  --name="AI Solutions Hub - Business Plan" \
  --description="For growing businesses - 7 Tools, 2M Tokens/month, Advanced Features" \
  --format=json 2>/dev/null)

BUSINESS_PRODUCT_ID=$(echo $BUSINESS_PRODUCT | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

if [ -n "$BUSINESS_PRODUCT_ID" ]; then
    echo -e "${GREEN}✓ Business Product created: $BUSINESS_PRODUCT_ID${NC}"
    
    BUSINESS_PRICE=$(stripe prices create \
      --product=$BUSINESS_PRODUCT_ID \
      --currency=usd \
      --unit-amount=9900 \
      --recurring[interval]=month \
      --nickname="Business Monthly" \
      --format=json 2>/dev/null)
    
    BUSINESS_PRICE_ID=$(echo $BUSINESS_PRICE | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)
    echo -e "${GREEN}✓ Business Price created: $BUSINESS_PRICE_ID${NC}"
fi

echo ""

# Create Enterprise Plan
echo "Creating Enterprise Plan ($299/month)..."
ENTERPRISE_PRODUCT=$(stripe products create \
  --name="AI Solutions Hub - Enterprise Plan" \
  --description="Full platform access - All 8 Tools, Unlimited Tokens, White-label Options" \
  --format=json 2>/dev/null)

ENTERPRISE_PRODUCT_ID=$(echo $ENTERPRISE_PRODUCT | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

if [ -n "$ENTERPRISE_PRODUCT_ID" ]; then
    echo -e "${GREEN}✓ Enterprise Product created: $ENTERPRISE_PRODUCT_ID${NC}"
    
    ENTERPRISE_PRICE=$(stripe prices create \
      --product=$ENTERPRISE_PRODUCT_ID \
      --currency=usd \
      --unit-amount=29900 \
      --recurring[interval]=month \
      --nickname="Enterprise Monthly" \
      --format=json 2>/dev/null)
    
    ENTERPRISE_PRICE_ID=$(echo $ENTERPRISE_PRICE | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)
    echo -e "${GREEN}✓ Enterprise Price created: $ENTERPRISE_PRICE_ID${NC}"
fi

echo ""
echo "=================================="
echo "Summary of Created Prices"
echo "=================================="
echo ""
echo -e "${YELLOW}Copy these Price IDs to your configuration:${NC}"
echo ""
echo "STRIPE_STARTER_PRICE_ID=$STARTER_PRICE_ID"
echo "STRIPE_PRO_PRICE_ID=$PRO_PRICE_ID"
echo "STRIPE_BUSINESS_PRICE_ID=$BUSINESS_PRICE_ID"
echo "STRIPE_ENTERPRISE_PRICE_ID=$ENTERPRISE_PRICE_ID"
echo ""
echo "=================================="
echo "Next Steps"
echo "=================================="
echo ""
echo "1. Update stripe-config.json with the Price IDs above"
echo "2. Set up webhook endpoint:"
echo "   - Go to: https://dashboard.stripe.com/webhooks"
echo "   - Add endpoint: https://your-railway-app.railway.app/api/stripe/webhook"
echo "   - Select events: customer.subscription.*, invoice.payment_*, checkout.session.completed"
echo "   - Copy webhook secret and add to environment variables"
echo ""
echo "3. Update environment variables:"
echo "   - Railway: Add STRIPE_WEBHOOK_SECRET"
echo "   - Vercel: Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
