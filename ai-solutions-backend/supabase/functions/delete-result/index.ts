Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

        // Get result ID from request
        const { resultId } = await req.json();

        if (!resultId) {
            throw new Error('Missing resultId parameter');
        }

        // Delete result from database (RLS will ensure user owns it)
        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/results?id=eq.${resultId}&user_id=eq.${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        if (!deleteResponse.ok) {
            const error = await deleteResponse.text();
            throw new Error(`Database delete failed: ${error}`);
        }

        return new Response(JSON.stringify({
            data: {
                message: 'Result deleted successfully',
                resultId
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete result error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'DELETE_RESULT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
