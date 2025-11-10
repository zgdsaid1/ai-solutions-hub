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
        const { routes, deliveries, optimizationType } = await req.json();

        const googleKey = Deno.env.get('GOOGLE_AI_API_KEY');

        const prompt = `Analyze and optimize these logistics routes:

Routes Data:
${JSON.stringify(routes, null, 2)}

Deliveries:
${JSON.stringify(deliveries, null, 2)}

Optimization Type: ${optimizationType || 'cost-and-time'}

Provide:
1. Optimized route plan
2. Cost analysis and savings
3. Time efficiency improvements
4. Vehicle utilization recommendations
5. Delivery schedule optimization
6. Risk factors and contingencies`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Google AI API error: ${await response.text()}`);
        }

        const data = await response.json();
        const analysis = data.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({
            data: {
                analysis,
                optimizationType,
                usage: {
                    engine: 'google-gemini-pro',
                    cost: 0.002
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Logistics tool error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'LOGISTICS_OPTIMIZATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
