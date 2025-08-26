-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  emergency_contact BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'Bilinmiyor',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_emergency_contact ON family_members(emergency_contact);

-- Enable RLS (Row Level Security)
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own family members" ON family_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family members" ON family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members" ON family_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family members" ON family_members
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();