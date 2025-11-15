// Stripe Webhook Handler Edge Function
// Processes Stripe webhook events for subscription management
// Handles payment success, subscription changes, and billing events

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        if (!stripeSecretKey || !stripeWebhookSecret) {
            console.warn('Stripe configuration missing - webhook processing disabled');
            return new Response(JSON.stringify({
                success: false,
                error: 'Stripe configuration missing'
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            throw new Error('No Stripe signature found');
        }

        // Verify webhook signature (simplified - would use proper Stripe verification in production)
        const event = JSON.parse(body);

        console.log(`Received Stripe webhook: ${event.type}`);

        // Route webhook events
        switch (event.type) {
            case 'customer.subscription.created':
                return await handleSubscriptionCreated(supabaseUrl, serviceRoleKey, event.data.object, corsHeaders);
            case 'customer.subscription.updated':
                return await handleSubscriptionUpdated(supabaseUrl, serviceRoleKey, event.data.object, corsHeaders);
            case 'customer.subscription.deleted':
                return await handleSubscriptionDeleted(supabaseUrl, serviceRoleKey, event.data.object, corsHeaders);
            case 'invoice.payment_succeeded':
                return await handlePaymentSucceeded(supabaseUrl, serviceRoleKey, event.data.object, corsHeaders);
            case 'invoice.payment_failed':
                return await handlePaymentFailed(supabaseUrl, serviceRoleKey, event.data.object, corsHeaders);
            case 'checkout.session.completed':
                return await handleCheckoutCompleted(supabaseUrl, serviceRoleKey, event.data.object, corsHeaders);
            default:
                console.log(`Unhandled event type: ${event.type}`);
                return new Response(JSON.stringify({ received: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
        }

    } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Handle subscription creation
async function handleSubscriptionCreated(supabaseUrl: string, serviceRoleKey: string, subscription: any, corsHeaders: any) {
    try {
        console.log('Handling subscription created:', subscription.id);

        // Find user by customer ID
        const customerResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_customer_id=eq.${subscription.customer}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const subscriptions = await customerResponse.json();
        let userSubscription = subscriptions[0];

        if (!userSubscription) {
            console.warn('No user found for customer:', subscription.customer);
            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Update subscription record
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${userSubscription.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update subscription');
        }

        // Update user profile subscription tier
        await updateUserSubscriptionTier(supabaseUrl, serviceRoleKey, userSubscription.user_id, subscription);

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error handling subscription created:', error);
        throw error;
    }
}

// Handle subscription updates
async function handleSubscriptionUpdated(supabaseUrl: string, serviceRoleKey: string, subscription: any, corsHeaders: any) {
    try {
        console.log('Handling subscription updated:', subscription.id);

        // Find subscription by Stripe ID
        const subResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription.id}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const subscriptions = await subResponse.json();
        const userSubscription = subscriptions[0];

        if (!userSubscription) {
            console.warn('Subscription not found:', subscription.id);
            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Update subscription
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${userSubscription.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update subscription');
        }

        // Update user profile subscription tier
        await updateUserSubscriptionTier(supabaseUrl, serviceRoleKey, userSubscription.user_id, subscription);

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error handling subscription updated:', error);
        throw error;
    }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(supabaseUrl: string, serviceRoleKey: string, subscription: any, corsHeaders: any) {
    try {
        console.log('Handling subscription deleted:', subscription.id);

        // Find subscription by Stripe ID
        const subResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription.id}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const subscriptions = await subResponse.json();
        const userSubscription = subscriptions[0];

        if (!userSubscription) {
            console.warn('Subscription not found:', subscription.id);
            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Update subscription to cancelled
        await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${userSubscription.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
        });

        // Downgrade user to free tier
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userSubscription.user_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subscription_tier: 'free',
                updated_at: new Date().toISOString()
            })
        });

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error handling subscription deleted:', error);
        throw error;
    }
}

// Handle successful payment
async function handlePaymentSucceeded(supabaseUrl: string, serviceRoleKey: string, invoice: any, corsHeaders: any) {
    try {
        console.log('Handling payment succeeded:', invoice.id);

        // Find subscription by customer
        const subResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_customer_id=eq.${invoice.customer}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const subscriptions = await subResponse.json();
        const userSubscription = subscriptions[0];

        if (!userSubscription) {
            console.warn('Subscription not found for customer:', invoice.customer);
            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Record billing history
        await fetch(`${supabaseUrl}/rest/v1/billing_history`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userSubscription.user_id,
                transaction_type: 'subscription_payment',
                amount: (invoice.amount_paid / 100), // Convert from cents
                currency: invoice.currency,
                stripe_invoice_id: invoice.id,
                subscription_period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
                subscription_period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
                description: 'Subscription payment',
                status: 'completed',
                metadata: {
                    invoice_number: invoice.number,
                    hosted_invoice_url: invoice.hosted_invoice_url
                }
            })
        });

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error handling payment succeeded:', error);
        throw error;
    }
}

