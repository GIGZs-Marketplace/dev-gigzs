import React, { useState, useEffect } from 'react'
import { MoreVertical, Clock, DollarSign, Users, ChevronRight, Search, Filter, Plus } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import PostJob from './PostJob'

function ProjectList() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostJob, setShowPostJob] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setJobs([])
        setLoading(false)
        return
      }
      // Fetch client profile id for this user
      const { data: clientProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (profileError || !clientProfile) {
        setJobs([])
        setLoading(false)
        return
      }
      // Now fetch jobs using client profile id
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false })
      if (jobsError || !jobsData) {
        setJobs([])
        setLoading(false)
        return
      }
      // For each job, fetch the number of applications
      const jobsWithApplications = await Promise.all(jobsData.map(async (job) => {
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
      setLoading(false)
    }
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00704A]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl w-80 focus:outline-none focus:border-[#00704A] text-lg shadow-sm"
            />
            <Search className="absolute left-4 top-3 text-gray-400" size={22} />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#00704A] text-lg shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          onClick={() => setShowPostJob(true)}
          className="flex items-center px-6 py-3 bg-[#00704A] text-white rounded-xl hover:bg-[#005538] text-lg font-semibold shadow-md transition-all duration-300"
        >
          <Plus size={24} className="mr-2 text-white" />
          <span className="text-white">Post New Job</span>
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-md">
            <h3 className="text-base font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-sm text-gray-500">Jobs you post will appear here.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[260px] group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">{job.title}</h3>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium shadow-sm">{job.applications_count} Applications</span>
              </div>
              <p className="text-gray-700 text-sm mb-6 line-clamp-3">{job.description}</p>
              <div className="flex flex-wrap gap-6 mt-auto">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock size={20} className="text-gray-400" />
                  <span>Start:</span>
                  <span className="font-medium text-gray-900">{job.start_date ? new Date(job.start_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock size={20} className="text-gray-400" />
                  <span>End:</span>
                  <span className="font-medium text-gray-900">{job.end_date ? new Date(job.end_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <DollarSign size={20} className="text-gray-400" />
                  <span>Budget:</span>
                  <span className="font-medium text-gray-900">{job.budget != null ? `$${job.budget}` : 'N/A'}</span>
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
            setShowPostJob(false)
          }}
        />
      )}
    </div>
  )
}

export default ProjectList