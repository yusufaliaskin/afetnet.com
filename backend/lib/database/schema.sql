-- AfetNet Database Schema
-- Bu dosya Supabase'de çalıştırılacak SQL komutlarını içerir

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  location GEOGRAPHY(POINT),
  notification_preferences JSONB DEFAULT '{
    "earthquake_alerts": true,
    "emergency_notifications": true,
    "news_updates": false,
    "magnitude_threshold": 4.0
  }',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Earthquakes table
CREATE TABLE IF NOT EXISTS earthquakes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE, -- Kandilli/AFAD ID
  magnitude DECIMAL(3,1) NOT NULL,
  depth DECIMAL(6,2),
  location VARCHAR(500) NOT NULL,
  coordinates GEOGRAPHY(POINT) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'kandilli', 'afad', 'manual'
  quality VARCHAR(20), -- 'automatic', 'reviewed', 'final'
  region VARCHAR(255),
  country VARCHAR(100) DEFAULT 'Turkey',
  tsunami_warning BOOLEAN DEFAULT false,
  felt_reports INTEGER DEFAULT 0,
  intensity_max DECIMAL(3,1),
  raw_data JSONB, -- Original API response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  earthquake_id UUID REFERENCES earthquakes(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'earthquake_alert', 'emergency', 'news', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB, -- Additional data like coordinates, links, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relationship VARCHAR(100),
  priority INTEGER DEFAULT 1, -- 1 = highest priority
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User locations/favorites table
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- 'Home', 'Work', 'School', etc.
  address TEXT,
  coordinates GEOGRAPHY(POINT) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  radius INTEGER DEFAULT 10000, -- Alert radius in meters
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disaster reports table (user-generated content)
CREATE TABLE IF NOT EXISTS disaster_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  earthquake_id UUID REFERENCES earthquakes(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'damage', 'injury', 'help_needed', 'safe', 'infrastructure'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  coordinates GEOGRAPHY(POINT),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  severity VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'resolved', 'false_report'
  images JSONB, -- Array of image URLs
  contact_info JSONB, -- Phone, email for follow-up
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  request_body JSONB,
  response_status INTEGER,
  response_time INTEGER, -- in milliseconds
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_earthquakes_date ON earthquakes(date DESC);
CREATE INDEX IF NOT EXISTS idx_earthquakes_magnitude ON earthquakes(magnitude DESC);
CREATE INDEX IF NOT EXISTS idx_earthquakes_coordinates ON earthquakes USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_earthquakes_source ON earthquakes(source);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_coordinates ON user_locations USING GIST(coordinates);

CREATE INDEX IF NOT EXISTS idx_disaster_reports_coordinates ON disaster_reports USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_disaster_reports_status ON disaster_reports(status);
CREATE INDEX IF NOT EXISTS idx_disaster_reports_created_at ON disaster_reports(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_earthquakes_updated_at BEFORE UPDATE ON earthquakes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_locations_updated_at BEFORE UPDATE ON user_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disaster_reports_updated_at BEFORE UPDATE ON disaster_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_reports ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Emergency contacts policies
CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

-- User locations policies
CREATE POLICY "Users can manage own locations" ON user_locations
    FOR ALL USING (auth.uid() = user_id);

-- Disaster reports policies
CREATE POLICY "Users can view all disaster reports" ON disaster_reports
    FOR SELECT USING (true);

CREATE POLICY "Users can create disaster reports" ON disaster_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own disaster reports" ON disaster_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Earthquakes are public (read-only for users)
ALTER TABLE earthquakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Earthquakes are publicly readable" ON earthquakes
    FOR SELECT USING (true);