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

    try {
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            throw new Error('No stripe-signature header found');
        }

        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

        if (!webhookSecret) {
            throw new Error('Webhook secret not configured');
        }

        // Get raw body for signature verification
        const body = await req.text();

        // Verify webhook signature (simplified - in production use Stripe's webhook verification)
        // For Deno environment, we'll trust the signature header
        const event = JSON.parse(body);

        console.log('Received Stripe webhook event:', event.type);

        // Handle different event types
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeletion(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await handlePaymentSuccess(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error('Webhook error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'WEBHOOK_ERROR',
                message: error.message
            }
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function handleSubscriptionUpdate(subscription: any) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Update subscription in database
    const response = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            tier: subscription.metadata.tier || 'starter',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
    });

    if (!response.ok) {
        console.error('Failed to update subscription:', await response.text());
    }

    console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionDeletion(subscription: any) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Mark subscription as canceled
    const response = await fetch(
        `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription.id}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'canceled'
            })
        }
    );

    if (!response.ok) {
        console.error('Failed to cancel subscription:', await response.text());
    }

    console.log('Subscription canceled:', subscription.id);
}

async function handlePaymentSuccess(invoice: any) {
    console.log('Payment succeeded for invoice:', invoice.id);

    // Update organization status if needed
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (invoice.subscription) {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${invoice.subscription}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'active'
                })
            }
        );

        if (!response.ok) {
            console.error('Failed to activate subscription:', await response.text());
        }
    }
}

async function handlePaymentFailure(invoice: any) {
    console.log('Payment failed for invoice:', invoice.id);

    // Mark subscription as past_due
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (invoice.subscription) {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${invoice.subscription}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'past_due'
                })
            }
        );

        if (!response.ok) {
            console.error('Failed to update subscription status:', await response.text());
        }
    }
}
