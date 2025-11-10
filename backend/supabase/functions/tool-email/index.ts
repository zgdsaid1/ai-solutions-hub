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
        const { action, emailContent, to, subject, from, cc, bcc, htmlContent, textContent } = await req.json();

        // Get environment variables
        const sandrigApiKey = Deno.env.get('SANDRIG_API_KEY');
        const googleKey = Deno.env.get('GOOGLE_AI_API_KEY');

        // Validate Sandgrig API key
        if (!sandrigApiKey) {
            throw new Error('Sandgrig API key not configured');
        }

        // Handle AI analysis actions
        if (action === 'analyze' || action === 'respond' || action === 'categorize') {
            if (!emailContent) {
                throw new Error('Email content is required for analysis');
            }

            let prompt = '';

            if (action === 'analyze') {
                prompt = `Analyze this email and provide insights:

Email Content:
${emailContent}

Provide:
1. Email priority level (High/Medium/Low)
2. Sentiment analysis
3. Action items required
4. Suggested response tone
5. Key points summary`;
            } else if (action === 'respond') {
                prompt = `Generate a professional response to this email:

Email Content:
${emailContent}

Create a professional, appropriate response that addresses all points raised.`;
            } else if (action === 'categorize') {
                prompt = `Categorize and prioritize this email:

Email Content:
${emailContent}

Provide:
1. Category (Sales, Support, Internal, Marketing, etc.)
2. Priority (High/Medium/Low)
3. Required action
4. Suggested handling time`;
            }

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
                    usage: {
                        engine: 'google-gemini-2.0-flash',
                        cost: 0.001
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle email sending
        if (action === 'send_email' || !action) {
            if (!to || !subject) {
                throw new Error('Recipient (to) and subject are required for sending emails');
            }

            // Prepare email data for Sandgrig
            const emailData = {
                from: from || 'noreply@aisolutionshub.co',
                to: Array.isArray(to) ? to : [to],
                subject: subject,
                text: textContent || htmlContent ? undefined : emailContent,
                html: htmlContent || undefined,
                cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
                bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
                metadata: {
                    source: 'ai-solutions-hub',
                    timestamp: new Date().toISOString()
                }
            };

            // Send email via Sandgrig API
            const sandrigResponse = await fetch('https://api.sandgrig.com/v1/emails/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sandrigApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (!sandrigResponse.ok) {
                const errorText = await sandrigResponse.text();
                throw new Error(`Sandgrig email failed: ${errorText}`);
            }

            const emailResult = await sandrigResponse.json();

            return new Response(JSON.stringify({
                data: {
                    messageId: emailResult.messageId || emailResult.id,
                    status: emailResult.status || 'sent',
                    from: emailResult.from,
                    to: emailResult.to,
                    subject: emailResult.subject,
                    sentAt: emailResult.sentAt || new Date().toISOString(),
                    usage: {
                        engine: 'sandgrig',
                        cost: 0.01
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle bulk email sending
        if (action === 'send_bulk_emails') {
            const { recipients } = await req.json();
            
            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                throw new Error('Recipients array is required for bulk email sending');
            }

            const bulkResults = [];
            let successCount = 0;
            let failureCount = 0;

            // Process emails sequentially to avoid rate limits
            for (const recipient of recipients) {
                try {
                    const emailData = {
                        from: recipient.from || from || 'noreply@aisolutionshub.co',
                        to: recipient.to,
                        subject: recipient.subject || subject,
                        text: recipient.textContent || recipient.htmlContent ? undefined : recipient.emailContent,
                        html: recipient.htmlContent || undefined,
                        metadata: {
                            source: 'ai-solutions-hub-bulk',
                            timestamp: new Date().toISOString(),
                            recipient_index: recipients.indexOf(recipient)
                        }
                    };

                    const sandrigResponse = await fetch('https://api.sandgrig.com/v1/emails/send', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${sandrigApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(emailData)
                    });

                    if (sandrigResponse.ok) {
                        const result = await sandrigResponse.json();
                        bulkResults.push({
                            recipient: recipient.to,
                            status: 'success',
                            messageId: result.messageId || result.id
                        });
                        successCount++;
                    } else {
                        const errorText = await sandrigResponse.text();
                        bulkResults.push({
                            recipient: recipient.to,
                            status: 'failed',
                            error: errorText
                        });
                        failureCount++;
                    }

                    // Add small delay to respect rate limits
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    bulkResults.push({
                        recipient: recipient.to,
                        status: 'failed',
                        error: error.message
                    });
                    failureCount++;
                }
            }

            return new Response(JSON.stringify({
                data: {
                    summary: {
                        total: recipients.length,
                        sent: successCount,
                        failed: failureCount
                    },
                    results: bulkResults,
                    usage: {
                        engine: 'sandgrig-bulk',
                        cost: 0.01 * successCount
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle email templates
        if (action === 'get_templates') {
            const templatesResponse = await fetch('https://api.sandgrig.com/v1/templates', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sandrigApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!templatesResponse.ok) {
                const errorText = await templatesResponse.text();
                throw new Error(`Sandgrig templates fetch failed: ${errorText}`);
            }

            const templates = await templatesResponse.json();

            return new Response(JSON.stringify({
                data: {
                    templates: templates.templates || templates,
                    usage: {
                        engine: 'sandgrig',
                        cost: 0.001
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle email statistics
        if (action === 'get_stats') {
            const { startDate, endDate } = await req.json();
            
            const statsParams = new URLSearchParams();
            if (startDate) statsParams.append('start_date', startDate);
            if (endDate) statsParams.append('end_date', endDate);

            const statsResponse = await fetch(`https://api.sandgrig.com/v1/stats?${statsParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sandrigApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!statsResponse.ok) {
                const errorText = await statsResponse.text();
                throw new Error(`Sandgrig stats fetch failed: ${errorText}`);
            }

            const stats = await statsResponse.json();

            return new Response(JSON.stringify({
                data: {
                    statistics: stats,
                    period: { startDate, endDate },
                    usage: {
                        engine: 'sandgrig',
                        cost: 0.001
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Handle campaign creation (if supported by Sandgrig)
        if (action === 'create_campaign') {
            const { campaignName, recipientList, templateId, subject, fromName, fromEmail } = await req.json();
            
            if (!campaignName || !recipientList || !templateId) {
                throw new Error('Campaign name, recipient list, and template ID are required');
            }

            const campaignData = {
                name: campaignName,
                recipients: recipientList,
                template_id: templateId,
                subject: subject,
                from_name: fromName || 'AI Solutions Hub',
                from_email: fromEmail || 'noreply@aisolutionshub.co',
                metadata: {
                    source: 'ai-solutions-hub',
                    created_at: new Date().toISOString()
                }
            };

            const campaignResponse = await fetch('https://api.sandgrig.com/v1/campaigns', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sandrigApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(campaignData)
            });

            if (!campaignResponse.ok) {
                const errorText = await campaignResponse.text();
                throw new Error(`Sandgrig campaign creation failed: ${errorText}`);
            }

            const campaign = await campaignResponse.json();

            return new Response(JSON.stringify({
                data: {
                    campaignId: campaign.id || campaign.campaignId,
                    name: campaign.name,
                    status: campaign.status,
                    createdAt: campaign.created_at || new Date().toISOString(),
                    usage: {
                        engine: 'sandgrig',
                        cost: 0.05
                    }
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // If no valid action provided
        throw new Error('Invalid action. Supported actions: analyze, respond, categorize, send_email, send_bulk_emails, get_templates, get_stats, create_campaign');

    } catch (error) {
        console.error('Email tool error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'EMAIL_TOOL_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});