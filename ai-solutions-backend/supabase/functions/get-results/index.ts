Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

        // Parse query parameters
        const url = new URL(req.url);
        const toolType = url.searchParams.get('toolType');
        const isFavorite = url.searchParams.get('isFavorite');
        const search = url.searchParams.get('search');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        // Build query
        let query = `user_id=eq.${userId}`;
        
        if (toolType) {
            query += `&tool_type=eq.${toolType}`;
        }
        
        if (isFavorite === 'true') {
            query += `&is_favorite=eq.true`;
        }

        if (search) {
            query += `&or=(title.ilike.*${search}*,description.ilike.*${search}*)`;
        }

        query += `&order=created_at.desc&limit=${limit}&offset=${offset}`;

        // Fetch results from database
        const fetchResponse = await fetch(`${supabaseUrl}/rest/v1/results?${query}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        if (!fetchResponse.ok) {
            const error = await fetchResponse.text();
            throw new Error(`Database fetch failed: ${error}`);
        }

        const results = await fetchResponse.json();

        // Get total count for pagination
        const countResponse = await fetch(`${supabaseUrl}/rest/v1/results?${query.split('&order=')[0]}&select=count`, {
            method: 'HEAD',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Prefer': 'count=exact'
            }
        });

        const totalCount = countResponse.headers.get('content-range')?.split('/')[1] || '0';

        return new Response(JSON.stringify({
            data: {
                results,
                pagination: {
                    total: parseInt(totalCount),
                    limit,
                    offset,
                    hasMore: offset + limit < parseInt(totalCount)
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get results error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'GET_RESULTS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
