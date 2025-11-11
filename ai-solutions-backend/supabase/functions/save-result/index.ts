Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Get authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing authorization header');
        }

        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Verify JWT token and get user ID
        const token = authHeader.replace('Bearer ', '');
        const jwtResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': supabaseKey
            }
        });

        if (!jwtResponse.ok) {
            throw new Error('Invalid authorization token');
        }

        const userData = await jwtResponse.json();
        const userId = userData.id;

        // Parse request body
        const { toolName, toolType, inputData, outputData, title, description, tags, isFavorite } = await req.json();

        if (!toolName || !toolType || !outputData) {
            throw new Error('Missing required fields: toolName, toolType, outputData');
        }

        // Insert result into database
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/results`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id: userId,
                tool_name: toolName,
                tool_type: toolType,
                input_data: inputData || {},
                output_data: outputData,
                title: title || `${toolName} Result - ${new Date().toISOString().split('T')[0]}`,
                description: description || '',
                tags: tags || [],
                is_favorite: isFavorite || false
            })
        });

        if (!insertResponse.ok) {
            const error = await insertResponse.text();
            throw new Error(`Database insert failed: ${error}`);
        }

        const savedResult = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                result: savedResult[0],
                message: 'Result saved successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Save result error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'SAVE_RESULT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
