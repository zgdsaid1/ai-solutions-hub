CREATE TABLE sales_assistant_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prospect_type VARCHAR(100) NOT NULL,
    sales_stage VARCHAR(100),
    ai_analysis JSONB,
    lead_qualification JSONB,
    proposal_data JSONB,
    pricing_recommendations JSONB,
    conversation_analysis JSONB,
    crm_integration JSONB,
    forecasting_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);