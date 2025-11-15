# AI Solutions Hub - Phase 1

Enterprise-grade SaaS platform providing AI capabilities through 8 specialized modules with intelligent multi-engine routing.

## Phase 1 Achievements

### Backend Infrastructure (Supabase)
- **Database**: 12 tables configured with Row-Level Security (RLS)
  - Core: profiles, subscriptions, module_usage, ai_routing_logs
  - Modules: marketing_campaigns, legal_documents, inventory_items, voice_sms_logs, email_campaigns, data_analysis_reports, logistics_routes, document_templates
  
- **Storage**: 5 public buckets for file management
  - user-uploads (10MB limit)
  - documents (10MB limit)
  - data-files (50MB limit)
  - signatures (5MB limit)
  - marketing-assets (50MB limit)

- **Edge Functions**: 3 serverless functions deployed
  - ai-router: Intelligent multi-engine AI routing system
  - create-profile: User profile creation after signup
  - stripe-webhook: Stripe subscription webhook handler (foundation)

- **Security**: Comprehensive RLS policies for all tables

### AI Routing System
The platform features an intelligent routing system that selects optimal AI engines based on:
- Module type (marketing, legal, inventory, etc.)
- Request type (content_creation, analysis, ocr, sentiment, etc.)
- Engine capabilities (Gemini for complex reasoning, Llama for content generation, specialized OCR/Sentiment engines)

### Frontend (React + TypeScript)
- **Authentication**: Complete auth system with Supabase Auth
  - Login/Signup pages
  - Protected routes
  - User profile management
  
- **Dashboard**: Main interface showing all 8 AI modules
  - Marketing & Business Growth Strategist
  - Legal Advisor (Business & Finance)
  - Smart Inventory Tracker
  - Voice & SMS Support Agent
  - Email Assistant (SendGrid Integration)
  - Data Analyzer & Insights
  - Logistics & Route Optimizer
  - Document Automation & e-Sign

- **Landing Page**: Professional marketing page

## Tech Stack

### Frontend
- React 18.3 + TypeScript
- Vite 6.0
- Tailwind CSS
- React Router v6
- Lucide React icons
- Supabase JS Client

### Backend
- Supabase (PostgreSQL database, Auth, Storage, Edge Functions)
- Deno runtime for edge functions

### Deployment Ready
- Vercel (Frontend)
- Railway (Additional services if needed)
- Supabase (Backend services)

## Live Demo

Production URL: https://www.aisolutionshub.co/

## Environment Variables

Supabase credentials are hardcoded in the frontend for Phase 1:
- SUPABASE_URL: https://qzehfqvmdzmbqournxej.supabase.co
- SUPABASE_ANON_KEY: (configured in src/lib/supabase.ts)

## API Endpoints

### Edge Functions
- AI Router: `https://qzehfqvmdzmbqournxej.supabase.co/functions/v1/ai-router`
- Create Profile: `https://qzehfqvmdzmbqournxej.supabase.co/functions/v1/create-profile`
- Stripe Webhook: `https://qzehfqvmdzmbqournxej.supabase.co/functions/v1/stripe-webhook`

## Getting Started

### Install Dependencies
```bash
cd ai-solutions-hub
pnpm install
```

### Development
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

## Database Schema

See `docs/database-schema.md` for detailed database structure.

## Next Steps (Phase 2)

1. Implement individual module interfaces
2. Integrate external AI APIs (OpenAI, Gemini, Llama)
3. Add Twilio for Voice & SMS
4. Integrate SendGrid for email campaigns
5. Complete Stripe payment integration
6. Add usage tracking and billing
7. Implement advanced analytics
8. Add file upload/download features for each module

## Security Features

- Row-Level Security (RLS) on all tables
- JWT-based authentication via Supabase Auth
- Secure edge functions with service role access
- User-specific data isolation
- Role-based access control (RBAC) foundation

## Subscription Tiers

- Free: Basic access to all modules
- Basic: Enhanced limits and features (foundation ready)
- Professional: Advanced features and higher limits (foundation ready)
- Enterprise: Unlimited access and custom solutions (foundation ready)

## License

Proprietary - AI Solutions Hub 2025
