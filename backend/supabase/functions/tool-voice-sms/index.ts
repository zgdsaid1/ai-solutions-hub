Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { action, phoneNumber, message, content, messageType } = await req.json();

        // Get environment variables
        const twilioSid = Deno.env.get('TWILIO_SID');
        const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
        const googleKey = Deno.env.get('GOOGLE_AI_API_KEY');

        // Validate Twilio credentials
        if (!twilioSid || !twilioAuthToken || !twilioPhoneNumber) {
            throw new Error('Twilio credentials not configured');
        }

        // Create base64 authentication for Twilio
        const authString = btoa(`${twilioSid}:${twilioAuthToken}`);

        // Handle webhook for incoming messages
        if (req.method === 'POST' && !phoneNumber) {
            const formData = await req.formData();
            const incomingMessage = formData.get('Body')?.toString() || '';
            const incomingFrom = formData.get('From')?.toString() || '';
            const incomingTo = formData.get('To')?.toString() || '';
            
            // Analyze incoming message with AI
            if (googleKey && incomingMessage) {
                const prompt = `Analyze this incoming customer message and provide response guidance:

Message: ${incomingMessage}
From: ${incomingFrom}
To: ${incomingTo}

Provide:
1. Message sentiment (Positive/Neutral/Negative)
2. Urgency level (High/Medium/Low)
3. Recommended response
4. Suggested action`;

                const aiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`,
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

                const aiData = await aiResponse.json();
                const analysis = aiData.candidates[0].content.parts[0].text;

                // Log the analysis for reference
                console.log('Incoming message analysis:', analysis);
            }

            // Return TwiML response
            const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Thank you for your message. Our AI assistant is analyzing your inquiry. A representative will respond shortly.</Message>
</Response>`;

            return new Response(twimlResponse, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/xml'
                }
            });
        }

        // Handle AI analysis actions
        if (action === 'analyze_sentiment' || action === 'generate_response') {
            const prompt = action === 'generate_response' 
                ? `Generate a professional SMS response for this customer inquiry:

Customer Message: ${content || message}
Phone: ${phoneNumber}

Provide a professional, helpful response that addresses the customer's needs.`
                : `Analyze the sentiment and urgency of this customer message:

Message: ${content || message}
Phone: ${phoneNumber}

Provide:
1. Sentiment (Positive/Neutral/Negative)
2. Urgency level (High/Medium/Low)
3. Issue category
4. Recommended action
5. Response priority`;

            const aiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`,
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

            if (!aiResponse.ok) {
                throw new Error(`Google AI API error: ${await aiResponse.text()}`);
            }

            const aiData = await aiResponse.json();
            const analysis = aiData.candidates[0].content.parts[0].text;

            return new Response(JSON.stringify({
                data: {
                    analysis,
                    action,
                    messageType: messageType || 'sms',
                    usage: {
                        engine: 'google-gemini-2.0-flash',
                        cost: 0.001
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle SMS sending
        if (action === 'send_sms' || !action) {
            if (!phoneNumber || !(content || message)) {
                throw new Error('Phone number and message content are required for sending SMS');
            }

            const smsBody = content || message;
            const toNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

            const twilioResponse = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${authString}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        'From': twilioPhoneNumber,
                        'To': toNumber,
                        'Body': smsBody
                    })
                }
            );

            if (!twilioResponse.ok) {
                const errorText = await twilioResponse.text();
                throw new Error(`Twilio SMS failed: ${errorText}`);
            }

            const smsData = await twilioResponse.json();

            return new Response(JSON.stringify({
                data: {
                    messageId: smsData.sid,
                    status: smsData.status,
                    from: smsData.from,
                    to: smsData.to,
                    body: smsData.body,
                    dateCreated: smsData.date_created,
                    usage: {
                        engine: 'twilio',
                        cost: 0.0075
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle voice calls
        if (action === 'make_call') {
            if (!phoneNumber) {
                throw new Error('Phone number is required for making calls');
            }

            const toNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            
            // Create TwiML for the call
            const twimlMessage = content || message || "Hello, this is an AI-powered call from AI Solutions Hub. Thank you for your time.";
            
            // Note: In production, this should be a webhook URL that returns TwiML
            const twilioResponse = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Calls.json`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${authString}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        'From': twilioPhoneNumber,
                        'To': toNumber,
                        'Twiml': `<Response><Say voice="alice">${twimlMessage}</Say></Response>`
                    })
                }
            );

            if (!twilioResponse.ok) {
                const errorText = await twilioResponse.text();
                throw new Error(`Twilio call failed: ${errorText}`);
            }

            const callData = await twilioResponse.json();

            return new Response(JSON.stringify({
                data: {
                    callId: callData.sid,
                    status: callData.status,
                    from: callData.from,
                    to: callData.to,
                    duration: callData.duration,
                    dateCreated: callData.date_created,
                    usage: {
                        engine: 'twilio',
                        cost: 0.013
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // If no valid action provided
        throw new Error('Invalid action. Supported actions: send_sms, make_call, analyze_sentiment, generate_response');

    } catch (error) {
        console.error('Voice/SMS tool error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'VOICE_SMS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});