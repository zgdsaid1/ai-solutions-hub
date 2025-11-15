// AI Router Edge Function
// Intelligent multi-provider AI routing with subscription tier enforcement
// Supports Gemini Pro, DeepSeek, with usage tracking and limits

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
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const googleAiApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
        const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userDataResponse = await userResponse.json();
        const userId = userDataResponse.id;

        const requestData = await req.json();
        const { prompt, taskType = 'general', preferredProvider } = requestData;

        if (!prompt) {
            throw new Error('Prompt is required');
        }

        // Check subscription and usage
        const subscriptionCheck = await checkSubscriptionAndUsage(supabaseUrl, serviceRoleKey, userId);
        
        if (!subscriptionCheck.canUseAI) {
            return new Response(JSON.stringify({
                success: false,
                error: {
                    code: 'USAGE_LIMIT_EXCEEDED',
                    message: subscriptionCheck.message,
                    usage: subscriptionCheck.usage,
                    limit: subscriptionCheck.limit,
                    subscription_tier: subscriptionCheck.subscription_tier
                }
            }), {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Select AI provider based on subscription tier and availability
        const providerResult = await selectProvider(
            subscriptionCheck.subscription_tier, 
            taskType, 
            preferredProvider,
            googleAiApiKey,
            deepseekApiKey
        );

        // Call the selected AI provider
        const aiResponse = await callAIProvider(
            providerResult.provider,
            prompt,
            taskType,
            providerResult.apiKey
        );

        // Track usage
        await trackUsage(supabaseUrl, serviceRoleKey, userId, taskType, providerResult.provider);

        return new Response(JSON.stringify({
            success: true,
            response: aiResponse.content,
            provider: providerResult.provider,
            taskType,
            usage: {
                current: subscriptionCheck.usage + 1,
                limit: subscriptionCheck.limit,
                subscription_tier: subscriptionCheck.subscription_tier
            },
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI Router error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: {
                code: 'AI_ROUTER_ERROR',
                message: error.message || 'AI routing failed'
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Check user subscription and current usage
async function checkSubscriptionAndUsage(supabaseUrl: string, serviceRoleKey: string, userId: string) {
    try {
        // Get user profile with subscription info
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&limit=1`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to get user profile');
        }

        const profiles = await profileResponse.json();
        const profile = profiles[0];
        
        if (!profile) {
            throw new Error('User profile not found');
        }

        const subscriptionTier = profile.subscription_tier || 'free';

        // Get current month usage
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        
        const usageResponse = await fetch(
            `${supabaseUrl}/rest/v1/usage_quotas?user_id=eq.${userId}&usage_period=eq.${startOfMonth.substring(0, 7)}&limit=1`, 
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        let currentUsage = 0;
        if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            if (usageData.length > 0) {
                currentUsage = usageData[0].requests_used || 0;
            }
        }

        // Define limits based on subscription tier
        let limit: number;
        let allowedProviders: string[];
        
        switch (subscriptionTier.toLowerCase()) {
            case 'free':
                limit = 10;
                allowedProviders = ['deepseek'];
                break;
            case 'pro':
                limit = 1000;
                allowedProviders = ['deepseek', 'gemini'];
                break;
            case 'enterprise':
                limit = -1; // unlimited
                allowedProviders = ['deepseek', 'gemini'];
                break;
            default:
                limit = 10;
                allowedProviders = ['deepseek'];
        }

        const canUseAI = limit === -1 || currentUsage < limit;
        const message = canUseAI 
            ? 'Usage within limits'
            : `Monthly limit of ${limit} requests exceeded. Current usage: ${currentUsage}. Upgrade your subscription to continue.`;

        return {
            canUseAI,
            message,
            usage: currentUsage,
            limit,
            subscription_tier: subscriptionTier,
            allowedProviders
        };

    } catch (error) {
        console.error('Subscription check error:', error);
        // Default to free tier limits on error
        return {
            canUseAI: false,
            message: 'Unable to verify subscription status',
            usage: 0,
            limit: 10,
            subscription_tier: 'free',
            allowedProviders: ['deepseek']
        };
    }
}

// Select the best AI provider based on subscription tier and task type
async function selectProvider(
    subscriptionTier: string, 
    taskType: string, 
    preferredProvider: string | undefined,
    googleAiApiKey: string | undefined,
    deepseekApiKey: string | undefined
) {
    const tier = subscriptionTier.toLowerCase();
    
    // Define provider availability
    const availableProviders: string[] = [];
    if (deepseekApiKey) availableProviders.push('deepseek');
    if (googleAiApiKey && ['pro', 'enterprise'].includes(tier)) {
        availableProviders.push('gemini');
    }

    if (availableProviders.length === 0) {
        throw new Error('No AI providers available');
    }

    // If user has a preference and it's allowed, use it
    if (preferredProvider && availableProviders.includes(preferredProvider)) {
        const apiKey = preferredProvider === 'gemini' ? googleAiApiKey : deepseekApiKey;
        return { provider: preferredProvider, apiKey };
    }

    // Smart routing based on task type and tier
    let selectedProvider: string;
    
    if (tier === 'free') {
        // Free tier: DeepSeek only
        selectedProvider = 'deepseek';
    } else {
        // Pro/Enterprise: Smart routing
        const complexTasks = ['document_generation', 'template_generation', 'legal_analysis', 'growth_analysis'];
        const isComplexTask = complexTasks.includes(taskType);
        
        if (isComplexTask && availableProviders.includes('gemini')) {
            // Use Gemini for complex tasks
            selectedProvider = 'gemini';
        } else {
            // Use DeepSeek for simple tasks or as fallback
            selectedProvider = 'deepseek';
        }
    }

    // Ensure selected provider is available
    if (!availableProviders.includes(selectedProvider)) {
        selectedProvider = availableProviders[0];
    }

    const apiKey = selectedProvider === 'gemini' ? googleAiApiKey : deepseekApiKey;
    return { provider: selectedProvider, apiKey };
}

// Call the selected AI provider
async function callAIProvider(provider: string, prompt: string, taskType: string, apiKey: string | undefined) {
    if (!apiKey) {
        throw new Error(`${provider} API key not configured`);
    }

    if (provider === 'gemini') {
        return await callGemini(prompt, taskType, apiKey);
    } else if (provider === 'deepseek') {
        return await callDeepSeek(prompt, taskType, apiKey);
    } else {
        throw new Error(`Unsupported provider: ${provider}`);
    }
}

// Call Gemini Pro API
async function callGemini(prompt: string, taskType: string, apiKey: string) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Task Type: ${taskType}\n\n${prompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${error}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!content) {
            throw new Error('No content received from Gemini');
        }

        return { content, tokens: content.length };

    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error(`Gemini call failed: ${error.message}`);
    }
}

// Call DeepSeek API
async function callDeepSeek(prompt: string, taskType: string, apiKey: string) {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{
                    role: 'user',
                    content: `Task Type: ${taskType}\n\n${prompt}`
                }],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`DeepSeek API error: ${error}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
            throw new Error('No content received from DeepSeek');
        }

        return { content, tokens: content.length };

    } catch (error) {
        console.error('DeepSeek API error:', error);
        throw new Error(`DeepSeek call failed: ${error.message}`);
    }
}

// Track usage in database
async function trackUsage(supabaseUrl: string, serviceRoleKey: string, userId: string, taskType: string, provider: string) {
    try {
        const currentDate = new Date();
        const usagePeriod = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // First, try to get existing usage record for this month
        const existingUsageResponse = await fetch(
            `${supabaseUrl}/rest/v1/usage_quotas?user_id=eq.${userId}&usage_period=eq.${usagePeriod}&limit=1`, 
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (existingUsageResponse.ok) {
            const existingUsage = await existingUsageResponse.json();
            
            if (existingUsage.length > 0) {
                // Update existing record
                await fetch(`${supabaseUrl}/rest/v1/usage_quotas?id=eq.${existingUsage[0].id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        requests_used: (existingUsage[0].requests_used || 0) + 1,
                        last_request_at: currentDate.toISOString()
                    })
                });
            } else {
                // Create new record
                await fetch(`${supabaseUrl}/rest/v1/usage_quotas`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        usage_period: usagePeriod,
                        requests_used: 1,
                        last_request_at: currentDate.toISOString()
                    })
                });
            }
        }

        // Also log to ai_routing_logs if the table exists
        try {
            await fetch(`${supabaseUrl}/rest/v1/ai_routing_logs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    task_type: taskType,
                    provider_used: provider,
                    request_timestamp: currentDate.toISOString(),
                    response_time: 0 // Could be calculated if needed
                })
            });
        } catch (logError) {
            // Ignore logging errors - usage tracking is more important
            console.warn('Failed to log to ai_routing_logs:', logError);
        }

    } catch (error) {
        console.error('Usage tracking error:', error);
        // Don't throw - usage tracking failure shouldn't break the main flow
    }
}