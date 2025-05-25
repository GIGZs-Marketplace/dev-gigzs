/*
  # Fix payment enum types

  This migration fixes the payment enum types by dropping and recreating them
  to ensure consistency across the database.
*/

-- Drop existing enum types if they exist
DO $$ 
BEGIN
    DROP TYPE IF EXISTS payment_status CASCADE;
    DROP TYPE IF EXISTS payment_type CASCADE;
    DROP TYPE IF EXISTS payout_status CASCADE;
END $$;

-- Recreate enum types
CREATE TYPE payment_status AS ENUM ('pending', 'half_paid', 'paid', 'failed');
CREATE TYPE payment_type AS ENUM ('advance', 'completion');
CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'rejected', 'completed'); 