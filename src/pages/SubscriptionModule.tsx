import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Crown,
  CreditCard,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Settings,
  Zap,
  Brain,
  Shield,
  Sparkles,
  Users,
  Mail,
  Phone,
  Clock,
  TrendingUp,
  ArrowLeft,
  Loader2,
  ExternalLink,
  X
} from 'lucide-react';

// Interfaces
interface SubscriptionPlan {
  id: string;
  plan_name: string;
  plan_slug: string;
  price_monthly: number;
  ai_requests_limit: number;
  ai_providers: string[];
  features: {
    basic_modules: boolean;
    ai_enhancement: boolean;
    export: boolean;
    priority_support: boolean;
    custom_integrations: boolean;
    advanced_analytics: boolean;
  };
  stripe_price_id: string;
  is_active: boolean;
}

interface UserSubscription {
  tier: string;
  plan: SubscriptionPlan;
  subscription_details: any;
  usage: any;
  profile: {
    email: string;
    full_name: string;
    company_name: string;
  };
}

interface UsageStats {
  current_period: {
    start: string;
    end: string;
    requests_used: number;
    requests_limit: number;
    requests_remaining: number;
  };
  statistics: {
    total_requests: number;
    successful_requests: number;
    success_rate: string;
    total_cost_usd: string;
    avg_response_time_ms: number;
  };
  breakdowns: {
    providers: Record<string, number>;
    modules: Record<string, number>;
  };
}

interface BillingHistoryItem {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  created_at: string;
  subscription_period_start?: string;
  subscription_period_end?: string;
  metadata?: any;
}

