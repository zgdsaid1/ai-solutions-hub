-- Complete Database Schema for AI Solutions Hub
-- Run this in your Supabase SQL Editor

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'free',
  subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== MARKETING SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS marketing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_type VARCHAR(255) NOT NULL,
  target_audience TEXT NOT NULL,
  budget VARCHAR(255),
  goals TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== LEGAL SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS legal_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  legal_query TEXT NOT NULL,
  document_type VARCHAR(255),
  jurisdiction VARCHAR(255),
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INVENTORY SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS inventory_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_inventory JSONB,
  sales_data JSONB,
  seasonality VARCHAR(255),
  lead_time INTEGER,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== LOGISTICS SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS logistics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  locations JSONB,
  delivery_requests JSONB,
  constraints JSONB,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CONTENT SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS content_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(255) NOT NULL,
  topic TEXT NOT NULL,
  target_audience VARCHAR(255),
  tone VARCHAR(255),
  length VARCHAR(255),
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== DATA ANALYSIS SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS data_analysis_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dataset JSONB,
  analysis_type VARCHAR(255),
  business_question TEXT,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SALES SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS sales_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_info JSONB,
  prospect_info JSONB,
  sales_stage VARCHAR(255),
  goals TEXT,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CUSTOMER SUPPORT SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS customer_support_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_issue TEXT NOT NULL,
  ticket_type VARCHAR(255),
  urgency VARCHAR(255),
  customer_history JSONB,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== EMAIL SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS email_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_type VARCHAR(255) NOT NULL,
  recipient VARCHAR(255),
  subject TEXT,
  purpose TEXT,
  tone VARCHAR(255),
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== DOCUMENT AUTOMATION SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS document_automation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(255) NOT NULL,
  data JSONB,
  template TEXT,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SUBSCRIPTION PLANS TABLE ====================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  interval_type VARCHAR(50) DEFAULT 'month',
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== USER SUBSCRIPTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== AI SOLUTIONS PLANS TABLE ====================
CREATE TABLE IF NOT EXISTS ai_solutions_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  features JSONB,
  limits JSONB,
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== AI SOLUTIONS SUBSCRIPTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS ai_solutions_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES ai_solutions_plans(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX IF NOT EXISTS idx_marketing_sessions_user_id ON marketing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_sessions_user_id ON legal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sessions_user_id ON inventory_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_logistics_sessions_user_id ON logistics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_sessions_user_id ON content_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_data_analysis_sessions_user_id ON data_analysis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_sessions_user_id ON sales_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_support_sessions_user_id ON customer_support_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sessions_user_id ON email_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_automation_sessions_user_id ON document_automation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_solutions_subscriptions_user_id ON ai_solutions_subscriptions(user_id);

-- ==================== ROW LEVEL SECURITY (RLS) ====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_automation_sessions ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (true);

-- Session tables policies
CREATE POLICY "Users can access own marketing sessions" ON marketing_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own legal sessions" ON legal_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own inventory sessions" ON inventory_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own logistics sessions" ON logistics_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own content sessions" ON content_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own data analysis sessions" ON data_analysis_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own sales sessions" ON sales_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own customer support sessions" ON customer_support_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own email sessions" ON email_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own document automation sessions" ON document_automation_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for plans
CREATE POLICY "Anyone can view plans" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view ai solutions plans" ON ai_solutions_plans
  FOR SELECT USING (true);

-- ==================== TRIGGERS ====================
-- Update updated_at timestamp on updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_solutions_plans_updated_at BEFORE UPDATE ON ai_solutions_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_solutions_subscriptions_updated_at BEFORE UPDATE ON ai_solutions_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();