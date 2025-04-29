import { useState, useEffect } from 'react'
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
  Plus
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
  description: string
  tasks: {
    total: number
    completed: number
  }
  lastUpdate: string
  startDate: string
}

interface MyProjectsProps {
  onViewDetails: (projectId: string | null) => void
}

function MyProjects({ onViewDetails }: MyProjectsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: 0
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<number>(0);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user found')

        // 2. Get freelancer profile
        const { data: freelancerProfile } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (!freelancerProfile) throw new Error('Freelancer profile not found')

        // 3. Fetch projects for this freelancer
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            client_id,
            status,
            start_date,
            end_date,
            budget,
            progress,
            description,
            lastUpdate: created_at,
            startDate: start_date,
            client_profiles ( company_name ),
            job_application_id
          `)
          .eq('freelancer_id', freelancerProfile.id)

        if (error) throw error

        // 4. Map to Project[]
        const mappedProjects = (projectsData || []).map((proj: any) => {
          return {
            id: proj.id,
            title: proj.title,
            clientName: proj.client_profiles?.company_name || 'Client',
            clientCompany: proj.client_profiles?.company_name || 'Client',
            status: proj.status as ProjectStatus,
            deadline: proj.end_date || proj.start_date || proj.created_at,
            budget: proj.budget || 0,
            progress: proj.progress ?? 0,
            description: proj.description || '',
            tasks: { total: 0, completed: 0 }, // Fill if you have tasks
            lastUpdate: proj.lastUpdate,
            startDate: proj.startDate,
          } as Project;
        });

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
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Helper to update progress in state
  const handleUpdateProgress = async () => {
    if (!selectedProjectId) return;
    // 1. Update in Supabase
    const { error } = await supabase
      .from('projects')
      .update({ progress: selectedProgress })
      .eq('id', selectedProjectId);
    if (error) {
      alert('Failed to update progress. Please try again.');
      return;
    }
    // 2. Update in local state
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === selectedProjectId
          ? { ...proj, progress: selectedProgress }
          : proj
      )
    );
    setShowUpdateModal(false);
    setSelectedProjectId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage your ongoing projects</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Project
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={(e) => { e.preventDefault(); /* Handle project creation */ }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-[#00704A]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-[#00704A]"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget ($)
                </label>
                <input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-[#00704A]"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <span>{project.clientCompany}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>Started {new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-[#00704A] rounded-lg hover:bg-gray-50">
                    <Edit size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-[#00704A] rounded-lg hover:bg-gray-50">
                    <ExternalLink size={20} />
                  </button>
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
                    <p className="text-sm font-medium">${project.budget.toLocaleString()}</p>
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
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#00704A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
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
                    {['open', 'ongoing', 'in_progress'].includes(project.status) && (
                      <button
                        className="flex items-center text-gray-600 hover:text-[#00704A]"
                        onClick={() => handleOpenUpdateModal(project.id, project.progress)}
                      >
                        <Edit size={18} className="mr-1" />
                        <span>Update Status</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => onViewDetails(project.id)}
                    className="flex items-center text-[#00704A] hover:text-[#005538]"
                  >
                    <span>View Details</span>
                    <ExternalLink size={18} className="ml-1" />
                  </button>
                </div>
              </div>
           
            ))
          )}
        </div>

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