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
        const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
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

        const userData = await userResponse.json();
        const userId = userData.id;

        const requestData = await req.json();
        const { operation, ...params } = requestData;

        // Helper function to call AI Router for response generation
        async function callAIRouter(prompt: string, taskType: string) {
            try {
                const aiRouterUrl = `${supabaseUrl}/functions/v1/ai-router`;
                const response = await fetch(aiRouterUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt,
                        task_type: taskType,
                        module_name: 'voice_sms_agent'
                    })
                });

                if (!response.ok) {
                    console.error('AI Router call failed, using fallback');
                    return null;
                }

                const data = await response.json();
                return data.data?.response || data.response || null;
            } catch (error) {
                console.error('AI Router error:', error);
                return null;
            }
        }

        // Helper function to send SMS via Twilio
        async function sendTwilioSMS(to: string, message: string) {
            if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
                return {
                    success: false,
                    message: 'Twilio not configured. SMS would be sent in production.',
                    sid: `DEMO_SMS_${Date.now()}`
                };
            }

            try {
                const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
                const formData = new URLSearchParams({
                    To: to,
                    From: twilioPhoneNumber,
                    Body: message
                });

                const authString = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

                const response = await fetch(twilioUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${authString}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Twilio API error: ${errorText}`);
                }

                const data = await response.json();
                return {
                    success: true,
                    message: 'SMS sent successfully',
                    sid: data.sid
                };
            } catch (error) {
                console.error('Twilio SMS error:', error);
                return {
                    success: false,
                    message: error.message,
                    sid: null
                };
            }
        }

        // Helper function to initiate voice call via Twilio
        async function initiateTwilioCall(to: string, message: string) {
            if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
                return {
                    success: false,
                    message: 'Twilio not configured. Call would be initiated in production.',
                    call_sid: `DEMO_CALL_${Date.now()}`
                };
            }

            try {
                // Create TwiML for the call
                const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">${message}</Say></Response>`;
                
                // For production, you would host this TwiML URL or use Twilio Functions
                const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
                const formData = new URLSearchParams({
                    To: to,
                    From: twilioPhoneNumber,
                    Twiml: twiml
                });

                const authString = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

                const response = await fetch(twilioUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${authString}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Twilio API error: ${errorText}`);
                }

                const data = await response.json();
                return {
                    success: true,
                    message: 'Call initiated successfully',
                    call_sid: data.sid
                };
            } catch (error) {
                console.error('Twilio call error:', error);
                return {
                    success: false,
                    message: error.message,
                    call_sid: null
                };
            }
        }

        // Route operations
        switch (operation) {
            case 'send_sms': {
                const { phone_number, message, use_ai = false, context = '' } = params;

                if (!phone_number || !message) {
                    throw new Error('Phone number and message are required');
                }

                let finalMessage = message;
                let aiResponse = null;

                // Use AI to enhance message if requested
                if (use_ai) {
                    const prompt = `Generate a professional SMS message based on the following context:
Context: ${context || 'General business communication'}
Original message: ${message}

Please create a concise, professional SMS message (max 160 characters) that conveys the intended meaning clearly.`;

                    aiResponse = await callAIRouter(prompt, 'sms_generation');
                    if (aiResponse) {
                        finalMessage = aiResponse.substring(0, 160); // SMS length limit
                    }
                }

                // Send SMS via Twilio
                const twilioResult = await sendTwilioSMS(phone_number, finalMessage);

                // Log the SMS
                const logRecord = {
                    user_id: userId,
                    conversation_type: 'sms',
                    phone_number,
                    direction: 'outbound',
                    message_content: finalMessage,
                    message_sid: twilioResult.sid,
                    ai_response: aiResponse,
                    metadata: {
                        use_ai,
                        context,
                        original_message: message,
                        twilio_configured: !!twilioAccountSid
                    }
                };

                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/voice_sms_logs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(logRecord)
                });

                if (!insertResponse.ok) {
                    const errorText = await insertResponse.text();
                    console.error('Failed to log SMS:', errorText);
                }

                const savedLog = await insertResponse.json();

                return new Response(JSON.stringify({
                    data: {
                        log: savedLog[0],
                        twilio_result: twilioResult,
                        message_sent: finalMessage,
                        ai_enhanced: use_ai && !!aiResponse
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'initiate_call': {
                const { phone_number, message, use_ai = false, context = '' } = params;

                if (!phone_number || !message) {
                    throw new Error('Phone number and message are required');
                }

                let finalMessage = message;
                let aiResponse = null;

                // Use AI to enhance message if requested
                if (use_ai) {
                    const prompt = `Generate a professional voice call script based on the following context:
Context: ${context || 'General business call'}
Original message: ${message}

Please create a clear, professional voice message that would be appropriate for a phone call.`;

                    aiResponse = await callAIRouter(prompt, 'voice_script_generation');
                    if (aiResponse) {
                        finalMessage = aiResponse;
                    }
                }

                // Initiate call via Twilio
                const twilioResult = await initiateTwilioCall(phone_number, finalMessage);

                // Log the call
                const logRecord = {
                    user_id: userId,
                    conversation_type: 'voice',
                    phone_number,
                    direction: 'outbound',
                    message_content: finalMessage,
                    call_sid: twilioResult.call_sid,
                    call_status: twilioResult.success ? 'initiated' : 'failed',
                    ai_response: aiResponse,
                    metadata: {
                        use_ai,
                        context,
                        original_message: message,
                        twilio_configured: !!twilioAccountSid
                    }
                };

                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/voice_sms_logs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(logRecord)
                });

                if (!insertResponse.ok) {
                    const errorText = await insertResponse.text();
                    console.error('Failed to log call:', errorText);
                }

                const savedLog = await insertResponse.json();

                return new Response(JSON.stringify({
                    data: {
                        log: savedLog[0],
                        twilio_result: twilioResult,
                        call_initiated: twilioResult.success,
                        ai_enhanced: use_ai && !!aiResponse
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'get_conversation_history': {
                const { phone_number, conversation_type, limit = 50 } = params;

                let query = `${supabaseUrl}/rest/v1/voice_sms_logs?user_id=eq.${userId}&order=created_at.desc&limit=${limit}`;

                if (phone_number) {
                    query += `&phone_number=eq.${encodeURIComponent(phone_number)}`;
                }

                if (conversation_type) {
                    query += `&conversation_type=eq.${conversation_type}`;
                }

                const response = await fetch(query, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch conversation history');
                }

                const logs = await response.json();

                return new Response(JSON.stringify({
                    data: { history: logs }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'generate_ai_response': {
                const { phone_number, incoming_message, conversation_history = [] } = params;

                if (!incoming_message) {
                    throw new Error('Incoming message is required');
                }

                // Build conversation context
                let conversationContext = 'Previous conversation:\n';
                conversation_history.forEach((msg: any) => {
                    conversationContext += `${msg.direction}: ${msg.message_content}\n`;
                });

                const prompt = `You are a helpful customer service AI assistant. Based on the conversation history and the latest message, generate an appropriate response.

${conversationContext}

Latest message: ${incoming_message}

Please provide a helpful, professional response:`;

                const aiResponse = await callAIRouter(prompt, 'customer_service_response');

                if (!aiResponse) {
                    return new Response(JSON.stringify({
                        data: {
                            suggested_response: 'Thank you for your message. Our team will get back to you shortly.',
                            ai_available: false
                        }
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                // Log the AI suggestion
                const logRecord = {
                    user_id: userId,
                    conversation_type: 'sms',
                    phone_number: phone_number || 'unknown',
                    direction: 'ai_suggestion',
                    message_content: incoming_message,
                    ai_response: aiResponse,
                    metadata: {
                        conversation_history
                    }
                };

                await fetch(`${supabaseUrl}/rest/v1/voice_sms_logs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(logRecord)
                });

                return new Response(JSON.stringify({
                    data: {
                        suggested_response: aiResponse,
                        ai_available: true
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'get_analytics': {
                // Get communication analytics
                const response = await fetch(
                    `${supabaseUrl}/rest/v1/voice_sms_logs?user_id=eq.${userId}&select=*`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics');
                }

                const logs = await response.json();

                // Calculate analytics
                const totalSMS = logs.filter((l: any) => l.conversation_type === 'sms').length;
                const totalCalls = logs.filter((l: any) => l.conversation_type === 'voice').length;
                const outbound = logs.filter((l: any) => l.direction === 'outbound').length;
                const inbound = logs.filter((l: any) => l.direction === 'inbound').length;
                const aiEnhanced = logs.filter((l: any) => l.ai_response !== null).length;

                // Calculate average call duration
                const callLogs = logs.filter((l: any) => l.conversation_type === 'voice' && l.call_duration);
                const avgCallDuration = callLogs.length > 0
                    ? callLogs.reduce((sum: number, l: any) => sum + (l.call_duration || 0), 0) / callLogs.length
                    : 0;

                return new Response(JSON.stringify({
                    data: {
                        analytics: {
                            total_communications: logs.length,
                            total_sms: totalSMS,
                            total_calls: totalCalls,
                            outbound_count: outbound,
                            inbound_count: inbound,
                            ai_enhanced_count: aiEnhanced,
                            average_call_duration_seconds: Math.round(avgCallDuration),
                            recent_contacts: [...new Set(logs.map((l: any) => l.phone_number))].slice(0, 10)
                        }
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'delete_log': {
                const { log_id } = params;

                if (!log_id) {
                    throw new Error('Log ID is required');
                }

                const deleteResponse = await fetch(
                    `${supabaseUrl}/rest/v1/voice_sms_logs?id=eq.${log_id}&user_id=eq.${userId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );

                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete log');
                }

                return new Response(JSON.stringify({
                    data: { success: true, message: 'Log deleted successfully' }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            default:
                throw new Error(`Unknown operation: ${operation}`);
        }

    } catch (error) {
        console.error('Voice/SMS agent error:', error);

        const errorResponse = {
            error: {
                code: 'VOICE_SMS_AGENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
