CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    vehicle_type VARCHAR(100),
    license_plate VARCHAR(50),
    current_location JSONB,
    status VARCHAR(50) DEFAULT 'available',
    assigned_routes UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);