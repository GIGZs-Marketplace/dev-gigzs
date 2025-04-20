/*
  # Update jobs table schema

  1. Changes
    - Add new fields for job details:
      - project_type
      - budget_type
      - budget_amount
      - budget_max_amount
      - duration
      - experience_level
      - timezone
      - project_scope
      - skills_required
      - visibility
      - preferences
    - Remove old fields:
      - budget
      - deadline

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns
ALTER TABLE jobs DROP COLUMN IF EXISTS budget;
ALTER TABLE jobs DROP COLUMN IF EXISTS deadline;

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS project_type text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_type text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_amount numeric;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget_max_amount numeric;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_level text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS project_scope text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills_required text[];
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS visibility text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS preferences jsonb;