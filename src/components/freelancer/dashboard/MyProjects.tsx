import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Clock, 
  DollarSign, 
  Calendar,
  MessageSquare,
  Building2,
  BarChart,
  ExternalLink,
  Edit,
  Info,
  X
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

type ProjectStatus = 'ongoing' | 'completed' | 'canceled'

interface Project {
  id: string
  title: string
  clientName: string
  clientCompany: string
  status: ProjectStatus
  deadline: string
  budget: number
  progress: number
  project_status: number
  description: string
  tasks: {
    total: number
    completed: number
  }
  lastUpdate: string
  startDate: string
  code_url?: string
}

interface MyProjectsProps {
  onViewDetails: (projectId: string | null) => void
}

function MyProjects({ onViewDetails }: MyProjectsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [, setLoading] = useState(true)
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<number>(0);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectRequirements, setProjectRequirements] = useState<string>('')

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user found')
        const { data: freelancerProfile } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (!freelancerProfile) throw new Error('Freelancer profile not found')
        // Fetch all projects assigned to this freelancer
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('*, client_profiles ( company_name )')
          .eq('freelancer_id', freelancerProfile.id)
        if (error) throw error
        const mappedProjects = (projectsData || []).map((proj: any) => {
          return {
            id: proj.id,
            title: proj.title,
            clientName: proj.client_profiles?.company_name || 'Client',
            clientCompany: proj.client_profiles?.company_name || 'Client',
            status: proj.status as ProjectStatus,
            deadline: proj.end_date || proj.start_date || proj.created_at,
            budget: proj.budget ?? 0, // Using only the budget field
            progress: proj.project_status ?? 0,
            project_status: proj.project_status ?? 0,
            code_url: proj.code_url || '',
            description: proj.description || '',
            tasks: { total: 0, completed: 0 },
            lastUpdate: proj.created_at,
            startDate: proj.start_date,
          } as Project & { code_url?: string, project_status?: number }
        })
        setProjects(mappedProjects)
      } catch (err) {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
    }
  }

  const filteredProjects = projects
    .filter(project => {
      const title = project.title ? project.title.toLowerCase() : '';
      const clientName = project.clientName ? project.clientName.toLowerCase() : '';
      const search = searchTerm ? searchTerm.toLowerCase() : '';
      const matchesSearch = 
        title.includes(search) ||
        clientName.includes(search);
      let matchesStatus = true;
      if (statusFilter === 'ongoing') {
        matchesStatus = ['open', 'ongoing', 'in_progress'].includes(project.status)
      } else if (statusFilter === 'completed') {
        matchesStatus = project.status === 'completed'
      } // 'all' matches everything
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (true) {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      } else {
        return b.progress - a.progress
      }
    })

  // Helper to open modal for a specific project
  const handleOpenUpdateModal = (projectId: string, currentProgress: number) => {
    setSelectedProjectId(projectId);
    setSelectedProgress(currentProgress);
    setShowUpdateModal(true);
  };

  // Helper to show project details and requirements
  const handleShowDetails = async (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
    
    try {
      // Fetch project requirements using maybeSingle to handle no rows case
      const { data, error } = await supabase
        .from('project_requirements')
        .select('requirements_text')
        .eq('project_id', project.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Handle case when no requirements exist
      if (!data || !data.requirements_text) {
        setProjectRequirements('No requirements added by client');
      } else {
        setProjectRequirements(data.requirements_text);
      }
    } catch (error) {
      console.error('Error fetching project requirements:', error);
      // Show user-friendly message for all error cases
      setProjectRequirements('No requirements added by client');
    }
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedProject(null)
    setProjectRequirements('')
  }

  const handleUpdateProgress = async () => {
    if (!selectedProjectId) return;
    // 1. Update in Supabase (use project_status)
    const { error } = await supabase
      .from('projects')
      .update({ project_status: selectedProgress })
      .eq('id', selectedProjectId);
    if (error) {
      alert('Failed to update progress. Please try again.');
      return;
    }
    // 2. Update in local state
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === selectedProjectId
          ? { ...proj, progress: selectedProgress, project_status: selectedProgress }
          : proj
      )
    );
    setShowUpdateModal(false);
    setSelectedProjectId(null);
  };

  // Code upload handler
  const handleCodeUpload = async (projectId: string, file: File) => {
    setUploadingProjectId(projectId);
    
    try {
      const BUCKET_NAME = 'project-code';
      const filePath = `${projectId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      // Try to upload the file
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        // If bucket doesn't exist, create it and retry
        if (uploadError.message.includes('bucket')) {
          const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: false,
            allowedMimeTypes: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
            fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
          });
          
          if (createBucketError) throw createBucketError;
          
          // Retry the upload
          const { error: retryError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });
            
          if (retryError) throw retryError;
        } else {
          throw uploadError;
        }
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      
      if (!publicUrl) throw new Error('Failed to generate public URL');
      
      // Update project with code URL
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          code_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === projectId ? { ...proj, code_url: publicUrl } : proj
        )
      );
      
      alert('Code uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Failed to upload code: ${err.message || 'Please check your permissions and try again'}`);
    } finally {
      setUploadingProjectId(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage your ongoing projects</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A] bg-white"
          >
            <option value="all">All Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600">No projects found</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Building2 size={16} className="mr-1" />
                      <span>{project.clientCompany || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>


              </div>

              <div className="mt-4 grid grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="text-sm font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-medium">{project.budget != null ? `$${project.budget.toLocaleString()}` : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Tasks</p>
                    <p className="text-sm font-medium">{project.tasks.completed}/{project.tasks.total} Completed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Last Update</p>
                    <p className="text-sm font-medium">{project.lastUpdate}</p>
                  </div>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">{typeof project.project_status === 'number' ? project.project_status : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#00704A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${typeof project.project_status === 'number' ? project.project_status : 0}%` }}
                  />
                </div>
                {/* Upload code button only visible at 75% or higher */}
                {(typeof project.project_status === 'number' ? project.project_status : 0) >= 75 && (
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="file"
                      ref={(el: HTMLInputElement | null) => { fileInputRefs.current[project.id] = el; return undefined; }}
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleCodeUpload(project.id, e.target.files[0])
                        }
                      }}
                    />
                    <button
                      className="px-3 py-1 bg-[#00704A] text-white rounded text-sm disabled:opacity-50"
                      onClick={() => fileInputRefs.current[project.id]?.click()}
                      disabled={uploadingProjectId === project.id}
                    >
                      {uploadingProjectId === project.id ? 'Uploading...' : 'Upload Code'}
                    </button>
                    {project.code_url && (
                      <a href={project.code_url} target="_blank" rel="noopener noreferrer" className="text-[#00704A] underline ml-2">View Code</a>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    className="flex items-center text-gray-600 hover:text-[#00704A]"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate', { detail: { section: 'messages' } }));
                    }}
                  >
                    <MessageSquare size={18} className="mr-1" />
                    <span>Message Client</span>
                  </button>
                  
                  <button
                    className="flex items-center text-gray-600 hover:text-blue-600"
                    onClick={() => handleShowDetails(project)}
                  >
                    <Info size={18} className="mr-1" />
                    <span>Requirements</span>
                  </button>

                  {['open', 'ongoing', 'in_progress'].includes(project.status) && (
                    <button
                      className="flex items-center text-gray-600 hover:text-[#00704A]"
                      onClick={() => handleOpenUpdateModal(project.id, project.project_status)}
                    >
                      <Edit size={18} className="mr-1" />
                      <span>Update Status</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Requirements Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 pb-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Project Requirements</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedProject.title}</p>
              </div>
              <button 
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Client's Requirements:</h4>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {projectRequirements}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 text-white bg-[#00704A] rounded-lg hover:bg-[#005538]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Update Project Progress</h3>
            <div className="flex flex-col space-y-3 mb-6">
              {[25, 50, 75, 100].map((val) => (
                <button
                  key={val}
                  className={`px-4 py-2 rounded-lg border ${selectedProgress === val ? 'bg-[#00704A] text-white' : 'bg-white text-gray-800'} hover:bg-[#00704A]/10`}
                  onClick={() => setSelectedProgress(val)}
                >
                  {val}%
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
                onClick={handleUpdateProgress}
                disabled={selectedProjectId === null}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyProjects