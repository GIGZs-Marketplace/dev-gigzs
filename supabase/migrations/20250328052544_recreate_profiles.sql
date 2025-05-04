-- Drop existing tables and policies
DROP TABLE IF EXISTS freelancer_profiles CASCADE;
DROP TABLE IF EXISTS client_profiles CASCADE;

-- Create freelancer profiles table
CREATE TABLE freelancer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text,
  professional_title text,
  hourly_rate numeric,
  skills text[],
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create client profiles table
CREATE TABLE client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  company_name text,
  industry text,
  company_size text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for freelancer_profiles
CREATE POLICY "Users can view own freelancer profile"
  ON freelancer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own freelancer profile"
  ON freelancer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freelancer profile"
  ON freelancer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to bypass RLS for freelancer profiles
CREATE POLICY "Service role can manage freelancer profiles"
  ON freelancer_profiles
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policies for client_profiles
CREATE POLICY "Users can view own client profile"
  ON client_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own client profile"
  ON client_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client profile"
  ON client_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to bypass RLS for client profiles
CREATE POLICY "Service role can manage client profiles"
  ON client_profiles
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role'); 