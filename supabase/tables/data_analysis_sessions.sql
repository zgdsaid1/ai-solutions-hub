CREATE TABLE data_analysis_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_type VARCHAR(100) NOT NULL,
    data_source VARCHAR(255),
    analysis_type VARCHAR(100) NOT NULL,
    data_content TEXT,
    ai_analysis JSONB,
    insights JSONB,
    visualizations JSONB,
    statistical_analysis JSONB,
    trends JSONB,
    recommendations JSONB,
    chart_configurations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);