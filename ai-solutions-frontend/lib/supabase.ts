import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqvcpbdwjkmbjsynhuqz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmNwYmR3amttYmpzeW5odXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzg5NzksImV4cCI6MjA3NzgxNDk3OX0.1Ze3wURXgaZDC8bgLVBVq0UU8ZRMFtBJkm1Od2zTet0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);