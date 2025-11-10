CREATE TABLE document_automation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    template_category VARCHAR(100),
    ai_analysis JSONB,
    document_content JSONB,
    template_data JSONB,
    formatting_options JSONB,
    export_formats JSONB,
    automation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);