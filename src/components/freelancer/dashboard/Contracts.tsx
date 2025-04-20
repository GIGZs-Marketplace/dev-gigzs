import React, { useState } from 'react'
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
  status: ContractStatus
  lastPayment: string
  nextPayment: string | null
  description: string
  milestones: {
    title: string
    dueDate: string
    status: 'completed' | 'pending' | 'overdue'
  }[]
}

function Contracts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all')
  const [sortBy, setSortBy] = useState<'date' | 'payment'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

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
      const matchesSearch = 
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || contract.paymentStatus === paymentFilter
      return matchesSearch && matchesStatus && matchesPayment
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          : new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      } else {
        return sortOrder === 'desc'
          ? b.value - a.value
          : a.value - b.value
      }
    })

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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
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

              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(contract.paymentStatus)}`}>
                {contract.paymentStatus.charAt(0).toUpperCase() + contract.paymentStatus.slice(1)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Contract Value</p>
                  <p className="text-sm font-medium">${contract.value.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Last Payment</p>
                  <p className="text-sm font-medium">{new Date(contract.lastPayment).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Next Payment</p>
                  <p className="text-sm font-medium">
                    {contract.nextPayment ? new Date(contract.nextPayment).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {contract.status === 'ongoing' && contract.paymentStatus === 'overdue' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center text-red-700">
                <AlertCircle size={18} className="mr-2" />
                <span className="text-sm">Payment is overdue. Please contact the client.</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-600 hover:text-[#00704A]">
                  <MessageSquare size={18} className="mr-1" />
                  <span>Message Client</span>
                </button>
                <button className="flex items-center text-gray-600 hover:text-[#00704A]">
                  <Download size={18} className="mr-1" />
                  <span>Download Contract</span>
                </button>
                {contract.status === 'ongoing' && (
                  <button className="flex items-center text-gray-600 hover:text-[#00704A]">
                    <Edit2 size={18} className="mr-1" />
                    <span>Request Modification</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedContract(contract)
                  setShowDetailsModal(true)
                }}
                className="flex items-center text-[#00704A] hover:text-[#005538]"
              >
                <span>View Details</span>
                <ExternalLink size={18} className="ml-1" />
              </button>
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
    </div>
  )
}

// Sample contracts data
const contracts: Contract[] = [
  {
    id: '1',
    title: 'E-commerce Website Development',
    clientName: 'John Smith',
    clientCompany: 'TechCorp Solutions',
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    value: 12000,
    paymentStatus: 'pending',
    status: 'ongoing',
    lastPayment: '2024-03-15',
    nextPayment: '2024-04-15',
    description: 'Development of a full-featured e-commerce platform including product management, payment integration, and admin dashboard.',
    milestones: [
      {
        title: 'Frontend Development',
        dueDate: '2024-03-15',
        status: 'completed'
      },
      {
        title: 'Backend Integration',
        dueDate: '2024-04-15',
        status: 'pending'
      },
      {
        title: 'Testing & Deployment',
        dueDate: '2024-05-15',
        status: 'pending'
      }
    ]
  },
  {
    id: '2',
    title: 'Mobile App Development',
    clientName: 'Sarah Johnson',
    clientCompany: 'InnovateLabs',
    startDate: '2024-02-01',
    endDate: '2024-08-01',
    value: 25000,
    paymentStatus: 'overdue',
    status: 'ongoing',
    lastPayment: '2024-03-01',
    nextPayment: '2024-04-01',
    description: 'Development of a cross-platform mobile application for inventory management and real-time tracking.',
    milestones: [
      {
        title: 'UI/UX Design',
        dueDate: '2024-03-01',
        status: 'completed'
      },
      {
        title: 'Core Features Development',
        dueDate: '2024-05-01',
        status: 'pending'
      },
      {
        title: 'Beta Testing',
        dueDate: '2024-07-01',
        status: 'pending'
      }
    ]
  },
  {
    id: '3',
    title: 'Website Redesign Project',
    clientName: 'Emma Wilson',
    clientCompany: 'Design Studio Pro',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    value: 8000,
    paymentStatus: 'paid',
    status: 'completed',
    lastPayment: '2024-03-31',
    nextPayment: null,
    description: 'Complete redesign of company website with focus on modern design principles and improved user experience.',
    milestones: [
      {
        title: 'Design Mockups',
        dueDate: '2024-01-15',
        status: 'completed'
      },
      {
        title: 'Development',
        dueDate: '2024-02-28',
        status: 'completed'
      },
      {
        title: 'Content Migration',
        dueDate: '2024-03-15',
        status: 'completed'
      }
    ]
  }
]

export default Contracts