/*
  # Create job applications table

  1. New Tables
    - `job_applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs.id)
      - `freelancer_id` (uuid, references freelancer_profiles.id)
      - `cover_letter` (text)
      - `proposed_rate` (numeric)
      - `status` (text, default: 'pending')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `job_applications` table
    - Add policies for:
      - Freelancers can create applications for open jobs
      - Freelancers can view their own applications
      - Clients can view applications for their jobs
*/

CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
  cover_letter text,
  proposed_rate numeric,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, freelancer_id)
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Freelancers can create applications
CREATE POLICY "Freelancers can create applications"
  ON job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE freelancer_profiles.id = job_applications.freelancer_id
      AND freelancer_profiles.user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.status = 'open'
    )
  );

-- Freelancers can view their own applications
CREATE POLICY "Freelancers can view own applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE freelancer_profiles.id = job_applications.freelancer_id
      AND freelancer_profiles.user_id = auth.uid()
    )
  );

-- Clients can view applications for their jobs
CREATE POLICY "Clients can view applications for their jobs"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN client_profiles ON jobs.client_id = client_profiles.id
      WHERE jobs.id = job_applications.job_id
      AND client_profiles.user_id = auth.uid()
    )
  );

-- Clients can update application status for their jobs
CREATE POLICY "Clients can update application status"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN client_profiles ON jobs.client_id = client_profiles.id
      WHERE jobs.id = job_applications.job_id
      AND client_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN client_profiles ON jobs.client_id = client_profiles.id
      WHERE jobs.id = job_applications.job_id
      AND client_profiles.user_id = auth.uid()
    )
  );