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
        const googleMapsApiKey = Deno.env.get('google_map_api_key');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        if (!googleMapsApiKey) {
            throw new Error('Google Maps API key not configured');
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

        // Route operations
        switch (operation) {
            case 'optimize_route': {
                const { origin, destination, waypoints = [], optimizationType = 'shortest' } = params;

                if (!origin || !destination) {
                    throw new Error('Origin and destination are required');
                }

                // Build waypoints string for Google Maps API
                const waypointsStr = waypoints.length > 0 
                    ? `&waypoints=optimize:true|${waypoints.join('|')}` 
                    : '';

                // Call Google Maps Directions API
                const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypointsStr}&key=${googleMapsApiKey}`;

                const directionsResponse = await fetch(directionsUrl);
                if (!directionsResponse.ok) {
                    throw new Error('Failed to fetch directions from Google Maps');
                }

                const directionsData = await directionsResponse.json();

                if (directionsData.status !== 'OK') {
                    throw new Error(`Google Maps API error: ${directionsData.status}`);
                }

                const route = directionsData.routes[0];
                const leg = route.legs[0];

                // Calculate total distance and duration
                let totalDistance = 0;
                let totalDuration = 0;
                route.legs.forEach((leg: any) => {
                    totalDistance += leg.distance.value;
                    totalDuration += leg.duration.value;
                });

                // Geocode origin and destination to get coordinates
                const originGeocode = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(origin)}&key=${googleMapsApiKey}`
                );
                const originData = await originGeocode.json();
                const originLocation = originData.results[0]?.geometry?.location;

                const destGeocode = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${googleMapsApiKey}`
                );
                const destData = await destGeocode.json();
                const destLocation = destData.results[0]?.geometry?.location;

                // Save route to database
                const routeRecord = {
                    user_id: userId,
                    route_name: params.route_name || `Route ${new Date().toLocaleDateString()}`,
                    origin_address: leg.start_address,
                    origin_lat: originLocation?.lat,
                    origin_lng: originLocation?.lng,
                    destination_address: leg.end_address,
                    destination_lat: destLocation?.lat,
                    destination_lng: destLocation?.lng,
                    waypoints: waypoints,
                    optimization_type: optimizationType,
                    total_distance: (totalDistance / 1000).toFixed(2), // Convert to km
                    total_duration: totalDuration, // in seconds
                    route_data: {
                        google_route: route,
                        overview_polyline: route.overview_polyline,
                        bounds: route.bounds
                    },
                    status: 'active'
                };

                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/logistics_routes`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(routeRecord)
                });

                if (!insertResponse.ok) {
                    const errorText = await insertResponse.text();
                    throw new Error(`Database insert failed: ${errorText}`);
                }

                const savedRoute = await insertResponse.json();

                return new Response(JSON.stringify({
                    data: {
                        route: savedRoute[0],
                        directions: directionsData,
                        summary: {
                            distance: `${(totalDistance / 1000).toFixed(2)} km`,
                            duration: `${Math.round(totalDuration / 60)} minutes`,
                            start_address: leg.start_address,
                            end_address: leg.end_address
                        }
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'get_routes': {
                const { limit = 10, status = 'active' } = params;

                const response = await fetch(
                    `${supabaseUrl}/rest/v1/logistics_routes?user_id=eq.${userId}&status=eq.${status}&order=created_at.desc&limit=${limit}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch routes');
                }

                const routes = await response.json();

                return new Response(JSON.stringify({
                    data: { routes }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'get_route_details': {
                const { route_id } = params;

                if (!route_id) {
                    throw new Error('Route ID is required');
                }

                const response = await fetch(
                    `${supabaseUrl}/rest/v1/logistics_routes?id=eq.${route_id}&user_id=eq.${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch route details');
                }

                const routes = await response.json();

                if (routes.length === 0) {
                    throw new Error('Route not found');
                }

                return new Response(JSON.stringify({
                    data: { route: routes[0] }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'update_route_status': {
                const { route_id, status } = params;

                if (!route_id || !status) {
                    throw new Error('Route ID and status are required');
                }

                const updateResponse = await fetch(
                    `${supabaseUrl}/rest/v1/logistics_routes?id=eq.${route_id}&user_id=eq.${userId}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            status,
                            updated_at: new Date().toISOString()
                        })
                    }
                );

                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    throw new Error(`Failed to update route: ${errorText}`);
                }

                const updatedRoute = await updateResponse.json();

                return new Response(JSON.stringify({
                    data: { route: updatedRoute[0] }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'delete_route': {
                const { route_id } = params;

                if (!route_id) {
                    throw new Error('Route ID is required');
                }

                const deleteResponse = await fetch(
                    `${supabaseUrl}/rest/v1/logistics_routes?id=eq.${route_id}&user_id=eq.${userId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );

                if (!deleteResponse.ok) {
                    throw new Error('Failed to delete route');
                }

                return new Response(JSON.stringify({
                    data: { success: true, message: 'Route deleted successfully' }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'calculate_distance': {
                const { origins, destinations } = params;

                if (!origins || !destinations) {
                    throw new Error('Origins and destinations are required');
                }

                // Call Google Maps Distance Matrix API
                const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins.join('|'))}&destinations=${encodeURIComponent(destinations.join('|'))}&key=${googleMapsApiKey}`;

                const distanceResponse = await fetch(distanceUrl);
                if (!distanceResponse.ok) {
                    throw new Error('Failed to calculate distance');
                }

                const distanceData = await distanceResponse.json();

                return new Response(JSON.stringify({
                    data: { matrix: distanceData }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            case 'get_analytics': {
                // Get route analytics for the user
                const response = await fetch(
                    `${supabaseUrl}/rest/v1/logistics_routes?user_id=eq.${userId}&select=*`,
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

                const routes = await response.json();

                // Calculate analytics
                const totalRoutes = routes.length;
                const activeRoutes = routes.filter((r: any) => r.status === 'active').length;
                const completedRoutes = routes.filter((r: any) => r.status === 'completed').length;
                
                let totalDistance = 0;
                let totalDuration = 0;
                routes.forEach((r: any) => {
                    totalDistance += parseFloat(r.total_distance || 0);
                    totalDuration += parseInt(r.total_duration || 0);
                });

                return new Response(JSON.stringify({
                    data: {
                        analytics: {
                            total_routes: totalRoutes,
                            active_routes: activeRoutes,
                            completed_routes: completedRoutes,
                            total_distance_km: totalDistance.toFixed(2),
                            total_duration_hours: (totalDuration / 3600).toFixed(2),
                            average_distance_km: totalRoutes > 0 ? (totalDistance / totalRoutes).toFixed(2) : 0,
                            average_duration_minutes: totalRoutes > 0 ? Math.round(totalDuration / totalRoutes / 60) : 0
                        }
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            default:
                throw new Error(`Unknown operation: ${operation}`);
        }

    } catch (error) {
        console.error('Logistics tracker error:', error);

        const errorResponse = {
            error: {
                code: 'LOGISTICS_TRACKER_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
