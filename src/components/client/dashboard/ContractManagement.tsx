import React from 'react'
import { FileText, Download, Clock, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react'

function ContractManagement() {
  const contracts = [
    {
      id: 1,
      title: 'Website Development Agreement',
      contractor: 'Sarah Johnson',
      contractorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      value: '$12,000',
      status: 'Active',
      paymentStatus: 'Up to date',
      lastPayment: '2024-02-15',
      nextPayment: '2024-03-15'
    },
    {
      id: 2,
      title: 'Mobile App Development Contract',
      contractor: 'Michael Chen',
      contractorAvatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      startDate: '2024-02-01',
      endDate: '2024-08-01',
      value: '$25,000',
      status: 'Active',
      paymentStatus: 'Pending',
      lastPayment: '2024-02-01',
      nextPayment: '2024-03-01'
    },
    {
      id: 3,
      title: 'UI/UX Design Services',
      contractor: 'Emma Wilson',
      contractorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      value: '$8,000',
      status: 'Completed',
      paymentStatus: 'Paid',
      lastPayment: '2024-03-31',
      nextPayment: null
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Contract Management</h2>
        <button className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors">
          <FileText size={20} className="mr-2" />
          New Contract
        </button>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                <div className="flex items-center space-x-2">
                  <img
                    src={contract.contractorAvatar}
                    alt={contract.contractor}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600">{contract.contractor}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                contract.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : contract.status === 'Completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {contract.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">
                    {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Contract Value</p>
                  <p className="text-sm font-medium">{contract.value}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Last Payment</p>
                  <p className="text-sm font-medium">
                    {new Date(contract.lastPayment).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-gray-400" size={18} />
                <div>
                  <p className="text-xs text-gray-500">Next Payment</p>
                  <p className="text-sm font-medium">
                    {contract.nextPayment ? new Date(contract.nextPayment).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className={`text-sm font-medium ${
                contract.paymentStatus === 'Up to date'
                  ? 'text-green-600'
                  : contract.paymentStatus === 'Pending'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}>
                Payment Status: {contract.paymentStatus}
              </span>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-1 text-sm text-[#00704A] hover:bg-[#00704A]/5 rounded">
                  <Download size={16} className="mr-1" />
                  Download
                </button>
                <button className="flex items-center px-3 py-1 text-sm text-[#00704A] hover:bg-[#00704A]/5 rounded">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContractManagement