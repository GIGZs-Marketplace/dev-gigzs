import React, { useState, useEffect } from 'react'
import { MoreVertical, Clock, DollarSign, Users, ChevronRight, Search, Filter, Plus } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import PostJob from './PostJob'

function ProjectList() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostJob, setShowPostJob] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!clientProfile) return

      // First get all jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          freelancer:freelancer_id (
            id,
            full_name,
            professional_title
          )
        `)
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      // Then get application counts for each job
      const jobsWithApplications = await Promise.all(
        (jobs || []).map(async (job) => {
          const { count } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id)

          return {
            ...job,
            applications_count: count
          }
        })
      )

      setProjects(jobsWithApplications || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-emerald-100 text-emerald-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00704A]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-[#00704A]"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => setShowPostJob(true)}
          className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
        >
          <Plus size={20} className="mr-2" />
          Post New Job
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by posting your first job
            </p>
            <button
              onClick={() => setShowPostJob(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00704A] hover:bg-[#005538]"
            >
              <Plus size={20} className="mr-2" />
              Post a Job
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#00704A] transition-colors">
                      {project.title}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{project.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} />
                  </button>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-[#00704A] transition-colors" />
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {project.skills_required?.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-violet-50 rounded-lg">
                    <DollarSign className="text-violet-500" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${project.budget_amount}
                      {project.budget_type === 'hourly' && '/hr'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Clock className="text-amber-500" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium text-gray-900">{project.duration.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Users className="text-emerald-500" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Applications</p>
                    <p className="text-sm font-medium text-gray-900">{project.applications_count || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="w-full px-4 py-2 text-sm font-medium text-[#00704A] bg-[#00704A]/10 rounded-lg hover:bg-[#00704A]/20 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Job Modal */}
      {showPostJob && (
        <PostJob 
          onClose={() => setShowPostJob(false)} 
          onJobPosted={() => {
            fetchProjects()
            setShowPostJob(false)
          }}
        />
      )}
    </div>
  )
}

export default ProjectList