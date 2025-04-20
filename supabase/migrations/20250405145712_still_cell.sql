/*
  # Create jobs table and set up relations

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references client_profiles)
      - `title` (text)
      - `description` (text)
      - `budget` (numeric)
      - `deadline` (date)
      - `created_at` (timestamp)
      - `status` (text)

  2. Security
    - Enable RLS
    - Add policies for:
      - Clients to create and manage their own jobs
      - Freelancers to view open jobs
*/

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  budget numeric,
  deadline date,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  status text DEFAULT 'open'::text
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for clients to insert their own jobs
CREATE POLICY "Clients can create jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = jobs.client_id
      AND user_id = auth.uid()
    )
  );

-- Create policy for clients to manage their own jobs
CREATE POLICY "Clients can update their own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = jobs.client_id
      AND user_id = auth.uid()
    )
  );

-- Create policy for clients to view their own jobs
CREATE POLICY "Clients can view their own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = jobs.client_id
      AND user_id = auth.uid()
    )
  );

-- Create policy for freelancers to view open jobs
CREATE POLICY "Freelancers can view open jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    status = 'open' OR
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = jobs.client_id
      AND user_id = auth.uid()
    )
  );