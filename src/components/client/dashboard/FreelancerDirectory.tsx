import React, { useState, useEffect } from 'react'
import { Search, Filter, Star, MapPin, Briefcase, ChevronDown, MessageSquare, ExternalLink, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface Freelancer {
  id: string
  full_name: string
  professional_title: string
  hourly_rate: number
  skills: string[]
  created_at: string
  status?: 'Available' | 'Busy'
  completed_projects?: number
  rating?: number
}

function FreelancerDirectory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    skills: [] as string[],
    availability: 'all',
    experience: 'all',
    hourlyRate: 'all'
  })
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFreelancers()
  }, [])

  const loadFreelancers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform and set default values for optional fields
      const transformedData = (data || []).map(freelancer => ({
        ...freelancer,
        status: Math.random() > 0.5 ? 'Available' : 'Busy',
        completed_projects: Math.floor(Math.random() * 50),
        rating: (4 + Math.random()).toFixed(1)
      }))

      setFreelancers(transformedData)
    } catch (err) {
      console.error('Error loading freelancers:', err)
      setError('Failed to load freelancers')
    } finally {
      setLoading(false)
    }
  }

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = 
      freelancer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.professional_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesExperience = filters.experience === 'all' || true // Add experience filter logic
    const matchesAvailability = filters.availability === 'all' || freelancer.status === filters.availability
    const matchesHourlyRate = filters.hourlyRate === 'all' || (() => {
      const rate = freelancer.hourly_rate || 0
      switch (filters.hourlyRate) {
        case 'under-50':
          return rate < 50
        case '50-100':
          return rate >= 50 && rate <= 100
        case 'over-100':
          return rate > 100
        default:
          return true
      }
    })()

    return matchesSearch && matchesExperience && matchesAvailability && matchesHourlyRate
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00704A]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Error loading freelancers</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <button
          onClick={loadFreelancers}
          className="mt-4 px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Freelancer Directory</h2>
          <p className="text-sm text-gray-600 mt-1">Find and connect with talented freelancers</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search freelancers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-[#00704A]"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <select
            value={filters.experience}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
          >
            <option value="all">All Experience Levels</option>
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>

          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={20} className="text-gray-500 mr-2" />
            More Filters
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span className="text-gray-700">Best Match</span>
            <ChevronDown size={16} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Freelancers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No freelancers found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          filteredFreelancers.map((freelancer) => (
            <div 
              key={freelancer.id} 
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${freelancer.id}`}
                  alt={freelancer.full_name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#00704A] transition-colors">
                    {freelancer.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">{freelancer.professional_title}</p>
                  <div className="flex items-center mt-1 space-x-3">
                    <div className="flex items-center">
                      <Star className="text-yellow-400" size={16} />
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {freelancer.rating}
                      </span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${freelancer.hourly_rate}/hr
                    </span>
                  </div>
                </div>
              </div>

              {freelancer.skills && freelancer.skills.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-sm border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Briefcase size={16} className="mr-1" />
                  <span>{freelancer.completed_projects} projects completed</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  freelancer.status === 'Available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {freelancer.status}
                </span>
              </div>

              <div className="mt-5 flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] flex items-center justify-center shadow-sm hover:shadow">
                  <MessageSquare size={18} className="mr-2" />
                  Contact
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default FreelancerDirectory