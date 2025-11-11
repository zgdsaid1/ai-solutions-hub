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
        const { resultId, format } = await req.json();

        if (!resultId || !format) {
            throw new Error('Missing required parameters: resultId, format');
        }

        // Fetch result from database
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

        const result = results[0];

        let exportData;
        let contentType;
        let filename = `${result.tool_name}_${result.id.slice(0, 8)}`;

        switch (format.toLowerCase()) {
            case 'json':
                exportData = JSON.stringify(result, null, 2);
                contentType = 'application/json';
                filename += '.json';
                break;

            case 'txt':
                exportData = `${result.title || 'Result'}\n${'='.repeat(50)}\n\n`;
                exportData += `Tool: ${result.tool_name}\n`;
                exportData += `Type: ${result.tool_type}\n`;
                exportData += `Created: ${new Date(result.created_at).toLocaleString()}\n\n`;
                
                if (result.description) {
                    exportData += `Description:\n${result.description}\n\n`;
                }

                exportData += `Output:\n${'-'.repeat(50)}\n`;
                exportData += typeof result.output_data === 'object' 
                    ? JSON.stringify(result.output_data, null, 2)
                    : result.output_data;

                contentType = 'text/plain';
                filename += '.txt';
                break;

            case 'csv':
                // CSV format for data analysis
                const headers = ['Tool Name', 'Tool Type', 'Title', 'Created At', 'Is Favorite'];
                const values = [
                    result.tool_name,
                    result.tool_type,
                    result.title || '',
                    new Date(result.created_at).toISOString(),
                    result.is_favorite ? 'Yes' : 'No'
                ];
                
                exportData = headers.join(',') + '\n' + values.map(v => `"${v}"`).join(',');
                contentType = 'text/csv';
                filename += '.csv';
                break;

            default:
                throw new Error(`Unsupported format: ${format}. Supported formats: json, txt, csv`);
        }

        return new Response(exportData, {
            headers: {
                ...corsHeaders,
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Export result error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'EXPORT_RESULT_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
