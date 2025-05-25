-- Create project_requirements table
CREATE TABLE IF NOT EXISTS public.project_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirements_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for project members" 
  ON public.project_requirements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (
        p.client_id = auth.uid() OR 
        p.freelancer_id = auth.uid()
      )
    )
  );

CREATE POLICY "Enable insert for project clients"
  ON public.project_requirements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND p.client_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_requirements_project_id ON public.project_requirements(project_id);
