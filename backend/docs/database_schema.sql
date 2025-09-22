-- Smart City Waste Management System Database Schema
-- PostgreSQL Database Design

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE ENTITIES
-- =============================================

-- 1. CITIZENS TABLE
CREATE TABLE citizens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    role VARCHAR(20) DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'operator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. WASTE BINS TABLE
CREATE TABLE waste_bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_code VARCHAR(20) UNIQUE NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    bin_type VARCHAR(50) NOT NULL CHECK (bin_type IN ('general', 'recyclable', 'organic', 'hazardous')),
    capacity_liters INTEGER NOT NULL,
    current_fill_level INTEGER DEFAULT 0 CHECK (current_fill_level >= 0 AND current_fill_level <= 100),
    sensor_status VARCHAR(20) DEFAULT 'active' CHECK (sensor_status IN ('active', 'inactive', 'maintenance')),
    last_emptied TIMESTAMP,
    installation_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. COLLECTION TRUCKS TABLE
CREATE TABLE collection_trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_number VARCHAR(20) UNIQUE NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20),
    capacity_liters INTEGER NOT NULL,
    fuel_efficiency DECIMAL(5, 2), -- km per liter
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'on_route', 'maintenance', 'out_of_service')),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. COLLECTION ROUTES TABLE
CREATE TABLE collection_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(255) NOT NULL,
    route_description TEXT,
    estimated_duration_minutes INTEGER,
    total_distance_km DECIMAL(8, 2),
    priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES citizens(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ROUTE BINS JUNCTION TABLE
CREATE TABLE route_bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES collection_routes(id) ON DELETE CASCADE,
    bin_id UUID REFERENCES waste_bins(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    estimated_arrival_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_id, bin_id),
    UNIQUE(route_id, sequence_order)
);

-- 6. COLLECTION EVENTS TABLE
CREATE TABLE collection_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(255) NOT NULL,
    route_id UUID REFERENCES collection_routes(id),
    truck_id UUID REFERENCES collection_trucks(id),
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    total_bins_collected INTEGER DEFAULT 0,
    total_waste_collected_liters INTEGER DEFAULT 0,
    fuel_consumed_liters DECIMAL(8, 2),
    notes TEXT,
    created_by UUID REFERENCES citizens(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. BIN COLLECTIONS TABLE (Individual bin collections)
CREATE TABLE bin_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES collection_events(id) ON DELETE CASCADE,
    bin_id UUID REFERENCES waste_bins(id),
    collected_at TIMESTAMP,
    waste_amount_liters INTEGER,
    bin_condition VARCHAR(50) CHECK (bin_condition IN ('good', 'damaged', 'needs_repair', 'replaced')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CITIZEN REPORTS TABLE
CREATE TABLE citizen_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID REFERENCES citizens(id),
    bin_id UUID REFERENCES waste_bins(id),
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('overflow', 'damaged', 'missing', 'odor', 'other')),
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES citizens(id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. SYSTEM NOTIFICATIONS TABLE
CREATE TABLE system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('bin_full', 'route_optimization', 'maintenance_due', 'collection_delay', 'system_alert')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'operators', 'citizens', 'admins')),
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Geographic indexes for location-based queries
CREATE INDEX idx_waste_bins_location ON waste_bins(latitude, longitude);
CREATE INDEX idx_trucks_location ON collection_trucks(current_location_lat, current_location_lng);

-- Status and date indexes
CREATE INDEX idx_bins_fill_level ON waste_bins(current_fill_level) WHERE is_active = true;
CREATE INDEX idx_events_status_date ON collection_events(status, scheduled_date);
CREATE INDEX idx_reports_status ON citizen_reports(status, reported_at);

