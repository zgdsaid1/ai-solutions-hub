// Subscription Management Edge Function
// Handles subscription operations, billing, and usage tracking
// Integrates with Stripe for payment processing

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userDataResponse = await userResponse.json();
        const userId = userDataResponse.id;

        const requestData = await req.json();
        const { action } = requestData;

        // Route to appropriate handler based on action
        switch (action) {
            case 'get_subscription_info':
                return await getSubscriptionInfo(supabaseUrl, serviceRoleKey, userId, corsHeaders);
            case 'get_subscription_plans':
                return await getSubscriptionPlans(supabaseUrl, serviceRoleKey, corsHeaders);
            case 'get_usage_stats':
                return await getUsageStats(supabaseUrl, serviceRoleKey, userId, corsHeaders);
            case 'get_billing_history':
                return await getBillingHistory(supabaseUrl, serviceRoleKey, userId, corsHeaders);
            case 'create_stripe_session':
                return await createStripeSession(supabaseUrl, serviceRoleKey, userId, stripeSecretKey, requestData, corsHeaders);
            case 'cancel_subscription':
                return await cancelSubscription(supabaseUrl, serviceRoleKey, userId, stripeSecretKey, corsHeaders);
            case 'update_payment_method':
                return await updatePaymentMethod(supabaseUrl, serviceRoleKey, userId, stripeSecretKey, requestData, corsHeaders);
            case 'check_feature_access':
                return await checkFeatureAccess(supabaseUrl, serviceRoleKey, userId, requestData, corsHeaders);
            case 'track_usage':
                return await trackUsage(supabaseUrl, serviceRoleKey, userId, requestData, corsHeaders);
            default:
                throw new Error('Invalid action');
        }

    } catch (error) {
        console.error('Subscription management error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: {
                code: 'SUBSCRIPTION_FAILED',
                message: error.message || 'Failed to process subscription request'
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Get user's subscription information
async function getSubscriptionInfo(supabaseUrl: string, serviceRoleKey: string, userId: string, corsHeaders: any) {
    try {
        // Get user profile with subscription tier
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const profiles = await profileResponse.json();
        const profile = profiles[0];

        if (!profile) {
            throw new Error('User profile not found');
        }

        // Get subscription details
        const subscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const subscriptions = await subscriptionResponse.json();
        const subscription = subscriptions[0];

        // Get current usage quota
        const today = new Date().toISOString().split('T')[0];
        const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        const usageResponse = await fetch(`${supabaseUrl}/rest/v1/usage_quotas?user_id=eq.${userId}&current_period_start=eq.${firstOfMonth}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const usageQuotas = await usageResponse.json();
        const currentUsage = usageQuotas[0];

        // Get plan details
        const planResponse = await fetch(`${supabaseUrl}/rest/v1/subscription_plans?plan_slug=eq.${profile.subscription_tier || 'free'}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const plans = await planResponse.json();
        const currentPlan = plans[0];

        return new Response(JSON.stringify({
            success: true,
            subscription: {
                tier: profile.subscription_tier || 'free',
                plan: currentPlan,
                subscription_details: subscription,
                usage: currentUsage,
                profile: {
                    email: profile.email,
                    full_name: profile.full_name,
                    company_name: profile.company_name
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error getting subscription info:', error);
        throw error;
    }
}

// Get all available subscription plans
async function getSubscriptionPlans(supabaseUrl: string, serviceRoleKey: string, corsHeaders: any) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/subscription_plans?is_active=eq.true&order=price_monthly.asc`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const plans = await response.json();

        return new Response(JSON.stringify({
            success: true,
            plans: plans
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error getting subscription plans:', error);
        throw error;
    }
}

// Get user's usage statistics
async function getUsageStats(supabaseUrl: string, serviceRoleKey: string, userId: string, corsHeaders: any) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const lastOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

        // Get current month's usage quota
        const quotaResponse = await fetch(`${supabaseUrl}/rest/v1/usage_quotas?user_id=eq.${userId}&current_period_start=eq.${firstOfMonth}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const quotas = await quotaResponse.json();
        const currentQuota = quotas[0];

        // Get AI routing logs for current month
        const logsResponse = await fetch(`${supabaseUrl}/rest/v1/ai_routing_logs?user_id=eq.${userId}&created_at=gte.${firstOfMonth}T00:00:00.000Z&created_at=lte.${lastOfMonth}T23:59:59.999Z&order=created_at.desc&limit=1000`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const logs = await logsResponse.json();

        // Calculate usage statistics
        const totalRequests = logs.length;
        const successfulRequests = logs.filter(log => log.success).length;
        const totalCost = logs.reduce((sum, log) => sum + (parseFloat(log.cost_usd) || 0), 0);
        const avgResponseTime = logs.length > 0 ? 
            logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length : 0;

        // Provider breakdown
        const providerBreakdown = logs.reduce((breakdown, log) => {
            breakdown[log.ai_provider] = (breakdown[log.ai_provider] || 0) + 1;
            return breakdown;
        }, {});

        // Module usage breakdown
        const moduleBreakdown = logs.reduce((breakdown, log) => {
            breakdown[log.module_name] = (breakdown[log.module_name] || 0) + 1;
            return breakdown;
        }, {});

        return new Response(JSON.stringify({
            success: true,
            usage: {
                current_period: {
                    start: firstOfMonth,
                    end: lastOfMonth,
                    requests_used: totalRequests,
                    requests_limit: currentQuota?.ai_requests_limit || 10,
                    requests_remaining: Math.max(0, (currentQuota?.ai_requests_limit || 10) - totalRequests)
                },
                statistics: {
                    total_requests: totalRequests,
                    successful_requests: successfulRequests,
                    success_rate: totalRequests > 0 ? (successfulRequests / totalRequests * 100).toFixed(1) : '100',
                    total_cost_usd: totalCost.toFixed(4),
                    avg_response_time_ms: Math.round(avgResponseTime)
                },
                breakdowns: {
                    providers: providerBreakdown,
                    modules: moduleBreakdown
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error getting usage stats:', error);
        throw error;
    }
}

// Get billing history
async function getBillingHistory(supabaseUrl: string, serviceRoleKey: string, userId: string, corsHeaders: any) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/billing_history?user_id=eq.${userId}&order=created_at.desc&limit=50`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const billingHistory = await response.json();

        return new Response(JSON.stringify({
            success: true,
            billing_history: billingHistory
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error getting billing history:', error);
        throw error;
    }
}

// Create Stripe checkout session
async function createStripeSession(supabaseUrl: string, serviceRoleKey: string, userId: string, stripeSecretKey: string, requestData: any, corsHeaders: any) {
    if (!stripeSecretKey) {
        return new Response(JSON.stringify({
            success: false,
            error: {
                code: 'STRIPE_NOT_CONFIGURED',
                message: 'Stripe integration is not configured. Please contact support.'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        const { planId, successUrl, cancelUrl } = requestData;

        // Get plan details
        const planResponse = await fetch(`${supabaseUrl}/rest/v1/subscription_plans?plan_slug=eq.${planId}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const plans = await planResponse.json();
        const plan = plans[0];

        if (!plan || !plan.stripe_price_id) {
            throw new Error('Plan not found or Stripe price ID not configured');
        }

        // Get user profile
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const profiles = await profileResponse.json();
        const profile = profiles[0];

        // Create Stripe checkout session using Stripe REST API
        const stripeBaseUrl = 'https://api.stripe.com/v1';
        const stripeAuth = 'Basic ' + btoa(stripeSecretKey + ':');
        
        // Build form data for Stripe API
        const formData = new URLSearchParams({
            'payment_method_types[]': 'card',
            'line_items[0][price]': plan.stripe_price_id,
            'line_items[0][quantity]': '1',
            'mode': 'subscription',
            'success_url': successUrl || 'https://mva1r4a5evsc.space.minimax.io/subscription?success=true',
            'cancel_url': cancelUrl || 'https://mva1r4a5evsc.space.minimax.io/subscription?cancelled=true',
            'client_reference_id': userId,
            'metadata[user_id]': userId,
            'metadata[plan_id]': plan.plan_slug,
            'metadata[plan_name]': plan.plan_name,
            'subscription_data[metadata][user_id]': userId,
            'subscription_data[metadata][plan_id]': plan.plan_slug
        });

        // Call Stripe API to create checkout session
        const stripeResponse = await fetch(`${stripeBaseUrl}/checkout/sessions`, {
            method: 'POST',
            headers: {
                'Authorization': stripeAuth,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const stripeData = await stripeResponse.json();

        // Check for Stripe API errors
        if (!stripeResponse.ok || stripeData.error) {
            console.error('Stripe API error:', stripeData.error);
            throw new Error(stripeData.error?.message || 'Failed to create Stripe checkout session');
        }

        return new Response(JSON.stringify({
            success: true,
            session_url: stripeData.url,
            session_id: stripeData.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error creating Stripe session:', error);
        return new Response(JSON.stringify({
            success: false,
            error: {
                code: 'STRIPE_SESSION_FAILED',
                message: error.message || 'Failed to create checkout session'
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// Cancel subscription
async function cancelSubscription(supabaseUrl: string, serviceRoleKey: string, userId: string, stripeSecretKey: string, corsHeaders: any) {
    try {
        // Update subscription to cancel at period end
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cancel_at_period_end: true,
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to cancel subscription');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Subscription will be cancelled at the end of the current billing period'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
}

// Update payment method
async function updatePaymentMethod(supabaseUrl: string, serviceRoleKey: string, userId: string, stripeSecretKey: string, requestData: any, corsHeaders: any) {
    // Placeholder for payment method update
    return new Response(JSON.stringify({
        success: true,
        message: 'Payment method update functionality requires Stripe configuration'
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Check feature access for user
async function checkFeatureAccess(supabaseUrl: string, serviceRoleKey: string, userId: string, requestData: any, corsHeaders: any) {
    try {
        const { feature_name } = requestData;

        // Get user's subscription tier
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const profiles = await profileResponse.json();
        const profile = profiles[0];
        const subscriptionTier = profile?.subscription_tier || 'free';

        // Get feature access rules
        const accessResponse = await fetch(`${supabaseUrl}/rest/v1/feature_access?subscription_tier=eq.${subscriptionTier}&feature_name=eq.${feature_name}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const access = await accessResponse.json();
        const featureAccess = access[0];

        return new Response(JSON.stringify({
            success: true,
            access: {
                feature_name: feature_name,
                is_enabled: featureAccess?.is_enabled || false,
                usage_limit: featureAccess?.usage_limit || 0,
                subscription_tier: subscriptionTier
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error checking feature access:', error);
        throw error;
    }
}

// Track usage for billing/limits
async function trackUsage(supabaseUrl: string, serviceRoleKey: string, userId: string, requestData: any, corsHeaders: any) {
    try {
        const { usage_type, usage_count = 1, metadata = {} } = requestData;

        // Get/create current month's quota record
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        // Get user's subscription tier
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const profiles = await profileResponse.json();
        const profile = profiles[0];
        const subscriptionTier = profile?.subscription_tier || 'free';

        // Get plan limits
        const planResponse = await fetch(`${supabaseUrl}/rest/v1/subscription_plans?plan_slug=eq.${subscriptionTier}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const plans = await planResponse.json();
        const plan = plans[0];

        // Check if usage quota exists for current month
        const quotaResponse = await fetch(`${supabaseUrl}/rest/v1/usage_quotas?user_id=eq.${userId}&current_period_start=eq.${firstOfMonth}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const quotas = await quotaResponse.json();
        let quota = quotas[0];

        if (!quota) {
            // Create new quota record
            const createQuotaResponse = await fetch(`${supabaseUrl}/rest/v1/usage_quotas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    user_id: userId,
                    current_period_start: firstOfMonth,
                    current_period_end: lastOfMonth,
                    ai_requests_used: 0,
                    ai_requests_limit: plan?.ai_requests_limit || 10,
                    subscription_tier: subscriptionTier
                })
            });

            const newQuotas = await createQuotaResponse.json();
            quota = newQuotas[0];
        }

        // Update usage count
        const newUsageCount = quota.ai_requests_used + usage_count;
        
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/usage_quotas?id=eq.${quota.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ai_requests_used: newUsageCount,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update usage');
        }

        // Check if approaching or over limit
        const limit = quota.ai_requests_limit;
        const isOverLimit = limit > 0 && newUsageCount > limit;
        const isNearLimit = limit > 0 && newUsageCount > (limit * 0.8);

        return new Response(JSON.stringify({
            success: true,
            usage: {
                used: newUsageCount,
                limit: limit,
                remaining: Math.max(0, limit - newUsageCount),
                is_over_limit: isOverLimit,
                is_near_limit: isNearLimit
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error tracking usage:', error);
        throw error;
    }
}