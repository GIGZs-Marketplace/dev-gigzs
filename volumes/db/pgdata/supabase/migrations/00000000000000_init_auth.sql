-- Create auth schema and tables
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  encrypted_password text,
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token text,
  confirmation_sent_at timestamptz,
  recovery_token text,
  recovery_sent_at timestamptz,
  email_change_token text,
  email_change text,
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  phone text,
  phone_confirmed_at timestamptz,
  phone_change text,
  phone_change_token text,
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamptz,
  reauthentication_token text,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean DEFAULT false NOT NULL,
  deleted_at timestamptz
);

-- Create instances table
CREATE TABLE IF NOT EXISTS auth.instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uuid uuid,
  raw_base_config text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id bigserial PRIMARY KEY,
  token text,
  user_id uuid REFERENCES auth.users(id),
  revoked boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  parent text
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payload json,
  created_at timestamptz DEFAULT now(),
  ip_address text DEFAULT ''::text
);

-- Create schema migrations table
CREATE TABLE IF NOT EXISTS auth.schema_migrations (
  version text PRIMARY KEY,
  statements text[],
  name text
);

-- Create mfa factors table
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  friendly_name text,
  factor_type auth.factor_type,
  status auth.factor_status,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  secret text
);

-- Create mfa challenges table
CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_id uuid REFERENCES auth.mfa_factors(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  ip_address text DEFAULT ''::text
);

-- Create mfa amr claims table
CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  authentication_method text,
  provider text
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  factor_id uuid REFERENCES auth.mfa_factors(id),
  aal auth.aal_level,
  not_after timestamptz
);

-- Create identities table
CREATE TABLE IF NOT EXISTS auth.identities (
  id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email text GENERATED ALWAYS AS (lower(identity_data->>'email')) STORED,
  CONSTRAINT identities_pkey PRIMARY KEY (provider, id)
);

-- Create sso domains table
CREATE TABLE IF NOT EXISTS auth.sso_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sso_provider_id uuid,
  domain text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sso providers table
CREATE TABLE IF NOT EXISTS auth.sso_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saml providers table
CREATE TABLE IF NOT EXISTS auth.saml_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sso_provider_id uuid REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  entity_id text UNIQUE,
  metadata_xml text,
  metadata_url text,
  attribute_mapping jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saml relay states table
CREATE TABLE IF NOT EXISTS auth.saml_relay_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sso_provider_id uuid REFERENCES auth.sso_providers(id) ON DELETE CASCADE,
  request_id text,
  for_email text,
  redirect_to text,
  from_ip_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create flow states table
CREATE TABLE IF NOT EXISTS auth.flow_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  auth_code text,
  code_challenge_method auth.code_challenge_method,
  code_challenge text,
  provider_type text,
  provider_access_token text,
  provider_refresh_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  authentication_method text
);

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.flow_states ENABLE ROW LEVEL SECURITY; 