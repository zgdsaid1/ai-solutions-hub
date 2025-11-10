CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    route_name VARCHAR(255) NOT NULL,
    start_location JSONB NOT NULL,
    end_location JSONB NOT NULL,
    waypoints JSONB DEFAULT '[]'::jsonb,
    total_distance_km DECIMAL(10,2),
    estimated_duration_min INTEGER,
    optimized_route JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);