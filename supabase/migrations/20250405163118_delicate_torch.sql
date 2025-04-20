/*
  # Add Freelancer Relationship to Jobs Table

  1. Changes
    - Add freelancer_id column to jobs table
    - Add foreign key relationship to freelancer_profiles
    - Update RLS policies to allow freelancers to view and update their jobs

  2. Security
    - Maintain existing RLS policies
    - Add new policies for freelancer access
*/

-- Add freelancer_id column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS freelancer_id uuid REFERENCES freelancer_profiles(id) ON DELETE SET NULL;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_jobs_freelancer_id ON jobs(freelancer_id);

-- Add policy for freelancers to view their assigned jobs
CREATE POLICY "Freelancers can view their assigned jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    freelancer_id IN (
      SELECT id FROM freelancer_profiles WHERE user_id = auth.uid()
    )
  );

-- Add policy for freelancers to update their assigned jobs
CREATE POLICY "Freelancers can update their assigned jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (
    freelancer_id IN (
      SELECT id FROM freelancer_profiles WHERE user_id = auth.uid()
    )
  );