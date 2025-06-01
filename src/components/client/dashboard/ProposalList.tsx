import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { updateJobApplicationStatus } from '../../../lib/projectApi'
import { Search, Filter, ChevronDown, DollarSign, AlertCircle, X, Briefcase, Award, Code } from 'lucide-react'

interface Certification {
  id: string
  name: string
  issuing_organization: string
  description: string
  issue_date: string
  credential_url?: string
  freelancer_id: string
  created_at: string
}

interface PortfolioItem {
  id: string
  title: string
  description: string
  image_url?: string
  project_url?: string
  skills_used: string[]
  freelancer_id: string
  created_at: string
}

interface FreelancerProfile {
  id: string
  full_name: string
  professional_title: string
  avatar_url?: string
  bio?: string
  skills?: string[]
  certifications?: Certification[]
  Portfolio_items?: PortfolioItem[]
}

interface Proposal {
  id: string
  job_id: string
  freelancer_id: string
  cover_letter: string
  proposed_rate: number
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  created_at: string
  freelancer: FreelancerProfile
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
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerProfile | null>(null)
  const [isLoadingFreelancer, setIsLoadingFreelancer] = useState(false)
  const [freelancerError, setFreelancerError] = useState<string | null>(null)

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchFreelancerDetails = async (freelancerId: string) => {
    setIsLoadingFreelancer(true)
    setFreelancerError(null)
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', freelancerId)
        .single()
      
      if (profileError) throw profileError
      
      // Fetch certifications
      const { data: certificationsData, error: certError } = await supabase
        .from('certifications')
        .select('*')
      
      if (certError) throw certError
      
      // Filter certifications for this freelancer
      const freelancerCertifications = certificationsData?.filter(
        cert => cert.freelancer_id === freelancerId
      ) || []
      
      // Fetch Portfolio items
      const { data: PortfolioData, error: PortfolioError } = await supabase
        .from('Portfolio')
        .select('*')
      
      if (PortfolioError) throw PortfolioError
      
      // Filter Portfolio items for this freelancer
      const freelancerPortfolio = PortfolioData?.filter(
        item => item.freelancer_id === freelancerId
      ) || []
      
      // Combine all data
      return {
        ...profileData,
        skills: profileData.skills || [],
        certifications: freelancerCertifications,
        Portfolio_items: freelancerPortfolio.map(item => ({
          ...item,
          skills_used: item.skills_used || []
        }))
      } as FreelancerProfile
      
    } catch (error) {
      console.error('Error fetching freelancer details:', error)
      setFreelancerError('Failed to load freelancer details')
      return null
    } finally {
      setIsLoadingFreelancer(false)
    }
  }

  const handleViewDetails = async (freelancerId: string) => {
    const data = await fetchFreelancerDetails(freelancerId)
    if (data) {
      setSelectedFreelancer(data)
    }
  }

  const closeModal = () => {
    setSelectedFreelancer(null)
    setFreelancerError(null)
  }

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!clientProfile) throw new Error('Client profile not found')
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
            id,
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
      return matchesSearch
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
      {/* Freelancer Details Modal */}
      {selectedFreelancer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedFreelancer.full_name}'s Profile
                      </h3>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    
                    {isLoadingFreelancer ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading profile...</p>
                      </div>
                    ) : freelancerError ? (
                      <div className="text-red-500 text-center py-4">{freelancerError}</div>
                    ) : (
                      <div className="space-y-8">
                        {/* Basic Info */}
                        <div className="flex items-start space-x-6 p-4 bg-gray-50 rounded-lg">
                          <img
                            src={selectedFreelancer.avatar_url || `https://ui-avatars.com/api/?name=${selectedFreelancer.full_name}`}
                            alt={selectedFreelancer.full_name}
                            className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                          />
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedFreelancer.full_name}</h2>
                            <p className="text-lg text-gray-600 mb-3">{selectedFreelancer.professional_title}</p>
                            {selectedFreelancer.bio && (
                              <p className="text-gray-700 bg-white p-3 rounded border">{selectedFreelancer.bio}</p>
                            )}
                          </div>
                        </div>

                        {/* Skills Section */}
                        {selectedFreelancer.skills && selectedFreelancer.skills.length > 0 && (
                          <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
                              <Code className="mr-2 text-primary" size={20} />
                              Professional Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedFreelancer.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-4 py-2 bg-primary/10 text-primary-dark rounded-full text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications Section */}
                        {selectedFreelancer.certifications && selectedFreelancer.certifications.length > 0 && (
                          <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
                              <Award className="mr-2 text-amber-500" size={20} />
                              Certifications
                            </h3>
                            <div className="space-y-4">
                              {selectedFreelancer.certifications.map((cert, index) => (
                                <div key={index} className="border-l-4 border-primary pl-4 py-2 hover:bg-gray-50 transition-colors">
                                  <h4 className="text-lg font-medium text-gray-900">{cert.name}</h4>
                                  <p className="text-gray-600"><span className="font-medium">Issuer:</span> {cert.issuing_organization}</p>
                                  {cert.description && (
                                    <p className="mt-1 text-gray-700">{cert.description}</p>
                                  )}
                                  <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                                    {cert.credential_url && (
                                      <a
                                        href={cert.credential_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-4 text-primary hover:underline flex items-center"
                                      >
                                        <span>View Credential</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Portfolio Section */}
                        {selectedFreelancer.Portfolio_items && selectedFreelancer.Portfolio_items.length > 0 && (
                          <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center">
                              <Briefcase className="mr-2 text-emerald-500" size={20} />
                              Portfolio Projects
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {selectedFreelancer.Portfolio_items.map((item, index) => (
                                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                  {item.image_url && (
                                    <div className="h-40 bg-gray-100 overflow-hidden">
                                      <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                                    <p className="text-gray-600 mb-3">{item.description}</p>
                                    
                                    {item.skills_used && item.skills_used.length > 0 && (
                                      <div className="mb-3">
                                        <span className="text-sm font-medium text-gray-500 block mb-1">Skills Used:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {item.skills_used.map((skill, skillIndex) => (
                                            <span
                                              key={skillIndex}
                                              className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                                            >
                                              {skill}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {item.project_url && (
                                      <a
                                        href={item.project_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark mt-2"
                                      >
                                        <span>View Project</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search proposals..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              className="appearance-none pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-primary bg-white"
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
              className="appearance-none pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-primary bg-white"
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
      {actionError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{actionError}</div>
      )}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
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
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={proposal.freelancer.avatar_url || 'https://ui-avatars.com/api/?name=' + proposal.freelancer.full_name}
                        alt={proposal.freelancer.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold">{proposal.freelancer.full_name}</span>
                      <span className="text-gray-500">{proposal.freelancer.professional_title}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{new Date(proposal.created_at).toLocaleDateString()}</div>
                  <div className="mt-2">
                    <span className={`font-semibold ${getStatusColor(proposal.status)}`}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => handleViewDetails(proposal.freelancer.id)}
                      className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
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
                <div className="mt-6 flex space-x-4">
                  <button
                    className="px-6 py-2.5 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors shadow-sm flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true)
                      setActionError(null)
                      // Optimistically update the proposal status in the UI
                      setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: 'accepted' } : p))
                      try {
                        await updateJobApplicationStatus(proposal.id, 'accepted')
                        // Create contract if not already exists
                        let clientId = '';
                        if (proposal.job) {
                          if (Array.isArray(proposal.job) && proposal.job.length > 0 && (proposal.job[0] as any).client_id) {
                            clientId = (proposal.job[0] as any).client_id;
                          } else if (!Array.isArray(proposal.job) && (proposal.job as any).client_id) {
                            clientId = (proposal.job as any).client_id;
                          }
                        }
                        const { data: existingContract, error: contractError } = await supabase
                          .from('contracts')
                          .select('id')
                          .eq('job_id', proposal.job_id)
                          .eq('freelancer_id', proposal.freelancer_id)
                          .maybeSingle()
                        if (!existingContract && clientId) {
                          const contractPayload = {
                            client_id: clientId,
                            freelancer_id: proposal.freelancer_id,
                            job_id: proposal.job_id,
                            title: proposal.job.title,
                            terms: proposal.cover_letter || '',
                            amount: proposal.proposed_rate,
                            start_date: new Date().toISOString().slice(0, 10),
                            end_date: null,
                            status: 'pending',
                          };
                          const { error: insertError, data: insertData } = await supabase.from('contracts').insert(contractPayload).select();
                          if (insertError) {
                            setActionError('Failed to create contract: ' + insertError.message);
                            throw insertError;
                          }
                        }
                        // First, check if the project exists
                        const { data: existingProject, error: projectError } = await supabase
                          .from('projects')
                          .select('id')
                          .eq('id', proposal.job_id)
                          .maybeSingle();

                        if (projectError) {
                          throw projectError;
                        }

                        if (existingProject) {
                          // Update existing project with the freelancer's proposed rate
                          await supabase
                            .from('projects')
                            .update({
                              freelancer_id: proposal.freelancer_id,
                              status: 'in_progress',
                              client_id: clientId,
                              budget: proposal.proposed_rate, // Update budget with freelancer's proposed rate
                              title: proposal.job.title,
                              description: proposal.cover_letter || 'Project created from accepted proposal',
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', proposal.job_id);
                        } else {
                          // Create new project if it doesn't exist with the freelancer's proposed rate
                          await supabase
                            .from('projects')
                            .insert([{
                              id: proposal.job_id,
                              client_id: clientId,
                              freelancer_id: proposal.freelancer_id,
                              title: proposal.job.title,
                              description: proposal.cover_letter || 'Project created from accepted proposal',
                              budget: proposal.proposed_rate, // Set budget to freelancer's proposed rate
                              status: 'in_progress',
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString()
                            }]);
                        }
                      } catch (err) {
                        console.error('Accept error:', err)
                        setActionError(err instanceof Error ? err.message : JSON.stringify(err))
                      } finally {
                        await fetchProposals()
                        setLoading(false)
                      }
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true)
                      setActionError(null)
                      try {
                        await updateJobApplicationStatus(proposal.id, 'rejected')
                      } catch (err) {
                        setActionError(err instanceof Error ? err.message : String(err))
                      } finally {
                        await fetchProposals()
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