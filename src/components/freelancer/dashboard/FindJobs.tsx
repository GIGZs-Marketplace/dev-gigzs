import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Building2, 
  Clock, 
  DollarSign, 
  MapPin, 
  Briefcase,
  Star,
  BookmarkPlus,
  ExternalLink,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface Job {
  id: string
  title: string
  description: string
  project_type: string
  budget_type: string
  budget_amount: number | null
  budget_max_amount: number | null
  duration: string
  experience_level: string
  location: string
  timezone: string
  project_scope: string
  skills_required: string[]
  status: string
  created_at: string
  client: {
    company_name: string
    industry: string
  }
}

function FindJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    budget: 'all'
  })

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:client_profiles (
            company_name,
            industry
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBudget = filters.budget === 'all' || (() => {
      const budget = job.budget_amount || 0
      switch (filters.budget) {
        case 'under-1000':
          return budget < 1000
        case '1000-5000':
          return budget >= 1000 && budget <= 5000
        case '5000-10000':
          return budget >= 5000 && budget <= 10000
        case 'over-10000':
          return budget > 10000
        default:
          return true
      }
    })()

    return matchesSearch && matchesBudget
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00704A]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Available Projects</h2>
          <p className="text-sm text-gray-600 mt-1">Browse through available projects and opportunities</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
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
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="all">All Budgets</option>
              <option value="under-1000">Under $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="over-10000">Over $10,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters to find more opportunities
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div 
              key={job.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <Building2 size={16} className="mr-1" />
                      <span>{job.client?.company_name}</span>
                    </div>
                    {job.location && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        <span>{job.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="text-[#00704A] hover:text-[#005538]">
                  <BookmarkPlus size={20} />
                </button>
              </div>

              <p className="mt-4 text-gray-600">{job.description}</p>

              {job.skills_required && job.skills_required.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills_required.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-medium">
                      {job.budget_amount ? `$${job.budget_amount.toLocaleString()}` : 'Not specified'}
                      {job.budget_type === 'hourly' && '/hr'}
                      {job.budget_max_amount && ` - $${job.budget_max_amount.toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium">{job.duration?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-medium">{job.experience_level?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <button
                  className="px-6 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { section: 'proposals', jobId: job.id } }))}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default FindJobs