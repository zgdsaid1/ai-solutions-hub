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
        const { documentType, data, action } = await req.json();

        if (!documentType) {
            throw new Error('Document type is required');
        }

        const openaiKey = Deno.env.get('OPENAI_API_KEY');

        let prompt = '';

        if (action === 'generate') {
            prompt = `Generate a professional ${documentType} document with the following information:

${JSON.stringify(data, null, 2)}

Create a complete, professional ${documentType} with all necessary sections, legal language, and formatting.`;
        } else if (action === 'review') {
            prompt = `Review this ${documentType} document and check for:

Document Content:
${data.content}

Provide:
1. Completeness check
2. Legal compliance review
3. Missing sections or clauses
4. Improvement suggestions
5. Risk assessment`;
        }

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
                        content: 'You are a professional document automation specialist with expertise in legal documents, contracts, invoices, and business correspondence.'
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

        const responseData = await response.json();
        const document = responseData.choices[0].message.content;

        const tokensUsed = responseData.usage.total_tokens;
        const cost = (tokensUsed / 1000) * 0.03;

        return new Response(JSON.stringify({
            data: {
                document,
                documentType,
                action,
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
        console.error('Document tool error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'DOCUMENT_AUTOMATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
