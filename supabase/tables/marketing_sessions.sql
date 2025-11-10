CREATE TABLE marketing_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    target_audience TEXT,
    budget_range VARCHAR(50),
    goals TEXT,
    current_situation TEXT,
    ai_analysis JSONB,
    marketing_strategy JSONB,
    campaign_recommendations JSONB,
    growth_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);