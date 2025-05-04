import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

console.log('VITE_SUPABASE_URL:', supabaseUrl)
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

export type UserType = 'freelancer' | 'client'

export interface Project {
  id: string
  client_id: string
  title: string
  description: string
  start_date: string
  end_date: string
  budget: number
  status: 'open' | 'in_progress' | 'completed'
  created_at: string
  technologies: string[]
  team_size: number
  requirements: string
}

// Function to create a new project
export async function createProject(projectData: Omit<Project, 'id' | 'created_at' | 'client_id'> & { freelancer_id?: string }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: clientProfile } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientProfile) throw new Error('Client profile not found')

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        ...projectData,
        client_id: clientProfile.id,
        ...(projectData.freelancer_id ? { freelancer_id: projectData.freelancer_id } : {})
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// Function to fetch projects
export async function fetchProjects(status?: string) {
  let query = supabase
    .from('projects')
    .select(`
      *,
      client:client_profiles (
        company_name,
        industry
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Function to fetch client's projects
export async function fetchClientProjects() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: clientProfile } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientProfile) throw new Error('Client profile not found')

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientProfile.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Function to update a job application's status
export async function updateJobApplicationStatus(applicationId: string, status: 'pending' | 'shortlisted' | 'accepted' | 'rejected') {
  const { error } = await supabase
    .from('job_applications')
    .update({ status })
    .eq('id', applicationId)
  if (error) throw error
}

// Function to assign a freelancer to a project and update status
export async function assignFreelancerToProject(projectId: string, freelancerId: string) {
  const { error } = await supabase
    .from('projects')
    .update({ freelancer_id: freelancerId, status: 'in_progress' })
    .eq('id', projectId)
  if (error) throw error
}