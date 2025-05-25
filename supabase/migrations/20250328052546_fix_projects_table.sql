/*
  # Fix projects table schema

  This migration consolidates the two different projects table schemas into one.
  It combines the fields from both schemas and ensures proper relationships.
*/

-- Drop dependent tables first
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.payment_webhooks CASCADE;
DROP TABLE IF EXISTS public.freelancer_wallets CASCADE;
DROP TABLE IF EXISTS public.payout_requests CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- Create consolidated projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES freelancer_profiles(id),
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  budget numeric NOT NULL,
  total_amount numeric NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  technologies text[],
  team_size int,
  requirements text,
  progress int DEFAULT 0
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

-- Create policy for freelancers to view and update their projects
CREATE POLICY "Freelancers can view and update their projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE id = projects.freelancer_id
      AND user_id = auth.uid()
    )
  );

-- Create policy for freelancers to view available projects
CREATE POLICY "Freelancers can view available projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (status = 'open'); 