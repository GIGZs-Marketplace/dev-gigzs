/*
  # Create projects table

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references client_profiles)
      - `title` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `budget` (numeric)
      - `status` (text)
      - `created_at` (timestamp)
      - `technologies` (text[])
      - `team_size` (int)
      - `requirements` (text)

  2. Security
    - Enable RLS
    - Add policies for:
      - Clients to manage their projects
      - Freelancers to view available projects
*/

-- Drop table if it exists to ensure clean state
DROP TABLE IF EXISTS public.projects;

-- Create projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  budget numeric,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  technologies text[],
  team_size int,
  requirements text
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy for clients to manage their projects
CREATE POLICY "Clients can manage their own projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = projects.client_id
      AND user_id = auth.uid()
    )
  );

-- Create policy for freelancers to view projects
CREATE POLICY "Freelancers can view available projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (status = 'open');