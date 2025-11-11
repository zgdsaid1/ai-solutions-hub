import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ustjuubbupzfjqmmzglt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdGp1dWJidXB6ZmpxbW16Z2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDAzMjcsImV4cCI6MjA3ODQxNjMyN30.lvxZpHqA8UAvY4aUvO1BxcTHeXNt7GYj0adGtbIPdH4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);