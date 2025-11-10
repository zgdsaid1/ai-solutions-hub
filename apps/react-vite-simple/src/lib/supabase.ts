import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zkmdfyfhekmbtumkxgsw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprbWRmeWZoZWttYnR1bWt4Z3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDg4MTIsImV4cCI6MjA3Nzc4NDgxMn0.uFCURn9e-n76Y1calSuNp1rj4SjuHJMDEHQPQ4mdp9M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
