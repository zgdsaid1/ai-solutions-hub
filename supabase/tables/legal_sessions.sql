CREATE TABLE legal_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    case_type VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(255),
    urgency_level VARCHAR(50),
    legal_query TEXT NOT NULL,
    ai_analysis JSONB,
    risk_assessment JSONB,
    legal_recommendations JSONB,
    compliance_guidance JSONB,
    document_analysis JSONB,
    legal_precedents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);