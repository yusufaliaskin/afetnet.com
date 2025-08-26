-- Create password_reset_codes table for password reset functionality
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(5) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user_id ON password_reset_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for password_reset_codes table
-- Only allow system/backend to manage reset codes (no direct user access)
CREATE POLICY "System can manage password reset codes" ON password_reset_codes
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_password_reset_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_password_reset_codes_updated_at_trigger
    BEFORE UPDATE ON password_reset_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_codes_updated_at();

-- Create function to clean up expired reset codes
CREATE OR REPLACE FUNCTION cleanup_expired_reset_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_codes 
    WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired codes (runs every hour)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-reset-codes', '0 * * * *', 'SELECT cleanup_expired_reset_codes();');