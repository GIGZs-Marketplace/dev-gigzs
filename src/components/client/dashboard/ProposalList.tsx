import React, { useState, useEffect } from 'react'
import { supabase, updateJobApplicationStatus, assignFreelancerToProject, createProject } from '../../../lib/supabase'
import { Search, Filter, ChevronDown, DollarSign, Clock, Star, AlertCircle } from 'lucide-react'

interface Proposal {
  id: string
  job_id: string
  freelancer_id: string
  cover_letter: string
  proposed_rate: number
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  created_at: string
  freelancer: {
    full_name: string
    professional_title: string
    avatar_url?: string
  }
  job: {
    title: string
    description?: string
  }
}

function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Proposal['status']>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!clientProfile) return
      // Fetch all proposals for jobs created by this client
      const { data: proposalsData, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          freelancer_id,
          cover_letter,
          proposed_rate,
          status,
          created_at,
          jobs (
            id,
            title,
            client_id
          ),
          freelancer_profiles (
            full_name,
            professional_title,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      // Only proposals for jobs created by this client
      const filtered = (proposalsData || []).filter((p: any) => p.jobs?.client_id === clientProfile.id)
      // Fix jobs and freelancer_profiles fields if they are arrays
      const normalized = filtered.map((p: any) => ({
        ...p,
        job: Array.isArray(p.jobs) ? p.jobs[0] : p.jobs,
        freelancer: Array.isArray(p.freelancer_profiles) ? p.freelancer_profiles[0] : p.freelancer_profiles,
      }))
      setProposals(normalized)
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProposals = proposals
    .filter(proposal => {
      const matchesSearch =
        proposal.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.freelancer.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        return sortOrder === 'desc'
          ? b.proposed_rate - a.proposed_rate
          : a.proposed_rate - b.proposed_rate
      }
    })

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search proposals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00704A]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              className="appearance-none pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00704A] bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00704A] bg-white"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'amount', 'asc' | 'desc']
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount High to Low</option>
              <option value="amount-asc">Amount Low to High</option>
            </select>
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00704A] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading proposals...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <div className="mb-4">
              <AlertCircle size={48} className="mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Found</h3>
            <p className="text-gray-600 mb-4">No proposals have been submitted for your jobs yet.</p>
          </div>
        ) : (
          filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{proposal.job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-1 text-violet-500" />
                      <span className="font-medium">{proposal.proposed_rate}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <img
                      src={proposal.freelancer.avatar_url || 'https://ui-avatars.com/api/?name=' + proposal.freelancer.full_name}
                      alt={proposal.freelancer.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-semibold">{proposal.freelancer.full_name}</span>
                    <span className="text-gray-500">{proposal.freelancer.professional_title}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{new Date(proposal.created_at).toLocaleDateString()}</div>
                  <div className="mt-2">Status: <span className={`font-semibold ${getStatusColor(proposal.status)}`}>{proposal.status}</span></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-gray-700 font-medium mb-1">Cover Letter:</div>
                <div className="bg-gray-50 rounded p-3 text-gray-700 whitespace-pre-line">
                  {proposal.cover_letter}
                </div>
              </div>
              {/* Accept/Reject Buttons */}
              {proposal.status === 'pending' && (
                <div className="mt-6 flex space-x-3">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true)
                      try {
                        // Accept this proposal
                        await updateJobApplicationStatus(proposal.id, 'accepted')
                        // Automatically create a project for this accepted proposal
                        await createProject({
                          title: proposal.job.title,
                          description: (proposal.job && 'description' in proposal.job && typeof proposal.job.description === 'string') ? proposal.job.description : '',
                          start_date: new Date().toISOString().slice(0, 10),
                          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // +30 days
                          budget: proposal.proposed_rate || 0,
                          status: 'in_progress',
                          technologies: [],
                          team_size: 1,
                          requirements: '',
                          freelancer_id: proposal.freelancer_id,
                        })
                        // Reject all other proposals for this job
                        const otherProposals = proposals.filter(p => p.job_id === proposal.job_id && p.id !== proposal.id)
                        await Promise.all(
                          otherProposals.map(p => updateJobApplicationStatus(p.id, 'rejected'))
                        )
                        // --- Chat creation logic ---
                        // Get freelancer user_id
                        const { data: freelancerProfile } = await supabase
                          .from('freelancer_profiles')
                          .select('user_id')
                          .eq('id', proposal.freelancer_id)
                          .single();
                        // Get job
                        const { data: job } = await supabase
                          .from('jobs')
                          .select('client_id')
                          .eq('id', proposal.job_id)
                          .single();
                        let clientUserId = null;
                        if (job && job.client_id) {
                          const { data: clientProfile } = await supabase
                            .from('client_profiles')
                            .select('user_id')
                            .eq('id', job.client_id)
                            .single();
                          clientUserId = clientProfile?.user_id;
                        }
                        const freelancerUserId = freelancerProfile?.user_id;
                        if (freelancerUserId && clientUserId) {
                          // Check if chat exists (robustly, both participant orders)
                          const { data: existingChats } = await supabase
                            .from('chats')
                            .select('id, participant_one, participant_two')
                            .or(`and(participant_one.eq.${clientUserId},participant_two.eq.${freelancerUserId}),and(participant_one.eq.${freelancerUserId},participant_two.eq.${clientUserId})`);
                          if (!existingChats || existingChats.length === 0) {
                            await supabase
                              .from('chats')
                              .insert([
                                { participant_one: clientUserId, participant_two: freelancerUserId }
                              ]);
                          }
                        }
                        // --- End chat creation logic ---
                        await fetchProposals()
                      } catch (err) {
                        alert('Error accepting proposal and creating project')
                      } finally {
                        setLoading(false)
                      }
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true)
                      try {
                        await updateJobApplicationStatus(proposal.id, 'rejected')
                        await fetchProposals()
                      } catch (err) {
                        alert('Error rejecting proposal')
                      } finally {
                        setLoading(false)
                      }
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProposalList 