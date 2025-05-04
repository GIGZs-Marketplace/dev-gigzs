-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE NOT NULL,
  freelancer_id uuid REFERENCES freelancer_profiles(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  proposal_id uuid REFERENCES proposals(id) ON DELETE SET NULL,
  title text NOT NULL,
  terms text NOT NULL, -- full contract text or JSON
  amount numeric NOT NULL,
  start_date date,
  end_date date,
  status text DEFAULT 'pending', -- draft, pending_freelancer, active, completed, cancelled
  contract_pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contract_signatures table
CREATE TABLE IF NOT EXISTS contract_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  role text NOT NULL, -- 'client' or 'freelancer'
  signature text, -- base64 or file url
  signed_at timestamptz
);

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Clients can manage their contracts" ON contracts;
  DROP POLICY IF EXISTS "Freelancers can view their contracts" ON contracts;
  DROP POLICY IF EXISTS "Users can manage their contract signatures" ON contract_signatures;
END $$;

-- Policies for contracts
CREATE POLICY "Clients can manage their contracts"
  ON contracts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE id = contracts.client_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can view their contracts"
  ON contracts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_profiles
      WHERE id = contracts.freelancer_id
      AND user_id = auth.uid()
    )
  );

-- Policies for contract_signatures
CREATE POLICY "Users can manage their contract signatures"
  ON contract_signatures
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()); 