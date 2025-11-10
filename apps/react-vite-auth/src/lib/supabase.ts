import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqvcpbdwjkmbjsynhuqz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmNwYmR3amttYmpzeW5odXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzg5NzksImV4cCI6MjA3NzgxNDk3OX0.1Ze3wURXgaZDC8bgLVBVq0UU8ZRMFtBJkm1Od2zTet0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Edge function URLs
export const EDGE_FUNCTIONS = {
  marketingStrategist: `${supabaseUrl}/functions/v1/ai-marketing-strategist`,
  legalAdvisor: `${supabaseUrl}/functions/v1/ai-legal-advisor`,
  dataAnalyzer: `${supabaseUrl}/functions/v1/ai-data-analyzer`,
  emailAssistant: `${supabaseUrl}/functions/v1/ai-email-assistant`,
  documentAutomation: `${supabaseUrl}/functions/v1/ai-document-automation`,
  customerSupport: `${supabaseUrl}/functions/v1/ai-customer-support`,
  salesAssistant: `${supabaseUrl}/functions/v1/ai-sales-assistant`,
  contentCreator: `${supabaseUrl}/functions/v1/ai-content-creator`,
  voiceSms: `${supabaseUrl}/functions/v1/tool-voice-sms`,
  email: `${supabaseUrl}/functions/v1/tool-email`,
  chatCompletion: `${supabaseUrl}/functions/v1/ai-chat-completion`,
};

// Helper function to call edge functions
export async function callEdgeFunction(functionUrl: string, data: any) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Edge function error: ${error}`);
  }

  return response.json();
}
