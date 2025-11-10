import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SUBSCRIPTION_PLANS } from '../types';
import { ArrowLeft, Check, CreditCard, Calendar, AlertCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState('basic');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCurrentTier(data.subscription_tier || 'basic');
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    
    try {
      // In a real app, this would integrate with Stripe
      // For now, we'll just update the database
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: planId })
        .eq('id', user?.id);

      if (error) throw error;
      
      setCurrentTier(planId);
      alert('Subscription updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
          <p className="text-gray-600">Choose the plan that fits your needs</p>
        </div>

        {/* Current Plan */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Current Plan</h3>
              <p className="text-blue-800">
                You are currently on the <span className="font-bold capitalize">{currentTier}</span> plan
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = currentTier === plan.id;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border-2 ${
                  isCurrentPlan
                    ? 'border-blue-600 shadow-lg'
                    : plan.id === 'professional'
                    ? 'border-blue-400 shadow-lg scale-105'
                    : 'border-gray-200'
                } p-8 relative`}
              >
                {plan.id === 'professional' && !isCurrentPlan && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-green-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      CURRENT PLAN
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.id === 'professional'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade Now'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Billing Info */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Payment Method</h3>
                <p className="text-sm text-gray-600">No payment method on file</p>
                <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                  Add payment method
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Next Billing Date</h3>
                <p className="text-sm text-gray-600">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Monthly billing cycle</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">Billing History</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
              No billing history available
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
