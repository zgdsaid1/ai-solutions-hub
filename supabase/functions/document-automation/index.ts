// AI Document Automation & e-Sign Edge Function
// Provides document generation, template management, and electronic signature workflows
// Integrates with AI Router for intelligent content generation

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
        const { action } = requestData;

        // Route to appropriate handler based on action
        switch (action) {
            case 'generate_document':
                return await generateDocument(supabaseUrl, serviceRoleKey, userId, token, requestData, corsHeaders);
            case 'get_templates':
                return await getTemplates(supabaseUrl, serviceRoleKey, userId, corsHeaders);
            case 'create_template':
                return await createTemplate(supabaseUrl, serviceRoleKey, userId, requestData, corsHeaders);
            case 'get_documents':
                return await getDocuments(supabaseUrl, serviceRoleKey, userId, corsHeaders);
            case 'get_document':
                return await getDocument(supabaseUrl, serviceRoleKey, userId, requestData.documentId, corsHeaders);
            case 'request_signature':
                return await requestSignature(supabaseUrl, serviceRoleKey, userId, requestData, corsHeaders);
            case 'add_signature':
                return await addSignature(supabaseUrl, serviceRoleKey, userId, requestData, corsHeaders);
            case 'get_signature_status':
                return await getSignatureStatus(supabaseUrl, serviceRoleKey, userId, requestData.documentId, corsHeaders);
            case 'create_workflow':
                return await createWorkflow(supabaseUrl, serviceRoleKey, userId, requestData, corsHeaders);
            case 'ai_generate_template':
                return await aiGenerateTemplate(supabaseUrl, serviceRoleKey, userId, token, requestData, corsHeaders);
            default:
                throw new Error('Invalid action');
        }

    } catch (error) {
        console.error('Document automation error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: {
                code: 'AUTOMATION_FAILED',
                message: error.message || 'Failed to process document automation request'
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// AI Router integration
async function callAIRouter(token: string, supabaseUrl: string, prompt: string, taskType: string) {
    try {
        const aiRouterUrl = `${supabaseUrl}/functions/v1/ai-router`;
        
        const response = await fetch(aiRouterUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                task_type: taskType,
                module: 'document_automation'
            })
        });

        if (!response.ok) {
            console.warn('AI Router request failed, using fallback');
            return null;
        }

        const data = await response.json();
        return data.response || data.content || null;
    } catch (error) {
        console.warn('AI Router error, using fallback:', error);
        return null;
    }
}

