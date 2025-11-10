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
        const { prompt, requestType, model } = await req.json();

        if (!prompt) {
            throw new Error('Prompt is required');
        }

        // Get API keys
        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        const googleKey = Deno.env.get('GOOGLE_AI_API_KEY');

        // Intelligent routing logic
        let chosenEngine = 'openai';
        let chosenModel = 'gpt-4';
        let estimatedCost = 0;

        // Route based on request type
        if (requestType === 'simple' || requestType === 'quick') {
            chosenEngine = 'google';
            chosenModel = 'gemini-pro';
            estimatedCost = 0.001;
        } else if (requestType === 'complex' || requestType === 'analysis') {
            chosenEngine = 'openai';
            chosenModel = 'gpt-4';
            estimatedCost = 0.03;
        } else if (requestType === 'code' || requestType === 'technical') {
            chosenEngine = 'openai';
            chosenModel = 'gpt-4';
            estimatedCost = 0.03;
        } else {
            // Default to cost-effective option
            chosenEngine = 'google';
            chosenModel = 'gemini-pro';
            estimatedCost = 0.002;
        }

        // Override with user-specified model
        if (model) {
            if (model.startsWith('gpt')) {
                chosenEngine = 'openai';
                chosenModel = model;
            } else if (model.startsWith('gemini')) {
                chosenEngine = 'google';
                chosenModel = model;
            }
        }

        let response;
        let aiResponse = '';

        // Call the chosen AI engine
        if (chosenEngine === 'openai') {
            const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: chosenModel,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 2000
                })
            });

            if (!openaiResponse.ok) {
                throw new Error(`OpenAI API error: ${await openaiResponse.text()}`);
            }

            const openaiData = await openaiResponse.json();
            aiResponse = openaiData.choices[0].message.content;

        } else if (chosenEngine === 'google') {
            const googleResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${googleKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            if (!googleResponse.ok) {
                throw new Error(`Google AI API error: ${await googleResponse.text()}`);
            }

            const googleData = await googleResponse.json();
            aiResponse = googleData.candidates[0].content.parts[0].text;
        }

        return new Response(JSON.stringify({
            data: {
                response: aiResponse,
                engine: chosenEngine,
                model: chosenModel,
                estimatedCost,
                requestType
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI Router error:', error);

        const errorResponse = {
            error: {
                code: 'AI_ROUTING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
