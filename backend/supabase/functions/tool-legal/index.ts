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
        const { documentType, documentContent, analysisType, priorityLevel } = await req.json();

        if (!documentContent) {
            throw new Error('Document content is required');
        }

        const openaiKey = Deno.env.get('OPENAI_API_KEY');

        const prompt = `You are an expert legal advisor specializing in business and finance law. Analyze the following document:

Document Type: ${documentType || 'Contract'}
Analysis Type: ${analysisType || 'Compliance Check'}
Priority Level: ${priorityLevel || 'High'}

Document Content:
${documentContent}

Please provide:
1. Document Summary
2. Key Terms Analysis
3. Risk Assessment (High, Medium, Low risks)
4. Compliance Check
5. Legal Recommendations
6. Action Items
7. Potential Issues and Solutions

Be specific, professional, and provide actionable legal insights.`;

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
                        content: 'You are a professional legal advisor with expertise in contract law, business compliance, tax strategy, and risk management.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 0.3
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
                parameters: {
                    documentType,
                    analysisType,
                    priorityLevel
                },
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
        console.error('Legal tool error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'LEGAL_ANALYSIS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
