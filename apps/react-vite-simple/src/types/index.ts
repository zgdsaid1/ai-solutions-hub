export interface User {
  id: string;
  email: string;
  full_name: string;
  organization_id: string;
  role: 'user' | 'manager' | 'admin' | 'owner';
  avatar_url?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  subscription_tier: 'starter' | 'pro' | 'business' | 'enterprise';
  stripe_customer_id?: string;
  subscription_status: 'active' | 'trial' | 'cancelled' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_subscription_id?: string;
  tier: 'starter' | 'pro' | 'business' | 'enterprise';
  status: 'active' | 'past_due' | 'cancelled' | 'trial';
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  organization_id: string;
  tool_name: string;
  ai_engine: string;
  tokens_used: number;
  cost: number;
  request_data?: any;
  response_data?: any;
  created_at: string;
}

export interface ToolConfig {
  id: string;
  organization_id: string;
  tool_name: string;
  configuration: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutingAnalytics {
  id: string;
  organization_id: string;
  request_type: string;
  chosen_engine: string;
  fallback_engine?: string;
  response_time: number;
  quality_score: number;
  cost_saved: number;
  created_at: string;
}

export interface BusinessTool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  tierAccess: 'starter' | 'pro' | 'business' | 'enterprise';
  aiEngine: string;
}

export const BUSINESS_TOOLS: BusinessTool[] = [
  {
    id: '1',
    name: 'Marketing & Growth Strategist',
    slug: 'marketing',
    description: 'AI-powered market analysis and strategy development',
    category: 'Marketing',
    icon: 'TrendingUp',
    tierAccess: 'starter',
    aiEngine: 'openai-gpt4'
  },
  {
    id: '2',
    name: 'Legal Advisor',
    slug: 'legal',
    description: 'Contract analysis, compliance, and legal consultation',
    category: 'Legal',
    icon: 'Scale',
    tierAccess: 'pro',
    aiEngine: 'openai-gpt4'
  },
  {
    id: '3',
    name: 'Smart Inventory Tracker',
    slug: 'inventory',
    description: 'Stock monitoring and demand forecasting',
    category: 'Operations',
    icon: 'Package',
    tierAccess: 'starter',
    aiEngine: 'google-gemini-pro'
  },
  {
    id: '4',
    name: 'Voice & SMS Agent',
    slug: 'voice-sms',
    description: 'AI customer support via voice and SMS',
    category: 'Support',
    icon: 'Phone',
    tierAccess: 'business',
    aiEngine: 'google-gemini-pro'
  },
  {
    id: '5',
    name: 'Email Assistant',
    slug: 'email',
    description: 'Email analysis and intelligent responses',
    category: 'Communication',
    icon: 'Mail',
    tierAccess: 'pro',
    aiEngine: 'google-gemini-pro'
  },
  {
    id: '6',
    name: 'Data Analyzer',
    slug: 'data',
    description: 'Pattern recognition and predictive analytics',
    category: 'Analytics',
    icon: 'BarChart',
    tierAccess: 'pro',
    aiEngine: 'openai-gpt4'
  },
  {
    id: '7',
    name: 'Logistics Optimizer',
    slug: 'logistics',
    description: 'Route planning and delivery optimization',
    category: 'Logistics',
    icon: 'Truck',
    tierAccess: 'enterprise',
    aiEngine: 'google-gemini-pro'
  },
  {
    id: '8',
    name: 'Document Automation',
    slug: 'documents',
    description: 'Contract generation and e-signature management',
    category: 'Documents',
    icon: 'FileText',
    tierAccess: 'starter',
    aiEngine: 'openai-gpt4'
  }
];

export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    price: 9,
    trialDays: 15,
    features: [
      'Marketing Strategist',
      'Inventory Tracker',
      'Document Automation',
      '175K AI Tokens/month',
      'Low Priority Routing',
      'Email Support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 29,
    trialDays: 7,
    features: [
      'All Starter Features',
      'Legal Advisor',
      'Email Assistant',
      'Data Analyzer',
      '500K AI Tokens/month',
      'Medium Priority Routing',
      'Email + Chat Support'
    ]
  },
  business: {
    name: 'Business',
    price: 99,
    trialDays: 0,
    features: [
      'All Pro Features',
      'Voice & SMS Agent',
      '2M AI Tokens/month',
      'High Priority Routing',
      'Custom AI Models',
      'Advanced Analytics',
      'Priority Support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    trialDays: 0,
    features: [
      'All Business Features',
      'Logistics Optimizer',
      'Unlimited AI Tokens',
      'Exclusive Routing',
      'Dedicated Capacity',
      'White-label Options',
      '24/7 Support',
      'Custom Integrations'
    ]
  }
};
