-- Create storage schema and tables
CREATE SCHEMA IF NOT EXISTS storage;

-- Create buckets table
CREATE TABLE IF NOT EXISTS storage.buckets (
  id text PRIMARY KEY,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  public boolean DEFAULT false
);

-- Create objects table
CREATE TABLE IF NOT EXISTS storage.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text REFERENCES storage.buckets,
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
);

-- Create migrations table
CREATE TABLE IF NOT EXISTS storage.migrations (
  id integer PRIMARY KEY,
  name varchar(100) NOT NULL,
  hash varchar(40) NOT NULL,
  executed_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public buckets are viewable by everyone." ON storage.buckets
  FOR SELECT
  USING (public = true);

CREATE POLICY "Users can view their own buckets." ON storage.buckets
  FOR SELECT
  USING (owner = auth.uid());

CREATE POLICY "Users can create buckets." ON storage.buckets
  FOR INSERT
  WITH CHECK (owner = auth.uid());

CREATE POLICY "Users can update their own buckets." ON storage.buckets
  FOR UPDATE
  USING (owner = auth.uid());

CREATE POLICY "Users can delete their own buckets." ON storage.buckets
  FOR DELETE
  USING (owner = auth.uid());

CREATE POLICY "Public buckets are viewable by everyone." ON storage.objects
  FOR SELECT
  USING (bucket_id IN (
    SELECT id FROM storage.buckets WHERE public = true
  ));

CREATE POLICY "Users can view their own objects." ON storage.objects
  FOR SELECT
  USING (owner = auth.uid());

CREATE POLICY "Users can upload objects to their own buckets." ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id IN (
    SELECT id FROM storage.buckets WHERE owner = auth.uid()
  ));

CREATE POLICY "Users can update their own objects." ON storage.objects
  FOR UPDATE
  USING (owner = auth.uid());

CREATE POLICY "Users can delete their own objects." ON storage.objects
  FOR DELETE
  USING (owner = auth.uid()); 