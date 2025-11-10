CREATE TABLE customer_support_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    inquiry_type VARCHAR(100) NOT NULL,
    language VARCHAR(50) DEFAULT 'en',
    ai_analysis JSONB,
    response_generation JSONB,
    ticket_data JSONB,
    escalation_rules JSONB,
    knowledge_base JSONB,
    sentiment_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);