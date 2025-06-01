import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MessageSquare, 
  Edit2, 
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Building2,
  ChevronRight,
  Plus
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface Job {
  id: string
  title: string
  description: string
  budget_amount: number
  budget_type: string
  duration: string
  client_id: string
}

interface JobApplication {
  id: string
  job_id: string
  freelancer_id: string
  cover_letter: string
  proposed_rate: number
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  created_at: string
  job: {
    title: string
    description: string
    client_id: string
    budget_amount: number
    budget_type: string
    duration: string
    client: {
      company_name: string
    }
  }
}

// Add sectionState prop
type MyProposalsProps = { sectionState?: any }
function MyProposals({ sectionState }: MyProposalsProps) {
  const [proposals, setProposals] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | JobApplication['status']>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [newProposal, setNewProposal] = useState({
    job_id: '',
    cover_letter: '',
    proposed_rate: null as number | null
  })
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [searchJobTerm, setSearchJobTerm] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  
  
  // Handle view details click
  const handleViewDetails = async (jobId: string) => {
    try {
      // First, find the project that corresponds to this job ID
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('id')
        .eq('job_id', jobId)
        .single();

      if (error || !projectData) {
        console.error('Error finding project for job:', error);
        alert('Could not find the associated project');
        return;
      }

      // Set the active section to projects and pass the project ID
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          section: 'projects',
          projectId: projectData.id
        } 
      }));
    } catch (err) {
      console.error('Error in handleViewDetails:', err);
      alert('An error occurred while loading the project');
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  // Open modal and prefill job if jobId is passed in sectionState
  // This should only run once when the component mounts with a valid sectionState
  useEffect(() => {
    const SESSION_STORAGE_KEY = 'lastConsumedProposalTriggerId';
    const triggerIdFromState = sectionState?.triggerId;
    const jobIdFromState = sectionState?.jobId;
    const openModalSignal = sectionState?.openModal === true;

    if (openModalSignal && jobIdFromState && triggerIdFromState) {
      const lastConsumedTriggerId = sessionStorage.getItem(SESSION_STORAGE_KEY);

      if (triggerIdFromState !== lastConsumedTriggerId) {
        setIsModalOpen(true);
        setNewProposal((prev) => ({ ...prev, job_id: jobIdFromState }));
        sessionStorage.setItem(SESSION_STORAGE_KEY, triggerIdFromState);
      } else {
        // This trigger has been consumed. If modal is somehow open, ensure it's closed unless user opened it manually.
        // For now, we assume if trigger is consumed, and modal is open, it's from a previous valid opening of this trigger.
        // If user closes it, isModalOpen becomes false, and this useEffect won't reopen for the same consumed trigger.
      }
    } else {
      // If the openModal signal is not active, or essential data is missing,
      // and the modal is open, close it.
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      // No need to clear sessionStorage here as a new triggerId will naturally supersede the old one.
      // Or, if no trigger is active, the check `triggerIdFromState !== lastConsumedTriggerId` handles it.
    }
    // Adding `isModalOpen` to dependencies to handle cases where modal might be closed by other means
    // and we need to re-evaluate if a persistent trigger in sectionState should reopen it (if not consumed).
  }, [sectionState, isModalOpen]);  // Empty dependency array means this only runs once on mount

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
        fetchProposals()
        fetchAvailableJobs()
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/' // or your login route
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      window.location.href = '/' // Redirect to login on error
    }
  }

  useEffect(() => {
    console.log('Proposals state updated:', proposals)
  }, [proposals])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user)
      if (!user) {
        console.error('User not authenticated')
        return
      }

      // Get freelancer profile
      const { data: freelancerProfile, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      console.log('Freelancer profile:', freelancerProfile, 'Error:', profileError)
      
      if (!freelancerProfile) {
        console.error('Freelancer profile not found')
        return
      }

      // Fetch job applications with job and client details
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          freelancer_id,
          cover_letter,
          proposed_rate,
          status,
          created_at,
          job:jobs (
            title,
            description,
            client_id,
            budget_amount,
            budget_type,
            duration,
            client:client_profiles (
              company_name
            )
          )
        `)
        .eq('freelancer_id', freelancerProfile.id)
        .order('created_at', { ascending: false })

      console.log('Proposals data:', proposalsData, 'Error:', proposalsError)

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError)
        return
      }

      // Safe transformation of proposals data
      const transformedProposals = proposalsData?.map(proposal => {
        // Safely extract job data
        const jobData = proposal.job?.[0] || proposal.job || {}
        
        // Safely extract client data
        const clientData = jobData.client?.[0] || jobData.client || {}
        
        return {
          ...proposal,
          job: {
            title: jobData.title || '',
            description: jobData.description || '',
            client_id: jobData.client_id || '',
            budget_amount: jobData.budget_amount || 0,
            budget_type: jobData.budget_type || '',
            duration: jobData.duration || '',
            client: {
              company_name: clientData.company_name || ''
            }
          }
        }
      }) || []

      console.log('Transformed proposals:', transformedProposals);
      setProposals(transformedProposals)
    } catch (error) {
      console.error('Error in fetchProposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          budget_amount,
          budget_type,
          duration,
          client_id
        `)
        .eq('status', 'open')

      if (error) throw error
      setAvailableJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
    }
  }

  const getStatusIcon = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />
      case 'shortlisted':
        return <CheckCircle size={16} className="text-blue-600" />
      case 'accepted':
        return <CheckCircle size={16} className="text-green-600" />
      case 'rejected':
        return <AlertCircle size={16} className="text-red-600" />
    }
  }

  const createProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please sign in to create a proposal')
        return
      }

      // Get freelancer profile
      const { data: freelancerProfile } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!freelancerProfile) {
        alert('Please complete your freelancer profile first')
        return
      }

      // Create new proposal
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_id: newProposal.job_id,
          freelancer_id: freelancerProfile.id,
          cover_letter: newProposal.cover_letter,
          proposed_rate: newProposal.proposed_rate,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (insertError) throw insertError

      // Reset form and close modal
      setNewProposal({ job_id: '', cover_letter: '', proposed_rate: null })
      setIsModalOpen(false)
      
      // Refresh the proposals list
      await fetchProposals()
      
      // Show success message
      setShowSuccessAlert(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessAlert(false)
      }, 3000)
    } catch (error) {
      console.error('Error creating proposal:', error)
      alert('Failed to create proposal. Please try again.')
    }
  }

  const filteredProposals = proposals
    .filter(proposal => {
      const matchesSearch = 
        proposal.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.job.client.company_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
        >
          <Plus size={18} className="mr-2" />
          <span>New Proposal</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
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
        ) : proposals.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <div className="mb-4">
              <AlertCircle size={48} className="mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Found</h3>
            <p className="text-gray-600 mb-4">You haven't submitted any proposals yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
            >
              <Plus size={18} className="mr-2" />
              <span>Submit Your First Proposal</span>
            </button>
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
                      <Building2 size={16} className="mr-1" />
                      <span>{proposal.job.client.company_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>Submitted {new Date(proposal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                    {getStatusIcon(proposal.status)}
                    <span className="capitalize">{proposal.status}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600 line-clamp-2">{proposal.cover_letter}</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Proposed Rate</p>
                    <p className="text-sm font-medium">
                      ${proposal.proposed_rate}
                      {proposal.job.budget_type === 'hourly' && '/hr'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Project Duration</p>
                    <p className="text-sm font-medium">{proposal.job.duration?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fade-in-out">
          <div className="flex items-center">
            <div className="py-1">
              <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
            </div>
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm">Your proposal has been submitted successfully.</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
            <form onSubmit={createProposal}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00704A] focus:border-[#00704A]"
                      value={searchJobTerm}
                      onChange={(e) => setSearchJobTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto bg-white">
                    {availableJobs
                      .filter(job => job.title.toLowerCase().includes(searchJobTerm.toLowerCase()) || 
                                    (job.description && job.description.toLowerCase().includes(searchJobTerm.toLowerCase())))
                      .map(job => (
                        <div 
                          key={job.id} 
                          className={`p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${job.id === newProposal.job_id ? 'bg-green-50 border-l-4 border-l-[#00704A]' : ''}`}
                          onClick={() => {
                            setNewProposal({...newProposal, job_id: job.id});
                            setSelectedJob(job);
                          }}
                        >
                          <div className="font-medium text-gray-900">{job.title}</div>
                          {job.description && (
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</div>
                          )}
                          <div className="flex flex-wrap items-center mt-2 text-xs text-gray-500 gap-3">
                            {job.budget_amount && (
                              <div className="flex items-center">
                                <DollarSign size={12} className="mr-1" />
                                ${job.budget_amount.toLocaleString()}{job.budget_type === 'hourly' ? '/hr' : ''}
                              </div>
                            )}
                            {job.duration && (
                              <div className="flex items-center">
                                <Clock size={12} className="mr-1" />
                                {job.duration.replace(/_/g, ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                    {availableJobs.filter(job => 
                      job.title.toLowerCase().includes(searchJobTerm.toLowerCase()) || 
                      (job.description && job.description.toLowerCase().includes(searchJobTerm.toLowerCase()))
                    ).length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No projects found matching your search.
                      </div>
                    )}
                  </div>
                  
                  {newProposal.job_id && selectedJob && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700">Selected Project:</div>
                      <div className="font-medium text-[#00704A]">{selectedJob.title}</div>
                    </div>
                  )}
                  
                  {!newProposal.job_id && (
                    <div className="text-xs text-red-500 mt-1">Please select a project to continue</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newProposal.cover_letter}
                    onChange={(e) => setNewProposal({...newProposal, cover_letter: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proposed Rate</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Enter your proposed rate"
                    value={newProposal.proposed_rate || ''}
                    onChange={(e) => setNewProposal({...newProposal, proposed_rate: e.target.value ? Number(e.target.value) : null})}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#00704A] rounded-md hover:bg-[#005538]"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyProposals