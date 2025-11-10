CREATE TABLE content_creation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(100) NOT NULL,
    platform VARCHAR(100),
    ai_analysis JSONB,
    content_generation JSONB,
    seo_optimization JSONB,
    media_integration JSONB,
    publishing_schedule JSONB,
    performance_tracking JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);