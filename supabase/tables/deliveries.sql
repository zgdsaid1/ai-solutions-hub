CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    route_id UUID,
    driver_id UUID,
    delivery_address JSONB NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    package_description TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    delivery_time TIMESTAMPTZ,
    estimated_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);