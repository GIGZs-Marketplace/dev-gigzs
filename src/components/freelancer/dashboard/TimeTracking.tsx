import React, { useState, useEffect } from 'react'
import { 
  DollarSign,
  Building2,
  Search,
  Clock3,
  CalendarDays
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface ClientProfile {
  id: string
  full_name: string | null
  company_name: string | null
}

interface ProjectBase {
  id: string
  client_id: string
  description: string
  start_date: string
  end_date: string | null
  budget: number
  status: string
  created_at: string
  technologies: string[]
  team_size: number
  requirements: string
  freelancer_id: string
  project_status: 'active' | 'completed' | 'pending' | string
  code_url: string | null
  job_id: string | null
  updated_at: string
  client_profiles?: ClientProfile[] | null // Supabase join returns array
}

interface Project extends Omit<ProjectBase, 'client_profiles'> {
  client_profiles?: ClientProfile[] | null
  client_name: string
  total_hours_worked: number
  hours_remaining: number
  days_remaining: number
  progress_percentage: number
  title: string
  hourly_rate: number
}



interface TimeEntry {
  id: string
  project_id: string
  freelancer_id: string
  start_time: string
  end_time: string
  duration: number // in minutes
  description: string
}

function TimeTracking() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [description, setDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch projects and time entries
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        console.log('Starting to fetch projects...')
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Auth error:', authError)
          setError('Authentication error: ' + authError.message)
          setLoading(false)
          return
        }
        
        if (!user) {
          console.log('No authenticated user found')
          setError('User not authenticated')
          setLoading(false)
          return
        }

        console.log('Fetching projects for user:', user.id)

        // First, let's check if we can fetch any projects at all
        const { data: testData, error: testError } = await supabase
          .from('projects')
          .select('*')
          .limit(1)

        console.log('Test query results - Any projects in table?', {
          hasData: !!testData?.length,
          error: testError
        })

        // First, get the freelancer profile for the current user
        const { data: freelancerProfile, error: freelancerError } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (freelancerError || !freelancerProfile) {
          console.error('Error fetching freelancer profile:', freelancerError)
          setError('Freelancer profile not found')
          setLoading(false)
          return
        }

        console.log('Freelancer profile ID:', freelancerProfile.id)

        // Fetch projects where the current user is the assigned freelancer
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id,
            client_id,
            description,
            start_date,
            end_date,
            budget,
            status,
            created_at,
            technologies,
            team_size,
            requirements,
            freelancer_id,
            project_status,
            code_url,
            job_id,
            updated_at,
            client_profiles (
              id,
              full_name,
              company_name
            )
          `)
          .eq('freelancer_id', freelancerProfile.id)
          .order('created_at', { ascending: false })

        console.log('Projects query results:', {
          projectsData,
          projectsError,
          query: 'projects with client_profiles join',
          user_id: user.id
        })

        if (projectsError) throw projectsError

        // Calculate time and map projects
         const projectsWithTime = await Promise.all(projectsData.map(async (project: any) => {
          // Handle missing start_date and end_date by using job.created_at and job.duration (fetched separately)
          let startDate: string | null = project.start_date && project.start_date !== 'null' 
            ? new Date(project.start_date).toISOString() 
            : null;
          let endDate: string | null = project.end_date && project.end_date !== 'null' 
            ? new Date(project.end_date).toISOString() 
            : null;

          // Only try to fetch job data if we're missing both dates and have a job_id
          if (!startDate && !endDate && project.job_id) {
            try {
              const { data: job, error: jobError } = await supabase
                .from('jobs')
                .select('created_at, duration')
                .eq('id', project.job_id)
                .single();

              if (job?.created_at) {
                startDate = new Date(job.created_at).toISOString();
                
                let durationDays = 0;
                if (job.duration !== undefined && job.duration !== null && !isNaN(Number(job.duration))) {
                  durationDays = Number(job.duration);
                }
                
                const calculatedEnd = new Date(job.created_at);
                if (durationDays < 30) {
                  calculatedEnd.setMonth(calculatedEnd.getMonth() + 1);
                } else if (durationDays < 90) {
                  calculatedEnd.setMonth(calculatedEnd.getMonth() + 3);
                } else {
                  calculatedEnd.setMonth(calculatedEnd.getMonth() + 6);
                }
                endDate = calculatedEnd.toISOString();
              }
            } catch (e) {
              console.error('Error fetching job data:', e);
              // If there's an error, keep the dates as null
            }
          }


          const endDateObj = endDate ? new Date(endDate) : null;
          const today = new Date();
          const timeDiff = endDateObj ? Math.max(0, endDateObj.getTime() - today.getTime()) : 0;
          const daysRemaining = endDateObj ? Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) : 0;
          
          // Ensure we have valid dates for the project
          const projectStartDate = startDate ? new Date(startDate) : null;
          const projectEndDate = endDate ? new Date(endDate) : null;

          // Calculate total budget hours based on budget (assuming budget is in dollars)
          // Using a default rate of $50/hour if no better calculation is available
          const hourlyRate = 50 // Default rate, adjust as needed
          const totalBudgetHours = project.budget / hourlyRate
          const hoursWorked = 0
          const hoursRemaining = Math.max(0, totalBudgetHours - hoursWorked)
          const progressPercentage = Math.min(100, (hoursWorked / totalBudgetHours) * 100)

          // Create a new object with all the required properties
          // Handle client_profiles as array (Supabase join default)
          let clientName = `Client ${project.client_id?.substring(0, 4) || '0000'}`;
          if (project.client_profiles && Array.isArray(project.client_profiles) && project.client_profiles.length > 0) {
            const profile = project.client_profiles[0];
            clientName = profile?.company_name || profile?.full_name || clientName;
          }

          const projectWithTime: Project = {
            ...project,
            client_profiles: project.client_profiles || null,
            client_name: clientName,
            title: project.description || `Project ${project.id.substring(0, 6)}`,
            hourly_rate: 50, // Default rate
            total_hours_worked: parseFloat(hoursWorked.toFixed(2)),
            hours_remaining: parseFloat(hoursRemaining.toFixed(2)),
            days_remaining: daysRemaining,
            progress_percentage: parseFloat(progressPercentage.toFixed(1)),
            // Ensure all required fields are included
            technologies: project.technologies || [],
            team_size: project.team_size || 1,
            requirements: project.requirements || '',
            status: project.status || 'active',
            project_status: project.project_status || 'pending'
          }
          
          return projectWithTime
        }))


        setProjects(projectsWithTime)
        if (projectsWithTime.length > 0 && !selectedProject) {
          setSelectedProject(projectsWithTime[0].id)
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [])


  const calculateEarnings = (minutes: number, hourlyRate: number): string => {
    if (isNaN(minutes) || isNaN(hourlyRate)) return '0.00';
    return ((minutes / 60) * hourlyRate).toFixed(2);
  }

  // Format countdown timer
  const formatCountdown = (endDate: string | null) => {
    if (!endDate) return 'No deadline';
    
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Deadline passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h left`;
  };

  // Get current project details
  const currentProject = projects.find(p => p.id === selectedProject)
  const hourlyRate = currentProject?.hourly_rate || 50 // Default to $50/hour if not specified

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }


  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
          <p className="text-sm text-gray-600 mt-1">Track your working hours and project progress</p>
        </div>
        <div className="w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

       {/* Timer Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={isTracking}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.description || `Project ${project.id.substring(0, 6)}`} - {project.client_name}
                </option>
              ))}
            </select>
            
            {currentProject ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Client: {currentProject.client_name || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {currentProject.end_date 
                        ? formatCountdown(currentProject.end_date)
                        : 'No deadline'}
                    </span>
                    {currentProject.end_date && (
                      <span className="text-xs text-gray-500">
                        Due: {new Date(currentProject.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock3 className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {(currentProject.total_hours_worked || 0).toFixed(1)} hours logged 
                    ({(currentProject.hours_remaining || 0).toFixed(1)} hours remaining)
                  </span>
                </div>
                {currentProject.hourly_rate !== undefined && 
                 currentProject.hourly_rate !== null && 
                 currentProject.hourly_rate > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      ${currentProject.hourly_rate}/hour 
                      (${calculateEarnings(
                        (currentProject.total_hours_worked || 0) * 60, 
                        currentProject.hourly_rate
                      )} earned)
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-500">
                No project selected or no projects available.
              </div>
            )}
            <div className="mt-4">
            <div className="w-full">
              <textarea
                placeholder="Add notes about this project (optional)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Your Projects</h3>
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No active projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex flex-col">
                      <h4 className="font-medium text-gray-900">
                        {project.description || `Project ${project.id.substring(0, 6)}`}
                      </h4>
                      {project.end_date && (
                        <span className="text-xs text-gray-500">
                          {formatCountdown(project.end_date)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{project.client_name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.project_status === 'active' ? 'bg-green-100 text-green-800' : 
                    project.project_status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {String(project.project_status || 'Unknown').charAt(0).toUpperCase() + String(project.project_status || 'Unknown').slice(1)}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{project.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${project.progress_percentage}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{project.total_hours_worked}</div>
                      <div className="text-xs text-gray-500">Hours Logged</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">{project.days_remaining}</div>
                      <div className="text-xs text-gray-500">Days Left</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedProject(project.id)}
                    className="w-full mt-2 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  >
                    Track Time
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracking;