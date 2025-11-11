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

        // Verify JWT token
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

        // Get request data
        const { resultId, expiresIn, maxViews } = await req.json();

        if (!resultId) {
            throw new Error('Missing resultId parameter');
        }

        // Verify user owns the result
        const resultResponse = await fetch(`${supabaseUrl}/rest/v1/results?id=eq.${resultId}&user_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
            }
        });

        if (!resultResponse.ok) {
            throw new Error('Result not found or access denied');
        }

        const results = await resultResponse.json();
        if (results.length === 0) {
            throw new Error('Result not found');
        }

        // Generate unique share token
        const shareToken = crypto.randomUUID();

        // Calculate expiration date (default 30 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (expiresIn || 30));

        // Create shared result entry
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/shared_results`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                result_id: resultId,
                share_token: shareToken,
                expires_at: expiresAt.toISOString(),
                max_views: maxViews || null,
                view_count: 0,
                is_active: true
            })
        });

        if (!insertResponse.ok) {
            const error = await insertResponse.text();
            throw new Error(`Failed to create share link: ${error}`);
        }

        const sharedResult = await insertResponse.json();

        // Update result to mark as shared
        await fetch(`${supabaseUrl}/rest/v1/results?id=eq.${resultId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_shared: true
            })
        });

        return new Response(JSON.stringify({
            data: {
                shareToken,
                shareUrl: `${supabaseUrl.replace('https://', 'https://app.')}/shared/${shareToken}`,
                expiresAt: expiresAt.toISOString(),
                maxViews: maxViews || null,
                message: 'Share link created successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Share result error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'SHARE_RESULT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
