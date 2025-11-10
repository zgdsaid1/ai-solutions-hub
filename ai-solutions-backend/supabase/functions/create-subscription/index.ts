Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { planType, customerEmail } = await req.json();

        if (!planType || !customerEmail) {
            throw new Error('Plan type and customer email are required');
        }

        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Define pricing plans
        const plans = {
            starter: { priceId: 'price_starter', amount: 900, name: 'Starter Plan' },
            pro: { priceId: 'price_pro', amount: 2900, name: 'Pro Plan' },
            business: { priceId: 'price_business', amount: 9900, name: 'Business Plan' },
            enterprise: { priceId: 'price_enterprise', amount: 29900, name: 'Enterprise Plan' }
        };

        const selectedPlan = plans[planType];
        if (!selectedPlan) {
            throw new Error('Invalid plan type');
        }

        // Create or retrieve Stripe customer
        const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                email: customerEmail,
                metadata: JSON.stringify({ plan: planType })
            })
        });

        if (!customerResponse.ok) {
            throw new Error(`Stripe customer creation failed: ${await customerResponse.text()}`);
        }

        const customer = await customerResponse.json();

        // Create Stripe Checkout Session
        const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                customer: customer.id,
                'payment_method_types[]': 'card',
                'line_items[0][price_data][currency]': 'usd',
                'line_items[0][price_data][product_data][name]': selectedPlan.name,
                'line_items[0][price_data][unit_amount]': selectedPlan.amount.toString(),
                'line_items[0][price_data][recurring][interval]': 'month',
                'line_items[0][quantity]': '1',
                mode: 'subscription',
                success_url: `${supabaseUrl}/billing?subscription=success`,
                cancel_url: `${supabaseUrl}/billing?subscription=cancelled`,
                'metadata[plan_type]': planType,
                'metadata[customer_email]': customerEmail
            })
        });

        if (!sessionResponse.ok) {
            throw new Error(`Stripe session creation failed: ${await sessionResponse.text()}`);
        }

        const session = await sessionResponse.json();

        return new Response(JSON.stringify({
            data: {
                checkoutUrl: session.url,
                sessionId: session.id,
                customerId: customer.id
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Subscription creation error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'SUBSCRIPTION_CREATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