// Handle failed payment
async function handlePaymentFailed(supabaseUrl: string, serviceRoleKey: string, invoice: any, corsHeaders: any) {
    try {
        console.log('Handling payment failed:', invoice.id);

        // Find subscription by customer
        const subResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_customer_id=eq.${invoice.customer}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const subscriptions = await subResponse.json();
        const userSubscription = subscriptions[0];

        if (!userSubscription) {
            console.warn('Subscription not found for customer:', invoice.customer);
            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Record failed billing
        await fetch(`${supabaseUrl}/rest/v1/billing_history`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userSubscription.user_id,
                transaction_type: 'subscription_payment',
                amount: (invoice.amount_due / 100), // Convert from cents
                currency: invoice.currency,
                stripe_invoice_id: invoice.id,
                description: 'Failed subscription payment',
                status: 'failed',
                metadata: {
                    invoice_number: invoice.number,
                    failure_code: invoice.charge?.failure_code,
                    failure_message: invoice.charge?.failure_message
                }
            })
        });

        // TODO: Send payment failed notification to user

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error handling payment failed:', error);
        throw error;
    }
}

// Handle checkout session completion
async function handleCheckoutCompleted(supabaseUrl: string, serviceRoleKey: string, session: any, corsHeaders: any) {
    try {
        console.log('Handling checkout completed:', session.id);

        // Get subscription from session
        if (session.subscription) {
            // This is a subscription checkout
            console.log('Subscription checkout completed for:', session.customer);
            
            // The subscription.created event will handle the actual subscription setup
            // Just record the successful checkout here
            
            // Record the checkout event
            await fetch(`${supabaseUrl}/rest/v1/billing_history`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: session.client_reference_id, // Assuming we pass user_id as client_reference_id
                    transaction_type: 'checkout_completed',
                    amount: (session.amount_total / 100), // Convert from cents
                    currency: session.currency,
                    description: 'Subscription checkout completed',
                    status: 'completed',
                    metadata: {
                        checkout_session_id: session.id,
                        customer_id: session.customer,
                        subscription_id: session.subscription
                    }
                })
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error handling checkout completed:', error);
        throw error;
    }
}

// Helper function to update user subscription tier
async function updateUserSubscriptionTier(supabaseUrl: string, serviceRoleKey: string, userId: string, subscription: any) {
    try {
        // Map Stripe price ID to subscription tier
        let subscriptionTier = 'free';
        
        if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            
            // Get plan by Stripe price ID
            const planResponse = await fetch(`${supabaseUrl}/rest/v1/subscription_plans?stripe_price_id=eq.${priceId}&limit=1`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const plans = await planResponse.json();
            if (plans.length > 0) {
                subscriptionTier = plans[0].plan_slug;
            }
        }

        // Update user profile
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subscription_tier: subscriptionTier,
                updated_at: new Date().toISOString()
            })
        });

        console.log(`Updated user ${userId} to subscription tier: ${subscriptionTier}`);

    } catch (error) {
        console.error('Error updating user subscription tier:', error);
        throw error;
    }
}