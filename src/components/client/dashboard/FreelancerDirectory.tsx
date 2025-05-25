import React, { useState, useEffect } from 'react'
import { Search, Filter, Star, MapPin, Briefcase, ChevronDown, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useNavigate } from 'react-router-dom';

interface Freelancer {
  id: string
  full_name: string
  professional_title: string
  hourly_rate: number
  skills: string[]
  created_at: string
  avatar_url?: string
  status?: 'Available' | 'Busy'
  completed_projects?: number
  rating?: number
}

function FreelancerDirectory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    loadFreelancers()
  }, [])

  const loadFreelancers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current client's ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: clientProfile, error: clientError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (clientError || !clientProfile) throw new Error('Client profile not found')

      // Get all projects where this client has accepted a freelancer
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('freelancer_id')
        .eq('client_id', clientProfile.id)
        .not('freelancer_id', 'is', null)

      if (projectsError) throw projectsError

      if (!projects || projects.length === 0) {
        setFreelancers([])
        setLoading(false)
        return
      }

      // Get unique freelancer IDs
      const freelancerIds = [...new Set(projects.map(p => p.freelancer_id))]

      // Fetch freelancer details
      const { data: freelancersData, error: freelancersError } = await supabase
        .from('freelancer_profiles')
        .select(`
          id,
          full_name,
          professional_title,
          avatar_url,
          hourly_rate,
          location,
          skills,
          created_at
        `)
        .in('id', freelancerIds)
        .order('created_at', { ascending: false })

      if (freelancersError) throw freelancersError

      // Transform data to match the Freelancer interface
      const transformedData: Freelancer[] = (freelancersData || []).map(freelancer => ({
        id: freelancer.id,
        full_name: freelancer.full_name || 'Freelancer',
        professional_title: freelancer.professional_title || 'Developer',
        hourly_rate: freelancer.hourly_rate || 0,
        skills: freelancer.skills || [],
        created_at: freelancer.created_at,
        avatar_url: freelancer.avatar_url || undefined,
        status: 'Available',
        completed_projects: 0,
        rating: 4.5
      }))

      setFreelancers(transformedData)
    } catch (err) {
      console.error('Error loading freelancers:', err)
      setError('Failed to load freelancers')
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedFreelancers = React.useMemo(() => {
    // Filter by search term
    const filtered = freelancers.filter(freelancer => 
      freelancer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.professional_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Sort based on selected option
    return [...filtered].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        return (b.rating || 0) - (a.rating || 0)
      }
    })
  }, [freelancers, searchTerm, sortBy])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <h2 className="text-xl font-semibold text-gray-800">Your Freelancers</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage freelancers you've worked with</p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search freelancers by name, title, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary w-full sm:w-auto"
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Freelancers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredAndSortedFreelancers.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No freelancers found</h3>
            <p className="mt-2 text-sm text-gray-500">
              You haven't worked with any freelancers yet.
            </p>
          </div>
        ) : (
          filteredAndSortedFreelancers.map((freelancer) => (
            <div 
              key={freelancer.id} 
              className="flex flex-col h-full bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start space-x-4 flex-shrink-0">
                {freelancer.avatar_url ? (
                  <img
                    src={freelancer.avatar_url}
                    alt={freelancer.full_name}
                    className="w-12 h-12 flex-shrink-0 rounded-full object-cover ring-2 ring-gray-100"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '';
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!freelancer.avatar_url && (
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg ring-2 ring-gray-100">
                    {freelancer.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors truncate">
                    {freelancer.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{freelancer.professional_title}</p>
                  <div className="flex items-center mt-1 space-x-3">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 flex-shrink-0" size={16} />
                      <span className="ml-1 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {freelancer.rating}
                      </span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      ${freelancer.hourly_rate}/hr
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex-1 min-h-0">
                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto py-1 custom-scrollbar">
                    {freelancer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs border border-gray-200 whitespace-nowrap"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Briefcase size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{freelancer.completed_projects || 0} projects</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  freelancer.status === 'Available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {freelancer.status}
                </span>
              </div>


            </div>
          ))
        )}
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}

export default FreelancerDirectory