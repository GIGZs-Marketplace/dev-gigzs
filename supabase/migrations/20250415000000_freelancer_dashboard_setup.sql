/*
  # Complete Freelancer Dashboard Setup

  This migration sets up all required tables for the freelancer dashboard:
  1. freelancer_profiles
  2. client_profiles
  3. jobs
  4. job_applications
  5. projects
  6. portfolio
  7. reviews_freelancer
*/

-- Create freelancer_profiles table
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text,
  professional_title text,
  hourly_rate numeric,
  skills text[],
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  company_name text,
  industry text,
  company_size text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  project_type text,
  budget_type text,
  budget_amount numeric,
  budget_max_amount numeric,
  duration text,
  experience_level text,
  location text,
  timezone text,
  project_scope text,
  skills_required text[],
  status text DEFAULT 'open',
  visibility text DEFAULT 'public',
  preferences jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create job_applications table
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

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
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

-- Create portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  skills text[],
  date timestamptz DEFAULT now(),
  tech text[],
  image text
);

-- Create reviews_freelancer table
CREATE TABLE IF NOT EXISTS reviews_freelancer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
  duration text,
  value text,
  completed text,
  skills_used text[],
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews_freelancer ENABLE ROW LEVEL SECURITY;

-- Policies for freelancer_profiles
CREATE POLICY "Users can view own freelancer profile"
  ON freelancer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own freelancer profile"
  ON freelancer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freelancer profile"
  ON freelancer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for client_profiles
CREATE POLICY "Users can view own client profile"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own client profile"
  ON client_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client profile"
  ON client_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for jobs
CREATE POLICY "Clients can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = jobs.client_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can manage their own jobs"
  ON jobs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = jobs.client_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can view open jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'open');

-- Policies for job_applications
CREATE POLICY "Freelancers can create applications"
  ON job_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE freelancer_profiles.id = job_applications.freelancer_id
      AND freelancer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can view own applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE freelancer_profiles.id = job_applications.freelancer_id
      AND freelancer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view applications for their jobs"
  ON job_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN client_profiles ON jobs.client_id = client_profiles.id
      WHERE jobs.id = job_applications.job_id
      AND client_profiles.user_id = auth.uid()
    )
  );

-- Policies for projects
CREATE POLICY "Clients can manage their projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = projects.client_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can view available projects"
  ON projects FOR SELECT
  TO authenticated
  USING (status = 'open');

-- Policies for portfolio
CREATE POLICY "Freelancers can manage their portfolio"
  ON portfolio FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE id = portfolio.freelancer_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view portfolios"
  ON portfolio FOR SELECT
  TO authenticated
  USING (true);

-- Policies for reviews_freelancer
CREATE POLICY "Freelancers can manage their reviews"
  ON reviews_freelancer FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE id = reviews_freelancer.freelancer_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view reviews"
  ON reviews_freelancer FOR SELECT
  TO authenticated
  USING (true); 