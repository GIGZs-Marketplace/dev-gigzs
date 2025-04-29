/*
  # Add Missing Tables and Storage Bucket

  This migration adds:
  1. proposals table
  2. chats table
  3. messages table
  4. documents table
  5. documents storage bucket
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Drop storage policies if they exist
    DROP POLICY IF EXISTS "Users can upload their documents" ON storage.objects;
    DROP POLICY IF EXISTS "Users can read their own documents" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
END $$;

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  cover_letter text,
  proposed_rate numeric,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, freelancer_id)
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one uuid REFERENCES auth.users NOT NULL,
  participant_two uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  UNIQUE(participant_one, participant_two)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  metadata jsonb
);

-- Enable RLS on all new tables
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for new tables to avoid conflicts
DO $$ 
BEGIN
    -- Drop proposals policies if they exist
    DROP POLICY IF EXISTS "Freelancers can manage their proposals" ON proposals;
    DROP POLICY IF EXISTS "Clients can view proposals for their jobs" ON proposals;

    -- Drop chats policies if they exist
    DROP POLICY IF EXISTS "Users can view their chats" ON chats;
    DROP POLICY IF EXISTS "Users can create chats" ON chats;

    -- Drop messages policies if they exist
    DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
    DROP POLICY IF EXISTS "Users can send messages in their chats" ON messages;

    -- Drop documents policies if they exist
    DROP POLICY IF EXISTS "Users can manage their documents" ON documents;
END $$;

-- Policies for proposals
CREATE POLICY "Freelancers can manage their proposals"
  ON proposals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE id = proposals.freelancer_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view proposals for their jobs"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN client_profiles ON jobs.client_id = client_profiles.id
      WHERE jobs.id = proposals.job_id
      AND client_profiles.user_id = auth.uid()
    )
  );

-- Policies for chats
CREATE POLICY "Users can view their chats"
  ON chats
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = participant_one OR
    auth.uid() = participant_two
  );

CREATE POLICY "Users can create chats"
  ON chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = participant_one OR
    auth.uid() = participant_two
  );

-- Policies for messages
CREATE POLICY "Users can view messages in their chats"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE id = messages.chat_id
      AND (participant_one = auth.uid() OR participant_two = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chats"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE id = messages.chat_id
      AND (participant_one = auth.uid() OR participant_two = auth.uid())
    )
    AND
    auth.uid() = sender_id
  );

-- Policies for documents
CREATE POLICY "Users can manage their documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files to documents bucket
CREATE POLICY "Users can upload their documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy to allow users to read their own documents
CREATE POLICY "Users can read their own documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy to allow users to update their own documents
CREATE POLICY "Users can update their own documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy to allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  ); 