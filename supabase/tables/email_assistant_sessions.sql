CREATE TABLE email_assistant_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type VARCHAR(100) NOT NULL,
    recipient_type VARCHAR(100),
    email_purpose TEXT NOT NULL,
    ai_analysis JSONB,
    email_content JSONB,
    personalization_data JSONB,
    template_suggestions JSONB,
    tone_settings JSONB,
    delivery_options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);