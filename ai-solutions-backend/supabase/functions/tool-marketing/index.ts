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
        const { industry, analysisDepth, region, budgetRange, targetAudience } = await req.json();

        if (!industry) {
            throw new Error('Industry is required');
        }

        const openaiKey = Deno.env.get('OPENAI_API_KEY');

        // Build comprehensive prompt for marketing analysis
        const prompt = `You are an expert marketing strategist. Provide a comprehensive marketing analysis and strategy for the following:

Industry: ${industry}
Analysis Depth: ${analysisDepth || 'comprehensive'}
Region: ${region || 'North America'}
Budget Range: ${budgetRange || '$10K-50K'}
Target Audience: ${targetAudience || 'B2B Enterprise'}

Please provide:
1. Market Overview and Size
2. Competitive Landscape Analysis
3. Target Audience Insights
4. Growth Opportunities
5. Marketing Strategy Recommendations
6. Budget Allocation Suggestions
7. Key Performance Indicators (KPIs)
8. Risk Assessment

Format the response with clear sections and actionable insights.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional marketing strategist with expertise in market analysis, competitive intelligence, and growth strategies.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${await response.text()}`);
        }

        const data = await response.json();
        const analysis = data.choices[0].message.content;

        // Log usage
        const tokensUsed = data.usage.total_tokens;
        const cost = (tokensUsed / 1000) * 0.03;

        return new Response(JSON.stringify({
            data: {
                analysis,
                parameters: {
                    industry,
                    analysisDepth,
                    region,
                    budgetRange,
                    targetAudience
                },
                usage: {
                    tokensUsed,
                    cost,
                    engine: 'openai-gpt-3.5-turbo'
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Marketing tool error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'MARKETING_ANALYSIS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