-- Foreign key indexes
CREATE INDEX idx_route_bins_route ON route_bins(route_id);
CREATE INDEX idx_route_bins_bin ON route_bins(bin_id);
CREATE INDEX idx_bin_collections_event ON bin_collections(event_id);
CREATE INDEX idx_bin_collections_bin ON bin_collections(bin_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_citizens_updated_at BEFORE UPDATE ON citizens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waste_bins_updated_at BEFORE UPDATE ON waste_bins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON collection_trucks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON collection_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON collection_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON citizen_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA INSERTS
-- =============================================

-- Insert sample citizens
INSERT INTO citizens (email, password_hash, first_name, last_name, phone, address, city, postal_code, latitude, longitude, role) VALUES
('admin@wastemanagement.com', '$2b$10$example_hash', 'System', 'Administrator', '+1234567890', 'City Hall', 'Smart City', '12345', 40.7128, -74.0060, 'admin'),
('operator@wastemanagement.com', '$2b$10$example_hash', 'John', 'Operator', '+1234567891', 'Waste Management Center', 'Smart City', '12345', 40.7589, -73.9851, 'operator'),
('citizen1@example.com', '$2b$10$example_hash', 'Alice', 'Johnson', '+1234567892', '123 Main St', 'Smart City', '12345', 40.7505, -73.9934, 'citizen');

-- Insert sample waste bins
INSERT INTO waste_bins (bin_code, location_name, latitude, longitude, bin_type, capacity_liters, current_fill_level) VALUES
('WB001', 'Central Park Main Entrance', 40.7829, -73.9654, 'general', 240, 75),
('WB002', 'Times Square', 40.7580, -73.9855, 'recyclable', 180, 45),
('WB003', 'Brooklyn Bridge Park', 40.6962, -73.9969, 'organic', 200, 90),
('WB004', 'Union Square', 40.7356, -73.9906, 'general', 240, 30),
('WB005', 'High Line Park', 40.7480, -74.0047, 'recyclable', 180, 85);

-- Insert sample collection trucks
INSERT INTO collection_trucks (truck_number, driver_name, driver_phone, capacity_liters, fuel_efficiency, status) VALUES
('T001', 'Mike Rodriguez', '+1234567893', 5000, 8.5, 'available'),
('T002', 'Sarah Chen', '+1234567894', 4500, 9.2, 'available'),
('T003', 'David Wilson', '+1234567895', 6000, 7.8, 'maintenance');

-- Insert sample collection routes
INSERT INTO collection_routes (route_name, route_description, estimated_duration_minutes, total_distance_km, priority_level, created_by) VALUES
('Downtown Route A', 'High-priority downtown collection route', 120, 15.5, 1, (SELECT id FROM citizens WHERE email = 'operator@wastemanagement.com')),
('Parks Route B', 'City parks and recreational areas', 90, 12.3, 2, (SELECT id FROM citizens WHERE email = 'operator@wastemanagement.com'));

-- Insert route-bin associations
INSERT INTO route_bins (route_id, bin_id, sequence_order) VALUES
((SELECT id FROM collection_routes WHERE route_name = 'Downtown Route A'), (SELECT id FROM waste_bins WHERE bin_code = 'WB001'), 1),
((SELECT id FROM collection_routes WHERE route_name = 'Downtown Route A'), (SELECT id FROM waste_bins WHERE bin_code = 'WB002'), 2),
((SELECT id FROM collection_routes WHERE route_name = 'Parks Route B'), (SELECT id FROM waste_bins WHERE bin_code = 'WB003'), 1),
((SELECT id FROM collection_routes WHERE route_name = 'Parks Route B'), (SELECT id FROM waste_bins WHERE bin_code = 'WB005'), 2);

-- Insert sample collection events
INSERT INTO collection_events (event_name, route_id, truck_id, scheduled_date, scheduled_start_time, status, created_by) VALUES
('Morning Downtown Collection', 
 (SELECT id FROM collection_routes WHERE route_name = 'Downtown Route A'),
 (SELECT id FROM collection_trucks WHERE truck_number = 'T001'),
 CURRENT_DATE + INTERVAL '1 day', '08:00:00', 'scheduled',
 (SELECT id FROM citizens WHERE email = 'operator@wastemanagement.com'));

-- Insert sample citizen reports
INSERT INTO citizen_reports (citizen_id, bin_id, report_type, description, severity) VALUES
((SELECT id FROM citizens WHERE email = 'citizen1@example.com'), 
 (SELECT id FROM waste_bins WHERE bin_code = 'WB003'), 
 'overflow', 'Bin is overflowing and attracting pests', 'high');
