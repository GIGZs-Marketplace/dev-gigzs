import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  FileText, 
  MessageSquare, 
  Edit2, 
  Clock, 
  DollarSign, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Building2,
  Download,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import SignatureModal from '../../SignatureModal'

type ContractStatus = 'ongoing' | 'completed' | 'disputed'
type PaymentStatus = 'pending' | 'paid' | 'overdue'

interface Contract {
  id: string
  title: string
  clientName: string
  clientCompany: string
  startDate: string
  endDate: string
  value: number
  paymentStatus: PaymentStatus
  status: string
  lastPayment: string
  nextPayment: string | null
  description: string
  milestones: {
    title: string
    dueDate: string
    status: 'completed' | 'pending' | 'overdue'
  }[]
  freelancer_signed?: boolean
  progress_status?: number
  code_url?: string
}

function Contracts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all')
  const [sortBy, setSortBy] = useState<'date' | 'payment'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signingContractId, setSigningContractId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadingContractId, setUploadingContractId] = useState<string | null>(null)
  const [progressUpdating, setProgressUpdating] = useState<string | null>(null)

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        // Get freelancer profile
        const { data: freelancerProfile } = await supabase
          .from('freelancer_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (!freelancerProfile) throw new Error('Freelancer profile not found')
        // Fetch contracts for this freelancer
        // First, fetch contracts with job details
        const { data, error } = await supabase
          .from('contracts')
          .select(`
            *,
            job:job_id (
              *,
              duration
            )
          `)
          .eq('freelancer_id', freelancerProfile.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        console.log('Raw contracts data from DB:', data); // Log raw data
        
        // Map DB fields to UI fields for all contracts
        const mapped = (data || []).map((c: any) => {
          // Function to convert job duration to days
          const getDurationInDays = (durationStr: string | null): number => {
            if (!durationStr) return 30; // Default to 30 days if no duration
            
            const lowerDuration = durationStr.toLowerCase();
            
            if (lowerDuration.includes('less than 1 month') || lowerDuration === '1 month') {
              return 30; // 1 month = 30 days
            } else if (lowerDuration.includes('1 to 3 months')) {
              return 90; // 3 months = ~90 days
            } else if (lowerDuration.includes('3 to 6 months')) {
              return 180; // 6 months = ~180 days
            } else if (lowerDuration.includes('6 to 12 months')) {
              return 365; // 1 year = ~365 days
            } else if (lowerDuration.includes('more than 1 year') || lowerDuration.includes('1+ year')) {
              return 365; // 1 year = ~365 days
            } else if (lowerDuration.includes('more than 2 years') || lowerDuration.includes('2+ years')) {
              return 730; // 2 years = ~730 days
            } else if (lowerDuration.includes('more than 3 years') || lowerDuration.includes('3+ years')) {
              return 1095; // 3 years = ~1095 days
            } else {
              // Try to parse as a number of days as fallback
              const days = parseInt(durationStr, 10);
              return isNaN(days) ? 30 : days; // Default to 30 days if can't parse
            }
          };
          
          // Get duration from job if available, otherwise use contract duration
          const durationDays = c.job?.duration 
            ? getDurationInDays(c.job.duration)
            : c.duration_days 
              ? parseInt(c.duration_days, 10) 
              : 30; // Default to 30 days if no duration specified
          
          // Parse dates if they exist
          const startDate = c.start_date ? new Date(c.start_date) : null;
          const endDate = c.end_date ? new Date(c.end_date) : null;
          
          // Calculate dates based on available data
          let calculatedStartDate = startDate;
          let calculatedEndDate = endDate;
          
          if (startDate && !endDate) {
            // If we have start date, calculate end date from duration
            calculatedEndDate = new Date(startDate);
            calculatedEndDate.setDate(startDate.getDate() + durationDays);
          } else if (!startDate && endDate) {
            // If we have end date, calculate start date from duration
            calculatedStartDate = new Date(endDate);
            calculatedStartDate.setDate(endDate.getDate() - durationDays);
          } else if (!startDate && !endDate) {
            // If no dates, use current date as start and add duration
            calculatedStartDate = new Date();
            calculatedEndDate = new Date();
            calculatedEndDate.setDate(calculatedStartDate.getDate() + durationDays);
          }
          
          return {
            ...c,
            startDate: calculatedStartDate?.toISOString().split('T')[0], // Format as YYYY-MM-DD
            endDate: calculatedEndDate?.toISOString().split('T')[0], // Format as YYYY-MM-DD
            value: c.amount,
            freelancer_signed: c.freelancer_signed ?? false,
            status: c.status || 'ongoing',
            paymentStatus: c.payment_status || 'pending'
          };
        })
        setContracts(mapped);
        console.log('Fetched contracts:', mapped); // For debugging
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchContracts()
  }, [])

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'disputed':
        return 'bg-red-100 text-red-800'
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
    }
  }

  const filteredContracts = contracts
    .filter(contract => {
      const matchesSearch = (contract.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          : new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      } else {
        return sortOrder === 'desc'
          ? (b.value || 0) - (a.value || 0)
          : (a.value || 0) - (b.value || 0)
      }
    })

  // Function to handle freelancer signature
  const handleFreelancerSign = async (contractId: string, signature: string) => {
    setLoading(true)
    try {
      // Update contract with freelancer signature
      const { data, error } = await supabase
        .from('contracts')
        .update({ freelancer_signature: signature, freelancer_signed: true })
        .eq('id', contractId)
        .select()
      if (error) throw error
      // Check if client has also signed
      const contract = data && data[0]
      if (contract && contract.client_signed) {
        await supabase.from('contracts').update({ status: 'signed' }).eq('id', contractId)
      }
      setShowSignatureModal(false)
      setSigningContractId(null)
      // Optionally refresh contracts list here
    } catch (err) {
      // Handle error (show toast, etc)
    } finally {
      setLoading(false)
    }
  }

  // Progress update handler
  const handleProgressChange = async (contractId: string, newProgress: number) => {
    setProgressUpdating(contractId)
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ progress_status: newProgress })
        .eq('id', contractId)
      if (error) throw error
      // Refresh contracts
      setContracts(contracts => contracts.map(c => c.id === contractId ? { ...c, progress_status: newProgress } : c))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error updating progress:', err)
    } finally {
      setProgressUpdating(null)
    }
  }

  // Code upload handler
  const handleCodeUpload = async (contractId: string, file: File) => {
    setUploadingContractId(contractId)
    try {
      const filePath = `${contractId}/${file.name}`
      const { data, error } = await supabase.storage.from('project-code').upload(filePath, file, { upsert: true })
      if (error) throw error
      // Get public URL
      const { data: urlData } = supabase.storage.from('project-code').getPublicUrl(filePath)
      const codeUrl = urlData.publicUrl
      // Update contract with code_url
      await supabase.from('contracts').update({ code_url: codeUrl }).eq('id', contractId)
      setContracts(contracts => contracts.map(c => c.id === contractId ? { ...c, code_url: codeUrl } : c))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error uploading code:', err)
    } finally {
      setUploadingContractId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Contracts</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your active and completed contracts</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ContractStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="disputed">Disputed</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | PaymentStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'payment', 'asc' | 'desc']
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
            >
              <option value="date-desc">Most Recent</option>
              <option value="date-asc">Oldest First</option>
              <option value="payment-desc">Highest Value</option>
              <option value="payment-asc">Lowest Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                  <div className="flex flex-col space-y-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status as ContractStatus)}`}>
                      {contract.status ? contract.status.charAt(0).toUpperCase() + contract.status.slice(1) : 'N/A'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contract.freelancer_signed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {contract.freelancer_signed ? 'Signed' : 'Not Signed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Building2 size={16} className="mr-1" />
                    <span>{contract.clientCompany}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>{new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(contract.paymentStatus)}`}>
                  {contract.paymentStatus ? contract.paymentStatus.charAt(0).toUpperCase() + contract.paymentStatus.slice(1) : 'N/A'}
                </span>
                {!contract.freelancer_signed && (
                  <button
                    onClick={() => {
                      setSigningContractId(contract.id)
                      setShowSignatureModal(true)
                    }}
                    className="text-xs px-3 py-1 bg-[#00704A] text-white rounded-full hover:bg-[#005538] transition-colors"
                  >
                    Sign Now
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Contract Value</p>
                  <p className="text-sm font-medium">${contract.value.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  contract.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <p className="text-sm font-medium">
                    {contract.paymentStatus === 'paid' ? 'Paid by Client' : 'Not Paid by Client'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4 w-full">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="relative group">
                      <button
                        onClick={() => {
                          if (new Date(contract.endDate) <= new Date()) {
                            console.log('Withdraw money for contract:', contract.id);
                          }
                        }}
                        disabled={new Date(contract.endDate) > new Date()}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                          new Date(contract.endDate) <= new Date()
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <DollarSign size={18} className="mr-2" />
                        <span>Withdraw Money</span>
                      </button>
                      {new Date(contract.endDate) > new Date() && (
                        <div className="absolute z-10 hidden group-hover:block w-64 px-3 py-2 mt-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg">
                          Available for withdrawal after {new Date(contract.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {new Date(contract.endDate) > new Date() && (
                      <span className="text-sm text-gray-500 hidden md:inline">
                        Available {new Date(contract.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {contract.status === 'ongoing' && (
                    <button className="flex items-center text-gray-600 hover:text-[#00704A]">
                      <Edit2 size={18} className="mr-1" />
                      <span>Request Modification</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contract Details Modal */}
      {showDetailsModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedContract.title}</h3>
                <p className="text-gray-600 mt-1">{selectedContract.clientCompany}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Contract Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contract Period</h4>
                  <p className="text-gray-900">
                    {new Date(selectedContract.startDate).toLocaleDateString()} - {new Date(selectedContract.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contract Value</h4>
                  <p className="text-gray-900">${selectedContract.value.toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-900">{selectedContract.description}</p>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Milestones</h4>
                <div className="space-y-3">
                  {selectedContract.milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{milestone.title}</p>
                        <p className="text-sm text-gray-600">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                        milestone.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]">
                  Download Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal for Freelancer */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSign={signature => signingContractId && handleFreelancerSign(signingContractId, signature)}
        loading={loading}
      />
    </div>
  )
}

export default Contracts