// Generate document from template
async function generateDocument(supabaseUrl: string, serviceRoleKey: string, userId: string, token: string, requestData: any, corsHeaders: any) {
    const { templateId, variables, documentName } = requestData;

    // Get template
    const templateResponse = await fetch(`${supabaseUrl}/rest/v1/document_templates?id=eq.${templateId}&limit=1`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const templates = await templateResponse.json();
    if (!templates || templates.length === 0) {
        throw new Error('Template not found');
    }

    const template = templates[0];

    // Replace variables in template content
    let content = template.content;
    if (variables && typeof variables === 'object') {
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            content = content.replace(regex, variables[key] || '');
        });
    }

    // Use AI to enhance content if requested
    if (requestData.useAI) {
        const aiPrompt = `Enhance and refine this ${template.template_type} document while maintaining all the important information and legal requirements:

${content}

Please improve the language, clarity, and professionalism while keeping all key details intact.`;

        const aiContent = await callAIRouter(token, supabaseUrl, aiPrompt, 'document_generation');
        if (aiContent) {
            content = aiContent;
        }
    }

    // Save document
    const document = {
        user_id: userId,
        template_id: templateId,
        document_name: documentName || `${template.template_name} - ${new Date().toISOString().split('T')[0]}`,
        content: content,
        variables: variables,
        status: 'draft',
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const saveResponse = await fetch(`${supabaseUrl}/rest/v1/automation_documents`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(document)
    });

    if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Failed to save document: ${errorText}`);
    }

    const savedDocument = await saveResponse.json();

    // Track usage
    await trackUsage(supabaseUrl, serviceRoleKey, userId, 'document_generation');

    return new Response(JSON.stringify({
        success: true,
        document: savedDocument[0]
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Get templates
async function getTemplates(supabaseUrl: string, serviceRoleKey: string, userId: string, corsHeaders: any) {
    // Get both public templates and user's custom templates
    const response = await fetch(`${supabaseUrl}/rest/v1/document_templates?or=(is_public.eq.true,user_id.eq.${userId})&order=created_at.desc`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const templates = await response.json();

    return new Response(JSON.stringify({
        success: true,
        templates: templates
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Create template
async function createTemplate(supabaseUrl: string, serviceRoleKey: string, userId: string, requestData: any, corsHeaders: any) {
    const { templateName, templateType, content, variables, isPublic } = requestData;

    const template = {
        user_id: userId,
        template_name: templateName,
        template_type: templateType,
        content: content,
        variables: variables || [],
        is_public: isPublic || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/document_templates`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(template)
    });

    if (!response.ok) {
        throw new Error('Failed to create template');
    }

    const savedTemplate = await response.json();

    return new Response(JSON.stringify({
        success: true,
        template: savedTemplate[0]
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Get documents
async function getDocuments(supabaseUrl: string, serviceRoleKey: string, userId: string, corsHeaders: any) {
    const response = await fetch(`${supabaseUrl}/rest/v1/automation_documents?user_id=eq.${userId}&order=created_at.desc&limit=100`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const documents = await response.json();

    return new Response(JSON.stringify({
        success: true,
        documents: documents
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Get single document
async function getDocument(supabaseUrl: string, serviceRoleKey: string, userId: string, documentId: string, corsHeaders: any) {
    const response = await fetch(`${supabaseUrl}/rest/v1/automation_documents?id=eq.${documentId}&user_id=eq.${userId}&limit=1`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const documents = await response.json();
    if (!documents || documents.length === 0) {
        throw new Error('Document not found');
    }

    return new Response(JSON.stringify({
        success: true,
        document: documents[0]
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Request signature
async function requestSignature(supabaseUrl: string, serviceRoleKey: string, userId: string, requestData: any, corsHeaders: any) {
    const { documentId, signerEmail, signerName, signatureType } = requestData;

    const signatureRequest = {
        document_id: documentId,
        requester_id: userId,
        signer_email: signerEmail,
        signer_name: signerName,
        signature_type: signatureType || 'electronic',
        status: 'pending',
        requested_at: new Date().toISOString()
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/document_signatures`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(signatureRequest)
    });

    if (!response.ok) {
        throw new Error('Failed to request signature');
    }

    const savedRequest = await response.json();

    // Update document status
    await fetch(`${supabaseUrl}/rest/v1/automation_documents?id=eq.${documentId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'pending_signature',
            updated_at: new Date().toISOString()
        })
    });

    return new Response(JSON.stringify({
        success: true,
        signatureRequest: savedRequest[0]
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Add signature
async function addSignature(supabaseUrl: string, serviceRoleKey: string, userId: string, requestData: any, corsHeaders: any) {
    const { signatureRequestId, signatureData, signatureMethod } = requestData;

    // Update signature request
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/document_signatures?id=eq.${signatureRequestId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            signature_data: signatureData,
            signature_method: signatureMethod,
            status: 'signed',
            signed_at: new Date().toISOString()
        })
    });

    if (!updateResponse.ok) {
        throw new Error('Failed to add signature');
    }

    const updatedRequest = await updateResponse.json();

    // Get document ID and check if all signatures are complete
    const documentId = updatedRequest[0].document_id;
    
    const signaturesResponse = await fetch(`${supabaseUrl}/rest/v1/document_signatures?document_id=eq.${documentId}`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const allSignatures = await signaturesResponse.json();
    const allSigned = allSignatures.every((sig: any) => sig.status === 'signed');

    if (allSigned) {
        // Update document status to completed
        await fetch(`${supabaseUrl}/rest/v1/automation_documents?id=eq.${documentId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'completed',
                updated_at: new Date().toISOString()
            })
        });
    }

    return new Response(JSON.stringify({
        success: true,
        signature: updatedRequest[0],
        documentCompleted: allSigned
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Get signature status
async function getSignatureStatus(supabaseUrl: string, serviceRoleKey: string, userId: string, documentId: string, corsHeaders: any) {
    const response = await fetch(`${supabaseUrl}/rest/v1/document_signatures?document_id=eq.${documentId}`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    const signatures = await response.json();

    return new Response(JSON.stringify({
        success: true,
        signatures: signatures
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Create workflow
async function createWorkflow(supabaseUrl: string, serviceRoleKey: string, userId: string, requestData: any, corsHeaders: any) {
    const { documentId, approvers, workflowName } = requestData;

    const workflow = {
        document_id: documentId,
        creator_id: userId,
        workflow_name: workflowName,
        approvers: approvers,
        current_step: 0,
        status: 'active',
        created_at: new Date().toISOString()
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/signature_workflows`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(workflow)
    });

    if (!response.ok) {
        throw new Error('Failed to create workflow');
    }

    const savedWorkflow = await response.json();

    return new Response(JSON.stringify({
        success: true,
        workflow: savedWorkflow[0]
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// AI-powered template generation
async function aiGenerateTemplate(supabaseUrl: string, serviceRoleKey: string, userId: string, token: string, requestData: any, corsHeaders: any) {
    const { templateType, description, requirements } = requestData;

    const prompt = `Create a professional ${templateType} template based on the following requirements:

Description: ${description}
Requirements: ${requirements || 'Standard legal and professional requirements'}

Please generate a complete template with:
1. Professional formatting and structure
2. Placeholder variables in {{VARIABLE_NAME}} format for customization
3. All necessary clauses and sections
4. Clear and professional language
5. Legal compliance considerations

Return the template content ready to use.`;

    const aiContent = await callAIRouter(token, supabaseUrl, prompt, 'template_generation');

    if (!aiContent) {
        throw new Error('AI template generation failed');
    }

    // Extract variables from the generated content
    const variableMatches = aiContent.match(/\{\{([A-Z_]+)\}\}/g) || [];
    const variables = [...new Set(variableMatches.map((v: string) => v.replace(/[{}]/g, '')))];

    // Track usage
    await trackUsage(supabaseUrl, serviceRoleKey, userId, 'template_generation');

    return new Response(JSON.stringify({
        success: true,
        template: {
            content: aiContent,
            variables: variables,
            suggested_name: `${templateType} Template - ${new Date().toISOString().split('T')[0]}`
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Track usage
async function trackUsage(supabaseUrl: string, serviceRoleKey: string, userId: string, operationType: string) {
    const usageData = {
        user_id: userId,
        module_name: 'document_automation',
        operation_type: operationType,
        usage_count: 1,
        last_used_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/module_usage`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usageData)
    });
}
