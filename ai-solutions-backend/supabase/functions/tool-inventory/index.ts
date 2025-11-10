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
        const { inventoryData, action } = await req.json();

        const googleKey = Deno.env.get('GOOGLE_AI_API_KEY');

        let prompt = '';

        if (action === 'forecast') {
            prompt = `Analyze this inventory data and provide demand forecasting:
${JSON.stringify(inventoryData, null, 2)}

Provide:
1. Demand forecast for next 30 days
2. Reorder recommendations
3. Stock optimization suggestions
4. Cost reduction opportunities`;
        } else if (action === 'alert') {
            prompt = `Check this inventory data for alerts:
${JSON.stringify(inventoryData, null, 2)}

Identify:
1. Low stock items
2. Overstock items
3. Items needing immediate attention
4. Supplier performance issues`;
        } else {
            prompt = `Analyze this inventory data:
${JSON.stringify(inventoryData, null, 2)}

Provide comprehensive inventory analysis including stock levels, trends, and recommendations.`;
        }

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
                action,
                usage: {
                    engine: 'google-gemini-pro',
                    cost: 0.001
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Inventory tool error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'INVENTORY_ANALYSIS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
