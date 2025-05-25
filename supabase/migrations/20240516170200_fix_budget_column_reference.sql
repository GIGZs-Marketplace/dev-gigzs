-- Fix the insert_project_on_accept_func function to use the correct column names
CREATE OR REPLACE FUNCTION public.insert_project_on_accept_func()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  job_title TEXT;
  job_client_id UUID;
  job_end_date TEXT;
  job_budget NUMERIC;
  job_team_size INTEGER;
  existing_project_id UUID;
BEGIN
  -- Only insert if status is changing to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- First check if a project already exists for this job
    SELECT id INTO existing_project_id
    FROM projects
    WHERE job_id = NEW.job_id;

    -- If no project exists, create a new one
    IF existing_project_id IS NULL THEN
      SELECT 
        title, 
        client_id, 
        COALESCE(end_date::text, 'N/A'), 
        COALESCE(budget_amount, 0), 
        COALESCE(team_size, 0)
      INTO 
        job_title, 
        job_client_id, 
        job_end_date, 
        job_budget, 
        job_team_size
      FROM jobs 
      WHERE id = NEW.job_id;

      INSERT INTO projects (
        job_id,
        client_id,
        freelancer_id,
        status,
        created_at,
        updated_at,
        title,
        start_date,
        end_date,
        budget,
        team_size
      )
      VALUES (
        NEW.job_id,
        job_client_id,
        NEW.freelancer_id,
        'in_progress',
        NOW(),
        NOW(),
        job_title,
        NOW(),
        CASE 
          WHEN job_end_date = 'N/A' THEN NULL
          ELSE job_end_date::date
        END,
        job_budget,
        job_team_size
      );
    ELSE
      -- Update existing project with freelancer info
      UPDATE projects
      SET freelancer_id = NEW.freelancer_id,
          status = 'in_progress',
          updated_at = NOW()
      WHERE id = existing_project_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop other trigger functions to prevent conflicts
DROP FUNCTION IF EXISTS public.update_project_on_proposal_accept();
DROP FUNCTION IF EXISTS public.upsert_project_on_proposal_accept();

-- Create a single trigger for proposal acceptance
DROP TRIGGER IF EXISTS on_proposal_accept ON job_applications;
CREATE TRIGGER on_proposal_accept
  AFTER UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.insert_project_on_accept_func();
