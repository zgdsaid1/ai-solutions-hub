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
        const { dataset, analysisType } = await req.json();

        if (!dataset) {
            throw new Error('Dataset is required');
        }

        const openaiKey = Deno.env.get('OPENAI_API_KEY');

        const prompt = `You are a data analytics expert. Analyze this dataset:

Dataset:
${JSON.stringify(dataset, null, 2)}

Analysis Type: ${analysisType || 'comprehensive'}

Provide:
1. Data Overview and Statistics
2. Pattern Recognition and Trends
3. Anomaly Detection
4. Predictive Insights
5. Key Performance Indicators
6. Actionable Recommendations
7. Visualize data insights

Be specific with numbers and provide actionable business insights.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional data analyst with expertise in pattern recognition, statistical analysis, and predictive analytics.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${await response.text()}`);
        }

        const data = await response.json();
        const analysis = data.choices[0].message.content;

        const tokensUsed = data.usage.total_tokens;
        const cost = (tokensUsed / 1000) * 0.03;

        return new Response(JSON.stringify({
            data: {
                analysis,
                analysisType,
                usage: {
                    tokensUsed,
                    cost,
                    engine: 'openai-gpt4'
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Data tool error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'DATA_ANALYSIS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
