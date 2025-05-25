import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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