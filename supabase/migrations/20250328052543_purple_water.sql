/*
  # Create profiles tables for freelancers and clients

  1. New Tables
    - `freelancer_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `professional_title` (text)
      - `hourly_rate` (numeric)
      - `skills` (text[])
      - `created_at` (timestamp)
    
    - `client_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `company_name` (text)
      - `industry` (text)
      - `company_size` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read/write their own data
*/

-- Create freelancer profiles table
CREATE TABLE IF NOT EXISTS freelancer_profiles (
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
CREATE TABLE IF NOT EXISTS client_profiles (
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