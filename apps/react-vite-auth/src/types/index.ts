export interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_tier?: string;
  created_at: string;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  endpoint: string;
  color: string;
}

export interface Session {
  id: string;
  user_id: string;
  tool_name: string;
  input_data: any;
  output_data: any;
  created_at: string;
  success: boolean;
}

export interface UsageStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens_used: number;
  requests_by_tool: Record<string, number>;
  requests_this_month: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  max_requests: number;
  max_users: number;
  priority_support: boolean;
}

export const AI_TOOLS: AITool[] = [
  {
    id: 'marketing-strategist',
    name: 'Marketing Strategist',
    description: 'Generate comprehensive marketing strategies and growth plans for your business',
    icon: 'TrendingUp',
    category: 'Business Growth',
    endpoint: 'ai-marketing-strategist',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'legal-advisor',
    name: 'Legal Advisor',
    description: 'Get legal consultation and document analysis powered by AI',
    icon: 'Scale',
    category: 'Legal & Compliance',
    endpoint: 'ai-legal-advisor',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'data-analyzer',
    name: 'Data Analyzer',
    description: 'Analyze complex datasets and generate actionable insights',
    icon: 'BarChart3',
    category: 'Analytics',
    endpoint: 'ai-data-analyzer',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'email-assistant',
    name: 'Email Assistant',
    description: 'Create personalized email content and campaigns',
    icon: 'Mail',
    category: 'Communication',
    endpoint: 'ai-email-assistant',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'document-automation',
    name: 'Document Automation',
    description: 'Generate and export professional documents automatically',
    icon: 'FileText',
    category: 'Productivity',
    endpoint: 'ai-document-automation',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Analyze customer inquiries and manage support tickets',
    icon: 'Headphones',
    category: 'Support',
    endpoint: 'ai-customer-support',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'sales-assistant',
    name: 'Sales Assistant',
    description: 'Qualify leads and forecast sales with AI-powered insights',
    icon: 'DollarSign',
    category: 'Sales',
    endpoint: 'ai-sales-assistant',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Create SEO-optimized content for blogs, social media, and marketing',
    icon: 'Pen Pen',
    category: 'Content',
    endpoint: 'ai-content-creator',
    color: 'from-pink-500 to-rose-500',
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9,
    interval: 'month',
    features: [
      '1,000 AI requests per month',
      '1 user account',
      'Access to all 8 AI tools',
      'Email support',
      'Basic analytics',
    ],
    max_requests: 1000,
    max_users: 1,
    priority_support: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    interval: 'month',
    features: [
      '10,000 AI requests per month',
      '3 user accounts',
      'Access to all 8 AI tools',
      'Priority email support',
      'Advanced analytics',
      'API access',
      'Custom integrations',
    ],
    max_requests: 10000,
    max_users: 3,
    priority_support: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: [
      'Unlimited AI requests',
      '10 user accounts',
      'Access to all 8 AI tools',
      '24/7 priority support',
      'Advanced analytics & reporting',
      'Full API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    max_requests: -1,
    max_users: 10,
    priority_support: true,
  },
];