export default function SubscriptionModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Main state
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'billing' | 'usage'>('overview');
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  
  // Data state
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  
  // UI state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSubscriptionInfo(),
        loadPlans(),
        loadUsageStats(),
        loadBillingHistory()
      ]);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionInfo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('subscription-management', {
        body: { action: 'get_subscription_info' }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.subscription) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription info:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('subscription-management', {
        body: { action: 'get_subscription_plans' }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.plans) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('subscription-management', {
        body: { action: 'get_usage_stats' }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.usage) {
        setUsageStats(data.usage);
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const loadBillingHistory = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('subscription-management', {
        body: { action: 'get_billing_history' }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.billing_history) {
        setBillingHistory(data.billing_history);
      }
    } catch (error) {
      console.error('Error loading billing history:', error);
    }
  };

  const handleUpgradePlan = async (plan: SubscriptionPlan) => {
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-management', {
        body: {
          action: 'create_stripe_session',
          planId: plan.plan_slug,
          successUrl: `${window.location.origin}/subscription?success=true`,
          cancelUrl: `${window.location.origin}/subscription?cancelled=true`
        }
      });
      
      if (error) throw error;
      
      if (data?.success && data?.session_url) {
        window.location.href = data.session_url;
      } else {
        alert('Stripe integration is not configured. Please contact support.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-management', {
        body: { action: 'cancel_subscription' }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        alert('Your subscription has been cancelled and will end at the end of your current billing period.');
        loadSubscriptionInfo();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  const getUsagePercentage = () => {
    if (!usageStats?.current_period) return 0;
    const { requests_used, requests_limit } = usageStats.current_period;
    if (requests_limit <= 0) return 0; // Unlimited
    return (requests_used / requests_limit) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 100) return 'text-red-600 bg-red-100';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${subscription?.tier === 'enterprise' ? 'bg-purple-100' : subscription?.tier === 'pro' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Crown className={`h-6 w-6 ${subscription?.tier === 'enterprise' ? 'text-purple-600' : subscription?.tier === 'pro' ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {subscription?.plan?.plan_name || 'Free Plan'}
              </h2>
              <p className="text-gray-600">
                {subscription?.tier === 'free' ? 'Get started with basic features' : 'Premium features included'}
              </p>
            </div>
          </div>
          {subscription?.tier === 'free' && (
            <button
              onClick={() => setActiveTab('plans')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Upgrade
            </button>
          )}
        </div>

        {subscription?.tier !== 'free' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(subscription?.plan?.price_monthly || 0)}
              </p>
              <p className="text-gray-600 text-sm">per month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {subscription?.subscription_details?.current_period_end ? formatDate(subscription.subscription_details.current_period_end) : 'N/A'}
              </p>
              <p className="text-gray-600 text-sm">next billing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {subscription?.subscription_details?.status === 'active' ? 'Active' : 'Inactive'}
              </p>
              <p className="text-gray-600 text-sm">status</p>
            </div>
          </div>
        )}

        {subscription?.tier !== 'free' && subscription?.subscription_details?.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800">
                Your subscription will be cancelled at the end of the current billing period.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Usage Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Usage This Month</h3>
        
        {usageStats ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">AI Requests</span>
                <span className={`text-sm px-2 py-1 rounded-full ${getUsageColor()}`}>
                  {usageStats.current_period.requests_used} / {usageStats.current_period.requests_limit === -1 ? '∞' : usageStats.current_period.requests_limit}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getUsagePercentage() >= 100 ? 'bg-red-500' : 
                    getUsagePercentage() >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{usageStats.statistics.success_rate}%</p>
                <p className="text-gray-600 text-xs">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{usageStats.statistics.avg_response_time_ms}ms</p>
                <p className="text-gray-600 text-xs">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">${usageStats.statistics.total_cost_usd}</p>
                <p className="text-gray-600 text-xs">Total Cost</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{Object.keys(usageStats.breakdowns.modules).length}</p>
                <p className="text-gray-600 text-xs">Modules Used</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No usage data available</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('plans')}
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
        >
          <ArrowRight className="h-6 w-6 text-blue-600 mb-2" />
          <h4 className="font-medium text-gray-900">View Plans</h4>
          <p className="text-gray-600 text-sm">Compare and upgrade plans</p>
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all text-left"
        >
          <BarChart3 className="h-6 w-6 text-green-600 mb-2" />
          <h4 className="font-medium text-gray-900">Usage Details</h4>
          <p className="text-gray-600 text-sm">Detailed usage analytics</p>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
        >
          <CreditCard className="h-6 w-6 text-purple-600 mb-2" />
          <h4 className="font-medium text-gray-900">Billing History</h4>
          <p className="text-gray-600 text-sm">View past transactions</p>
        </button>
      </div>
    </div>
  );

  const renderPlans = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white p-6 rounded-xl shadow-sm border-2 ${
              subscription?.tier === plan.plan_slug 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            } transition-all`}
          >
            {plan.plan_slug === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.plan_name}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {plan.price_monthly === 0 ? 'Free' : formatCurrency(plan.price_monthly)}
                {plan.price_monthly > 0 && <span className="text-lg font-normal text-gray-600">/month</span>}
              </div>
              <p className="text-gray-600 text-sm">
                {plan.ai_requests_limit === -1 ? 'Unlimited' : plan.ai_requests_limit} AI requests per month
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">All basic modules included</span>
              </div>
              {plan.features.ai_enhancement && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">AI content enhancement</span>
                </div>
              )}
              {plan.features.export && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Export functionality</span>
                </div>
              )}
              {plan.features.advanced_analytics && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Advanced analytics</span>
                </div>
              )}
              {plan.features.priority_support && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Priority support</span>
                </div>
              )}
              {plan.features.custom_integrations && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Custom integrations</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700">
                  {plan.ai_providers.includes('gemini') && plan.ai_providers.includes('deepseek') 
                    ? 'Gemini + DeepSeek AI' 
                    : plan.ai_providers.includes('deepseek') 
                    ? 'DeepSeek AI' 
                    : 'AI Provider'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (subscription?.tier === plan.plan_slug) return;
                handleUpgradePlan(plan);
              }}
              disabled={subscriptionLoading || subscription?.tier === plan.plan_slug}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                subscription?.tier === plan.plan_slug
                  ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                  : plan.plan_slug === 'free'
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {subscriptionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : subscription?.tier === plan.plan_slug ? (
                'Current Plan'
              ) : (
                plan.plan_slug === 'free' ? 'Downgrade' : 'Upgrade'
              )}
            </button>
          </div>
        ))}
      </div>

      {subscription?.tier !== 'free' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Subscription</h3>
          <p className="text-gray-600 mb-4">
            Cancel your subscription to downgrade to the free plan at the end of your billing period.
          </p>
          <button
            onClick={handleCancelSubscription}
            disabled={subscriptionLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg"
          >
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Usage Analytics</h2>
        <p className="text-gray-600">Detailed breakdown of your AI usage and performance</p>
      </div>

      {usageStats && (
        <>
          {/* Current Period Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Current Billing Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{usageStats.current_period.requests_used}</p>
                <p className="text-gray-600 text-sm">Requests Used</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {usageStats.current_period.requests_limit === -1 ? '∞' : usageStats.current_period.requests_remaining}
                </p>
                <p className="text-gray-600 text-sm">Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatDate(usageStats.current_period.start)}
                </p>
                <p className="text-gray-600 text-sm">Period Start</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatDate(usageStats.current_period.end)}
                </p>
                <p className="text-gray-600 text-sm">Period End</p>
              </div>
            </div>
          </div>

          {/* Provider Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Provider Usage</h3>
              <div className="space-y-3">
                {Object.entries(usageStats.breakdowns.providers).map(([provider, count]) => (
                  <div key={provider} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{provider}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Module Usage</h3>
              <div className="space-y-3">
                {Object.entries(usageStats.breakdowns.modules).slice(0, 5).map(([module, count]) => (
                  <div key={module} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{module.replace('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing History</h2>
        <p className="text-gray-600">View your past transactions and invoices</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingHistory.length > 0 ? (
                billingHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.description}</div>
                      <div className="text-sm text-gray-500">{item.transaction_type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.amount, item.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.subscription_period_start && item.subscription_period_end
                        ? `${formatDate(item.subscription_period_start)} - ${formatDate(item.subscription_period_end)}`
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No billing history available</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
              <p className="text-gray-600">Manage your AI Solutions Hub subscription and billing</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {!loading && (
          <>
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'overview', label: 'Overview', icon: Crown },
                  { id: 'plans', label: 'Plans', icon: Sparkles },
                  { id: 'usage', label: 'Usage', icon: BarChart3 },
                  { id: 'billing', label: 'Billing', icon: CreditCard }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'plans' && renderPlans()}
            {activeTab === 'usage' && renderUsage()}
            {activeTab === 'billing' && renderBilling()}
          </>
        )}
      </div>
    </div>
  );
}