import { useState, useEffect } from 'react'
import { Search, Clock, DollarSign, Users, Calendar, ExternalLink, PlusCircle, ListChecks, Code, Download, X } from 'lucide-react'
import RequirementsModal from '../../../components/common/RequirementsModal';
import { fetchClientProjects } from '../../../lib/projectApi'
import { supabase } from '../../../lib/supabase'

function ProjectsDirectory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [projects, setProjects] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    team_size: '',
    technologies: [] as string[],
    project_scope: '',
    status: 'open' as const
  })
  const [codeFiles, setCodeFiles] = useState<Array<{name: string, url: string}>>([])
  const [loadingCode, setLoadingCode] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [showRequirementsModal, setShowRequirementsModal] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<string>('open')

  // Fetch code files for a project
  const fetchCodeFiles = async (projectId: string) => {
    setLoadingCode(true);
    setCodeFiles([]);
    
    try {
      // First get the project to check if it has a code_url
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('code_url')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      
      if (projectData?.code_url) {
        // If there's a direct code URL, add it to the files list
        const fileName = projectData.code_url.split('/').pop() || 'code_file';
        setCodeFiles([{ name: fileName, url: projectData.code_url }]);
      } else {
        // If no direct URL, try to list files from the project's folder in storage
        const { data: files, error: listError } = await supabase.storage
          .from('project-code')
          .list(projectId);
          
        if (listError) {
          // If the bucket doesn't exist or is empty, just return empty array
          if (listError.message.includes('The resource was not found')) {
            return [];
          }
          throw listError;
        }
        
        if (files && files.length > 0) {
          // Get signed URLs for each file
          const filesWithUrls = await Promise.all(
            files
              .filter(file => file.name) // Filter out any undefined/null file names
              .map(async (file) => {
                try {
                  const { data: { publicUrl } } = supabase.storage
                    .from('project-code')
                    .getPublicUrl(`${projectId}/${file.name}`);
                  
                  return {
                    name: file.name,
                    url: publicUrl
                  };
                } catch (err) {
                  console.error(`Error getting URL for file ${file.name}:`, err);
                  return null;
                }
              })
          );
          
          // Filter out any failed file fetches
          const validFiles = filesWithUrls.filter((file): file is { name: string; url: string } => file !== null);
          setCodeFiles(validFiles);
        }
      }
    } catch (error) {
      console.error('Error fetching code files:', error);
      // Set empty array to show no files found
      setCodeFiles([]);
    } finally {
      setLoadingCode(false);
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setJobs([])
        setJobsLoading(false)
        return
      }
      // Fetch jobs posted by this client
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      if (jobsError || !jobsData) {
        setJobs([])
        setJobsLoading(false)
        return
      }
      // For each job, fetch the number of applications
      const jobsWithApplications = await Promise.all(jobsData.map(async (job: any) => {
        const { count, error: countError } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
        return {
          ...job,
          applications_count: countError ? 0 : (count ?? 0)
        }
      }))
      setJobs(jobsWithApplications)
      setJobsLoading(false)
    }
    fetchJobs()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await fetchClientProjects()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      // Get client profile id
      const { data: clientProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (profileError || !clientProfile) throw new Error('Client profile not found')
      // Insert into jobs table
      const { error: insertError } = await supabase
        .from('jobs')
        .insert([
          {
            client_id: clientProfile.id,
            title: formData.title,
            description: formData.description,
            start_date: formData.start_date,
            end_date: formData.end_date,
            budget_amount: Number(formData.budget),
            team_size: Number(formData.team_size),
            technologies: formData.technologies,
            project_scope: formData.project_scope,
            status: formData.status,
            created_at: new Date().toISOString()
          }
        ])
      if (insertError) throw insertError
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        budget: '',
        team_size: '',
        technologies: [],
        project_scope: '',
        status: 'open'
      })
      // Refresh jobs list
      setJobsLoading(true)
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false })
      if (!jobsError && jobsData) setJobs(jobsData)
      setJobsLoading(false)
      
      // Show success message
      setShowSuccessMessage(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error: any) {
      console.error('Error creating job:', error)
      alert('Error creating job: ' + (error.message || error))
    }
  }

  const filteredProjects = projects.filter(project => {
    const title = project.title ? project.title.toLowerCase() : '';
    const description = project.description ? project.description.toLowerCase() : '';
    const matchesSearch = 
      title.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and track all your projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#005538] transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          New Project
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                <p className="mt-1 text-gray-600">{project.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'open' ? 'bg-green-100 text-green-800' :
                project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-sm font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="text-sm font-medium">{project.budget != null ? `$${project.budget.toLocaleString()}` : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Team Size</p>
                  <p className="text-sm font-medium">{project.team_size != null ? `${project.team_size} members` : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {(project.technologies ?? []).map((tech: string, index: number) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs border border-gray-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.freelancer && (
              <div className="mt-4 flex items-center space-x-2">
                <img 
                  src={project.freelancer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.freelancer.full_name || 'F')}`} 
                  alt={project.freelancer.full_name} 
                  className="w-8 h-8 rounded-full" 
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.freelancer.full_name}</p>
                  <p className="text-xs text-gray-500">{project.freelancer.professional_title}</p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedProjectStatus(project.status);
                    setShowRequirementsModal(true);
                  }}
                  className="flex items-center text-primary hover:text-[#005538] text-sm"
                >
                  <ListChecks size={16} className="mr-1" />
                  Manage Details
                </button>
                {project.code_url && (
                  <button 
                    onClick={async () => {
                      setSelectedProjectId(project.id);
                      await fetchCodeFiles(project.id);
                      setShowCodeModal(true);
                    }}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Code size={16} className="mr-1" />
                    View Code
                  </button>
                )}
              </div>
              {project.project_status !== undefined && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-500">Progress:</span>
                  <progress 
                    value={project.project_status || 0} 
                    max="100" 
                    className="w-20 h-1.5 align-middle [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" 
                  />
                  <span className="text-xs font-medium text-gray-700">{project.project_status || 0}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fade-in-out">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm">Your project has been created successfully.</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Size</label>
                  <input
                    type="number"
                    value={formData.team_size}
                    onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Technologies</label>
                <input
                  type="text"
                  placeholder="Enter technologies separated by commas"
                  onChange={(e) => setFormData({
                    ...formData,
                    technologies: e.target.value.split(',').map(t => t.trim())
                  })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Project Scope</label>
                <textarea
                  value={formData.project_scope}
                  onChange={(e) => setFormData({ ...formData, project_scope: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#005538]"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    
      {/* Requirements Modal */}
      {selectedProjectId && (
        <RequirementsModal
          isOpen={showRequirementsModal}
          onClose={() => setShowRequirementsModal(false)}
          projectId={selectedProjectId}
          isClient={true}
          projectStatus={selectedProjectStatus}
        />
      )}

      {/* Code Viewer Modal */}
      {showCodeModal && selectedProjectId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={(e) => {
            // Close modal when clicking on the backdrop
            if (e.target === e.currentTarget) {
              setShowCodeModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Project Code Files</h3>
              <button 
                onClick={() => setShowCodeModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingCode ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : codeFiles.length > 0 ? (
                <div className="space-y-3">
                  {codeFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <div className="flex items-center min-w-0">
                        <Code size={18} className="text-gray-500 mr-3 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                      <a 
                        href={file.url} 
                        download={file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 whitespace-nowrap inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-[#005538] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                      >
                        <Download size={16} className="mr-1.5" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code size={48} className="mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-1">No code files found</h4>
                  <p className="text-gray-500">There are no code files available for this project.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsDirectory