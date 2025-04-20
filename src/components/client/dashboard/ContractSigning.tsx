import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Send
} from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '../../../lib/supabase'

type SignatureRef = SignatureCanvas | null

interface ContractSigningProps {
  onClose?: () => void
}

function ContractSigning({ onClose }: ContractSigningProps) {
  const [activeTab, setActiveTab] = useState<'contracts' | 'templates' | 'signing'>('contracts')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const signatureRef = useRef<SignatureRef>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [signatureData, setSignatureData] = useState<string | null>(null)

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
      setSignatureData(null)
    }
  }

  const saveSignature = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL()
      setSignatureData(dataUrl)
      setShowSignatureModal(false)
    }
  }

  const handleContractSign = async (contractId: string) => {
    if (!signatureData) return

    try {
      // Save signature and update contract status
      const { data, error } = await supabase
        .from('contract_signatures')
        .insert([
          {
            contract_id: contractId,
            signature: signatureData,
            signed_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      // Update contract status
      const { error: updateError } = await supabase
        .from('contracts')
        .update({ status: 'signed' })
        .eq('id', contractId)

      if (updateError) throw updateError

      // Reset state
      setSignatureData(null)
      setSelectedContract(null)
      setShowSignatureModal(false)
    } catch (error) {
      console.error('Error signing contract:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Contract & NDA Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and sign contracts and NDAs securely</p>
        </div>
        <button
          onClick={() => setActiveTab('templates')}
          className="flex items-center px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Contract
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-4 px-1 relative ${
              activeTab === 'contracts'
                ? 'text-[#00704A] border-b-2 border-[#00704A]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Contracts
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 relative ${
              activeTab === 'templates'
                ? 'text-[#00704A] border-b-2 border-[#00704A]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Contract Templates
          </button>
          <button
            onClick={() => setActiveTab('signing')}
            className={`py-4 px-1 relative ${
              activeTab === 'signing'
                ? 'text-[#00704A] border-b-2 border-[#00704A]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Signatures
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:border-[#00704A]"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00704A]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Signature</option>
            <option value="signed">Signed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-[#00704A] hover:bg-[#00704A]/5 rounded-lg flex items-center">
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button className="px-4 py-2 text-[#00704A] hover:bg-[#00704A]/5 rounded-lg flex items-center">
            <Upload size={20} className="mr-2" />
            Import
          </button>
        </div>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <FileText className="text-[#00704A]" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    contract.status === 'signed' ? 'bg-green-100 text-green-800' :
                    contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Created on {format(new Date(contract.createdAt), 'MMM dd, yyyy')}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setSelectedContract(contract)
                    setShowSignatureModal(true)
                  }}
                  className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] transition-colors flex items-center"
                >
                  Sign Now
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Eye size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Download size={20} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2" />
                <span>{contract.parties.join(', ')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={16} className="mr-2" />
                <span>Expires on {format(new Date(contract.expiryDate), 'MMM dd, yyyy')}</span>
              </div>
            </div>

            {contract.status === 'pending' && (
              <div className="mt-4 flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="text-yellow-500 mr-2" size={20} />
                  <span className="text-sm text-yellow-700">Awaiting signature from {contract.pendingSignature}</span>
                </div>
                <button className="text-[#00704A] hover:text-[#005538] text-sm font-medium flex items-center">
                  <Send size={16} className="mr-1" />
                  Send Reminder
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Sign Contract</h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="border rounded-lg p-4 mb-4">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'signature-canvas border rounded-lg w-full h-64 bg-gray-50',
                }}
                backgroundColor="rgb(249, 250, 251)"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={clearSignature}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <div className="space-x-2">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedContract && handleContractSign(selectedContract.id)}
                  className="px-4 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538]"
                >
                  Sign Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sample data
const contracts = [
  {
    id: '1',
    title: 'Website Development Agreement',
    status: 'pending',
    createdAt: '2024-03-15T10:00:00Z',
    expiryDate: '2024-04-15T10:00:00Z',
    parties: ['TechCorp Solutions', 'Sarah Johnson'],
    pendingSignature: 'Sarah Johnson',
    type: 'contract'
  },
  {
    id: '2',
    title: 'Non-Disclosure Agreement',
    status: 'signed',
    createdAt: '2024-03-10T10:00:00Z',
    expiryDate: '2025-03-10T10:00:00Z',
    parties: ['TechCorp Solutions', 'Michael Chen'],
    type: 'nda'
  },
  {
    id: '3',
    title: 'Mobile App Development Contract',
    status: 'draft',
    createdAt: '2024-03-20T10:00:00Z',
    expiryDate: '2024-05-20T10:00:00Z',
    parties: ['TechCorp Solutions', 'Emma Wilson'],
    type: 'contract'
  }
]

export default ContractSigning