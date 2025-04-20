import { useState } from 'react'
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

type ProjectStatus = 'ongoing' | 'completed' | 'canceled'

interface Project {
  id: string
  title: string
  clientName: string
  clientCompany: string
  status: ProjectStatus
  deadline: string
  budget: number
  paymentProgress: number
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
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (true) {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      } else {
        return b.paymentProgress - a.paymentProgress
      }
    })

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
                  <span className="text-sm text-gray-600">Payment Progress</span>
                  <span className="text-sm font-medium">{project.paymentProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#00704A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.paymentProgress}%` }}
                  />
                </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
  <div className="flex items-center space-x-4">
    <button
      className="flex items-center text-gray-600 hover:text-[#00704A]"
      onClick={() => {
        // Use app-level navigation to avoid full reload and logout
        window.dispatchEvent(new CustomEvent('navigate', { detail: { section: 'messages' } }));
      }}
    >
      <MessageSquare size={18} className="mr-1" />
      <span>Message Client</span>
    </button>
    {project.status === 'ongoing' && (
      <button className="flex items-center text-gray-600 hover:text-[#00704A]">
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
    </div>
  )
}

// Sample projects data
const projects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Website Development',
    clientName: 'John Smith',
    clientCompany: 'TechCorp Solutions',
    status: 'ongoing',
    deadline: '2024-06-15',
    budget: 12000,
    paymentProgress: 65,
    description: 'Development of a full-featured e-commerce platform including product management, payment integration, and admin dashboard.',
    tasks: {
      total: 20,
      completed: 13
    },
    lastUpdate: '2 hours ago',
    startDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Mobile App Development',
    clientName: 'Sarah Johnson',
    clientCompany: 'InnovateLabs',
    status: 'ongoing',
    deadline: '2024-08-01',
    budget: 25000,
    paymentProgress: 40,
    description: 'Development of a cross-platform mobile application for inventory management and real-time tracking.',
    tasks: {
      total: 30,
      completed: 12
    },
    lastUpdate: '1 day ago',
    startDate: '2024-02-01'
  },
  {
    id: '3',
    title: 'Website Redesign Project',
    clientName: 'Emma Wilson',
    clientCompany: 'Design Studio Pro',
    status: 'completed',
    deadline: '2024-03-31',
    budget: 8000,
    paymentProgress: 100,
    description: 'Complete redesign of company website with focus on modern design principles and improved user experience.',
    tasks: {
      total: 15,
      completed: 15
    },
    lastUpdate: '1 week ago',
    startDate: '2024-01-01'
  }
]

export default MyProjects