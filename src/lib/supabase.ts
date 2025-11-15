import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallback for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qzehfqvmdzmbqournxej.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6ZWhmcXZtZHptYnFvdXJueGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Nzc4MDIsImV4cCI6MjA3ODU1MzgwMn0.kq1ZzIZ-qEwIpADYQzDgfBlRDvT6rsHTkhSntVTHeuI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  role: string
  subscription_tier: string
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_name: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}
